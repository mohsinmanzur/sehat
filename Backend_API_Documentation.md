# Sehat Scan Backend API Documentation

This document provides a comprehensive overview of the backend API endpoints available in the Sehat Scan application.

## Base URL
The API is typically accessible at `http://localhost:3000` (or your configured port/domain) plus the respective endpoint path.

---

## 1. Authentication (`/auth`)

Handles patient and doctor registration, login (via OTP or Google), and session management.

| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `POST` | `/auth/requestcode` | Requests a login OTP for a user. | **Body:**<br><code>{<br>&nbsp;&nbsp;"email": "string"<br>}</code> | <code>{<br>&nbsp;&nbsp;"status": "string"<br>}</code> |
| `POST` | `/auth/verifycode` | Verifies the OTP for patient login. | **Body:**<br><code>{<br>&nbsp;&nbsp;"email": "string",<br>&nbsp;&nbsp;"code": "string"<br>}</code> | <code>{<br>&nbsp;&nbsp;"access_token": "string",<br>&nbsp;&nbsp;"refresh_token": "string"<br>}</code> |
| `POST` | `/auth/register` | Registers a new patient. | **Body:**<br><code>{<br>&nbsp;&nbsp;"name": "string",<br>&nbsp;&nbsp;"email": "string",<br>&nbsp;&nbsp;"gender": "male\|female\|other",<br>&nbsp;&nbsp;"date_of_birth": "string(ISO Date)",<br>&nbsp;&nbsp;"phone?": "string",<br>&nbsp;&nbsp;"blood_group?": "string",<br>&nbsp;&nbsp;"emergency_contacts?": "[{ key: value }]",<br>&nbsp;&nbsp;"reward_points?": "number",<br>&nbsp;&nbsp;"is_research_opt_in?": "boolean"<br>}</code> | <code>{<br>&nbsp;&nbsp;"access_token": "string",<br>&nbsp;&nbsp;"refresh_token": "string"<br>}</code> |
| `POST` | `/auth/doctor/register` | Registers a new doctor. | **Body:**<br><code>{<br>&nbsp;&nbsp;"name": "string",<br>&nbsp;&nbsp;"email": "string",<br>&nbsp;&nbsp;"gender": "male\|female\|other",<br>&nbsp;&nbsp;"phone": "string",<br>&nbsp;&nbsp;"license_number": "string",<br>&nbsp;&nbsp;"associated_hospital?": "string",<br>&nbsp;&nbsp;"specialization?": "string"<br>}</code> | <code>{<br>&nbsp;&nbsp;"access_token": "string",<br>&nbsp;&nbsp;"refresh_token": "string"<br>}</code> |
| `POST` | `/auth/doctor/verifycode`| Verifies the OTP for doctor login. | **Body:**<br><code>{<br>&nbsp;&nbsp;"email": "string",<br>&nbsp;&nbsp;"code": "string"<br>}</code> | <code>{<br>&nbsp;&nbsp;"access_token": "string",<br>&nbsp;&nbsp;"refresh_token": "string"<br>}</code> |
| `POST` | `/auth/doctor/verifyaccount`| Verifies a doctor's account. | **Body:**<br><code>{<br>&nbsp;&nbsp;"email": "string"<br>}</code> | <code>{<br>&nbsp;&nbsp;"status": "string"<br>}</code> |
| `POST` | `/auth/refresh` | Refreshes the authentication token. | **Headers:** Requires Refresh Token in Authorization header | <code>{<br>&nbsp;&nbsp;"access_token": "string",<br>&nbsp;&nbsp;"refresh_token": "string"<br>}</code> |
| `POST` | `/auth/google` | Handles Google OAuth login. | **Body:**<br><code>{<br>&nbsp;&nbsp;"idToken": "string"<br>}</code> | <code>{<br>&nbsp;&nbsp;"message": "string",<br>&nbsp;&nbsp;"user": {<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "uuid",<br>&nbsp;&nbsp;&nbsp;&nbsp;"name": "string",<br>&nbsp;&nbsp;&nbsp;&nbsp;"email": "string",<br>&nbsp;&nbsp;&nbsp;&nbsp;...<br>&nbsp;&nbsp;}<br>}</code> |

