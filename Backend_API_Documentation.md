# Sehat Scan Backend API Documentation

This document provides a comprehensive overview of the backend API endpoints available in the Sehat Scan application. The backend is built using NestJS.

## Base URL
The API is typically accessible at `http://localhost:3000` (or your configured port/domain) plus the respective endpoint path.

---

## 1. Authentication (`/auth`)

Handles patient and doctor registration, login (via OTP or Google), and session management.

| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `POST` | `/auth/requestcode` | Requests a login OTP for a user. | **Body:** `{ email: string }` | Success message |
| `POST` | `/auth/verifycode` | Verifies the OTP for patient login. | **Body:** `{ email: string, code: string }` | Tokens (`access_token`, `refresh_token`) and user object |
| `POST` | `/auth/register` | Registers a new patient. | **Body:** `CreatePatientDto` | Newly created patient object |
| `POST` | `/auth/doctor/register` | Registers a new doctor. | **Body:** `CreateDoctorDTO` | Newly created doctor object |
| `POST` | `/auth/doctor/verifycode`| Verifies the OTP for doctor login. | **Body:** `{ email: string, code: string }` | Tokens and doctor object |
| `POST` | `/auth/doctor/verifyaccount`| Verifies a doctor's account. | **Body:** `{ email: string }` | Success message |
| `POST` | `/auth/refresh` | Refreshes the authentication token. | **Headers:** Requires Refresh Token in Authorization header | New `access_token` and `refresh_token` |
| `POST` | `/auth/google` | Handles Google OAuth login. | **Body:** `{ idToken: string }` | Tokens and user object |

> [!NOTE]  
> The OTP system currently has a development bypass where code `000000` is accepted without external verification.

---

## 2. Patient Management (`/patient`)

CRUD operations for Patient records.

| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `GET`  | `/patient` | Retrieves patient(s). | **Query (optional):** `id`, `email`, `name`<br>_If no query params are provided, it returns all patients._ | Array of `Patient` objects (or single `Patient` if ID provided) |
| `POST` | `/patient` | Creates a new patient. | **Body:** `CreatePatientDto` | Created `Patient` object |
| `PUT`  | `/patient` | Updates an existing patient. | **Query:** `id` (required)<br>**Body:** `UpdatePatientDto` | Updated `Patient` object |
| `DELETE`| `/patient`| Deletes a patient. | **Query:** `id` (required) | Deletion confirmation / status |

---

## 3. Health Measurements (`/health-measurement`)

Manages health measurements, units, and reference ranges.

| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `GET`  | `/health-measurement` | Retrieves health measurements. | **Query (optional):** `patient_id`, `id` | Array of `HealthMeasurement` objects |
| `POST` | `/health-measurement` | Creates a health measurement. | **Body:** `CreateMeasurementDto` | Created `HealthMeasurement` object |
| `PUT`  | `/health-measurement` | Updates a health measurement. | **Query:** `id` (required)<br>**Body:** `UpdateMeasurementDto` | Updated `HealthMeasurement` object |
| `DELETE`| `/health-measurement`| Deletes a health measurement. | **Query:** `id` (required) | Deletion confirmation / status |

### Measurement Units & Reference Ranges
| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `POST` | `/health-measurement/unit` | Creates a new measurement unit. | **Body:** `CreateMeasurementUnitDto` | Created `MeasurementUnit` object |
| `GET`  | `/health-measurement/unit` | Retrieves all measurement units. | - | Array of `MeasurementUnit` objects |
| `GET`  | `/health-measurement/reference-ranges` | Retrieves reference ranges. | **Query (optional):** `unit_id` | Array of `ReferenceRange` objects |

---

## 4. Medical Documents / Records (`/record`)

Handles file uploads and metadata for medical documents.

| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `GET`  | `/record` | Retrieves medical records. | **Query (optional):** `id`, `patient_id` | Array of `MedicalDocument` objects |
| `GET`  | `/record/document-url` | Gets document URL from measurement ID. | **Query:** `id` (required) | Object containing document `url` |
| `POST` | `/record/image/upload` | Uploads an image (PNG/JPEG). | **Form Data:**<br>- `file`: Express.Multer.File<br>- Body fields mapping to `CreateMedicalDocumentDto` | Created `MedicalDocument` metadata |
| `POST` | `/record/image/get-secure-url`| Generates a secure URL for a file. | **Body:** `{ file_url: string }` | Object containing secure `url` |

---

## 5. Sharing (`/share`)

Allows patients to share their health measurements securely.

| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `GET`  | `/share/shares` | Gets all active shares for a patient. | **Query:** `patient_id` (required) | Array of `AccessGrant` objects |
| `POST` | `/share` | Shares a measurement. | **Query:** `patient_id` (required)<br>**Body:** `ShareMeasurementDto` | Created `AccessGrant` object |
| `POST` | `/share/revoke` | Revokes an existing share. | **Query:** `patient_id` (required), `share_id` (required) | Revocation confirmation / status |

---

## 6. General / Utility

| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `GET`  | `/` | Health check / basic app info. | - | Simple greeting / status string |

---

> [!TIP]
> For exact Data Transfer Object (DTO) schemas, please refer to the respective `dto` files located in the `src/[module]/dto/` directories in the backend codebase.
