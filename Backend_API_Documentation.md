# Sehat Scan Backend API Documentation

This document provides a comprehensive overview of the backend API endpoints available in the Sehat Scan application.

## Base URL
The API is typically accessible at `http://localhost:3000` (or your configured port/domain) plus the respective endpoint path.

---

## 1. Authentication (`/auth`)

Handles patient and doctor registration, login (via OTP or Google), and session management.

| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `POST` | `/auth/requestcode` | Requests a login OTP for a user. | **Body:** `{ "email": "string" }` | `{ "status": "string" }` |
| `POST` | `/auth/verifycode` | Verifies the OTP for patient login. | **Body:** `{ "email": "string", "code": "string" }` | `{ "id": "uuid", "jwtToken": "string", "refreshToken": "string" }` |
| `POST` | `/auth/register` | Registers a new patient. | **Body:** `{ "name": "string", "email": "string", "gender": "male/female/other", "date_of_birth": "string(ISO Date)", "phone?": "string", "blood_group?": "string", "emergency_contacts?": "[{ key: value }]", "reward_points?": "number", "is_research_opt_in?": "boolean" }` | `{ "id": "uuid", "jwtToken": "string", "refreshToken": "string" }` |
| `POST` | `/auth/doctor/register` | Registers a new doctor. | **Body:** `{ "name": "string", "email": "string", "gender": "male/female/other", "phone": "string", "license_number": "string", "associated_hospital?": "string", "specialization?": "string" }` | `{ "id": "uuid", "jwtToken": "string", "refreshToken": "string" }` |
| `POST` | `/auth/doctor/verifycode`| Verifies the OTP for doctor login. | **Body:** `{ "email": "string", "code": "string" }` | `{ "id": "uuid", "jwtToken": "string", "refreshToken": "string" }` |
| `POST` | `/auth/doctor/verifyaccount`| Verifies a doctor's account. | **Body:** `{ "email": "string" }` | `{ "status": "string" }` |
| `POST` | `/auth/refresh` | Refreshes the authentication token. | **Headers:** Requires Refresh Token in Authorization header | `{ "id": "uuid", "jwt": "string" }` |
| `POST` | `/auth/google` | Handles Google OAuth login. | **Body:** `{ "idToken": "string" }` | `{ "message": "string", "user": { "id": "uuid", "name": "string", "email": "string", ... } }` |

> [!NOTE]  
> The OTP system currently has a development bypass where code `000000` is accepted without external verification.

---

## 2. Patient Management (`/patient`)

CRUD operations for Patient records.

| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `GET`  | `/patient` | Retrieves patient(s). | **Query (optional):** `id`, `email`, `name`. _If no query params are provided, it returns all patients._ | Array of (or single) Patient Object(s): `{ "id": "uuid", "name": "string", "email": "string", "gender": "male/female/other", "phone": "string/null", "date_of_birth": "string(ISO)", "blood_group": "string/null", "emergency_contacts": "[{key:value}]/null", "reward_points": "number", "is_research_opt_in": "boolean", "created_at": "string(ISO)", "updated_at": "string(ISO)" }` |
| `POST` | `/patient` | Creates a new patient. | **Body:** (See `/auth/register` body parameters) | `{ "id": "uuid", "name": "string", "email": "string", "gender": "male/female/other", "phone": "string/null", "date_of_birth": "string(ISO)", "blood_group": "string/null", "emergency_contacts": "[{key:value}]/null", "reward_points": "number", "is_research_opt_in": "boolean", "created_at": "string(ISO)", "updated_at": "string(ISO)" }` |
| `PUT`  | `/patient` | Updates an existing patient. | **Query:** `id` (required) **Body:** (Same as `/auth/register` but all fields are optional) | `{ "id": "uuid", "name": "string", "email": "string", "gender": "male/female/other", "phone": "string/null", "date_of_birth": "string(ISO)", "blood_group": "string/null", "emergency_contacts": "[{key:value}]/null", "reward_points": "number", "is_research_opt_in": "boolean", "created_at": "string(ISO)", "updated_at": "string(ISO)" }` |
| `DELETE`| `/patient`| Deletes a patient. | **Query:** `id` (required) | `void` |

---

## 3. Health Measurements (`/health-measurement`)

Manages health measurements, units, and reference ranges.

| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `GET`  | `/health-measurement` | Retrieves health measurements. | **Query (optional):** `patient_id`, `id` | `[ { "id": "uuid", "document_id": "uuid/null", "patient_id": "uuid", "unit_id": "uuid", "numeric_value": "number", "special_conditions": "string[]", "created_at": "string(ISO)", "updated_at": "string(ISO)" } ]` |
| `POST` | `/health-measurement` | Creates a health measurement. | **Body:** `{ "patient_id": "uuid", "unit_id": "uuid", "numeric_value": "number", "document_id?": "uuid", "special_conditions?": "string[]" }` | `{ "id": "uuid", "document_id": "uuid/null", "patient_id": "uuid", "unit_id": "uuid", "numeric_value": "number", "special_conditions": "string[]", "created_at": "string(ISO)", "updated_at": "string(ISO)" }` |
| `PUT`  | `/health-measurement` | Updates a health measurement. | **Query:** `id` (required) **Body:** (Same as POST but all fields optional) | Measurement Object or `null` |
| `DELETE`| `/health-measurement`| Deletes a health measurement. | **Query:** `id` (required) | `void` |

### Measurement Units & Reference Ranges
| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `POST` | `/health-measurement/unit` | Creates a new measurement unit. | **Body:** `{ "unit_name": "string", "symbol": "string", "measurement_group": "string" }` | Unit Object: `{ "id": "uuid", "unit_name": "string", "symbol": "string", "measurement_group": "string" }` |
| `GET`  | `/health-measurement/unit` | Retrieves all measurement units. | - | `[ { "id": "uuid", "unit_name": "string", "symbol": "string", "measurement_group": "string" } ]` |
| `GET`  | `/health-measurement/reference-ranges` | Retrieves reference ranges. | **Query (optional):** `unit_id` | `[ { "id": "uuid", "unit_id": "uuid", "min_value": "number", "max_value": "number", "target_gender": "male/female/other/null", "min_age": "number/null", "max_age": "number/null", "special_conditions": "string[]/null" } ]` |

---

## 4. Medical Documents / Records (`/record`)

Handles file uploads and metadata for medical documents.

| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `GET`  | `/record` | Retrieves medical records. | **Query (optional):** `id`, `patient_id` | `[ { "id": "uuid", "patient_id": "uuid", "file_name": "string", "file_url": "string", "record_type": "lab_report/prescription/...", "ocr_extracted_text": "string/null", "date_issued": "string(ISO)/null", "created_at": "string(ISO)", "updated_at": "string(ISO)" } ]` |
| `GET`  | `/record/document-url` | Gets document URL from measurement ID. | **Query:** `id` (required) | `{ "url": "string" }` |
| `POST` | `/record/image/upload` | Uploads an image (PNG/JPEG). | **Form Data:** `- file`: Binary Image Data, Body Fields: `{ "patient_id": "uuid", "record_type": "lab_report/prescription/...", "file_name?": "string", "date_issued?": "string(ISO)" }` | `{ "id": "uuid", "patient_id": "uuid", "file_name": "string", "file_url": "string", "record_type": "lab_report/prescription/...", "ocr_extracted_text": "string/null", "date_issued": "string(ISO)/null", "created_at": "string(ISO)", "updated_at": "string(ISO)" }` |
| `POST` | `/record/image/get-secure-url`| Generates a secure URL for a file. | **Body:** `{ "file_url": "string" }` | `{ "url": "string" }` |

---

## 5. Sharing (`/share`)

Allows patients to share their health measurements securely.

| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `GET`  | `/share/shares` | Retrieves the health measurements associated with a specific share grant. | **Query:** `share_id` (required) | `[ { "id": "uuid", "patient_id": "uuid", "unit_id": "uuid", "numeric_value": "number", "created_at": "string(ISO)", "updated_at": "string(ISO)", "patient": {...}, "measurement_unit": {...} } ]` |
| `POST` | `/share` | Shares a measurement. | **Query:** `patient_id` (required) **Body:** `{ "doctorEmail": "string", "measurement_ids?": "uuid[]", "permission?": "string" }` | `{ "id": "uuid", "patient_id": "uuid", "doctor_id": "uuid", "measurement_ids": "uuid[]", "permission": "string", "created_at": "string(ISO)", "updated_at": "string(ISO)" }` |
| `POST` | `/share/revoke` | Revokes an existing share. | **Query:** `patient_id` (required), `share_id` (required) | `void` |

---

## 6. General / Utility

| Method | Endpoint | Description | Request Details | Output Details |
|--------|----------|-------------|-----------------|----------------|
| `GET`  | `/` | Health check / basic app info. | - | `string` |

---

> [!TIP]
> This document uses explicit JSON schemas to describe the shape of requests and responses for clarity.
