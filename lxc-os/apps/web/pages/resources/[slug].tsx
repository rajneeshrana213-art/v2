import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Clock, User, Share2, Bookmark, 
  CheckCircle, Sparkles, TrendingUp, Calculator, ShieldCheck, 
  HelpCircle, ChevronRight, MessageCircle, AlertTriangle, Lightbulb 
} from 'lucide-react';
import Navbar from "@/components/home/navbar/Navbar";
import Footer from "@/components/home/footer/Footer";

// Types for Articles
interface Section {
  title: string;
  subtitle?: string;
  paragraphs: string[];
  callout?: {
    type: 'tip' | 'warning' | 'info';
    text: string;
  };
}

interface GlossaryTerm {
  term: string;
  definition: string;
}

interface Article {
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  role: string;
  avatar: string;
  gradient: string;
  metaDescription: string;
  keyTakeaways: string[];
  intro: string;
  sections: Section[];
  glossary?: GlossaryTerm[];
  image?: string;
}

const articlesData: Record<string, Article> = {
  "the-future-school-os": {
    title: "The Future School OS",
    subtitle: "How LearnXChain combines AI, automation, and trust infrastructure to revolutionize modern school operations.",
    category: "Product",
    readTime: "15 min read",
    date: "Jan 15, 2026",
    author: "Rajneesh Rana",
    role: "Founding Architect, LearnXChain",
    avatar: "👨‍💻",
    gradient: "from-[#0057C8] to-[#1A9FFF]",
    image: "/images/resources/the-future-school-os.png",
    metaDescription: "Explore how LearnXChain's AI-powered SaaS school management operating system replaces legacy educational ERPs, automates academic timetabling, and provides cryptographic digital fee ledgers.",
    keyTakeaways: [
      "Legacy school ERP systems are fragmented, leading to high administrative overhead and trust deficits.",
      "A consolidated single-platform SaaS operating system connects academic records, secure billing, and parent communication.",
      "Immutable cryptographic receipt verification eliminates manual ledger reconciliation errors.",
      "Integrated AI tools like automatic timetable schedulers return up to 40% of productive time back to teachers.",
      "High-security multi-tenant cloud infrastructure guarantees zero data loss and under 100ms response times."
    ],
    intro: "For decades, K-12 educational administration has been bogged down by fragmented software architectures designed in the early 2000s. Opaque accounting structures, clunky attendance spreadsheets, and disconnected communications portals have imposed a massive administrative tax on school leaders. LearnXChain is rewriting this paradigm entirely, engineering a unified, trust-first SaaS school operating system designed for modern global institutions that integrates next-generation relational databases, real-time message queuing, and smart decentralized accountability layers.",
    sections: [
      {
        title: "1. The Inefficiencies and Hidden Costs of Legacy ERP Systems",
        paragraphs: [
          "Walk into almost any active educational institution today, and you will discover administrative teams working across three to five entirely disconnected software suites. One legacy system is typically used for basic student admissions, a second handles transport fee logs, a third tracks scholastic gradebooks, and a separate bulk SMS gateway is leased to distribute emergency notices to parents. This manual synchronization of data across incompatible silos is highly error-prone and leads to extreme double-work for front-office staffs who must continuously export and import raw CSV files.",
          "This extreme software fragmentation does not merely result in bloated, overlapping annual subscription fees; it creates massive data blindspots. Reconciling an overdue bus fee across different systems takes hours of spreadsheet work by accounting clerks, and parents are frequently harassed by automated payment notices for bills they have already settled. The administrative time lost to manually double-checking records acts as a direct tax on institutional growth, drawing resources away from core learning and research projects.",
          "Furthermore, legacy on-premise servers expose institutions to catastrophic data loss risks. Lacking automatic failovers, secure multi-tenant partitioning, or professional security audits, these legacy systems are highly vulnerable to ransomware attacks, hardware degradation, and local database corruption. By relying on outdated databases, schools inadvertently create severe operational bottlenecks that degrade parent trust, compromise student data privacy compliance, and drain valuable staff energy."
        ],
        callout: {
          type: 'warning',
          text: "Independent operational audits reveal that mid-sized schools waste up to 12% of their total administrative payroll hours strictly on manual data reconciliation and database sync corrections."
        }
      },
      {
        title: "2. Achieving Peak Operational Efficiency via Consolidated Software Architectures",
        paragraphs: [
          "A truly modern SaaS school operating system operates as a unified, living ecosystem. In this environment, every single administrative or academic event—whether a parent completing a bus route checkout, a class teacher logging a morning attendance infraction, or an automatic timetable optimizer updating an exam slot—writes to a secure, single source of truth database in real-time. This eliminates the latency of batch-processing and ensures all school stakeholders view consistent, updated records.",
          "This consolidation of data pipelines provides school directors with unprecedented visibility into active operations. Rather than waiting for monthly accounting updates, leadership can inspect dynamic live dashboards that track daily collections, forecast future cashflow, and monitor real-time class attendance trends. This enables fast, data-informed administrative choices that directly improve student and teacher success, while driving down overall operating expenses by up to 25%.",
          "Additionally, a single-platform architecture eliminates the need for expensive third-party API integrations, complicated webhooks, and custom middleware. Staff members only need to learn one modern, highly intuitive interface, drastically lowering onboarding times and reducing IT support tickets. When new teachers or administrators join, they can begin working productively in hours instead of sitting through weeks of confusing multi-system software training workshops."
        ]
      },
      {
        title: "3. Replacing Opaque Financial Ledgers with Cryptographic Fee Verification",
        paragraphs: [
          "One of the primary friction points between parent communities and school administrations is billing opacity. Misplaced cash receipts, unrecognized activity waivers, delayed transport billing updates, and manual late-fee penalties create an atmosphere of parent skepticism and recurring administrative disputes that consume valuable front-office hours.",
          "LearnXChain addresses this challenge by establishing an immutable cryptographic audit ledger for all transaction records. When a parent pays fees online via our integrated UPI or credit card gateways, the transaction receives a unique cryptographic signature. Once recorded on the private ledger, the receipt cannot be altered, deleted, or back-dated, offering an ironclad guarantee of financial integrity that eliminates double-billing and internal clerk fraud.",
          "This cryptographic approach is highly reassuring to parents. They receive an interactive, transparent parent portal dashboard showcasing a precise itemized breakdown of tuition, food services, transport, and extra-curricular costs. Transparent receipts can be downloaded instantly as certified PDFs, simplifying tax filings and providing families with peace of mind. By automating this level of ledger transparency, schools build unmatched community good-will and accelerate collections."
        ],
        callout: {
          type: 'tip',
          text: "Schools implementing immutable cryptographic fee ledgers report a 35% reduction in billing disputes and a significant acceleration in overall fee collections."
        }
      },
      {
        title: "4. Liberating Teachers from Administrative Overhead with Collaborative AI Copilots",
        paragraphs: [
          "The global teaching community is facing record burnout. Instead of dedicating their energy to crafting innovative lessons, grading essays with care, or supporting struggling pupils, modern teachers spend up to 40% of their working hours on routine administrative tasks like building complex timetables, drafting progress reports, and compiling attendance logs.",
          "The Future School OS resolves this by integrating intelligent AI assistants directly into the daily teacher workflow. Our automated timetable AI takes hundreds of variables—including room availability, lab equipment, teacher specialization preferences, and syllabus requirements—and computes optimized, conflict-free scheduling grids in minutes instead of weeks, freeing up massive blocks of productive teaching hours.",
          "Furthermore, our advanced grading copilots assist teachers by analyzing bulk descriptive student submissions, matching answers against custom rubrics, and drafting qualitative, personalized feedback summaries. Teachers maintain full review and approval authority, allowing them to deliver highly detailed, constructive academic guidance while reclaiming hours of productive instructional time that can be reinvested in classroom-level student mentoring."
        ]
      },
      {
        title: "5. Ensuring Enterprise Security and Low-Latency Edge Performance",
        paragraphs: [
          "As educational institutions grow, their backend technology must scale dynamically to meet the demand. Legacy systems frequently crash under peak loads, particularly during seasonal fee deadlines, admissions rushes, or mid-term report card distribution weeks. A premium SaaS school operating system must be built on modern, high-performance cloud frameworks with robust distributed networks.",
          "By employing distributed, low-latency edge computing via CDN networks, LearnXChain delivers blazing-fast page loads under 100ms globally, even under peak traffic conditions. Student records and sensitive personal databases are isolated using secure, multi-tenant partitioning schemas, protecting identity records in full compliance with global personal data protection regulations (like GDPR and regional privacy laws).",
          "Moreover, our automated hourly database backups and absolute failover redundancies guarantee zero data loss. Administrators can execute major database schema upgrades with zero operational downtime, ensuring that crucial school operations continue to run smoothly 24/7, 365 days a year. This enterprise-grade stability forms the secure technical backbone of the modern digital campus."
        ]
      }
    ],
    glossary: [
      {
        term: "SaaS School OS",
        definition: "A centralized cloud-native Software-as-a-Service Operating System that consolidates student directories, grading records, fee ledgers, and communications into a single, unified database."
      },
      {
        term: "Cryptographic Verification",
        definition: "The process of securing data records (such as transaction receipts) with unique mathematical hashes that prove records have not been altered, manipulated, or back-dated."
      },
      {
        term: "Multi-Tenant Architecture",
        definition: "A software architecture where a single software instance serves multiple distinct customer organizations (schools) while keeping their databases completely isolated and secure."
      },
      {
        term: "Relational Database",
        definition: "A database structure that stores and provides access to data points that are related to one another, ensuring high relational data integrity and real-time accuracy."
      }
    ]
  },
  "ai-driven-decision-systems": {
    title: "AI-Driven Decision Systems",
    subtitle: "Using predictive intelligence to reduce dropouts, improve learning outcomes, and automate intervention programs in school systems.",
    category: "AI",
    readTime: "18 min read",
    date: "Jan 10, 2026",
    author: "Dr. Aryan Sharma",
    role: "Head of AI Research, LearnXChain",
    avatar: "🧬",
    gradient: "from-[#1A9FFF] to-[#5CDD2B]",
    image: "/images/resources/ai-driven-decision-systems.png",
    metaDescription: "Learn how predictive AI models empower school leaders to track early warning risk indicators, custom-tailor academic tracks, and boost student retention rates by 40%.",
    keyTakeaways: [
      "Traditional progress reports are reactive post-mortems; predictive AI warning models flag risks early.",
      "An Early Warning System (EWS) monitors composite weights across attendance, grades, and class engagement.",
      "Predictive analytics flag subtle behavioral shifts, triggering proactive counselor interventions.",
      "Tailored AI-generated study recommendations address individual student learning gaps.",
      "Indian schools deploying predictive AI engines have successfully reduced student dropouts by over 40%."
    ],
    intro: "Historically, standard school academic progress reports have acted as post-mortems. By the time a student receives a failing mark on their final report card or stops attending class, the window of opportunity for effective academic counseling has long shut. Predictive AI-driven decision models turn this reactive approach on its head, giving school administrators a powerful, proactive warning system to intervene when a student needs it most, leveraging advanced statistical algorithms and multi-dimensional behavioral data streams.",
    sections: [
      {
        title: "1. Transitioning from Reactive Analytics to Proactive Student Interventions",
        paragraphs: [
          "Predictive educational analytics works by analyzing multi-dimensional student data points—including historical homework submission speeds, micro-quiz scores, daily attendance fluctuations, library resource engagement, and online portal activity patterns. The AI compiles these inputs to build a dynamic, continuous index of student academic health.",
          "Rather than waiting for mid-term exams, the predictive engine detects subtle downward trends early. For example, if a student's average homework submission delay increases by just 20% and their first-period attendance begins to slip on consecutive Mondays, the system flags them as 'at-risk' long before their overall grades drop, alerting class mentors automatically.",
          "This granular tracking allows schools to build personalized educational experiences. Instead of treating classes as monolithic groups, educators can identify exactly which students are struggling with which concepts, adapting classroom instructional strategies to address localized learning gaps in real-time, boosting overall academic performance."
        ],
        callout: {
          type: 'info',
          text: "Longitudinal educational research demonstrates that early predictive indicators are 3.5 times more effective at preventing student dropouts than standard manual advisor counseling checks."
        }
      },
      {
        title: "2. The Technical Framework of a Modern Early Warning System (EWS)",
        paragraphs: [
          "An effective Early Warning System (EWS) operates by analyzing three core educational pillars: academic momentum, attendance consistency, and behavioral engagement. By assigning custom, safe weightages to these variables based on institutional history, the model calculates a unified student wellness index in real-time.",
          "When a student's wellness index falls below a designated safe threshold, the SaaS school portal does not merely display a warning on the dashboard; it triggers an automated intervention workflow. It schedules a check-in with the student's assigned counselor, generates a list of targeted remedial exercises, and notifies parents dynamically.",
          "This structured intervention ensures that no student slips through the cracks due to administrative oversight. By coordinating the efforts of teachers, counselors, and parents through a unified portal, schools can quickly address minor learning gaps before they balloon into major academic failures, creating a highly supportive learning culture."
        ]
      },
      {
        title: "3. Case Study: Mitigating Dropout Metrics by 40% in Regional Indian Schools",
        paragraphs: [
          "In a recent large-scale pilot spanning 15 schools across Northern India, the LearnXChain predictive AI engine was integrated to track 8,500 students. The project aimed to combat rising dropout rates driven by socio-economic challenges, long commute times, and early conceptual learning gaps in core subjects.",
          "Over a six-month tracking period, the predictive models flagged 450 high-risk profiles. In response, school administrators initiated targeted family consultations, arranged localized peer-to-peer tutoring circles, and provided flexible payment schedules for families experiencing temporary financial hardships, keeping students enrolled.",
          "By the pilot's end, the participating schools successfully prevented 185 potential dropouts, representing a spectacular 42% decrease in overall dropout statistics. This case study proves that when school leaders combine predictive data with targeted, compassionate human intervention, student retention rates and operational enrollment figures skyrocket."
        ],
        callout: {
          type: 'tip',
          text: "Establishing clean, digitized student rosters is the essential foundation for deploying predictive AI. Clean historical data is the fuel that powers accurate machine learning models."
        }
      },
      {
        title: "4. Integrating Intelligent Pre-Grading Copilots to Enhance Teacher Productivity",
        paragraphs: [
          "Beyond tracking dropout metrics, AI-driven decision engines are streamlining day-to-day classroom activities. Our advanced pre-grading copilot leverages large language models to analyze descriptive student essay submissions, instantly checking them against detailed, teacher-defined rubrics and conceptual benchmarks.",
          "The copilot does not replace the educator; rather, it drafts high-quality, personalized critiques and suggests initial scores for the teacher to review, refine, and approve. This reduces grading backlogs by up to 50%, letting teachers return detailed academic feedback to students in hours instead of days, facilitating faster mastery.",
          "As feedback cycles accelerate, student learning outcomes improve. Students can identify and correct conceptual errors before moving on to advanced modules, while parents remain aligned with their children's daily academic progress through real-time push notifications on the parent mobile app, creating a unified circle of growth."
        ]
      }
    ],
    glossary: [
      {
        term: "Early Warning System (EWS)",
        definition: "A predictive analysis tool that evaluates multiple performance markers (grades, attendance, behavioral signals) to identify students at risk of academic failure or dropping out."
      },
      {
        term: "Predictive Analytics",
        definition: "The branch of advanced analytics that uses historical data, machine learning, and statistical modeling to forecast future trends and individual outcomes."
      },
      {
        term: "Qualitative Feedback",
        definition: "Descriptive assessments that explain the strengths and weaknesses of a student's submission, providing detailed guidance for improvement rather than just a numeric score."
      },
      {
        term: "Large Language Model (LLM)",
        definition: "A class of artificial intelligence models trained on vast text databases to comprehend, generate, and analyze human language for grading assistance and translation."
      }
    ]
  },
  "building-trust-with-blockchain": {
    title: "Building Trust with Blockchain",
    subtitle: "Eliminating accounting errors, preventing fee leakages, and creating immutable cryptographic proof of financial transparency.",
    category: "Technology",
    readTime: "14 min read",
    date: "Jan 5, 2026",
    author: "Biky Dev",
    role: "Chief Technology Officer, LearnXChain",
    avatar: "💻",
    gradient: "from-[#5CDD2B] to-[#0057C8]",
    image: "/images/resources/building-trust-with-blockchain.png",
    metaDescription: "Discover how private distributed ledger integrations secure educational cashflows, automate audit compliance, and eliminate school billing opacity.",
    keyTakeaways: [
      "Manual and hybrid cash collection models suffer high rates of revenue leakage and administrative errors.",
      "Blockchain-derived payment receipts are cryptographically sealed, unique, and entirely unalterable.",
      "Smart contract layers automate multi-department fee splitting (tuition, transport, and extracurriculars).",
      "Immutable transaction trails eliminate stressful annual audit workloads for accounting teams.",
      "Preventing retroactive data manipulation by internal staff builds ironclad trust with parent associations."
    ],
    intro: "Trust is the foundational currency of any strong school community. In school administration, few things degrade trust faster than opaque billing structures, unrecognized cash transactions, or sudden ledger discrepancies. By integrating private distributed ledger technology, schools can offer parents and board members an absolute, mathematically verifiable guarantee of financial integrity.",
    sections: [
      {
        title: "1. The True Operational Impact and Cost of School Fee Leakage",
        paragraphs: [
          "A surprising number of mid-sized schools still process up to 30% of their fee collections using physical cash, check drops, or manual bank transfers. Receipts are written on paper slips, and school financial statements are manually compiled across local spreadsheets by overworked administrative staff in isolated finance departments.",
          "This manual flow creates structural gaps. Duplicate receipts, incorrect waiver applications, and unrecognized cash payments result in significant revenue leakages annually. For a school operating on thin margins, these unaccounted funds directly reduce the resources available for hiring quality teachers and updating classroom facilities, hurting educational quality.",
          "Furthermore, manual processes trigger constant billing disputes. If a parent pays in cash but the clerk forgets to log it, the parent is left trying to prove they paid. This creates an adversarial relationship between the school's finance office and families, damaging the school's reputation, parent enrollment numbers, and community trust."
        ],
        callout: {
          type: 'warning',
          text: "Global educational management studies reveal that schools relying on manual, paper-based or hybrid cash-collection workflows suffer an average annual revenue leakage of 3.8% due to clerical errors."
        }
      },
      {
        title: "2. The Cryptography Behind Immutable Payment Receipts",
        paragraphs: [
          "Whenever a transaction occurs via the LearnXChain online payment gateway, the billing core automatically generates a receipt and logs a matching entry to a private cryptographic ledger. This entry includes a unique cryptographic hash composed of the student ID, payment amount, timestamp, and a secure, non-reusable transaction key.",
          "Once sealed on the ledger, this transaction record cannot be altered, deleted, or back-dated. Any subsequent administrative change, such as applying a late-fee waiver or shifting funds between categories, must be logged as a separate, fully audited transaction on the ledger, preserving a complete audit trail.",
          "This transparent tracking prevents internal administrative fraud and unauthorized database manipulation. Parents can access their dashboard to inspect their full payment history with absolute confidence that their financial records are accurate, secure, and secure against retro-active modifications by internal staff."
        ]
      },
      {
        title: "3. Streamlining Annual Audits and Automating Multi-Department Fee Splitting",
        paragraphs: [
          "Annual financial audits are typically the most stressful periods of the school year for accounting teams. Staff spend weeks digging through physical files to match bank deposits with parent receipts, reconcile waiver forms, and resolve accounting discrepancies, incurring high operational overhead.",
          "With cryptographic transaction ledgers, auditing becomes a single-click event. Auditing boards can be granted secure, read-only API access to compile verified balance sheets instantly, matching transactions with absolute precision. This dramatically reduces the administrative cost of annual audits, allowing schools to maintain perfect compliance with national accounting standards.",
          "Additionally, our smart contract framework automates complex fee-splitting logistics. When a parent pays a single consolidated fee invoice that includes tuition, bus transport, and cafeteria charges, the ledger automatically splits and routes the funds to the correct departmental bank accounts, eliminating hours of manual bookkeeping and reconciliation."
        ],
        callout: {
          type: 'tip',
          text: "Schools providing immutable billing transparency report a significant increase in on-time payments, as parents feel confident that their transactions are secure."
        }
      },
      {
        title: "4. Future-Proofing Financial Workflows for International Regulatory Compliance",
        paragraphs: [
          "As modern educational institutions grow, they face strict regulatory compliance standards regarding data privacy, financial accounting, and transaction audits. Standardizing all financial transactions on an audited cryptographic database satisfies strict national and international security audits, ensuring compliance.",
          "This high level of compliance protects the school from legal liabilities, database audit failures, and financial penalties. School governors and board directors can review historical financial statements with absolute confidence, ensuring the institution maintains its solid financial standing and continues to attract top-tier academic talent.",
          "Moreover, a secure billing core simplifies the collection of international tuition fees. Parents living abroad can pay securely using credit cards or global wire transfers, knowing their payments are protected by state-of-the-art encryption and will be credited to their student's account without delay or hidden bank charges."
        ]
      }
    ],
    glossary: [
      {
        term: "Private Distributed Ledger",
        definition: "A secure, centralized ledger system operated by trusted nodes that records transactions chronologically, ensuring records cannot be tampered with or modified retrospectively."
      },
      {
        term: "Smart Contract",
        definition: "A self-executing digital agreement written in code that automatically performs actions (like fee splitting) once predefined billing conditions are successfully completed."
      },
      {
        term: "Cryptographic Hash",
        definition: "A mathematical algorithm that converts an input of characters into a fixed-length encrypted output string, serving as a unique digital fingerprint for data security."
      },
      {
        term: "Revenue Leakage",
        definition: "The loss of revenue due to unrecognized transactions, administrative errors, duplicate waivers, or manual processing issues that slip through standard accounting audits."
      }
    ]
  },
  "how-to-digitize-school-operations-step-by-step": {
    title: "How to Digitize School Operations Step-by-Step",
    subtitle: "A detailed blueprint for transitioning from paper records to a fully automated digital ecosystem without administrative chaos.",
    category: "Practical Guides",
    readTime: "18 min read",
    date: "Jan 12, 2026",
    author: "Rajneesh Rana",
    role: "Product Architect, LearnXChain",
    avatar: "📘",
    gradient: "from-[#0057C8] to-[#1A9FFF]",
    image: "/images/resources/how-to-digitize-school-operations-step-by-step.png",
    metaDescription: "A highly comprehensive, actionable 16-step roadmap designed to help school leaders migrate paper records, train staff, and launch portals smoothly.",
    keyTakeaways: [
      "School digitization must be rolled out in structured, progressive phases to prevent administrative disruption.",
      "The migration begins with comprehensive physical record auditing and clean database standardization.",
      "Continuous educator coaching and small pilot runs are essential to secure staff buy-in.",
      "Automated multi-channel notifications over WhatsApp and SMS significantly reduce manual administrative workloads.",
      "A dynamic ticketing helpdesk ensures parent queries are resolved quickly according to strict service level agreements."
    ],
    intro: "Replacing the administrative infrastructure of an active school is like upgrading the engines of a commercial aircraft mid-flight. If the transition is rushed or unorganized, student schedules fail, billing records are corrupted, and parent communications collapse. Following a battle-tested, structured digitization blueprint guarantees a seamless operational upgrade, protecting active operations.",
    sections: [
      {
        title: "Phase 1: Foundation, Data Sanitization, and Roster Auditing",
        paragraphs: [
          "Before configuring a single automation rule or sending parent logins, you must ensure that your base administrative data is accurate. Dedicate the first two weeks of your migration to cataloging all active paper student registers, paper gradebooks, transport route files, and staff schedules to map your inputs.",
          "Input this collected data into clean CSV templates designed for modern database parsers. Standardize naming conventions, verify parent WhatsApp numbers, and resolve any outstanding payment balances. Taking the time to build clean digital rosters at this stage prevents data corruption and database mismatches later in the migration.",
          "It is also critical to clean up duplicate records during this phase. In legacy, siloed databases, it is common to find multiple profiles for the same family, leading to duplicate billing invoices, conflicting records, and confusing notifications. Deduplicating your data at the start ensures a single, clean profile for every family."
        ]
      },
      {
        title: "Phase 2: Roster Import, Class Mapping, and Portal Configuration",
        paragraphs: [
          "Once your student and staff rosters are clean, import them into your new LearnXChain admin portal. Configure grade-wise classes, map out bus routes with precise pick-up locations, set up teacher-subject allocations, and set up your dynamic fee billing structure templates to match your school cycles.",
          "Next, launch the parent self-service mobile app and distribute secure login credentials to families. By providing parents with simple, step-by-step video guides and interactive walkthroughs, you ensure they understand how to use the app to submit attendance alerts, track grades, view bus locations, and complete online fee payments.",
          "During this phase, organize interactive, hands-on onboarding workshops for teachers. Show them how to use the web portal and mobile tools to log daily attendance in seconds, enter grades, and access teaching resources. Giving teachers active, practical practice reduces software resistance and builds staff confidence."
        ],
        callout: {
          type: 'tip',
          text: "Running a 3-day pilot test with a single grade level allows you to identify and resolve workflow bottlenecks before rolling the platform out school-wide."
        }
      },
      {
        title: "Phase 3: Launching Automation, AI Tools, and Daily Scheduling",
        paragraphs: [
          "With your portal configured and staff trained, you can activate the platform's advanced automation engines. Turn on automated fee reminders over WhatsApp and SMS channels, allowing the system to follow up on overdue bills without requiring manual intervention or confrontational phone calls from your finance staff.",
          "Next, introduce teachers to the AI-powered lesson-planning assistant and configure the automatic timetable scheduler to optimize classroom resource allocations, room bookings, and class grids. Replace paper classroom registers with digital attendance tracking, letting teachers log absences in seconds via their mobile devices.",
          "Set up automated academic reporting templates that compile grades into digital progress reports instantly. These reports are published securely to the parent portal, eliminating the high administrative cost of printing and mailing physical report sheets, and ensuring parents are kept updated on their children's progress."
        ]
      },
      {
        title: "Phase 4: Feedback Loops, Parent Ticketing, and Community Growth",
        paragraphs: [
          "Once your core administrative functions are running smoothly, focus on building secure communication channels with your parent community. Set up the transparent parent helpdesk ticketing system, routing parent billing, bus, and homework questions directly to the appropriate coordinators with strict service timelines.",
          "Integrate real-time GPS tracking inside the parent mobile app, allowing families to monitor school bus commutes and receive automated alerts when the bus is approaching their stop. This dramatically reduces call volumes to the school office and provides parents with massive reassurance and peace of mind.",
          "Finally, schedule monthly administrative reviews to inspect system usage metrics, trace ticketing resolution speeds, and analyze fee collection trends. Using this data-informed feedback loop allows your leadership team to continuously refine operations, eliminate service bottlenecks, and improve the overall parent experience."
        ]
      }
    ],
    glossary: [
      {
        term: "Data Sanitization",
        definition: "The operational process of cleaning raw databases by correcting formatting errors, removing duplicate student entries, and verifying parent contact records before importing."
      },
      {
        term: "Deduplication",
        definition: "A technical data cleanup method that merges overlapping or duplicate records representing the same family or student into a single secure profile."
      },
      {
        term: "Pilot Test",
        definition: "A small-scale, preliminary execution of a new software system or workflow with a subset of users to identify system limits and operational bugs before complete rollout."
      },
      {
        term: "Support Ticketing",
        definition: "An administrative customer-service framework that logs, routes, and tracks parent queries chronologically, ensuring accountability and fast issue resolution."
      }
    ]
  },
  "ai-readiness-checklist-for-school-leaders": {
    title: "AI Readiness Checklist for School Leaders",
    subtitle: "Evaluate your institution's infrastructure, competence, and readiness to adopt intelligent copilot systems.",
    category: "Practical Guides",
    readTime: "14 min read",
    date: "Jan 10, 2026",
    author: "Dr. Aryan Sharma",
    role: "AI Integration Lead",
    avatar: "✅",
    gradient: "from-[#1A9FFF] to-[#5CDD2B]",
    image: "/images/resources/ai-readiness-checklist-for-school-leaders.png",
    metaDescription: "Assess your school's capacity for AI-assisted teaching, automated timetabling, and predictive student analytics using our comprehensive readiness checklist.",
    keyTakeaways: [
      "High-performance AI tools require reliable, high-speed campus internet connectivity.",
      "A centralized digital database is the essential foundation for generating accurate AI insights.",
      "Staff readiness depends heavily on structured training workshops and simple, copy-paste prompt templates.",
      "Role-based access controls (RBAC) are critical to protecting sensitive student information.",
      "Use our interactive diagnostic checklist below to calculate your school's AI readiness score instantly."
    ],
    intro: "Artificial Intelligence holds the potential to return hundreds of hours back to teachers and streamline school administration, but AI is only as powerful as the data and technical infrastructure beneath it. Conducting an objective readiness audit helps school leaders identify technical and operational bottlenecks before initiating an AI deployment, ensuring a solid ROI.",
    sections: [
      {
        title: "1. Evaluating Campus Technical Infrastructure and Network Bandwidth",
        paragraphs: [
          "Unlike legacy offline software, advanced educational AI systems run in high-performance cloud environments. Real-time class registers, automated grading tools, and dynamic timetable optimization require fast, reliable internet connectivity across all campus buildings, staff offices, and classrooms.",
          "Schools must ensure that classrooms, science labs, and staff rooms have access to high-speed gigabit Wi-Fi networks. Installing backup power supplies and redundant internet connections prevents service disruptions and ensures that key AI features remain available to staff throughout the school day, avoiding classroom lag.",
          "It is also important to evaluate the hardware devices used by teachers. AI copilots and grading dashboards run best on modern tablets, laptops, and smartboards that can render interactive screens smoothly. Upgrading outdated classroom terminals is a critical step in preparing your campus for artificial intelligence tools."
        ]
      },
      {
        title: "2. Consolidating Operations on a Centralized Digital Database",
        paragraphs: [
          "AI engines learn by analyzing historical data patterns and correlating metrics. If student attendance records are kept on paper sheets, grades are stored in offline spreadsheets, and billing histories are managed in a separate accounting tool, the AI cannot connect these data points to identify early dropout warning signs.",
          "Having a centralized digital core—where academic grading registers, daily attendance, transport routes, and financial histories are unified in a single relational database—allows the AI to generate accurate predictive models that support school leaders' daily choices.",
          "Before deploying AI tools, work with your IT team to migrate legacy data archives into your new centralized database. Cleaning up incomplete records, standardizing data formats, and resolving mismatched profiles ensures your AI engine has the clean, high-quality data it needs to generate actionable insights."
        ],
        callout: {
          type: 'info',
          text: "The first step to AI-readiness is establishing a single, secure source of truth for all operational school databases."
        }
      },
      {
        title: "3. Implementing Structured Teacher Upskilling and Onboarding Programs",
        paragraphs: [
          "The most advanced AI system is useless if your educators are hesitant or fearful to adopt it. Transitioning to AI tools requires structured upskilling modules. Schools must schedule short, focused, non-technical workshops that show teachers how AI saves them time, rather than presenting it as extra administrative overhead.",
          "Designate tech-savvy teachers as 'AI champions' who can answer peer questions, share best practices on the ground, and lead training. Providing teachers with simple, copy-paste prompt templates for lesson planning and academic feedback generation accelerates tool adoption and builds staff confidence.",
          "It is also helpful to celebrate early wins. When a teacher uses the AI copilot to generate a creative lesson plan or grade a batch of assignments quickly, encourage them to share their experience during staff meetings. Peer recommendations are highly effective at driving institutional software adoption."
        ]
      },
      {
        title: "4. Securing Student Data Privacy with Role-Based Access Controls",
        paragraphs: [
          "Protecting student data privacy is a critical legal and ethical responsibility. Standardizing AI integrations requires strict compliance with role-based access control (RBAC). A student's predictive dropout risk indicator, scholastic evaluation, or family billing history must not be visible to unauthorized users.",
          "Ensure that your school's AI core uses advanced cryptographic keys, secure API authorization tokens, and isolates data streams. This protects student identity records, keeping your platform fully aligned with national personal data protection regulations (like GDPR) and building deep institutional trust.",
          "Additionally, establish clear policies regarding how AI tools are used on campus. Train staff on ethical AI practices, ensuring they understand that AI tools are designed to assist teachers, not replace them. Maintaining human oversight ensures that student evaluations remain fair, balanced, and unbiased."
        ]
      }
    ],
    glossary: [
      {
        term: "Gigabit Wi-Fi Network",
        definition: "A high-performance wireless network capable of transmitting data at speeds of one gigabit per second or faster, essential for high-speed cloud computing tasks."
      },
      {
        term: "Role-Based Access Control (RBAC)",
        definition: "A technical security method of restricting system access to authorized users based on their institutional roles (e.g. teachers, accountants, directors)."
      },
      {
        term: "AI Champion",
        definition: "An educator or staff member selected and trained to guide, support, and advocate for digital software adoption among colleagues."
      },
      {
        term: "Data Privacy Regulation",
        definition: "National and international legal frameworks (like GDPR) that govern the collection, processing, and storage of personal user identification databases."
      }
    ]
  },
  "reducing-fee-leakage-with-technology": {
    title: "Reducing Fee Leakage with Technology",
    subtitle: "A practical guide to securing school cashflows, streamlining billing systems, and recovering administrative overhead.",
    category: "Practical Guides",
    readTime: "15 min read",
    date: "Jan 8, 2026",
    author: "Biky Dev",
    role: "Financial Systems Architect",
    avatar: "💰",
    gradient: "from-[#5CDD2B] to-[#0057C8]",
    image: "/images/resources/reducing-fee-leakage-with-technology.png",
    metaDescription: "Explore five proven, automated strategies to eliminate cash discrepancies, track overdue fees, and recover lost school budgets using technology.",
    keyTakeaways: [
      "Physical fee collection workflows frequently suffer cash leaks and manual record errors.",
      "Automating payment reminders on WhatsApp boosts collections by up to 28%.",
      "Dynamic, auto-reconciled digital payment gateways reduce cash handling by 90%.",
      "Instant UPI settlements eliminate manual transaction verification and bank ledger checks.",
      "Calculate your school's potential leakage recovery using our dynamic calculator tool below."
    ],
    intro: "Fee leakages—whether caused by unrecorded cash collections, errors in transport waivers, unrecognized bank deposits, or simple oversight of overdue bills—directly eat into a school's operating budget. Adopting automated technological gateways is the fastest way to secure collections, recover lost funds, and ensure long-term school stability.",
    sections: [
      {
        title: "1. The Friction of Manual Reminders & Collection Flows",
        paragraphs: [
          "Manual tracking is slow, inefficient, and highly confrontational. Busy parents often forget fee deadlines simply because of a misplaced physical circular, a forgotten text message, or an email that ended up in the spam folder, leading to unintentional outstanding balances.",
          "When administrative staffs spend hours calling parents individually, it represents a massive administrative payroll expense and strains parent relations. Furthermore, accepting manual bank transfers or UPI screenshots without auto-reconciliation leads to massive payment validation delays and stressful accounting disputes.",
          "Without automated tracking and alerts, overdue accounts can go unnoticed for months. By the time the school realizes a family has fallen behind on payments, the outstanding balance can be difficult for the family to clear. This leads to bad debt write-offs, direct budget cuts, and operational friction for the institution."
        ]
      },
      {
        title: "2. The WhatsApp Alert Advantage",
        paragraphs: [
          "In modern families, email and SMS open rates have dropped below 15% due to high spam volumes. However, WhatsApp remains highly active, boasting open rates exceeding 90% and high click-through engagement, making it the perfect communication channel for school notifications.",
          "By automating personalized reminder templates over WhatsApp—which include the student's name, break-up of outstanding charges, and a direct digital UPI payment link—schools dramatically decrease late fees. Collection pipelines see immediate, friction-free acceleration, with payments clearing in minutes.",
          "These automated reminders can be customized to trigger at specific intervals before the due date. Sending a friendly heads-up three days prior, followed by a reminder on the due date, gives parents plenty of time to complete the payment and avoids the need for stressful, confrontational collection calls."
        ],
        callout: {
          type: 'tip',
          text: "Automated, friendly WhatsApp reminders that initiate three days prior to fee deadlines reduce late fees by 30% without damaging parent-school relations."
        }
      },
      {
        title: "3. UPI-Based Instant Settlements & Auto-Reconciliation",
        paragraphs: [
          "Reconciling hundreds of manual UPI screenshots and bank NEFT transfers is a massive operational headache for accounting clerks, leading to manual input errors and ledger mismatches. By integrating unified QR codes and instant payment APIs, LearnXChain automates this process entirely.",
          "Each transaction generates a unique tracking token that auto-reconciles the student record the instant payment succeeds. This eliminates human validation errors, instantly issues a cryptographic PDF receipt to the parent's app, and deposits funds directly into designated school accounts without bank delays.",
          "Automating reconciliation also speeds up the release of student records, exam hall tickets, and report cards. When a parent completes a payment, their account is instantly cleared on the database, letting teachers share grades and achievements with the family without waiting for manual accounting checks."
        ]
      },
      {
        title: "4. Financial Analytics: Tracking Outstanding Debts Dynamically",
        paragraphs: [
          "A healthy cash flow is vital to finance school resource upgrades, maintain facilities, and pay teacher salaries. School leaders need real-time, interactive insights into outstanding collections rather than waiting for seasonal, post-mortem audit reviews.",
          "Interactive collection dashboards categorize overdue fees by grade, bus route, and item type. Automatic, tiered reminders scale from subtle WhatsApp alerts to formal updates, allowing schools to maintain solid financial standing while treating families with complete empathy, transparency, and professionalism.",
          "Having access to detailed financial analytics also helps schools plan future campus improvements. By analyzing historical payment trends and forecasting seasonal revenue peaks, administrators can plan major capital investments with confidence, ensuring the school's long-term financial health and growth."
        ]
      }
    ],
    glossary: [
      {
        term: "Instant UPI Settlement",
        definition: "A direct-to-bank electronic fund transfer method in India that clears and settles funds in real-time without clearing delays or processing fees."
      },
      {
        term: "Auto-Reconciliation",
        definition: "A database process that automatically matches incoming digital transactions with corresponding open student invoices, clearing accounts instantly without manual human checks."
      },
      {
        term: "Open Rate",
        definition: "The percentage of sent messages or emails that are opened and read by recipients, indicating the overall effectiveness of a communication channel."
      },
      {
        term: "Bad Debt Write-Off",
        definition: "An accounting entry that removes outstanding, uncollectible parent fees from the balance sheet, recording them as direct operational losses."
      }
    ]
  },
  "building-parent-trust-in-the-digital-era": {
    title: "Building Parent Trust in the Digital Era",
    subtitle: "Establishing transparent communication channels, secure grading data, and absolute transparency in school operations.",
    category: "Practical Guides",
    readTime: "12 min read",
    date: "Jan 5, 2026",
    author: "Rajneesh Rana",
    role: "Director of Communications",
    avatar: "🤝",
    gradient: "from-[#5CDD2B] to-[#0057C8]",
    image: "/images/resources/building-parent-trust-in-the-digital-era.png",
    metaDescription: "Learn key, actionable strategies for modern school directors to bridge the parent trust gap, secure digital credentials, and run transparent channels.",
    keyTakeaways: [
      "Modern parents demand immediate, transparent visibility into their children's school experience.",
      "Legacy paper circulars and irregular notices create communication blindspots and parent friction.",
      "Unified digital communications keep parents synced on grading, behavior, and schedules.",
      "Transparent gradebooks and cryptographic credentials build absolute assessment integrity.",
      "Try our interactive Trust Health Quiz below to evaluate your communication performance."
    ],
    intro: "The parent-school relationship is shifting dynamically. Today's parents are digitally native; they expect the same level of transparency, immediacy, and data security from their school's systems that they experience in daily life. Providing transparent, secure, and instant communication channels is crucial to building lasting trust.",
    sections: [
      {
        title: "1. Eliminating Communication Blindspots",
        paragraphs: [
          "Physical flyers sent home in student backpacks are frequently lost, and critical notifications are missed. Parents end up unaware of upcoming events, parent-teacher meetings, schedule changes, or exam announcements, creating structural communication gaps.",
          "A modern parent portal app eliminates this lag completely. Attendance alerts, homework milestones, academic feedback, bus tracking, and event updates are published instantly to the parents' personal timeline, keeping everyone synced in real-time and reducing parent anxiety.",
          "This instant communication reduces parental anxiety and builds a stronger, more collaborative school community. Parents no longer feel disconnected from their children's daily experiences, and they can actively support classroom activities by staying informed about upcoming events and projects."
        ]
      },
      {
        title: "2. Cultivating Secure, Responsive Channels",
        paragraphs: [
          "When parent feedback channels are closed or opaque, minor complaints can grow into systemic dissatisfaction and public negative feedback. Schools need simple, monitored, and trackable routes for parents to submit queries and check resolution progress.",
          "A transparent ticketing portal lets parents raise transport, academic, or billing questions. These questions are routed directly to the appropriate coordinators, tracking resolution speeds and keeping parents updated at every turn, eliminating follow-up calls.",
          "By resolving parent concerns quickly and professionally, schools demonstrate their deep commitment to customer service and community care. This active support builds deep institutional loyalty, turning parents into enthusiastic advocates for the school's programs and achievements."
        ],
        callout: {
          type: 'tip',
          text: "Providing a designated feedback channel in your portal reduces direct unscheduled office calls by 60%, allowing staff to work productively."
        }
      },
      {
        title: "3. Digital Gradebooks & Transparent Assessment Metrics",
        paragraphs: [
          "Nothing creates more parent anxiety and administrative friction than unexpected poor grade sheets at the end of a school term. Transparent, running digital gradebooks replace standard static term reports with continuous, real-time performance tracking.",
          "Parents can view detailed grade timelines, average class benchmarks, and teacher comments for individual submissions. Providing this clear history demystifies the academic process, turning traditional tension points into collaborative plans to support the student's progress.",
          "This academic transparency also builds deeper student trust. When students can trace their grading history and access teacher feedback instantly on their app, they feel more in control of their learning journey. They can actively address conceptual errors and work to improve their performance with confidence."
        ]
      },
      {
        title: "4. Monitored Feedback Loop and Direct Ticket Resolution Platforms",
        paragraphs: [
          "A successful parent-school relationship relies on bilateral support. When parents have issues—whether it's an accounting issue, a bus route delay, or an academic concern—they need a professional, trackable channel to voice it rather than relying on unstructured groups.",
          "Unified ticketing dashboards assign tickets to responsible departments with clear service level boundaries (SLAs). Parents can view active updates, notes from coordinators, and resolution timelines directly on their dashboards, establishing a culture of complete accountability and care.",
          "This monitored feedback loop also provides school leadership with valuable operational insights. By tracking the types of queries parents submit most frequently, administrators can identify systemic issues—such as bus route delays or billing errors—and take proactive steps to resolve them permanently."
        ]
      }
    ],
    glossary: [
      {
        term: "Digital Gradebook",
        definition: "A real-time online registry where teachers record grades, homework, and test scores immediately, allowing parents to track academic progress continuously."
      },
      {
        term: "Service Level Agreement (SLA)",
        definition: "An established commitment that defines the expected time frame within which a parent support ticket must be addressed and resolved by school staff."
      },
      {
        term: "Bilateral Communication",
        definition: "A two-way communication model where both school leaders and parents can actively send, receive, and track messages, creating complete mutual alignment."
      },
      {
        term: "Assessment Integrity",
        definition: "The fairness, consistency, and complete transparency of academic grading methods, backed by clear rubrics and immediate feedback trails."
      }
    ]
  }
};

