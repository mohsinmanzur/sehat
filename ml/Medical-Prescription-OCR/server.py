import io
import os
import torch
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import VisionEncoderDecoderModel, DonutProcessor, pipeline

current_dir = os.path.dirname(os.path.abspath(__file__))
donut_model_path = os.path.join(current_dir, "model")

processor = DonutProcessor.from_pretrained(donut_model_path)
donut_model = VisionEncoderDecoderModel.from_pretrained(donut_model_path)

device = "cuda" if torch.cuda.is_available() else "cpu"
donut_model.to(device)
donut_model.eval()

classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli",
    device=0 if device == "cuda" else -1,
)

candidate_labels = ["medical prescription", "not medical prescription"]

medical_keywords = [
    "prescribed", "take", "mg", "ml", "capsules", "dosage",
    "dr.", "doctor", "patient", "medications", "apply", "signature",
    "clinic", "pharmacy", "rx", "dose", "medicine", "drug",
]


def extract_text(image: Image.Image) -> str:
    image = image.convert("RGB")
    encoding = processor(images=image, return_tensors="pt").to(device)
    with torch.no_grad():
        generated_ids = donut_model.generate(
            encoding.pixel_values,
            max_length=512,
            num_beams=1,
            early_stopping=True,
            decoder_start_token_id=processor.tokenizer.convert_tokens_to_ids("<s_ocr>"),
        )
    return processor.tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0].strip()


def classify(text: str):
    if not text:
        return "no text", 0.0
    result = classifier(text, candidate_labels)
    label, confidence = result["labels"][0], float(result["scores"][0])
    has_medical = any(k in text.lower() for k in medical_keywords)
    if label == "not medical prescription" and has_medical:
        label, confidence = "medical prescription", max(confidence, 0.75)
    elif label == "medical prescription" and not has_medical:
        label, confidence = "not medical prescription", max(confidence, 0.75)
    return label, confidence


class OCRResponse(BaseModel):
    text: str
    label: str
    confidence: float


app = FastAPI(title="Sehat OCR", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "device": device}


@app.post("/ocr", response_model=OCRResponse)
async def ocr(file: UploadFile = File(...)) -> OCRResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="file must be an image")
    try:
        image = Image.open(io.BytesIO(await file.read()))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"could not read image: {e}")
    text = extract_text(image)
    label, confidence = classify(text)
    return OCRResponse(text=text, label=label, confidence=round(confidence, 3))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
