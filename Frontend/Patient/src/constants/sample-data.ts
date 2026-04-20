export const access_grant_data = [
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "doctor": {
      "id": "a3b91823-3e74-4b52-9457-3a1b2c4d5e6f",
      "name": "Dr. Sarah Khan",
      "gender": "female",
      "email": "sarah.khan@hospital.com",
      "phone": "+923001234567",
      "license_number": "PMDC-12345",
      "associated_hospital": "Aga Khan University Hospital",
      "specialization": "Cardiology",
      "is_verified": true,
      "created_at": "2024-01-10T10:00:00Z",
      "updated_at": "2024-01-15T14:30:00Z"
    },
    "patient": {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "name": "Ahmed Ali",
      "gender": "male",
      "email": "ahmed.ali@example.com",
      "phone": "+923211234567",
      "date_of_birth": "1990-05-15",
      "blood_group": "O+",
      "emergency_contacts": [
        {
          "name": "Fatima",
          "relation": "Wife",
          "phone": "+923331234567"
        }
      ],
      "reward_points": 150,
      "is_research_opt_in": true,
      "created_at": "2024-02-20T14:30:00Z",
      "updated_at": "2024-03-01T09:15:00Z"
    },
    "health_measurement": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "document_id": "987fcdeb-51a2-43f7-b890-1a2b3c4d5e6f",
      "patient_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "unit_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "numeric_value": 120.5,
      "created_at": "2024-04-18T08:00:00Z",
      "updated_at": "2024-04-18T08:00:00Z"
    },
    "access_token": "tok_abc123xyz890",
    "permission": "view_only",
    "is_revoked": false,
    "expires_at": "2026-5-31T23:59:59Z"
  },
  {
    "id": "71a23c45-d6e7-89f0-1234-56789abcde12",
    "doctor": {
      "id": "d5d6d7d8-e5f6-7890-1234-56789abcdef0",
      "name": "Dr. Fahad Mustafa",
      "gender": "male",
      "email": "fahad.mustafa@clinic.pk",
      "phone": "+923451234567",
      "license_number": "PMDC-67890",
      "associated_hospital": "Liaquat National Hospital",
      "specialization": "Endocrinology",
      "is_verified": true,
      "created_at": "2023-11-05T11:20:00Z",
      "updated_at": "2024-01-15T16:45:00Z"
    },
    "patient": {
      "id": "p5p6p7p8-e5f6-7890-1234-56789abcdef0",
      "name": "Zainab Abbas",
      "gender": "female",
      "email": "zainab.a@example.com",
      "phone": "+923111234567",
      "date_of_birth": "1985-11-22",
      "blood_group": "A-",
      "emergency_contacts": [],
      "reward_points": 0,
      "is_research_opt_in": false,
      "created_at": "2024-01-25T10:10:00Z",
      "updated_at": "2024-01-25T10:10:00Z"
    },
    "health_measurement": null,
    "access_token": "tok_xyz987abc321",
    "permission": "full_access",
    "is_revoked": false,
    "expires_at": "2025-01-25T10:10:00Z"
  }
]