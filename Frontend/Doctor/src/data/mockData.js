export const sessions = [
  { id: 1, patient: 'Sarah Johnson', specialty: 'Cardiology Follow-up', remaining: '18 min left', status: 'warning', insights: 'Elevated BP and LDL levels', access: 'OTP verified' },
  { id: 2, patient: 'Robert Martinez', specialty: 'Diabetes Review', remaining: '42 min left', status: 'success', insights: 'HbA1c stable this month', access: 'QR session' },
  { id: 3, patient: 'Emily Davis', specialty: 'Chest Imaging', remaining: '09 min left', status: 'danger', insights: 'Urgent chest X-ray flagged', access: 'Access code' },
];

export const patientSummary = {
  name: 'Rajesh Kumar Sharma',
  age: 47,
  gender: 'Male',
  bloodGroup: 'B+',
  accessTimer: '14m 23s',
  overview: [
    { label: 'Total Reports', value: 18 },
    { label: 'Abnormal Findings', value: 4 },
    { label: 'Latest Report', value: '24 Mar' },
  ],
  insights: [
    { title: 'Blood Glucose', value: '162 mg/dL', status: 'warning' },
    { title: 'Blood Pressure', value: '146 / 92', status: 'danger' },
    { title: 'BMI Index', value: '28.1', status: 'warning' },
  ],
};

export const reports = [
  { id: 'cbc', title: 'Complete Blood Count', type: 'Lab Report', date: '24 Mar 2026', status: 'warning', patient: 'Rajesh Sharma' },
  { id: 'lipid', title: 'Lipid Profile', type: 'Lab Report', date: '20 Mar 2026', status: 'danger', patient: 'Rajesh Sharma' },
  { id: 'xray', title: 'Chest X-Ray Digital', type: 'Imaging', date: '12 Mar 2026', status: 'success', patient: 'Rajesh Sharma' },
  { id: 'bp', title: 'Weekly BP Monitor', type: 'Vitals', date: '09 Mar 2026', status: 'warning', patient: 'Rajesh Sharma' },
];

export const reportDetails = {
  cbc: {
    title: 'Complete Blood Count (CBC) Report',
    category: 'Laboratory',
    date: '24 Mar 2026',
    patient: 'Rajesh Kumar Sharma',
    doctorNote: 'Follow up in 2 weeks. Monitor fatigue and review iron supplementation response.',
    aiSummary: 'Mild anemia pattern with low hemoglobin and borderline RBC count. Platelets within range.',
    values: [
      ['Hemoglobin', '10.8 g/dL', 'danger'],
      ['RBC Count', '4.1 M/uL', 'warning'],
      ['WBC Count', '8.2 K/uL', 'success'],
      ['Platelets', '280 K/uL', 'success'],
      ['Hematocrit', '33%', 'warning'],
      ['MCV', '78 fL', 'warning'],
    ],
  },
  lipid: {
    title: 'Lipid Profile',
    category: 'Laboratory',
    date: '20 Mar 2026',
    patient: 'Rajesh Kumar Sharma',
    doctorNote: 'Counsel on diet and consider statin escalation if trend persists.',
    aiSummary: 'LDL and triglycerides remain above target range. HDL is slightly below optimum.',
    values: [
      ['LDL', '172 mg/dL', 'danger'],
      ['Triglycerides', '238 mg/dL', 'danger'],
      ['HDL', '38 mg/dL', 'warning'],
      ['Total Cholesterol', '244 mg/dL', 'danger'],
    ],
  },
};

export const notifications = [
  'Session for Emily Davis expires in 9 minutes.',
  'New CBC report shared by Rajesh Kumar Sharma.',
  'Two abnormal findings require review today.',
];
