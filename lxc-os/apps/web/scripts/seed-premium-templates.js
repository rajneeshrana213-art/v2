"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = __importStar(require("dotenv"));
dotenv.config();
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var templates, _i, templates_1, template, exists;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Seeding premium document templates...");
                    templates = [
                        {
                            name: "Premium Student ID Card (Front)",
                            description: "Standard CR80 size (54mm x 86mm) ID card front with elegant gradient design and photo placeholder.",
                            type: "ID_CARD",
                            category: "STUDENT_ID",
                            isDefault: true,
                            status: "PUBLISHED",
                            content: "\n<div style=\"width: 54mm; height: 86mm; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); border-radius: 4mm; position: relative; overflow: hidden; font-family: 'Inter', sans-serif; color: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);\">\n  <!-- Top Header Pattern -->\n  <div style=\"position: absolute; top: -10mm; right: -10mm; width: 40mm; height: 40mm; background: rgba(255,255,255,0.1); border-radius: 50%;\"></div>\n  \n  <div style=\"padding: 4mm; display: flex; flex-direction: column; align-items: center; text-align: center;\">\n    <!-- School Logo -->\n    <div style=\"margin-bottom: 2mm; display: flex; flex-direction: column; align-items: center;\">\n      <div style=\"width: 12mm; height: 12mm; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1mm; box-shadow: 0 2px 4px rgba(0,0,0,0.2);\">\n        <img src=\"{{school.logo}}\" alt=\"School Logo\" style=\"width: 8mm; height: 8mm; object-fit: contain;\" onerror=\"this.style.display='none'\" />\n        <!-- Fallback if no logo -->\n        <span style=\"font-size: 6mm; color: #1e3a8a; font-weight: 800; line-height: 1;\">LX</span>\n      </div>\n      <h2 style=\"margin: 0; font-size: 3.5mm; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;\">{{school.name}}</h2>\n      <p style=\"margin: 0; font-size: 1.8mm; opacity: 0.9;\">STUDENT IDENTITY CARD</p>\n    </div>\n\n    <!-- Student Photo -->\n    <div style=\"width: 24mm; height: 30mm; background: white; border-radius: 2mm; padding: 0.8mm; margin-bottom: 3mm; box-shadow: 0 4px 10px rgba(0,0,0,0.3);\">\n      <div style=\"width: 100%; height: 100%; background-color: #f1f5f9; border-radius: 1.5mm; overflow: hidden; position: relative;\">\n        <img src=\"{{student.photoUrl}}\" alt=\"Student\" style=\"width: 100%; height: 100%; object-fit: cover;\" onerror=\"this.src='https://ui-avatars.com/api/?name={{student.name}}&background=e2e8f0&color=64748b&size=200'\" />\n      </div>\n    </div>\n\n    <!-- Student Info -->\n    <div style=\"width: 100%; text-align: center; margin-bottom: 1mm;\">\n      <h1 style=\"margin: 0; font-size: 4.5mm; font-weight: 800; color: white;\">{{student.name}}</h1>\n      <p style=\"margin: 1mm 0 0 0; font-size: 2.8mm; color: #e0e7ff; font-weight: 600;\">CLASS: {{student.className}}</p>\n    </div>\n\n    <!-- Info Grid -->\n    <div style=\"width: 90%; background: rgba(255,255,255,0.1); border-radius: 2mm; padding: 2mm; margin-top: auto;\">\n      <div style=\"display: flex; justify-content: space-between; margin-bottom: 1mm;\">\n        <span style=\"font-size: 2mm; opacity: 0.8;\">DOB</span>\n        <span style=\"font-size: 2mm; font-weight: 700;\">{{student.dob}}</span>\n      </div>\n      <div style=\"display: flex; justify-content: space-between; margin-bottom: 1mm;\">\n        <span style=\"font-size: 2mm; opacity: 0.8;\">BLOOD GROUP</span>\n        <span style=\"font-size: 2mm; font-weight: 700;\">{{student.bloodGroup}}</span>\n      </div>\n      <div style=\"display: flex; justify-content: space-between;\">\n        <span style=\"font-size: 2mm; opacity: 0.8;\">ID NUM</span>\n        <span style=\"font-size: 2mm; font-weight: 700;\">{{student.enrollmentNumber}}</span>\n      </div>\n    </div>\n  </div>\n\n  <!-- Bottom Bar with Barcode placeholder -->\n  <div style=\"position: absolute; bottom: 0; left: 0; right: 0; height: 10mm; background: white; display: flex; align-items: center; justify-content: center;\">\n    <img src=\"https://barcode.tec-it.com/barcode.ashx?data={{student.enrollmentNumber}}&code=Code128&translate-esc=on\" alt=\"Barcode\" style=\"height: 6mm; object-fit: contain; opacity: 0.8;\" onerror=\"this.style.display='none'\" />\n    <span style=\"font-size: 2mm; color: #64748b; font-family: monospace; font-weight: 600; display: block;\">*{{student.enrollmentNumber}}*</span>\n  </div>\n</div>\n      ",
                        },
                        {
                            name: "Premium Student ID Card (Back)",
                            description: "Standard CR80 size (54mm x 86mm) ID card back containing terms, emergency contacts, and validity.",
                            type: "ID_CARD",
                            category: "STUDENT_ID",
                            isDefault: false,
                            status: "PUBLISHED",
                            content: "\n<div style=\"width: 54mm; height: 86mm; background: white; border: 1px solid #e2e8f0; border-radius: 4mm; padding: 5mm; display: flex; flex-direction: column; font-family: 'Inter', sans-serif; color: #1e293b; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); position: relative;\">\n  <div style=\"position: absolute; top: 0; left: 0; right: 0; height: 4mm; background: #3b82f6; border-top-left-radius: 4mm; border-top-right-radius: 4mm;\"></div>\n  \n  <h3 style=\"margin: 2mm 0 3mm 0; font-size: 3mm; font-weight: 800; text-align: center; color: #1e3a8a; text-transform: uppercase;\">Terms & Conditions</h3>\n  \n  <ul style=\"margin: 0; padding-left: 3mm; font-size: 1.8mm; line-height: 1.4; color: #475569; margin-bottom: 4mm;\">\n    <li style=\"margin-bottom: 1mm;\">This card is the property of {{school.name}}.</li>\n    <li style=\"margin-bottom: 1mm;\">It is strictly non-transferable and must be surrendered upon graduation or withdrawal.</li>\n    <li style=\"margin-bottom: 1mm;\">Loss of this card must be reported immediately to the administration.</li>\n  </ul>\n\n  <div style=\"background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 2mm; padding: 2mm; margin-bottom: 4mm;\">\n    <h4 style=\"margin: 0 0 1mm 0; font-size: 2mm; font-weight: 700; color: #0f172a;\">Emergency Contact</h4>\n    <div style=\"font-size: 1.8mm; color: #475569; margin-bottom: 0.5mm;\"><strong>Name:</strong> {{student.parentName}}</div>\n    <div style=\"font-size: 1.8mm; color: #475569;\"><strong>Phone:</strong> {{student.parentPhone}}</div>\n  </div>\n\n  <div style=\"margin-bottom: auto;\">\n    <h4 style=\"margin: 0 0 1mm 0; font-size: 2mm; font-weight: 700; color: #0f172a;\">School Address</h4>\n    <div style=\"font-size: 1.8mm; color: #475569; line-height: 1.4;\">{{school.address}}<br />{{school.city}}, {{school.state}} {{school.pincode}}</div>\n    <div style=\"font-size: 1.8mm; color: #475569; margin-top: 1mm;\"><strong>Ph:</strong> {{school.phone}}</div>\n  </div>\n\n  <div style=\"text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 2mm; margin-top: 2mm;\">\n    <p style=\"margin: 0; font-size: 1.8mm; color: #64748b; font-weight: 600;\">VALID UNTIL</p>\n    <p style=\"margin: 0.5mm 0 0 0; font-size: 3mm; font-weight: 800; color: #ef4444;\">MAY 2027</p>\n  </div>\n</div>\n      ",
                        },
                        {
                            name: "Gold Trim Achievement Certificate",
                            description: "A4 Landscape certificate with premium gold trim borders, elegant typography, and official seal placeholder.",
                            type: "CERTIFICATE",
                            category: "ACHIEVEMENT",
                            isDefault: true,
                            status: "PUBLISHED",
                            content: "\n<div style=\"width: 297mm; height: 210mm; padding: 10mm; background-color: #ffffff; position: relative; font-family: 'Times New Roman', serif; color: #0f172a;\">\n  <!-- Double gold border -->\n  <div style=\"position: absolute; top: 10mm; left: 10mm; right: 10mm; bottom: 10mm; border: 3mm double #b49f4c; border-radius: 4px;\"></div>\n  <div style=\"position: absolute; top: 12mm; left: 12mm; right: 12mm; bottom: 12mm; border: 1px solid #d4af37;\"></div>\n  \n  <div style=\"width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative; z-index: 10; padding: 20mm;\">\n    <!-- School Header -->\n    <div style=\"margin-bottom: 5mm; display: flex; flex-direction: column; align-items: center;\">\n      <h3 style=\"margin: 0; font-size: 24px; font-weight: bold; color: #1e3a8a; text-transform: uppercase; letter-spacing: 2px;\">{{school.name}}</h3>\n      <p style=\"margin: 5px 0 0 0; font-size: 14px; font-style: italic; color: #475569;\">{{school.city}}, {{school.state}}</p>\n    </div>\n\n    <!-- Title -->\n    <h1 style=\"margin: 0 0 10mm 0; font-size: 64px; color: #b49f4c; letter-spacing: 4px; line-height: 1;\">CERTIFICATE</h1>\n    <h2 style=\"margin: 0 0 10mm 0; font-size: 28px; font-weight: normal; letter-spacing: 8px; text-transform: uppercase;\">Of Achievement</h2>\n\n    <!-- Body -->\n    <p style=\"font-size: 18px; font-style: italic; color: #64748b; margin-bottom: 5mm;\">This is to proudly certify that</p>\n    <h2 style=\"margin: 0 0 5mm 0; font-size: 48px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; min-width: 60%; color: #0f172a; font-family: 'Inter', sans-serif; font-weight: 700;\">{{student.name}}</h2>\n    \n    <p style=\"font-size: 18px; line-height: 1.6; max-width: 80%; margin: 5mm auto;\">\n      has successfully completed the required course of study and demonstrated outstanding academic excellence during the academic year <strong>2025-2026</strong>. <br/>\n      Awarded for outstanding performance in <strong>{{document.awardName || 'Academic Excellence'}}</strong>.\n    </p>\n\n    <!-- Signatures -->\n    <div style=\"display: flex; justify-content: space-between; width: 80%; margin-top: 20mm; position: relative;\">\n      \n      <!-- Seal Placeholder -->\n      <div style=\"position: absolute; left: 50%; top: -10mm; transform: translateX(-50%); width: 35mm; height: 35mm; border-radius: 50%; background: #d4af37; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid white;\">\n        <!-- Inner ring -->\n        <div style=\"width: 31mm; height: 31mm; border-radius: 50%; border: 1px dashed white; display: flex; align-items: center; justify-content: center; flex-direction: column; color: white;\">\n          <span style=\"font-size: 12px; font-family: 'Inter', sans-serif; font-weight: bold;\">OFFICIAL</span>\n          <span style=\"font-size: 14px; letter-spacing: 2px;\">SEAL</span>\n        </div>\n      </div>\n\n      <div style=\"text-align: center; width: 60mm;\">\n        <div style=\"border-bottom: 1px solid #1e293b; height: 20mm; margin-bottom: 5px;\">\n           <img src=\"{{signatures.principal}}\" style=\"max-height: 100%; max-width: 100%;\" onerror=\"this.style.display='none'\" />\n        </div>\n        <p style=\"font-size: 16px; font-weight: bold; margin: 0;\">Principal</p>\n        <p style=\"font-size: 12px; color: #64748b; margin: 0;\">{{school.name}}</p>\n      </div>\n\n      <div style=\"text-align: center; width: 60mm;\">\n        <div style=\"border-bottom: 1px solid #1e293b; height: 20mm; margin-bottom: 5px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 5px;\">\n           <span style=\"font-size: 16px; font-family: 'Inter', sans-serif; font-weight: 600;\">{{document.date || 'June 15, 2026'}}</span>\n        </div>\n        <p style=\"font-size: 16px; font-weight: bold; margin: 0;\">Date Issued</p>\n      </div>\n\n    </div>\n  </div>\n</div>\n      ",
                        },
                        {
                            name: "Modern Corporate Final Transcript",
                            description: "A4 Portrait report card template with clean tables, subtle striping, and highly readable grading scales.",
                            type: "REPORT_CARD",
                            category: "FINAL_EXAM",
                            isDefault: true,
                            status: "PUBLISHED",
                            content: "\n<div style=\"width: 210mm; height: 297mm; padding: 15mm; background-color: #ffffff; font-family: 'Inter', sans-serif; color: #1e293b;\">\n  \n  <!-- Header Section -->\n  <div style=\"display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 6mm; margin-bottom: 6mm;\">\n    <div style=\"display: flex; gap: 4mm; align-items: center;\">\n      <div style=\"width: 20mm; height: 20mm; background: #bfdbfe; border-radius: 4px; display: flex; justify-content: center; align-items: center;\">\n         <img src=\"{{school.logo}}\" alt=\"Logo\" style=\"width: 16mm; height: 16mm; object-fit: contain;\" onerror=\"this.style.display='none'\" />\n      </div>\n      <div>\n        <h1 style=\"margin: 0 0 2px 0; font-size: 24px; font-weight: 800; color: #0f172a; text-transform: uppercase;\">{{school.name}}</h1>\n        <p style=\"margin: 0; font-size: 12px; color: #64748b;\">{{school.address}}, {{school.city}} {{school.pincode}}</p>\n        <p style=\"margin: 0; font-size: 12px; color: #64748b;\">Phone: {{school.phone}} | Email: {{school.email}}</p>\n      </div>\n    </div>\n    <div style=\"text-align: right;\">\n      <h2 style=\"margin: 0 0 5px 0; font-size: 18px; font-weight: 700; color: #2563eb;\">OFFICIAL TRANSCRIPT</h2>\n      <p style=\"margin: 0; font-size: 14px; font-weight: 600;\">Academic Year: <span style=\"color: #64748b;\">2025-2026</span></p>\n      <p style=\"margin: 0; font-size: 12px; color: #64748b;\">Term: Final Examination</p>\n    </div>\n  </div>\n\n  <!-- Student Info Card -->\n  <div style=\"background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6mm; margin-bottom: 8mm; display: grid; grid-template-columns: 1fr 1fr; gap: 4mm;\">\n    <div>\n      <div style=\"margin-bottom: 2mm;\"><strong style=\"font-size: 12px; color: #94a3b8; text-transform: uppercase;\">Student Name</strong><br/><span style=\"font-size: 16px; font-weight: 700; color: #0f172a;\">{{student.name}}</span></div>\n      <div style=\"margin-bottom: 2mm;\"><strong style=\"font-size: 12px; color: #94a3b8; text-transform: uppercase;\">Enrollment No.</strong><br/><span style=\"font-size: 14px; font-weight: 500;\">{{student.enrollmentNumber || 'N/A'}}</span></div>\n      <div><strong style=\"font-size: 12px; color: #94a3b8; text-transform: uppercase;\">Date of Birth</strong><br/><span style=\"font-size: 14px; font-weight: 500;\">{{student.dob}}</span></div>\n    </div>\n    <div>\n      <div style=\"margin-bottom: 2mm;\"><strong style=\"font-size: 12px; color: #94a3b8; text-transform: uppercase;\">Class & Section</strong><br/><span style=\"font-size: 16px; font-weight: 700; color: #0f172a;\">{{student.className}}</span></div>\n      <div style=\"margin-bottom: 2mm;\"><strong style=\"font-size: 12px; color: #94a3b8; text-transform: uppercase;\">Class Teacher</strong><br/><span style=\"font-size: 14px; font-weight: 500;\">{{student.classTeacher || 'Teacher Name'}}</span></div>\n      <div><strong style=\"font-size: 12px; color: #94a3b8; text-transform: uppercase;\">Attendance</strong><br/><span style=\"font-size: 14px; font-weight: 500;\">94% Tracker</span></div>\n    </div>\n  </div>\n\n  <!-- Grades Table -->\n  <table style=\"width: 100%; border-collapse: collapse; margin-bottom: 8mm; font-size: 14px;\">\n    <thead>\n      <tr style=\"background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;\">\n        <th style=\"padding: 10px; text-align: left; font-weight: 700; color: #334155; width: 40%;\">Subject</th>\n        <th style=\"padding: 10px; text-align: center; font-weight: 700; color: #334155;\">Maximum Marks</th>\n        <th style=\"padding: 10px; text-align: center; font-weight: 700; color: #334155;\">Marks Obtained</th>\n        <th style=\"padding: 10px; text-align: center; font-weight: 700; color: #334155;\">Grade</th>\n      </tr>\n    </thead>\n    <tbody>\n      <!-- Example row (In a real system, you'd iterate over {{grades}} array) -->\n      <tr style=\"border-bottom: 1px solid #e2e8f0;\">\n        <td style=\"padding: 10px; font-weight: 600;\">Mathematics</td>\n        <td style=\"padding: 10px; text-align: center;\">100</td>\n        <td style=\"padding: 10px; text-align: center;\">92</td>\n        <td style=\"padding: 10px; text-align: center; font-weight: 700; color: #16a34a;\">A1</td>\n      </tr>\n      <tr style=\"border-bottom: 1px solid #e2e8f0; background-color: #fafbfc;\">\n        <td style=\"padding: 10px; font-weight: 600;\">Science</td>\n        <td style=\"padding: 10px; text-align: center;\">100</td>\n        <td style=\"padding: 10px; text-align: center;\">88</td>\n        <td style=\"padding: 10px; text-align: center; font-weight: 700; color: #16a34a;\">A2</td>\n      </tr>\n      <tr style=\"border-bottom: 1px solid #e2e8f0;\">\n        <td style=\"padding: 10px; font-weight: 600;\">English Literature</td>\n        <td style=\"padding: 10px; text-align: center;\">100</td>\n        <td style=\"padding: 10px; text-align: center;\">85</td>\n        <td style=\"padding: 10px; text-align: center; font-weight: 700; color: #16a34a;\">A2</td>\n      </tr>\n      <tr style=\"border-bottom: 1px solid #e2e8f0; background-color: #fafbfc;\">\n        <td style=\"padding: 10px; font-weight: 600;\">Social Studies</td>\n        <td style=\"padding: 10px; text-align: center;\">100</td>\n        <td style=\"padding: 10px; text-align: center;\">95</td>\n        <td style=\"padding: 10px; text-align: center; font-weight: 700; color: #16a34a;\">A1</td>\n      </tr>\n      <tr style=\"border-bottom: 2px solid #cbd5e1; background-color: #f1f5f9; font-weight: bold;\">\n        <td style=\"padding: 10px;\">Total</td>\n        <td style=\"padding: 10px; text-align: center;\">400</td>\n        <td style=\"padding: 10px; text-align: center;\">360</td>\n        <td style=\"padding: 10px; text-align: center;\">90%</td>\n      </tr>\n    </tbody>\n  </table>\n\n  <!-- Remarks & Grading Scale -->\n  <div style=\"display: grid; grid-template-columns: 2fr 1fr; gap: 6mm; margin-bottom: 15mm;\">\n    <!-- Remarks -->\n    <div>\n      <h3 style=\"margin: 0 0 2mm 0; font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase;\">Class Teacher's Remarks</h3>\n      <div style=\"border: 1px dashed #cbd5e1; border-radius: 6px; padding: 4mm; font-size: 14px; font-style: italic; color: #475569; min-height: 20mm;\">\n        An outstanding performance this year. Shows great analytical thinking and leadership qualities in class activities. Keep it up!\n      </div>\n      <p style=\"margin-top: 4mm; font-size: 14px;\"><strong>Result:</strong> PASSED and Promoted to Next Class.</p>\n    </div>\n\n    <!-- Scale -->\n    <div style=\"background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4mm;\">\n      <h3 style=\"margin: 0 0 2mm 0; font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; text-align: center;\">Grading Scale</h3>\n      <table style=\"width: 100%; font-size: 11px;\">\n        <tbody>\n          <tr><td style=\"padding: 2px;\">91 - 100</td><td style=\"font-weight: bold;\">A1</td></tr>\n          <tr><td style=\"padding: 2px;\">81 - 90</td><td style=\"font-weight: bold;\">A2</td></tr>\n          <tr><td style=\"padding: 2px;\">71 - 80</td><td style=\"font-weight: bold;\">B1</td></tr>\n          <tr><td style=\"padding: 2px;\">61 - 70</td><td style=\"font-weight: bold;\">B2</td></tr>\n          <tr><td style=\"padding: 2px;\">51 - 60</td><td style=\"font-weight: bold;\">C1</td></tr>\n          <tr><td style=\"padding: 2px;\">Below 35</td><td style=\"color: red; font-weight: bold;\">Fail</td></tr>\n        </tbody>\n      </table>\n    </div>\n  </div>\n\n  <!-- Signatures -->\n  <div style=\"display: flex; justify-content: space-between; margin-top: auto; padding-top: 10mm;\">\n    <div style=\"text-align: center; width: 45mm;\">\n      <div style=\"border-bottom: 1px solid #64748b; height: 15mm; margin-bottom: 2mm;\"></div>\n      <p style=\"margin: 0; font-size: 12px; font-weight: 600; color: #334155;\">Class Teacher</p>\n    </div>\n    <div style=\"text-align: center; width: 45mm;\">\n      <div style=\"border-bottom: 1px solid #64748b; height: 15mm; margin-bottom: 2mm; display: flex; align-items: flex-end; justify-content: center;\">\n         <span style=\"font-size: 12px;\">{{document.date || 'June 15, 2026'}}</span>\n      </div>\n      <p style=\"margin: 0; font-size: 12px; font-weight: 600; color: #334155;\">Date Issued</p>\n    </div>\n    <div style=\"text-align: center; width: 45mm;\">\n      <div style=\"border-bottom: 1px solid #64748b; height: 15mm; margin-bottom: 2mm;\">\n         <img src=\"{{signatures.principal}}\" style=\"max-height: 100%; max-width: 100%;\" onerror=\"this.style.display='none'\" />\n      </div>\n      <p style=\"margin: 0; font-size: 12px; font-weight: 600; color: #334155;\">Principal</p>\n    </div>\n  </div>\n  \n  <div style=\"text-align: center; margin-top: 8mm;\">\n    <p style=\"font-size: 10px; color: #94a3b8;\">This document is electronically generated and secured via LearnXChain Blockchain technology.</p>\n  </div>\n\n</div>\n      ",
                        },
                    ];
                    _i = 0, templates_1 = templates;
                    _a.label = 1;
                case 1:
                    if (!(_i < templates_1.length)) return [3 /*break*/, 7];
                    template = templates_1[_i];
                    return [4 /*yield*/, prisma.documentTemplate.findFirst({
                            where: { name: template.name },
                        })];
                case 2:
                    exists = _a.sent();
                    if (!exists) return [3 /*break*/, 4];
                    return [4 /*yield*/, prisma.documentTemplate.update({
                            where: { id: exists.id },
                            data: template,
                        })];
                case 3:
                    _a.sent();
                    console.log("Updated ".concat(template.name));
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, prisma.documentTemplate.create({
                        data: template,
                    })];
                case 5:
                    _a.sent();
                    console.log("Created ".concat(template.name));
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7:
                    console.log("Premium templates seeded successfully!");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