> [!NOTE]  
> The OTP system currently has a development bypass where code `000000` is accepted without external verification.

---

## 2. Patient Management (`/patient`)

CRUD operations for Patient records.

| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `GET`  | `/patient` | Retrieves patient(s). | **Query (optional):** `id`, `email`, `name`<br>_If no query params are provided, it returns all patients._ | Array of (or single) Patient Object(s):<br><code>{<br>&nbsp;&nbsp;"id": "uuid",<br>&nbsp;&nbsp;"name": "string",<br>&nbsp;&nbsp;"email": "string",<br>&nbsp;&nbsp;"gender": "male\|female\|other",<br>&nbsp;&nbsp;"phone": "string\|null",<br>&nbsp;&nbsp;"date_of_birth": "string(ISO)",<br>&nbsp;&nbsp;"blood_group": "string\|null",<br>&nbsp;&nbsp;"emergency_contacts": "[{key:value}]\|null",<br>&nbsp;&nbsp;"reward_points": "number",<br>&nbsp;&nbsp;"is_research_opt_in": "boolean",<br>&nbsp;&nbsp;"created_at": "string(ISO)",<br>&nbsp;&nbsp;"updated_at": "string(ISO)"<br>}</code> |
| `POST` | `/patient` | Creates a new patient. | **Body:**<br>(See `/auth/register` body parameters) | Patient Object |
| `PUT`  | `/patient` | Updates an existing patient. | **Query:** `id` (required)<br>**Body:**<br>(Same as `/auth/register` but all fields are optional) | Patient Object \| `null` |
| `DELETE`| `/patient`| Deletes a patient. | **Query:** `id` (required) | `void` |

---

## 3. Health Measurements (`/health-measurement`)

Manages health measurements, units, and reference ranges.

| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `GET`  | `/health-measurement` | Retrieves health measurements. | **Query (optional):** `patient_id`, `id` | Array of Measurement Objects:<br><code>{<br>&nbsp;&nbsp;"id": "uuid",<br>&nbsp;&nbsp;"document_id": "uuid\|null",<br>&nbsp;&nbsp;"patient_id": "uuid",<br>&nbsp;&nbsp;"unit_id": "uuid",<br>&nbsp;&nbsp;"numeric_value": "number",<br>&nbsp;&nbsp;"created_at": "string(ISO)",<br>&nbsp;&nbsp;"updated_at": "string(ISO)"<br>}</code> |
| `POST` | `/health-measurement` | Creates a health measurement. | **Body:**<br><code>{<br>&nbsp;&nbsp;"patient_id": "uuid",<br>&nbsp;&nbsp;"unit_id": "uuid",<br>&nbsp;&nbsp;"numeric_value": "number",<br>&nbsp;&nbsp;"document_id?": "uuid",<br>&nbsp;&nbsp;"special_conditions?": "string[]"<br>}</code> | Measurement Object |
| `PUT`  | `/health-measurement` | Updates a health measurement. | **Query:** `id` (required)<br>**Body:**<br>(Same as POST but all fields optional) | Measurement Object \| `null` |
| `DELETE`| `/health-measurement`| Deletes a health measurement. | **Query:** `id` (required) | `void` |

