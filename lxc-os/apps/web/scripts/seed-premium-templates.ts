import * as dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding premium document templates...");

  await prisma.documentTemplate.deleteMany({
    where: {
      name: {
        in: [
          "Premium Student ID Card (Front)",
          "Premium Student ID Card (Back)",
        ],
      },
    },
  });

  const templates = [
    {
      name: "Premium Student ID Card",
      description:
        "Standard CR80 size (54mm x 86mm) ID card containing both front and back designs with elegant styling.",
      type: "ID_CARD",
      category: "STUDENT_ID",
      isDefault: true,
      status: "PUBLISHED",
      content: `
<div style="display: flex; gap: 10mm; flex-wrap: wrap; justify-content: center; align-items: flex-start; padding: 5mm;">
  <!-- Front -->
  <div style="width: 54mm; height: 86mm; box-sizing: border-box; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); border-radius: 4mm; position: relative; overflow: hidden; font-family: 'Inter', sans-serif; color: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <!-- Top Header Pattern -->
    <div style="position: absolute; top: -10mm; right: -10mm; width: 40mm; height: 40mm; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
    
    <div style="padding: 4mm; display: flex; flex-direction: column; align-items: center; text-align: center; height: 100%; box-sizing: border-box;">
      <!-- School Logo -->
      <div style="margin-bottom: 2mm; display: flex; flex-direction: column; align-items: center;">
        <div style="width: 12mm; height: 12mm; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1mm; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
          <img src="{{school.logo}}" alt="School Logo" style="width: 8mm; height: 8mm; object-fit: contain;" onerror="this.style.display='none'" />
          <!-- Fallback if no logo -->
          <span style="font-size: 6mm; color: #1e3a8a; font-weight: 800; line-height: 1;">LX</span>
        </div>
        <h2 style="margin: 0; font-size: 3.5mm; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">{{school.name}}</h2>
        <p style="margin: 0; font-size: 1.8mm; opacity: 0.9;">STUDENT IDENTITY CARD</p>
      </div>

      <!-- Student Photo -->
      <div style="width: 24mm; height: 30mm; background: white; border-radius: 2mm; padding: 0.8mm; margin-bottom: 3mm; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
        <div style="width: 100%; height: 100%; background-color: #f1f5f9; border-radius: 1.5mm; overflow: hidden; position: relative;">
          <img src="{{student.photoUrl}}" alt="Student" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://ui-avatars.com/api/?name={{student.name}}&background=e2e8f0&color=64748b&size=200'" />
        </div>
      </div>

      <!-- Student Info -->
      <div style="width: 100%; text-align: center; margin-bottom: 1mm;">
        <h1 style="margin: 0; font-size: 4.5mm; font-weight: 800; color: white;">{{student.name}}</h1>
        <p style="margin: 1mm 0 0 0; font-size: 2.8mm; color: #e0e7ff; font-weight: 600;">CLASS: {{student.className}}</p>
      </div>

      <!-- Info Grid -->
      <div style="width: 90%; background: rgba(255,255,255,0.1); border-radius: 2mm; padding: 2mm; margin-top: auto;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 1mm;">
          <span style="font-size: 2mm; opacity: 0.8;">DOB</span>
          <span style="font-size: 2mm; font-weight: 700;">{{student.dob}}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 1mm;">
          <span style="font-size: 2mm; opacity: 0.8;">BLOOD GROUP</span>
          <span style="font-size: 2mm; font-weight: 700;">{{student.bloodGroup}}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="font-size: 2mm; opacity: 0.8;">ID NUM</span>
          <span style="font-size: 2mm; font-weight: 700;">{{student.enrollmentNumber}}</span>
        </div>
      </div>
    </div>

    <!-- Bottom Bar with Barcode placeholder -->
    <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 10mm; background: white; display: flex; align-items: center; justify-content: center;">
      <img src="https://barcode.tec-it.com/barcode.ashx?data={{student.enrollmentNumber}}&code=Code128&translate-esc=on" alt="Barcode" style="height: 6mm; object-fit: contain; opacity: 0.8;" onerror="this.style.display='none'" />
      <span style="font-size: 2mm; color: #64748b; font-family: monospace; font-weight: 600; display: block;">*{{student.enrollmentNumber}}*</span>
    </div>
  </div>

  <!-- Back -->
  <div style="width: 54mm; height: 86mm; box-sizing: border-box; background: white; border: 1px solid #e2e8f0; border-radius: 4mm; padding: 5mm; display: flex; flex-direction: column; font-family: 'Inter', sans-serif; color: #1e293b; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); position: relative;">
    <div style="position: absolute; top: 0; left: 0; right: 0; height: 4mm; background: #3b82f6; border-top-left-radius: 4mm; border-top-right-radius: 4mm;"></div>
    
    <h3 style="margin: 2mm 0 3mm 0; font-size: 3mm; font-weight: 800; text-align: center; color: #1e3a8a; text-transform: uppercase;">Terms & Conditions</h3>
    
    <ul style="margin: 0; padding-left: 3mm; font-size: 1.8mm; line-height: 1.4; color: #475569; margin-bottom: 4mm;">
      <li style="margin-bottom: 1mm;">This card is the property of {{school.name}}.</li>
      <li style="margin-bottom: 1mm;">It is strictly non-transferable and must be surrendered upon graduation or withdrawal.</li>
      <li style="margin-bottom: 1mm;">Loss of this card must be reported immediately to the administration.</li>
    </ul>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 2mm; padding: 2mm; margin-bottom: 4mm;">
      <h4 style="margin: 0 0 1mm 0; font-size: 2mm; font-weight: 700; color: #0f172a;">Emergency Contact</h4>
      <div style="font-size: 1.8mm; color: #475569; margin-bottom: 0.5mm;"><strong>Name:</strong> {{student.parentName}}</div>
      <div style="font-size: 1.8mm; color: #475569;"><strong>Phone:</strong> {{student.parentPhone}}</div>
    </div>

    <div style="margin-bottom: auto;">
      <h4 style="margin: 0 0 1mm 0; font-size: 2mm; font-weight: 700; color: #0f172a;">School Address</h4>
      <div style="font-size: 1.8mm; color: #475569; line-height: 1.4;">{{school.address}}<br />{{school.city}}, {{school.state}} {{school.pincode}}</div>
      <div style="font-size: 1.8mm; color: #475569; margin-top: 1mm;"><strong>Ph:</strong> {{school.phone}}</div>
    </div>

    <div style="text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 2mm; margin-top: 2mm;">
      <p style="margin: 0; font-size: 1.8mm; color: #64748b; font-weight: 600;">VALID UNTIL</p>
      <p style="margin: 0.5mm 0 0 0; font-size: 3mm; font-weight: 800; color: #ef4444;">MAY 2027</p>
    </div>
  </div>
</div>
      `,
    },
    {
      name: "Gold Trim Achievement Certificate",
      description:
        "A4 Landscape certificate with premium gold trim borders, elegant typography, and official seal placeholder.",
      type: "CERTIFICATE",
      category: "ACHIEVEMENT",
      isDefault: true,
      status: "PUBLISHED",
      content: `
<div style="width: 297mm; height: 210mm; padding: 10mm; background-color: #ffffff; position: relative; font-family: 'Times New Roman', serif; color: #0f172a;">
  <!-- Double gold border -->
  <div style="position: absolute; top: 10mm; left: 10mm; right: 10mm; bottom: 10mm; border: 3mm double #b49f4c; border-radius: 4px;"></div>
  <div style="position: absolute; top: 12mm; left: 12mm; right: 12mm; bottom: 12mm; border: 1px solid #d4af37;"></div>
  
  <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative; z-index: 10; padding: 20mm;">
    <!-- School Header -->
    <div style="margin-bottom: 5mm; display: flex; flex-direction: column; align-items: center;">
      <h3 style="margin: 0; font-size: 24px; font-weight: bold; color: #1e3a8a; text-transform: uppercase; letter-spacing: 2px;">{{school.name}}</h3>
      <p style="margin: 5px 0 0 0; font-size: 14px; font-style: italic; color: #475569;">{{school.city}}, {{school.state}}</p>
    </div>

    <!-- Title -->
    <h1 style="margin: 0 0 10mm 0; font-size: 64px; color: #b49f4c; letter-spacing: 4px; line-height: 1;">CERTIFICATE</h1>
    <h2 style="margin: 0 0 10mm 0; font-size: 28px; font-weight: normal; letter-spacing: 8px; text-transform: uppercase;">Of Achievement</h2>

    <!-- Body -->
    <p style="font-size: 18px; font-style: italic; color: #64748b; margin-bottom: 5mm;">This is to proudly certify that</p>
    <h2 style="margin: 0 0 5mm 0; font-size: 48px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; min-width: 60%; color: #0f172a; font-family: 'Inter', sans-serif; font-weight: 700;">{{student.name}}</h2>
    
    <p style="font-size: 18px; line-height: 1.6; max-width: 80%; margin: 5mm auto;">
      has successfully completed the required course of study and demonstrated outstanding academic excellence during the academic year <strong>2025-2026</strong>. <br/>
      Awarded for outstanding performance in <strong>{{document.awardName || 'Academic Excellence'}}</strong>.
    </p>

    <!-- Signatures -->
    <div style="display: flex; justify-content: space-between; width: 80%; margin-top: 20mm; position: relative;">
      
      <!-- Seal Placeholder -->
      <div style="position: absolute; left: 50%; top: -10mm; transform: translateX(-50%); width: 35mm; height: 35mm; border-radius: 50%; background: #d4af37; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid white;">
        <!-- Inner ring -->
        <div style="width: 31mm; height: 31mm; border-radius: 50%; border: 1px dashed white; display: flex; align-items: center; justify-content: center; flex-direction: column; color: white;">
          <span style="font-size: 12px; font-family: 'Inter', sans-serif; font-weight: bold;">OFFICIAL</span>
          <span style="font-size: 14px; letter-spacing: 2px;">SEAL</span>
        </div>
      </div>

      <div style="text-align: center; width: 60mm;">
        <div style="border-bottom: 1px solid #1e293b; height: 20mm; margin-bottom: 5px;">
           <img src="{{signatures.principal}}" style="max-height: 100%; max-width: 100%;" onerror="this.style.display='none'" />
        </div>
        <p style="font-size: 16px; font-weight: bold; margin: 0;">Principal</p>
        <p style="font-size: 12px; color: #64748b; margin: 0;">{{school.name}}</p>
      </div>

      <div style="text-align: center; width: 60mm;">
        <div style="border-bottom: 1px solid #1e293b; height: 20mm; margin-bottom: 5px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 5px;">
           <span style="font-size: 16px; font-family: 'Inter', sans-serif; font-weight: 600;">{{document.date || 'June 15, 2026'}}</span>
        </div>
        <p style="font-size: 16px; font-weight: bold; margin: 0;">Date Issued</p>
      </div>

    </div>
  </div>
</div>
      `,
    },
    {
      name: "Modern Corporate Final Transcript",
      description:
        "A4 Portrait report card template with clean tables, subtle striping, and highly readable grading scales.",
      type: "REPORT_CARD",
      category: "FINAL_EXAM",
      isDefault: true,
      status: "PUBLISHED",
      content: `
<div style="width: 210mm; height: 297mm; padding: 15mm; background-color: #ffffff; font-family: 'Inter', sans-serif; color: #1e293b;">
  
  <!-- Header Section -->
  <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 6mm; margin-bottom: 6mm;">
    <div style="display: flex; gap: 4mm; align-items: center;">
      <div style="width: 20mm; height: 20mm; background: #bfdbfe; border-radius: 4px; display: flex; justify-content: center; align-items: center;">
         <img src="{{school.logo}}" alt="Logo" style="width: 16mm; height: 16mm; object-fit: contain;" onerror="this.style.display='none'" />
      </div>
      <div>
        <h1 style="margin: 0 0 2px 0; font-size: 24px; font-weight: 800; color: #0f172a; text-transform: uppercase;">{{school.name}}</h1>
        <p style="margin: 0; font-size: 12px; color: #64748b;">{{school.address}}, {{school.city}} {{school.pincode}}</p>
        <p style="margin: 0; font-size: 12px; color: #64748b;">Phone: {{school.phone}} | Email: {{school.email}}</p>
      </div>
    </div>
    <div style="text-align: right;">
      <h2 style="margin: 0 0 5px 0; font-size: 18px; font-weight: 700; color: #2563eb;">OFFICIAL TRANSCRIPT</h2>
      <p style="margin: 0; font-size: 14px; font-weight: 600;">Academic Year: <span style="color: #64748b;">2025-2026</span></p>
      <p style="margin: 0; font-size: 12px; color: #64748b;">Term: Final Examination</p>
    </div>
  </div>

  <!-- Student Info Card -->
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6mm; margin-bottom: 8mm; display: grid; grid-template-columns: 1fr 1fr; gap: 4mm;">
    <div>
      <div style="margin-bottom: 2mm;"><strong style="font-size: 12px; color: #94a3b8; text-transform: uppercase;">Student Name</strong><br/><span style="font-size: 16px; font-weight: 700; color: #0f172a;">{{student.name}}</span></div>
      <div style="margin-bottom: 2mm;"><strong style="font-size: 12px; color: #94a3b8; text-transform: uppercase;">Enrollment No.</strong><br/><span style="font-size: 14px; font-weight: 500;">{{student.enrollmentNumber || 'N/A'}}</span></div>
      <div><strong style="font-size: 12px; color: #94a3b8; text-transform: uppercase;">Date of Birth</strong><br/><span style="font-size: 14px; font-weight: 500;">{{student.dob}}</span></div>
    </div>
    <div>
      <div style="margin-bottom: 2mm;"><strong style="font-size: 12px; color: #94a3b8; text-transform: uppercase;">Class & Section</strong><br/><span style="font-size: 16px; font-weight: 700; color: #0f172a;">{{student.className}}</span></div>
      <div style="margin-bottom: 2mm;"><strong style="font-size: 12px; color: #94a3b8; text-transform: uppercase;">Class Teacher</strong><br/><span style="font-size: 14px; font-weight: 500;">{{student.classTeacher || 'Teacher Name'}}</span></div>
      <div><strong style="font-size: 12px; color: #94a3b8; text-transform: uppercase;">Attendance</strong><br/><span style="font-size: 14px; font-weight: 500;">94% Tracker</span></div>
    </div>
  </div>

  <!-- Grades Table -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 8mm; font-size: 14px;">
    <thead>
      <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
        <th style="padding: 10px; text-align: left; font-weight: 700; color: #334155; width: 40%;">Subject</th>
        <th style="padding: 10px; text-align: center; font-weight: 700; color: #334155;">Maximum Marks</th>
        <th style="padding: 10px; text-align: center; font-weight: 700; color: #334155;">Marks Obtained</th>
        <th style="padding: 10px; text-align: center; font-weight: 700; color: #334155;">Grade</th>
      </tr>
    </thead>
    <tbody>
      <!-- Example row (In a real system, you'd iterate over {{grades}} array) -->
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-weight: 600;">Mathematics</td>
        <td style="padding: 10px; text-align: center;">100</td>
        <td style="padding: 10px; text-align: center;">92</td>
        <td style="padding: 10px; text-align: center; font-weight: 700; color: #16a34a;">A1</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafbfc;">
        <td style="padding: 10px; font-weight: 600;">Science</td>
        <td style="padding: 10px; text-align: center;">100</td>
        <td style="padding: 10px; text-align: center;">88</td>
        <td style="padding: 10px; text-align: center; font-weight: 700; color: #16a34a;">A2</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-weight: 600;">English Literature</td>
        <td style="padding: 10px; text-align: center;">100</td>
        <td style="padding: 10px; text-align: center;">85</td>
        <td style="padding: 10px; text-align: center; font-weight: 700; color: #16a34a;">A2</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0; background-color: #fafbfc;">
        <td style="padding: 10px; font-weight: 600;">Social Studies</td>
        <td style="padding: 10px; text-align: center;">100</td>
        <td style="padding: 10px; text-align: center;">95</td>
        <td style="padding: 10px; text-align: center; font-weight: 700; color: #16a34a;">A1</td>
      </tr>
      <tr style="border-bottom: 2px solid #cbd5e1; background-color: #f1f5f9; font-weight: bold;">
        <td style="padding: 10px;">Total</td>
        <td style="padding: 10px; text-align: center;">400</td>
        <td style="padding: 10px; text-align: center;">360</td>
        <td style="padding: 10px; text-align: center;">90%</td>
      </tr>
    </tbody>
  </table>

  <!-- Remarks & Grading Scale -->
  <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 6mm; margin-bottom: 15mm;">
    <!-- Remarks -->
    <div>
      <h3 style="margin: 0 0 2mm 0; font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase;">Class Teacher's Remarks</h3>
      <div style="border: 1px dashed #cbd5e1; border-radius: 6px; padding: 4mm; font-size: 14px; font-style: italic; color: #475569; min-height: 20mm;">
        An outstanding performance this year. Shows great analytical thinking and leadership qualities in class activities. Keep it up!
      </div>
      <p style="margin-top: 4mm; font-size: 14px;"><strong>Result:</strong> PASSED and Promoted to Next Class.</p>
    </div>

    <!-- Scale -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4mm;">
      <h3 style="margin: 0 0 2mm 0; font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; text-align: center;">Grading Scale</h3>
      <table style="width: 100%; font-size: 11px;">
        <tbody>
          <tr><td style="padding: 2px;">91 - 100</td><td style="font-weight: bold;">A1</td></tr>
          <tr><td style="padding: 2px;">81 - 90</td><td style="font-weight: bold;">A2</td></tr>
          <tr><td style="padding: 2px;">71 - 80</td><td style="font-weight: bold;">B1</td></tr>
          <tr><td style="padding: 2px;">61 - 70</td><td style="font-weight: bold;">B2</td></tr>
          <tr><td style="padding: 2px;">51 - 60</td><td style="font-weight: bold;">C1</td></tr>
          <tr><td style="padding: 2px;">Below 35</td><td style="color: red; font-weight: bold;">Fail</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Signatures -->
  <div style="display: flex; justify-content: space-between; margin-top: auto; padding-top: 10mm;">
    <div style="text-align: center; width: 45mm;">
      <div style="border-bottom: 1px solid #64748b; height: 15mm; margin-bottom: 2mm;"></div>
      <p style="margin: 0; font-size: 12px; font-weight: 600; color: #334155;">Class Teacher</p>
    </div>
    <div style="text-align: center; width: 45mm;">
      <div style="border-bottom: 1px solid #64748b; height: 15mm; margin-bottom: 2mm; display: flex; align-items: flex-end; justify-content: center;">
         <span style="font-size: 12px;">{{document.date || 'June 15, 2026'}}</span>
      </div>
      <p style="margin: 0; font-size: 12px; font-weight: 600; color: #334155;">Date Issued</p>
    </div>
    <div style="text-align: center; width: 45mm;">
      <div style="border-bottom: 1px solid #64748b; height: 15mm; margin-bottom: 2mm;">
         <img src="{{signatures.principal}}" style="max-height: 100%; max-width: 100%;" onerror="this.style.display='none'" />
      </div>
      <p style="margin: 0; font-size: 12px; font-weight: 600; color: #334155;">Principal</p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 8mm;">
    <p style="font-size: 10px; color: #94a3b8;">This document is electronically generated and secured via LearnXChain Blockchain technology.</p>
  </div>

</div>
      `,
    },
  ];

  for (const template of templates) {
    // Upsert by name so it doesn't duplicate if run multiple times
    const exists = await prisma.documentTemplate.findFirst({
      where: { name: template.name },
    });

    if (exists) {
      await prisma.documentTemplate.update({
        where: { id: exists.id },
        data: template as any,
      });
      console.log(`Updated ${template.name}`);
    } else {
      await prisma.documentTemplate.create({
        data: template as any,
      });
      console.log(`Created ${template.name}`);
    }
  }

  console.log("Premium templates seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