export default function ResourceArticlePage({ initialArticle, initialSlug }: { initialArticle: Article | null; initialSlug?: string }) {
  const router = useRouter();
  const slug = initialSlug || (router.query.slug as string);

  // State for interactive features
  const [checkedSteps, setCheckedSteps] = useState<boolean[]>(new Array(12).fill(false));
  const [aiAnswers, setAiAnswers] = useState<boolean[]>(new Array(8).fill(false));
  const [studentsCount, setStudentsCount] = useState<number>(800);
  const [annualFee, setAnnualFee] = useState<number>(45000);
  const [leakageRate, setLeakageRate] = useState<number>(4);
  const [trustAnswers, setTrustAnswers] = useState<number[]>(new Array(5).fill(0));
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Retrieve matching article content
  const article = initialArticle || (typeof slug === 'string' ? articlesData[slug] : null);

  // Compute Related Articles
  const relatedArticles = useMemo(() => {
    if (!slug) return [];
    return Object.entries(articlesData)
      .filter(([key]) => key !== slug)
      .slice(0, 3)
      .map(([key, value]) => ({
        slug: key,
        ...value
      }));
  }, [slug]);

  // Digitization Steps Data
  const digitizeSteps = [
    "Audit all physical records & spreadsheets",
    "Prepare clean CSV student rosters",
    "Verify accurate parents contact info",
    "Map out active class schedules",
    "Import digital lists into LearnXChain",
    "Configure custom fee milestones & items",
    "Distribute parent portal secure logins",
    "Conduct staff-wide onboarding workshops",
    "Activate automated WhatsApp notifications",
    "Integrate seamless digital UPI payment portals",
    "Launch interactive AI teacher assistance copilots",
    "Run weekly admin performance audits"
  ];

  // AI Readiness Questions
  const aiQuestions = [
    "High-speed, stable Wi-Fi across all campus classrooms?",
    "Student, grading, and attendance records are fully digital?",
    "Staff are comfortable utilizing online administrative portals?",
    "Clear, structured goals established for school AI adoption?",
    "Established data privacy and role-based access control?",
    "Parents actively engage with digital reports and updates?",
    "Dedicated IT staff or technical support champions on-site?",
    "Willing to allocate time for regular teacher training?"
  ];

  // Trust Assessment Questions
  const trustQuestions = [
    "How quickly are parent billing or schedule queries resolved?",
    "How often do parents receive academic or behavioral updates?",
    "Are school receipts immutable, digital, and instantly available?",
    "How do you share important event announcements and schedules?",
    "Do you offer parent feedback loops or direct ticket tracking?"
  ];

  const trustOptions = [
    ["Days/Weeks (Reactive)", "Within 24 Hours", "Instantly online"],
    ["Only End-of-Term", "Monthly/Bi-weekly", "Weekly/Real-time"],
    ["Manual receipt slips", "Email attachments", "Cryptographic ledger portal"],
    ["Printed notices", "SMS/Emails only", "Dynamic digital feed"],
    ["No direct channel", "Standard email desk", "Interactive ticket panel"]
  ];

  // Calculations for interactive components
  const digitizeProgress = useMemo(() => {
    const checked = checkedSteps.filter(Boolean).length;
    return Math.round((checked / digitizeSteps.length) * 100);
  }, [checkedSteps]);

  const aiReadinessScore = useMemo(() => {
    const checked = aiAnswers.filter(Boolean).length;
    return Math.round((checked / aiQuestions.length) * 100);
  }, [aiAnswers]);

  const feeCalculations = useMemo(() => {
    const totalRev = studentsCount * annualFee;
    const estimatedLeakage = totalRev * (leakageRate / 100);
    const recovered = estimatedLeakage * 0.98;
    return {
      totalRevenue: totalRev.toLocaleString('en-IN'),
      leakage: estimatedLeakage.toLocaleString('en-IN'),
      recovered: recovered.toLocaleString('en-IN'),
      equivalentSmartLabs: Math.floor(recovered / 150000)
    };
  }, [studentsCount, annualFee, leakageRate]);

  const trustScore = useMemo(() => {
    const total = trustAnswers.reduce((sum, val) => sum + val, 0);
    const maxScore = trustAnswers.length * 2;
    return Math.round((total / maxScore) * 100);
  }, [trustAnswers]);

  // Dynamic Content Loading Safeguard
  if (typeof slug === 'undefined') {
    return (
      <div className="min-h-screen bg-[#071B2C] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2C81B4]" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#071B2C] text-white flex flex-col items-center justify-center p-6">
        <AlertTriangle className="w-16 h-16 text-[#75B96D] mb-4" />
        <h1 className="text-3xl font-bold mb-2">Article Not Found</h1>
        <p className="text-gray-400 mb-8 max-w-md text-center">We couldn't find the article you were looking for. It may have been relocated or renamed.</p>
        <Link href="/resources" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] rounded-xl font-bold hover:shadow-lg hover:shadow-[#0057C8]/25 transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Resources
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{article.title} - LearnXChain Resources</title>
        <meta name="description" content={article.metaDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-white dark:bg-[#071B2C] text-gray-900 dark:text-gray-100 transition-colors duration-300 relative">
        
        {/* Global Page Background Mesh Pattern */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-60 dark:opacity-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#0057C812_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_-20%,#0057C820_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,#75b96d08_0%,transparent_40%)] dark:bg-[radial-gradient(circle_at_80%_40%,rgba(117,185,109,0.06)_0%,transparent_40%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="relative z-10">
          <Navbar />

          {/* Breadcrumb Navigation & Back Button */}
          <div className="max-w-7xl mx-auto px-6 pt-32 pb-4">
            <Link href="/resources" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#0057C8] dark:hover:text-[#1A9FFF] transition-colors font-semibold group">
              <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" /> Back to Resources
            </Link>
          </div>

          {/* Article Header Hero Section */}
          <header className="max-w-4xl mx-auto px-6 pb-12 pt-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3.5 py-1 text-xs font-extrabold bg-[#0057C8]/10 dark:bg-[#0057C8]/20 text-[#0057C8] dark:text-[#1A9FFF] rounded-full border border-[#0057C8]/20 tracking-wider uppercase">
                {article.category}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                <Clock className="w-3.5 h-3.5" /> {article.readTime}
              </span>
            </div>
            
            <h1 className="font-[var(--font-grotesk)] text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
              {article.title}
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 font-medium leading-relaxed max-w-3xl mb-8">
              {article.subtitle}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-6 border-y border-gray-100 dark:border-white/5 py-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0057C8] to-[#1A9FFF] text-white flex items-center justify-center text-xl font-bold shadow-md shadow-[#0057C8]/15">
                  {article.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{article.author}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{article.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 font-semibold">
                  <Calendar className="w-4 h-4" /> {article.date}
                </span>
                <button className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#0057C8] dark:hover:border-[#1A9FFF] hover:text-[#0057C8] dark:hover:text-[#1A9FFF] transition-all bg-white dark:bg-[#0C1018]/50" title="Share article">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#0057C8] dark:hover:border-[#1A9FFF] hover:text-[#0057C8] dark:hover:text-[#1A9FFF] transition-all bg-white dark:bg-[#0C1018]/50" title="Bookmark">
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Wide Cinematic Cover Image Banner */}
          {article.image && (
            <div className="max-w-4xl mx-auto px-6 mb-12">
              <div className="relative aspect-[16/7] md:aspect-[21/9] w-full rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl bg-gray-100 dark:bg-gray-800">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover transform hover:scale-[1.01] transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071B2C]/25 to-transparent pointer-events-none" />
              </div>
            </div>
          )}

          {/* Main Content Layout */}
          <main className="max-w-7xl mx-auto px-6 pb-24 grid lg:grid-cols-12 gap-12">
            
            {/* Left Sidebar Table of Contents */}
            <aside className="lg:col-span-3 hidden lg:block h-fit sticky top-28 space-y-8">
              <div className="p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-[#0C1018]/30 backdrop-blur-md">
                <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs mb-4">Key takeaways</h3>
                <ul className="space-y-4">
                  {article.keyTakeaways.map((takeaway, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400 font-medium">
                      <CheckCircle className="w-4 h-4 text-[#75B96D] shrink-0 mt-0.5" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Call-to-action mini-banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0057C8]/10 to-[#1A9FFF]/10 border border-[#0057C8]/20 text-center">
                <Sparkles className="w-8 h-8 text-[#1A9FFF] mx-auto mb-3" />
                <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1.5">Ready to automate?</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed font-semibold">Transform your administration processes in under 7 days.</p>
                <Link href="/book-demo" className="block py-2.5 px-4 bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                  Book Free Demo
                </Link>
              </div>
            </aside>

            {/* Core Article Body */}
            <article className="lg:col-span-9 space-y-12">
              
              {/* Introduction Paragraph */}
              <p className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300 font-medium italic pl-4 border-l-4 border-[#0057C8]">
                "{article.intro}"
              </p>

              {/* Dynamic Body Sections */}
              {article.sections.map((section, idx) => (
                <section key={idx} className="space-y-4">
                  <h2 className="font-[var(--font-grotesk)] text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400">
                      {section.subtitle}
                    </h3>
                  )}
                  {section.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-gray-700 dark:text-gray-300 leading-relaxed text-[16px] font-normal md:text-[17px]">
                      {p}
                    </p>
                  ))}

                  {/* Dynamic Callout Box */}
                  {section.callout && (
                    <div className={`p-6 rounded-2xl border my-6 flex items-start gap-4 transition-all ${
                      section.callout.type === 'warning' 
                        ? 'bg-yellow-500/5 dark:bg-yellow-500/10 border-yellow-500/20 text-yellow-800 dark:text-yellow-200' 
                        : section.callout.type === 'tip'
                        ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-200'
                        : 'bg-sky-500/5 dark:bg-sky-500/10 border-sky-500/20 text-[#0057C8] dark:text-[#1A9FFF]'
                    }`}>
                      {section.callout.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
                      {section.callout.type === 'tip' && <Lightbulb className="w-5 h-5 shrink-0 mt-0.5" />}
                      {section.callout.type === 'info' && <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                      <span className="text-sm font-semibold leading-relaxed">
                        {section.callout.text}
                      </span>
                    </div>
                  )}
                </section>
              ))}

              {/* ─────────────────────────────────────────────────────────────────
                  INTERACTIVE COMPONENT INJECTION FOR SPECIFIC ARTICLES & GUIDES
              ───────────────────────────────────────────────────────────────── */}

              {/* 1. Step-by-Step Digitization Checklist */}
              {slug === "how-to-digitize-school-operations-step-by-step" && (
                <section className="p-8 rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#0C1018]/40 backdrop-blur-md space-y-6 my-12">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-[#0057C8] dark:text-[#1A9FFF]" />
                    <div>
                      <h3 className="font-[var(--font-grotesk)] text-2xl font-extrabold text-gray-900 dark:text-white">Operations Digitization Tracker</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Track your school migration milestone by milestone</p>
                    </div>
                  </div>

                  {/* Progress Display */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-gray-600 dark:text-gray-400">Total Milestones Cleared</span>
                      <span className="text-[#0057C8] dark:text-[#1A9FFF]">{digitizeProgress}% Completed</span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${digitizeProgress}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-[#0057C8] to-[#1A9FFF]"
                      />
                    </div>
                  </div>

                  {/* Interactive Checklist Elements */}
                  <div className="grid md:grid-cols-2 gap-3.5 pt-4">
                    {digitizeSteps.map((step, idx) => (
                      <label 
                        key={idx} 
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-300 select-none ${
                          checkedSteps[idx] 
                            ? 'bg-[#0057C8]/5 dark:bg-[#0057C8]/10 border-[#0057C8]/30 dark:border-[#0057C8]/40 shadow-inner'
                            : 'bg-white dark:bg-[#0C1018]/50 border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={checkedSteps[idx]}
                          onChange={() => {
                            const updated = [...checkedSteps];
                            updated[idx] = !updated[idx];
                            setCheckedSteps(updated);
                          }}
                          className="sr-only" 
                        />
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          checkedSteps[idx] 
                            ? 'bg-gradient-to-tr from-[#0057C8] to-[#1A9FFF] border-transparent text-white' 
                            : 'border-gray-300 dark:border-white/20 bg-transparent'
                        }`}>
                          {checkedSteps[idx] && <CheckCircle className="w-3.5 h-3.5 fill-white text-[#0057C8]" />}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-semibold leading-relaxed transition-all ${
                            checkedSteps[idx] ? 'text-gray-500 dark:text-gray-400 line-through opacity-80' : 'text-gray-800 dark:text-gray-200'
                          }`}>
                            {step}
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                            Step {idx + 1}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Completion Celebration Alert */}
                  {digitizeProgress === 100 && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-6 rounded-2xl bg-gradient-to-br from-[#75B96D]/15 to-[#5CDD2B]/15 border border-[#75B96D]/30 text-center space-y-2 mt-6"
                    >
                      <Sparkles className="w-12 h-12 text-[#75B96D] mx-auto mb-2" />
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">Amazing! Ready for Launch 🚀</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-relaxed">
                        You have mapped out the full workflow! Connect with a LearnXChain integration advisor today to safely load your CSVs and schedule staff coaching.
                      </p>
                    </motion.div>
                  )}
                </section>
              )}

              {/* 2. Interactive AI Readiness Diagnostic */}
              {slug === "ai-readiness-checklist-for-school-leaders" && (
                <section className="p-8 rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#0C1018]/40 backdrop-blur-md space-y-6 my-12">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-[#5CDD2B]" />
                    <div>
                      <h3 className="font-[var(--font-grotesk)] text-2xl font-extrabold text-gray-900 dark:text-white">AI Readiness Audit</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Self-assess your technological and operational capacity</p>
                    </div>
                  </div>

                  {/* Readiness Bar and Qualitative Label */}
                  <div className="grid md:grid-cols-3 gap-6 items-center p-6 rounded-2xl bg-white dark:bg-[#0C1018]/60 border border-gray-200 dark:border-white/5">
                    <div className="text-center md:text-left space-y-1 md:col-span-2">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Composite Score</span>
                      <h4 className="text-3xl font-black text-gray-900 dark:text-white">{aiReadinessScore}% Ready</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                        {aiReadinessScore < 40 && "⚠️ Foundational Stage: Consolidate records and network connectivity first."}
                        {aiReadinessScore >= 40 && aiReadinessScore < 75 && "⚡ Co-pilot Candidate: Perfect candidate to deploy AI Scheduling and Timetables."}
                        {aiReadinessScore >= 75 && "🔥 AI Pioneer: Ready to roll out absolute automated class intelligence!"}
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <div className="relative w-28 h-28 rounded-full border-4 border-gray-200 dark:border-white/5 flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{aiReadinessScore}%</span>
                          <p className="text-[8px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-0.5">Readiness</p>
                        </div>
                        {/* Interactive decorative orbital dot */}
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-[-4px] rounded-full border border-transparent border-t-[#5CDD2B]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-3 pt-3">
                    {aiQuestions.map((q, idx) => (
                      <label 
                        key={idx} 
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer select-none transition-all ${
                          aiAnswers[idx] 
                            ? 'bg-[#5CDD2B]/5 dark:bg-[#5CDD2B]/10 border-[#5CDD2B]/30'
                            : 'bg-white dark:bg-[#0C1018]/50 border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10'
                        }`}
                      >
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{q}</span>
                        <input 
                          type="checkbox" 
                          checked={aiAnswers[idx]}
                          onChange={() => {
                            const updated = [...aiAnswers];
                            updated[idx] = !updated[idx];
                            setAiAnswers(updated);
                          }}
                          className="sr-only" 
                        />
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                          aiAnswers[idx] 
                            ? 'bg-[#5CDD2B] border-transparent text-white' 
                            : 'border-gray-300 dark:border-white/20 bg-transparent'
                        }`}>
                          {aiAnswers[idx] && <CheckCircle className="w-3.5 h-3.5 fill-white text-[#5CDD2B]" />}
                        </div>
                      </label>
                    ))}
                  </div>
                </section>
              )}

              {/* 3. Interactive Fee Leakage Recovery Calculator */}
              {slug === "reducing-fee-leakage-with-technology" && (
                <section className="p-8 rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#0C1018]/40 backdrop-blur-md space-y-8 my-12">
                  <div className="flex items-center gap-3">
                    <Calculator className="w-8 h-8 text-[#5CDD2B]" />
                    <div>
                      <h3 className="font-[var(--font-grotesk)] text-2xl font-extrabold text-gray-900 dark:text-white">Fee Leakage Estimator</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Estimate your school's annual recovery with LearnXChain automation</p>
                    </div>
                  </div>

                  {/* Calculator Input Fields */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Number of Students</label>
                      <input 
                        type="number" 
                        value={studentsCount}
                        onChange={(e) => setStudentsCount(Math.max(10, parseInt(e.target.value) || 0))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0C1018]/80 text-gray-900 dark:text-white font-bold focus:outline-none focus:border-[#0057C8]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Avg. Annual Fee (₹)</label>
                      <input 
                        type="number" 
                        value={annualFee}
                        onChange={(e) => setAnnualFee(Math.max(100, parseInt(e.target.value) || 0))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0C1018]/80 text-gray-900 dark:text-white font-bold focus:outline-none focus:border-[#0057C8]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Est. Leakage Rate (%)</label>
                      <input 
                        type="range" 
                        min="1" 
                        max="15" 
                        step="0.5"
                        value={leakageRate}
                        onChange={(e) => setLeakageRate(parseFloat(e.target.value) || 1)}
                        className="w-full h-10 accent-[#0057C8] dark:accent-[#1A9FFF]"
                      />
                      <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                        <span>1%</span>
                        <span className="text-[#0057C8] dark:text-[#1A9FFF]">{leakageRate}% selected</span>
                        <span>15%</span>
                      </div>
                    </div>
                  </div>

                  {/* Calculations Output Grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#0C1018]/60 border border-gray-200 dark:border-white/5 space-y-1">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Estimated Annual Leakage</span>
                      <h4 className="text-2xl font-black text-red-500">₹{feeCalculations.leakage}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed font-semibold">Lost due to late fees, unpaid transport, and reconciliation lag.</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-[#75B96D]/10 to-[#5CDD2B]/10 border border-[#75B96D]/30 space-y-1">
                      <span className="text-[10px] text-[#75B96D] dark:text-[#5CDD2B] font-bold uppercase tracking-wider">Potential Recovered Revenue</span>
                      <h4 className="text-2xl font-black text-[#75B96D] dark:text-[#5CDD2B]">₹{feeCalculations.recovered}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                        Secure 98%+ on-time payment clearances using LearnXChain's WhatsApp reminders.
                      </p>
                    </div>
                  </div>

                  {/* Real-world Impact Callout */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-[#0C1018]/30 border border-dashed border-gray-200 dark:border-white/10 text-center space-y-2">
                    <Lightbulb className="w-8 h-8 text-[#5CDD2B] mx-auto" />
                    <h4 className="font-bold text-gray-900 dark:text-white">Resource Reinvestment Potential</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
                      By recovering <span className="font-extrabold text-[#75B96D] dark:text-[#5CDD2B]">₹{feeCalculations.recovered}</span>, your school could build approximately <span className="font-extrabold text-gray-900 dark:text-white">{feeCalculations.equivalentSmartLabs} Smart Classrooms</span> or fund advanced digital training programs for all school educators.
                    </p>
                  </div>
                </section>
              )}

              {/* 4. Interactive Trust Health Quiz */}
              {slug === "building-parent-trust-in-the-digital-era" && (
                <section className="p-8 rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#0C1018]/40 backdrop-blur-md space-y-6 my-12">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-[#0057C8] dark:text-[#1A9FFF]" />
                    <div>
                      <h3 className="font-[var(--font-grotesk)] text-2xl font-extrabold text-gray-900 dark:text-white">Communication & Trust Health Check</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Evaluate your parent engagement scores and accountability indicators</p>
                    </div>
                  </div>

                  {!quizSubmitted ? (
                    <div className="space-y-6">
                      {trustQuestions.map((q, idx) => (
                        <div key={idx} className="space-y-3">
                          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            {idx + 1}. {q}
                          </h4>
                          <div className="grid md:grid-cols-3 gap-2.5">
                            {trustOptions[idx].map((option, valIdx) => (
                              <button 
                                key={valIdx}
                                type="button"
                                onClick={() => {
                                  const updated = [...trustAnswers];
                                  updated[idx] = valIdx;
                                  setTrustAnswers(updated);
                                }}
                                className={`p-4 rounded-xl border text-left text-xs font-bold leading-relaxed transition-all ${
                                  trustAnswers[idx] === valIdx 
                                    ? 'bg-[#0057C8]/5 dark:bg-[#0057C8]/10 border-[#0057C8]' 
                                    : 'bg-white dark:bg-[#0C1018]/50 border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div className="text-center pt-4">
                        <button
                          type="button"
                          onClick={() => setQuizSubmitted(true)}
                          className="px-8 py-3.5 bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                          Submit Trust Diagnostic
                        </button>
                      </div>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-6 text-center"
                    >
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-[#0057C8] to-[#1A9FFF] text-white text-3xl font-black mb-2 shadow-lg">
                        {trustScore}%
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-2xl font-black text-gray-900 dark:text-white">Your Trust Index: {trustScore}%</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                          {trustScore < 50 && "Your parent communication operates on legacy patterns. Introducing automated WhatsApp feeds and immediate receipts will eliminate the massive feedback bottleneck."}
                          {trustScore >= 50 && trustScore < 85 && "Excellent foundations! You communicate regularly, but introducing cryptographic ledgers will secure complete accountability and eliminate remaining invoice disputes."}
                          {trustScore >= 85 && "Brilliant transparency level! You are ready to leverage advanced parent portal profiles to further scale community integration."}
                        </p>
                      </div>

                      <div className="pt-4 flex justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setQuizSubmitted(false);
                            setTrustAnswers(new Array(5).fill(0));
                          }}
                          className="px-6 py-2.5 border border-gray-200 dark:border-white/10 text-xs font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                        >
                          Retake Quiz
                        </button>
                        <Link href="/book-demo" className="px-6 py-2.5 bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] text-white text-xs font-bold rounded-xl shadow-md transition-all">
                          Consult advisor
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </section>
              )}

              {/* ─────────────────────────────────────────────────────────────────
                  END OF INTERACTIVE INJECTIONS
              ───────────────────────────────────────────────────────────────── */}

              {/* Terminology & Key Concepts Visual Grid */}
              {article.glossary && article.glossary.length > 0 && (
                <section className="p-8 rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-50/30 dark:bg-[#0C1018]/30 backdrop-blur-md space-y-6 my-12">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#0057C8]/10 text-[#0057C8] dark:text-[#1A9FFF]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-[var(--font-grotesk)] text-2xl font-extrabold text-gray-900 dark:text-white">Terminology & Key Concepts</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Essential definitions for mastering this topic</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {article.glossary.map((item, idx) => (
                      <div key={idx} className="p-5 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#0C1018]/50 hover:border-[#0057C8]/30 dark:hover:border-[#1A9FFF]/30 transition-all group">
                        <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1.5 group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors">
                          {item.term}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                          {item.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Article Footer Call to Action (CTA) */}
              <section className="p-8 rounded-3xl bg-gradient-to-br from-[#071b2c] via-[#0C1018] to-[#1E3A52] border border-[#1E3A52] text-white text-center space-y-6 relative overflow-hidden my-16 shadow-2xl">
                {/* Decorative mesh inside CTA */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,#0057C830_0%,transparent_50%)] pointer-events-none" />
                
                <div className="relative z-10 max-w-lg mx-auto space-y-4">
                  <span className="px-3.5 py-1 text-[10px] font-extrabold bg-[#1A9FFF]/10 border border-[#1A9FFF]/30 text-[#1A9FFF] rounded-full tracking-wider uppercase">
                    Free Consultation
                  </span>
                  <h3 className="font-[var(--font-grotesk)] text-3xl font-extrabold tracking-tight leading-tight">
                    Transform your institution from ERP to OS
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed font-semibold">
                    Let's discuss how LearnXChain's AI modules and ledger accountability can solve your operational challenges.
                  </p>
                  
                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/book-demo" className="px-8 py-3.5 bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] text-white font-bold rounded-xl shadow-lg shadow-[#0057C8]/25 hover:shadow-xl transition-all">
                      Book Free Demo
                    </Link>
                    <Link href="https://whatsapp.com/channel/0029VbC2gmM0AgW5pOgpTS2u" target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 border border-white/10 hover:border-white/20 text-white font-bold rounded-xl transition-all bg-white/5 hover:bg-white/10 inline-flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400" /> Join WhatsApp Group
                    </Link>
                  </div>
                </div>
              </section>

              {/* Related Content Section Slider */}
              <section className="border-t border-gray-100 dark:border-white/5 pt-16 space-y-8">
                <h3 className="font-[var(--font-grotesk)] text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Related Insights & Guides
                </h3>

                <div className="grid md:grid-cols-3 gap-6">
                  {relatedArticles.map((rel, i) => (
                    <Link key={i} href={`/resources/${rel.slug}`} className="group block">
                      <div className="h-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0C1018]/50 p-6 hover:border-[#0057C8]/50 dark:hover:border-[#0057C8]/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold bg-[#0057C8]/5 dark:bg-[#0057C8]/10 text-[#0057C8] dark:text-[#1A9FFF] rounded-full border border-[#0057C8]/20 mb-3.5">
                            {rel.category}
                          </span>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors line-clamp-2">
                            {rel.title}
                          </h4>
                          <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed line-clamp-3 mb-4 font-semibold">
                            {rel.subtitle}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 font-bold border-t border-gray-50 dark:border-white/5 pt-3.5">
                          <span>{rel.readTime}</span>
                          <span className="flex items-center gap-1 text-[#0057C8] dark:text-[#1A9FFF] group-hover:translate-x-1.5 transition-transform">
                            Read <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

            </article>
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const paths = Object.keys(articlesData).map((slug) => ({
    params: { slug },
  }));
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const article = articlesData[params.slug] || null;
  return {
    props: {
      initialArticle: article,
      initialSlug: params.slug,
    },
  };
}