### Measurement Units & Reference Ranges
| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `POST` | `/health-measurement/unit` | Creates a new measurement unit. | **Body:**<br><code>{<br>&nbsp;&nbsp;"unit_name": "string",<br>&nbsp;&nbsp;"symbol": "string",<br>&nbsp;&nbsp;"measurement_group": "string"<br>}</code> | Unit Object:<br><code>{<br>&nbsp;&nbsp;"id": "uuid",<br>&nbsp;&nbsp;"unit_name": "string",<br>&nbsp;&nbsp;"symbol": "string",<br>&nbsp;&nbsp;"measurement_group": "string"<br>}</code> |
| `GET`  | `/health-measurement/unit` | Retrieves all measurement units. | - | Array of Unit Objects |
| `GET`  | `/health-measurement/reference-ranges` | Retrieves reference ranges. | **Query (optional):** `unit_id` | Array of Reference Range Objects:<br><code>{<br>&nbsp;&nbsp;"id": "uuid",<br>&nbsp;&nbsp;"unit_id": "uuid",<br>&nbsp;&nbsp;"min_value": "number",<br>&nbsp;&nbsp;"max_value": "number",<br>&nbsp;&nbsp;"target_gender": "male\|female\|other\|null",<br>&nbsp;&nbsp;"min_age": "number\|null",<br>&nbsp;&nbsp;"max_age": "number\|null",<br>&nbsp;&nbsp;"special_conditions": "string[]\|null"<br>}</code> |

---

## 4. Medical Documents / Records (`/record`)

Handles file uploads and metadata for medical documents.

| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `GET`  | `/record` | Retrieves medical records. | **Query (optional):** `id`, `patient_id` | Array of Document Objects:<br><code>{<br>&nbsp;&nbsp;"id": "uuid",<br>&nbsp;&nbsp;"patient_id": "uuid",<br>&nbsp;&nbsp;"file_name": "string",<br>&nbsp;&nbsp;"file_url": "string",<br>&nbsp;&nbsp;"record_type": "lab_report\|prescription\|...",<br>&nbsp;&nbsp;"ocr_extracted_text": "string\|null",<br>&nbsp;&nbsp;"date_issued": "string(ISO)\|null",<br>&nbsp;&nbsp;"created_at": "string(ISO)",<br>&nbsp;&nbsp;"updated_at": "string(ISO)"<br>}</code> |
| `GET`  | `/record/document-url` | Gets document URL from measurement ID. | **Query:** `id` (required) | <code>{<br>&nbsp;&nbsp;"url": "string"<br>}</code> |
| `POST` | `/record/image/upload` | Uploads an image (PNG/JPEG). | **Form Data:**<br>- `file`: Binary Image Data<br>- Body Fields:<br><code>{<br>&nbsp;&nbsp;"patient_id": "uuid",<br>&nbsp;&nbsp;"record_type": "lab_report\|prescription\|...",<br>&nbsp;&nbsp;"file_name?": "string",<br>&nbsp;&nbsp;"date_issued?": "string(ISO)"<br>}</code> | Document Object |
| `POST` | `/record/image/get-secure-url`| Generates a secure URL for a file. | **Body:**<br><code>{<br>&nbsp;&nbsp;"file_url": "string"<br>}</code> | <code>{<br>&nbsp;&nbsp;"url": "string"<br>}</code> |

---

## 5. Sharing (`/share`)

Allows patients to share their health measurements securely.

| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `GET`  | `/share/shares` | Gets all active shares for a patient. | **Query:** `patient_id` (required) | Array of Access Grant Objects:<br><code>{<br>&nbsp;&nbsp;"id": "uuid",<br>&nbsp;&nbsp;"patient_id": "uuid",<br>&nbsp;&nbsp;"doctor_id": "uuid",<br>&nbsp;&nbsp;"measurement_ids": "uuid[]",<br>&nbsp;&nbsp;"permission": "string",<br>&nbsp;&nbsp;"created_at": "string(ISO)",<br>&nbsp;&nbsp;"updated_at": "string(ISO)"<br>}</code> |
| `POST` | `/share` | Shares a measurement. | **Query:** `patient_id` (required)<br>**Body:**<br><code>{<br>&nbsp;&nbsp;"doctorEmail": "string",<br>&nbsp;&nbsp;"measurement_ids?": "uuid[]",<br>&nbsp;&nbsp;"permission?": "string"<br>}</code> | Access Grant Object |
| `POST` | `/share/revoke` | Revokes an existing share. | **Query:** `patient_id` (required), `share_id` (required) | `void` |

---

## 6. General / Utility

| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `GET`  | `/` | Health check / basic app info. | - | `string` |

---

> [!TIP]
> This document uses explicit JSON schemas to describe the shape of requests and responses for clarity.
