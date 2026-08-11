export const PREDEFINED_TEMPLATES = [
  {
    name: "Student ID Card",
    type: "ID_CARD",
    category: "STUDENT_ID",
    description: "Standard vertical ID card for students",
    content: "<html><body><h1>Student ID Card</h1><p>{{name}}</p></body></html>",
  },
  {
    name: "Teacher ID Card",
    type: "ID_CARD",
    category: "TEACHER_ID",
    description: "Professional ID card for teaching staff",
    content: "<html><body><h1>Staff ID Card</h1><p>{{name}}</p></body></html>",
  },
  {
    name: "Transfer Certificate",
    type: "CERTIFICATE",
    category: "TRANSFER",
    description: "Official school leaving/transfer certificate",
    content: "<html><body><h1>Transfer Certificate</h1><p>This is to certify that {{name}} has completed their studies.</p></body></html>",
  },
  {
    name: "Bonafide Certificate",
    type: "CERTIFICATE",
    category: "BONAFIDE",
    description: "Standard bonafide certificate for students",
    content: "<html><body><h1>Bonafide Certificate</h1><p>This is to certify that {{name}} is a bonafide student of this school.</p></body></html>",
  },
  {
    name: "Character Certificate",
    type: "CERTIFICATE",
    category: "CHARACTER",
    description: "Student character and conduct certificate",
    content: "<html><body><h1>Character Certificate</h1><p>The conduct of {{name}} has been exemplary.</p></body></html>",
  },
];
