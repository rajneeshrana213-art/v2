'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Course details map
interface CourseMeta {
  title: string;
  description: string;
  accent: string;
  rgb: string;
  hover: string;
  subtitle: string;
  mainTitle: string;
  mainTitleSub: string;
  tagline: string;
  covers: string;
  languages: string;
  stats: string;
  sidebarTitle: string;
}

const COURSE_MAP: Record<string, CourseMeta> = {
  ai_masterclass: {
    title: 'The Complete AI, Machine Learning & LLM Engineering Handbook',
    description: 'A comprehensive, production-grade guide to Python, mathematics, PyTorch neural networks, Transformers, advanced LLMs, memory architectures, agent framework building, and GPU deployments.',
    accent: '#ec4899',
    rgb: '236, 72, 153',
    hover: '#f472b6',
    subtitle: 'THE COMPLETE MASTERCLASS',
    mainTitle: 'ARTIFICIAL INTELLIGENCE, MACHINE LEARNING',
    mainTitleSub: '& LLM ENGINEERING HANDBOOK',
    tagline: 'Absolute Beginner → ML Engineer → Transformers → RAG & Agent Architect',
    covers: 'Covers: Python & Math • Machine Learning Algorithms • Neural Networks & PyTorch • Transformers & Attention • Hugging Face & LLM Tuning • LangGraph Agents • RAG & Vector Databases • Evaluations & GPU Infrastructure',
    languages: 'Accents: Python | PyTorch | LangGraph | vLLM',
    stats: '1000+ Pages Target  •  30 Deep Chapters  •  10 Production Projects  •  Interactive Interview Simulator',
    sidebarTitle: 'AI & LLM Engineering'
  },
  aptitude_msterclass: {
    title: 'The Complete Aptitude, Logical Reasoning & Quantitative Reasoning Masterclass Handbook',
    description: 'A comprehensive, production-grade guide to Quantitative Aptitude, Logical Reasoning, Analytical Thinking, and Problem Solving for SDE Interviews and Placements.',
    accent: '#f59e0b',
    rgb: '245, 158, 11',
    hover: '#fbbf24',
    subtitle: 'THE ULTIMATE MASTERCLASS',
    mainTitle: 'QUANTITATIVE APTITUDE, LOGICAL',
    mainTitleSub: '& ANALYTICAL REASONING',
    tagline: 'Absolute Beginner → Basic Arithmetic → Logical Reasoning → Placement Aptitude → SDE Interview Quant Expert',
    covers: 'Covers: Number System • Percentages & Ratios • Time & Work LCM • Relative speed & Trains • Bayes Theorem Trees • Syllogisms Venns • Circular seating puzzles • Guesstimates & Fermi Problems • 365-Day study roadmap',
    languages: 'Accents: Vedic Speed Math | Pythagorean Coordinates | Fintech Assessments | Google Fermi Problems',
    stats: '1000+ Pages Target  •  27 Deep Chapters  •  1000+ Practice Problems  •  50+ Custom SVG Diagrams',
    sidebarTitle: 'Quant & Aptitude'
  },
  behavioral_masterclass: {
    title: 'Behavioral Interview, Leadership Communication & Career Growth Handbook',
    description: 'Succeed in senior behavioral reviews. Craft high-impact STAR narratives, build a career story bank, negotiate compensation, and show leadership maturity.',
    accent: '#f59e0b',
    rgb: '245, 158, 11',
    hover: '#fbbf24',
    subtitle: 'THE COMPLETE HANDBOOK',
    mainTitle: 'BEHAVIORAL INTERVIEW, LEADERSHIP',
    mainTitleSub: '& EXECUTIVE COMMUNICATION',
    tagline: 'Absolute Beginner → Star Framework → Amazon Leadership Principles → Behavioral Interview Success',
    covers: 'Covers: STAR Method • Story Bank Crafting • Amazon Leadership Principles • Conflict Resolution • Googleyness • Salary Negotiation Timelines • Pitch Scripts & Worksheets',
    languages: 'Accents: STAR Method | Amazon Principles | Googleyness | Salary Negotiation',
    stats: '500+ Pages Target  •  15 Core Chapters  •  100+ Interview Scenarios  •  Interactive STAR Builder',
    sidebarTitle: 'Behavioral & Leadership'
  },
  'c++_dsa_masterclass': {
    title: 'The Complete C++ & Advanced Data Structures Algorithms Handbook',
    description: 'Advanced algorithms handbook designed for top-tier competitive programmers and FAANG coding interviews. Covers STL internals, DP, and graph structures.',
    accent: '#ef4444',
    rgb: '239, 68, 68',
    hover: '#f87171',
    subtitle: 'THE ULTIMATE MASTERCLASS',
    mainTitle: 'C++ DATA STRUCTURES, ALGORITHMS',
    mainTitleSub: '& COMPETITIVE PROGRAMMING',
    tagline: 'Absolute Beginner → C++ Core → OOP & STL → Tree & Graph Algorithms → FAANG Coding Interview Expert',
    covers: 'Covers: C++ Core • STL Internals • Logic Building • Trees & SegTrees • Graph Algorithms • Dynamic Programming state compression • FAANG interview strategies',
    languages: 'Accents: C++ STL | Segment Trees | Bitmask DP | FAANG Rubrics',
    stats: '1000+ Pages Target  •  25 Deep Chapters  •  500+ LeetCode Solutions  •  50+ Dynamic Diagrams',
    sidebarTitle: 'C++ & Advanced DSA'
  },
  core_subject: {
    title: 'Computer Science Core Subjects Handbook',
    description: 'Academic core concepts of Computer Science. Master memory paging, concurrency deadlocks, TCP/IP networking, and database ACID properties.',
    accent: '#10b981',
    rgb: '16, 185, 129',
    hover: '#34d399',
    subtitle: 'THE ACADEMIC CORE',
    mainTitle: 'COMPUTER SCIENCE CORE SUBJECTS',
    mainTitleSub: 'MASTERCLASS HANDBOOK',
    tagline: 'Absolute Beginner → Operating Systems → Database Systems → Computer Networks → Core Theory',
    covers: 'Covers: OS Process Management • Paging & Virtual Memory • DBMS ACID Properties • SQL Indexing • TCP/IP Protocol Suite • DNS & Network Routing • Socket Programming Skeletons',
    languages: 'Accents: OS Kernels | SQL Indexing | TCP/IP Sockets | ACID Transactions',
    stats: '800+ Pages Target  •  20 Core Chapters  •  300+ Interview Questions  •  Interactive Quiz Simulator',
    sidebarTitle: 'CS Core Subjects'
  },
  devops_masterclass: {
    title: 'The Complete DevOps, Cloud Engineering & GitOps Handbook',
    description: 'Master CI/CD pipelines, Docker containerization, Kubernetes orchestration, Infrastructure as Code, and production logging.',
    accent: '#8b5cf6',
    rgb: '139, 92, 246',
    hover: '#a78bfa',
    subtitle: 'THE COMPLETE MASTERCLASS',
    mainTitle: 'DEVOPS, SRE & PLATFORM',
    mainTitleSub: 'ENGINEERING HANDBOOK',
    tagline: 'Absolute Beginner → Bash Scripting → Docker Containers → Kubernetes Clusters → GitOps Pipelines',
    covers: 'Covers: Bash Scripting • Linux Internals & Systems • Docker Containers • Kubernetes Orchestration • CI/CD Github Actions • Terraform IaC • Prometheus & Grafana Monitoring',
    languages: 'Accents: Bash | Dockerfiles | K8s Yaml | Terraform HCL',
    stats: '1000+ Pages Target  •  30 Deep Chapters  •  15 Multi-Stage Pipelines  •  Interactive Deployments',
    sidebarTitle: 'DevOps & Infrastructure'
  },
  dsa: {
    title: 'Multi-Language DSA & Coding Masterclass Handbook',
    description: 'Comprehensive data structures, logic building, and algorithms masterclass in C++, Java, Python, and JavaScript. Optimized for coding interviews and FAANG placement.',
    accent: '#ef4444',
    rgb: '239, 68, 68',
    hover: '#f87171',
    subtitle: 'THE COMPLETE MASTERCLASS',
    mainTitle: 'DSA & COMPETITIVE PROGRAMMING',
    mainTitleSub: 'MASTERCLASS HANDBOOK',
    tagline: 'Absolute Beginner → Logic Building → Multi-Language Implementations → FAANG placement prep',
    covers: 'Covers: Arrays & Strings • Linked Lists & Stacks • Binary Trees & BST • Graph Traversals • Dynamic Programming Patterns • Backtracking Algorithms • Mock interview problems',
    languages: 'Accents: C++ | Java | Python | JavaScript',
    stats: '1000+ Pages Target  •  28 Core Chapters  •  800+ Coding Submissions  •  Interactive Logic Builders',
    sidebarTitle: 'Multi-Language DSA'
  },
  system_design_masterclass: {
    title: 'High-Level & Low-Level Software System Design Handbook',
    description: 'System design patterns, database sharding, consistent hashing, consistent data flow, and microservices for billion-user scale.',
    accent: '#6366f1',
    rgb: '99, 102, 241',
    hover: '#818cf8',
    subtitle: 'THE SYSTEM ARCHITECT',
    mainTitle: 'SOFTWARE ENGINEERING',
    mainTitleSub: '& SYSTEM DESIGN HANDBOOK',
    tagline: 'Absolute Beginner → OOP Design → HLD Scalability → CAP Theorem → Distributed Databases',
    covers: 'Covers: SOLID Principles • OOP Design Patterns • HLD Scalability & Sharding • CAP Theorem & Consensus • Event-Driven Systems • Consistent Hashing • DNS & Load Balancing Architecture',
    languages: 'Accents: UML Diagrams | API Definitions | Database Schemas | Distributed Logs',
    stats: '1200+ Pages Target  •  35 Deep Chapters  •  15 Real-World Case Studies  •  Interactive HLD Visualizer',
    sidebarTitle: 'System Design'
  },
  web3_masterclass: {
    title: 'The Complete Web3, Cryptography & Solana Protocol Engineering Handbook',
    description: 'Absolute Beginner to DeFi Architect. Learn rust, cryptography, smart contracts, and protocol auditing.',
    accent: '#10b981',
    rgb: '16, 185, 129',
    hover: '#34d399',
    subtitle: 'THE PROTOCOL ARCHITECT',
    mainTitle: 'WEB3, CRYPTOGRAPHY & SOLANA',
    mainTitleSub: 'PROTOCOL ENGINEERING HANDBOOK',
    tagline: 'Absolute Beginner → Cryptography → Blockchain Core → Rust & Anchor → Smart Contract Auditing',
    covers: 'Covers: Cryptographic Hash/Signatures • Blockchain Consensus (PoW, PoS) • Rust programming • Solana Account Model • Anchor framework development • DeFi AMM architectures • Auditing smart contracts',
    languages: 'Accents: Rust | Anchor | Solidity | Web3.js',
    stats: '1000+ Pages Target  •  32 Core Chapters  •  12 DeFi Projects  •  Interactive Cryptography Demos',
    sidebarTitle: 'Web3 & Cryptography'
  },
  webdev_master_class: {
    title: 'The Complete Full-Stack Web Developer & Cloud Architect Handbook',
    description: 'Master frontend layouts, responsive UI design, backend service APIs, databases, caching, and performance scaling.',
    accent: '#06b6d4',
    rgb: '6, 182, 212',
    hover: '#22d3ee',
    subtitle: 'THE FULL STACK ARCHITECT',
    mainTitle: 'FULL STACK WEB DEVELOPMENT',
    mainTitleSub: 'MASTERCLASS HANDBOOK',
    tagline: 'Absolute Beginner → Frontend (HTML/CSS/JS) → Backend APIs → Databases & Caching → Cloud Architecture',
    covers: 'Covers: CSS Grids & Flexbox • Vanilla JS DOM • REST & GraphQL APIs • Relational vs Document Databases • Redis Caching • AWS Cloud Architecture • High-Availability Scaling',
    languages: 'Accents: HTML5/CSS3 | JavaScript | Node.js | PostgreSQL',
    stats: '1500+ Pages Target  •  40 Extensive Chapters  •  20 Full-Stack Projects  •  Interactive Code Editor Skeletons',
    sidebarTitle: 'Web Development'
  }
};

// Step configuration
interface Phase {
  cardId: string;
  label: string;
  desc: string;
}

interface LevelConfig {
  title: string;
  phases: Phase[];
  steps: string[];
}

const ROADMAP_CONFIG: Record<string, { label: string; beginner: LevelConfig; intermediate: LevelConfig; advanced: LevelConfig }> = {
  webdev: {
    label: 'Full Stack Web Architect',
    beginner: {
      title: 'Full Stack Foundation Path',
      phases: [
        { cardId: 'card-3005', label: 'Phase 1 · Aptitude', desc: 'Logic, reasoning & placement math' },
        { cardId: 'card-3007', label: 'Phase 2 · CS Core',   desc: 'OS, DBMS, Networking fundamentals' },
        { cardId: 'card-3009', label: 'Phase 3 · DSA',       desc: 'Multi-language data structures' },
        { cardId: 'card-3000', label: 'Phase 4 · Web Dev',   desc: 'HTML/CSS/JS, APIs, Cloud' }
      ],
      steps: ['Aptitude', 'CS Core', 'DSA Basics', 'Web Dev']
    },
    intermediate: {
      title: 'Full Stack Developer Path',
      phases: [
        { cardId: 'card-3000', label: 'Phase 1 · Web Dev',     desc: 'Full stack: frontend → backend → cloud' },
        { cardId: 'card-3009', label: 'Phase 2 · Algorithms',  desc: 'Problem solving & interview patterns' },
        { cardId: 'card-3006', label: 'Phase 3 · Sys Design',  desc: 'HLD, scalability, databases' },
        { cardId: 'card-3008', label: 'Phase 4 · Behavioral',  desc: 'STAR method, career communication' }
      ],
      steps: ['Web Mastery', 'Algorithms', 'System Design', 'Behavioral']
    },
    advanced: {
      title: 'Senior Web Architect Path',
      phases: [
        { cardId: 'card-3000', label: 'Phase 1 · Web Dev',    desc: 'Expert full stack & cloud architecture' },
        { cardId: 'card-3006', label: 'Phase 2 · Sys Design', desc: 'Distributed systems at scale' },
        { cardId: 'card-3001', label: 'Phase 3 · DevOps',     desc: 'CI/CD, K8s, Terraform, SRE' },
        { cardId: 'card-3008', label: 'Phase 4 · Leadership', desc: 'Executive behavioral & negotiation' }
      ],
      steps: ['Full Stack', 'Architecture', 'DevOps & SRE', 'Leadership']
    }
  },
  devops: {
    label: 'DevOps & Infrastructure Engineer',
    beginner: {
      title: 'DevOps Foundation Path',
      phases: [
        { cardId: 'card-3005', label: 'Phase 1 · Aptitude',  desc: 'Logic, math & analytical reasoning' },
        { cardId: 'card-3007', label: 'Phase 2 · CS Core',   desc: 'OS, networking & DBMS' },
        { cardId: 'card-3000', label: 'Phase 3 · Web Basics', desc: 'HTML, JS, REST APIs fundamentals' },
        { cardId: 'card-3001', label: 'Phase 4 · DevOps',    desc: 'Docker, Linux, CI/CD pipelines' }
      ],
      steps: ['Aptitude', 'CS Core', 'Web Basics', 'DevOps']
    },
    intermediate: {
      title: 'Platform Engineer Path',
      phases: [
        { cardId: 'card-3001', label: 'Phase 1 · DevOps',    desc: 'Docker, K8s, Terraform, GitHub Actions' },
        { cardId: 'card-3007', label: 'Phase 2 · CS Core',   desc: 'OS internals, networking deep dive' },
        { cardId: 'card-3006', label: 'Phase 3 · Sys Design', desc: 'Distributed infra & reliability' },
        { cardId: 'card-3008', label: 'Phase 4 · Behavioral', desc: 'SRE mindset & incident leadership' }
      ],
      steps: ['DevOps Mastery', 'CS Depth', 'System Design', 'Behavioral']
    },
    advanced: {
      title: 'Senior SRE · Platform Architect Path',
      phases: [
        { cardId: 'card-3001', label: 'Phase 1 · DevOps',    desc: 'Advanced IaC, GitOps, observability' },
        { cardId: 'card-3006', label: 'Phase 2 · Sys Design', desc: 'Large-scale distributed systems' },
        { cardId: 'card-3004', label: 'Phase 3 · C++ & DSA', desc: 'Performance algorithms for infra tools' },
        { cardId: 'card-3008', label: 'Phase 4 · Leadership', desc: 'Tech lead behavioral & negotiations' }
      ],
      steps: ['Infrastructure', 'Distributed Systems', 'Algorithms', 'Leadership']
    }
  },
  web3: {
    label: 'Web3 & Protocol Engineer',
    beginner: {
      title: 'Web3 Foundation Path',
      phases: [
        { cardId: 'card-3005', label: 'Phase 1 · Aptitude', desc: 'Logic & problem-solving fundamentals' },
        { cardId: 'card-3007', label: 'Phase 2 · CS Core',  desc: 'OS, networking & cryptography basics' },
        { cardId: 'card-3009', label: 'Phase 3 · DSA',      desc: 'Algorithms powering blockchain nodes' },
        { cardId: 'card-3002', label: 'Phase 4 · Web3',     desc: 'Blockchain, Rust, Solana, DeFi' }
      ],
      steps: ['Aptitude', 'CS Core', 'DSA', 'Blockchain']
    },
    intermediate: {
      title: 'Blockchain Developer Path',
      phases: [
        { cardId: 'card-3002', label: 'Phase 1 · Web3',      desc: 'Rust, Solana, Anchor smart contracts' },
        { cardId: 'card-3009', label: 'Phase 2 · Algorithms', desc: 'Hash structures & consensus algorithms' },
        { cardId: 'card-3006', label: 'Phase 3 · Sys Design', desc: 'DeFi protocol architecture & scaling' },
        { cardId: 'card-3008', label: 'Phase 4 · Behavioral', desc: 'Web3 startup & DAO communication' }
      ],
      steps: ['Web3 Mastery', 'Algorithms', 'Protocol Design', 'Behavioral']
    },
    advanced: {
      title: 'Protocol Architect Path',
      phases: [
        { cardId: 'card-3002', label: 'Phase 1 · Web3',      desc: 'Advanced auditing & protocol design' },
        { cardId: 'card-3006', label: 'Phase 2 · Sys Design', desc: 'Distributed consensus at scale' },
        { cardId: 'card-3004', label: 'Phase 3 · C++ & DSA', desc: 'High-performance cryptographic engines' },
        { cardId: 'card-3008', label: 'Phase 4 · Leadership', desc: 'Protocol governance & DAO leadership' }
      ],
      steps: ['Protocol Eng.', 'Distributed Sys', 'Performance', 'Leadership']
    }
  },
  ai: {
    label: 'AI & LLM Engineer',
    beginner: {
      title: 'AI Foundation Path',
      phases: [
        { cardId: 'card-3005', label: 'Phase 1 · Aptitude', desc: 'Math, stats & analytical reasoning' },
        { cardId: 'card-3007', label: 'Phase 2 · CS Core',  desc: 'OS, DBMS & computation theory' },
        { cardId: 'card-3009', label: 'Phase 3 · DSA',      desc: 'Algorithms essential for ML' },
        { cardId: 'card-3003', label: 'Phase 4 · AI & ML',  desc: 'PyTorch, Transformers, RAG & Agents' }
      ],
      steps: ['Math & Aptitude', 'CS Core', 'DSA', 'AI & ML']
    },
    intermediate: {
      title: 'ML Engineer Path',
      phases: [
        { cardId: 'card-3003', label: 'Phase 1 · AI & ML',    desc: 'Neural nets, LLMs, fine-tuning & RAG' },
        { cardId: 'card-3009', label: 'Phase 2 · Algorithms',  desc: 'Graph & optimization algorithms for AI' },
        { cardId: 'card-3006', label: 'Phase 3 · Sys Design',  desc: 'ML system architecture & vector DBs' },
        { cardId: 'card-3008', label: 'Phase 4 · Behavioral',  desc: 'AI research & product communication' }
      ],
      steps: ['AI Mastery', 'Algorithms', 'ML Systems', 'Behavioral']
    },
    advanced: {
      title: 'Senior AI Architect Path',
      phases: [
        { cardId: 'card-3003', label: 'Phase 1 · AI & LLM',   desc: 'LLM serving, vLLM, agent frameworks' },
        { cardId: 'card-3006', label: 'Phase 2 · Sys Design',  desc: 'Distributed ML infra & model serving' },
        { cardId: 'card-3004', label: 'Phase 3 · C++ & DSA',  desc: 'CUDA kernels & performance algorithms' },
        { cardId: 'card-3008', label: 'Phase 4 · Leadership',  desc: 'AI team leadership & executive presence' }
      ],
      steps: ['LLM Engineering', 'ML Systems', 'Performance', 'Leadership']
    }
  }
};

// Inline SVGs for rendering diagrams dynamically
const DIAGRAM_LIBRARY: Record<string, string> = {
  renderingPipeline: `<svg viewBox="0 0 820 200" width="100%" xmlns="http://www.w3.org/2000/svg">
    <style>.t{font-family:sans-serif;font-size:12px;fill:#f8fafc;text-anchor:middle}.s{font-family:sans-serif;font-size:10px;fill:#94a3b8;text-anchor:middle}.lbl{font-family:sans-serif;font-size:11px;fill:#38bdf8;text-anchor:middle;font-weight:700}</style>
    <rect x="10"  y="60" width="110" height="50" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="65"  y="80"  class="t">JavaScript</text><text x="65" y="96" class="s">DOM Updates</text>
    <rect x="155" y="60" width="110" height="50" rx="8" fill="#1e293b" stroke="#818cf8" stroke-width="1.5"/>
    <text x="210" y="80" class="t">Style Calc</text><text x="210" y="96" class="s">CSS Rules</text>
    <rect x="300" y="60" width="110" height="50" rx="8" fill="#1e293b" stroke="#a78bfa" stroke-width="1.5"/>
    <text x="355" y="80" class="t">Layout</text><text x="355" y="96" class="s">Box Model</text>
    <rect x="445" y="60" width="110" height="50" rx="8" fill="#1e293b" stroke="#f472b6" stroke-width="1.5"/>
    <text x="500" y="80" class="t">Paint</text><text x="500" y="96" class="s">Pixels → Screen</text>
    <rect x="590" y="60" width="110" height="50" rx="8" fill="#1e293b" stroke="#34d399" stroke-width="1.5"/>
    <text x="645" y="80" class="t">Composite</text><text x="645" y="96" class="s">GPU Layers</text>
    <rect x="735" y="60" width="75"  height="50" rx="8" fill="#0f172a" stroke="#fbbf24" stroke-width="2"/>
    <text x="772" y="80" class="t">Frame</text><text x="772" y="96" class="s">60fps</text>
    <line x1="120" y1="85" x2="153" y2="85" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#arr)"/>
    <line x1="265" y1="85" x2="298" y2="85" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arr)"/>
    <line x1="410" y1="85" x2="443" y2="85" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#arr)"/>
    <line x1="555" y1="85" x2="588" y2="85" stroke="#f472b6" stroke-width="1.5" marker-end="url(#arr)"/>
    <line x1="700" y1="85" x2="733" y2="85" stroke="#34d399" stroke-width="1.5" marker-end="url(#arr)"/>
    <text x="65"  y="130" class="lbl">① JS</text>
    <text x="210" y="130" class="lbl">② Style</text>
    <text x="355" y="130" class="lbl">③ Layout</text>
    <text x="500" y="130" class="lbl">④ Paint</text>
    <text x="645" y="130" class="lbl">⑤ Composite</text>
    <text x="772" y="130" class="lbl">⑥ Output</text>
    <text x="410" y="25" style="font-family:sans-serif;font-size:14px;fill:#f8fafc;text-anchor:middle;font-weight:700">Browser Rendering Pipeline</text>
    <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/></marker></defs>
  </svg>`,

  eventLoop: `<svg viewBox="0 0 820 240" width="100%" xmlns="http://www.w3.org/2000/svg">
    <style>.t{font-family:sans-serif;font-size:12px;fill:#f8fafc;text-anchor:middle}.s{font-family:sans-serif;font-size:10px;fill:#94a3b8;text-anchor:middle}.h{font-family:sans-serif;font-size:14px;fill:#f8fafc;text-anchor:middle;font-weight:700}</style>
    <text x="410" y="22" class="h">JavaScript Event Loop Architecture</text>
    <rect x="20"  y="40" width="140" height="170" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
    <text x="90"  y="62" class="t" style="fill:#38bdf8;font-weight:700">Call Stack</text>
    <rect x="30"  y="70" width="120" height="30" rx="4" fill="#1e3a5f"/><text x="90" y="90" class="s">fn() executing</text>
    <rect x="30" y="104" width="120" height="30" rx="4" fill="#1e3a5f"/><text x="90" y="124" class="s">anonymous()</text>
    <rect x="30" y="138" width="120" height="30" rx="4" fill="#1e293b"/><text x="90" y="158" class="s">main()</text>
    <rect x="200" y="40" width="160" height="80" rx="8" fill="#0f172a" stroke="#a78bfa" stroke-width="2"/>
    <text x="280" y="62" class="t" style="fill:#a78bfa;font-weight:700">Microtask Queue</text>
    <rect x="210" y="70" width="140" height="25" rx="4" fill="#2d1b69"/><text x="280" y="87" class="s">Promise.then() · queueMicrotask()</text>
    <rect x="200" y="140" width="160" height="70" rx="8" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <text x="280" y="162" class="t" style="fill:#f59e0b;font-weight:700">Task Queue</text>
    <rect x="210" y="170" width="140" height="25" rx="4" fill="#451a03"/><text x="280" y="187" class="s">setTimeout · I/O</text>
    <rect x="400" y="40" width="160" height="170" rx="8" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
    <text x="480" y="62" class="t" style="fill:#34d399;font-weight:700">Web APIs</text>
    <rect x="410" y="70"  width="140" height="22" rx="4" fill="#052e16"/><text x="480" y="85" class="s">setTimeout / setInterval</text>
    <rect x="410" y="97"  width="140" height="22" rx="4" fill="#052e16"/><text x="480" y="112" class="s">fetch / XMLHttpRequest</text>
    <rect x="410" y="124" width="140" height="22" rx="4" fill="#052e16"/><text x="480" y="139" class="s">DOM Events</text>
    <rect x="410" y="151" width="140" height="22" rx="4" fill="#052e16"/><text x="480" y="166" class="s">requestAnimationFrame</text>
    <rect x="600" y="90" width="200" height="70" rx="8" fill="#0f172a" stroke="#ec4899" stroke-width="2"/>
    <text x="700" y="112" class="t" style="fill:#ec4899;font-weight:700">Event Loop</text>
    <text x="700" y="132" class="s">1. Run all Microtasks</text>
    <text x="700" y="148" class="s">2. Pick 1 Macrotask → repeat</text>
    <line x1="200" y1="80" x2="162" y2="80" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#a2)"/>
    <line x1="200" y1="175" x2="162" y2="130" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#a2)"/>
    <line x1="560" y1="120" x2="598" y2="120" stroke="#34d399" stroke-width="1.5" marker-end="url(#a2)"/>
    <line x1="600" y1="125" x2="362" y2="85" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#a2)"/>
    <defs><marker id="a2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/></marker></defs>
  </svg>`,

  dnsFlowchart: `<svg viewBox="0 0 820 200" width="100%" xmlns="http://www.w3.org/2000/svg">
    <style>.t{font-family:sans-serif;font-size:11px;fill:#f8fafc;text-anchor:middle}.s{font-family:sans-serif;font-size:9px;fill:#94a3b8;text-anchor:middle}.h{font-family:sans-serif;font-size:14px;fill:#f8fafc;text-anchor:middle;font-weight:700}</style>
    <text x="410" y="20" class="h">DNS Resolution Flowchart</text>
    <rect x="10"  y="40" width="100" height="50" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    <text x="60"  y="62" class="t">Browser</text><text x="60" y="78" class="s">Cache Check</text>
    <rect x="145" y="40" width="100" height="50" rx="6" fill="#1e293b" stroke="#818cf8" stroke-width="1.5"/>
    <text x="195" y="62" class="t">OS Cache</text><text x="195" y="78" class="s">hosts file</text>
    <rect x="280" y="40" width="110" height="50" rx="6" fill="#1e293b" stroke="#a78bfa" stroke-width="1.5"/>
    <text x="335" y="62" class="t">Recursive</text><text x="335" y="78" class="s">Resolver (ISP)</text>
    <rect x="425" y="40" width="100" height="50" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="475" y="62" class="t">Root NS</text><text x="475" y="78" class="s">13 root servers</text>
    <rect x="560" y="40" width="100" height="50" rx="6" fill="#1e293b" stroke="#f472b6" stroke-width="1.5"/>
    <text x="610" y="62" class="t">TLD NS</text><text x="610" y="78" class="s">.com / .io / .org</text>
    <rect x="695" y="40" width="115" height="50" rx="6" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
    <text x="752" y="62" class="t">Auth NS</text><text x="752" y="78" class="s">Returns IP → TTL</text>
    <line x1="110" y1="65" x2="143" y2="65" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#a3)"/>
    <line x1="245" y1="65" x2="278" y2="65" stroke="#818cf8" stroke-width="1.5" marker-end="url(#a3)"/>
    <line x1="390" y1="65" x2="423" y2="65" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#a3)"/>
    <line x1="525" y1="65" x2="558" y2="65" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#a3)"/>
    <line x1="660" y1="65" x2="693" y2="65" stroke="#f472b6" stroke-width="1.5" marker-end="url(#a3)"/>
    <line x1="752" y1="90" x2="752" y2="150" stroke="#34d399" stroke-width="1.5" stroke-dasharray="4,3"/>
    <line x1="752" y1="150" x2="60" y2="150" stroke="#34d399" stroke-width="1.5" stroke-dasharray="4,3"/>
    <line x1="60" y1="150" x2="60" y2="92" stroke="#34d399" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#a3)"/>
    <text x="406" y="168" class="s" style="fill:#34d399">IP returned & cached by browser</text>
    <defs><marker id="a3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/></marker></defs>
  </svg>`,

  systemDesignArch: `<svg viewBox="0 0 820 240" width="100%" xmlns="http://www.w3.org/2000/svg">
    <style>.t{font-family:sans-serif;font-size:11px;fill:#f8fafc;text-anchor:middle}.s{font-family:sans-serif;font-size:9px;fill:#94a3b8;text-anchor:middle}.h{font-family:sans-serif;font-size:14px;fill:#f8fafc;text-anchor:middle;font-weight:700}</style>
    <text x="410" y="20" class="h">Full-Stack System Design Architecture</text>
    <rect x="10"  y="40" width="110" height="45" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/><text x="65"  y="58" class="t">Client</text><text x="65"  y="74" class="s">Browser / Mobile</text>
    <rect x="155" y="40" width="110" height="45" rx="6" fill="#1e293b" stroke="#818cf8" stroke-width="1.5"/><text x="210" y="58" class="t">CDN</text><text x="210" y="74" class="s">Static assets / Edge</text>
    <rect x="300" y="40" width="110" height="45" rx="6" fill="#1e293b" stroke="#a78bfa" stroke-width="1.5"/><text x="355" y="58" class="t">Load Balancer</text><text x="355" y="74" class="s">Nginx / ALB</text>
    <rect x="445" y="40" width="110" height="45" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/><text x="500" y="58" class="t">API Gateway</text><text x="500" y="74" class="s">Auth / Rate Limit</text>
    <rect x="300" y="120" width="110" height="45" rx="6" fill="#1e293b" stroke="#34d399" stroke-width="1.5"/><text x="355" y="138" class="t">Microservices</text><text x="355" y="154" class="s">User / Order / Pay</text>
    <rect x="445" y="120" width="110" height="45" rx="6" fill="#1e293b" stroke="#f472b6" stroke-width="1.5"/><text x="500" y="138" class="t">Message Queue</text><text x="500" y="154" class="s">Kafka / RabbitMQ</text>
    <rect x="155" y="120" width="110" height="45" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/><text x="210" y="138" class="t">Cache Layer</text><text x="210" y="154" class="s">Redis / Memcached</text>
    <rect x="590" y="80" width="110" height="45" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/><text x="645" y="98" class="t">Database</text><text x="645" y="114" class="s">Postgres / MongoDB</text>
    <rect x="720" y="80" width="90"  height="45" rx="6" fill="#1e293b" stroke="#818cf8" stroke-width="1.5"/><text x="765" y="98" class="t">Object Store</text><text x="765" y="114" class="s">S3 / GCS</text>
    <line x1="120" y1="62" x2="153" y2="62" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#a4)"/>
    <line x1="265" y1="62" x2="298" y2="62" stroke="#818cf8" stroke-width="1.5" marker-end="url(#a4)"/>
    <line x1="410" y1="62" x2="443" y2="62" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#a4)"/>
    <line x1="500" y1="85" x2="500" y2="118" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#a4)"/>
    <line x1="355" y1="85" x2="355" y2="118" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#a4)"/>
    <line x1="210" y1="85" x2="210" y2="118" stroke="#818cf8" stroke-width="1.5" marker-end="url(#a4)"/>
    <line x1="410" y1="142" x2="443" y2="142" stroke="#34d399" stroke-width="1.5" marker-end="url(#a4)"/>
    <line x1="555" y1="100" x2="588" y2="100" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#a4)"/>
    <line x1="700" y1="100" x2="718" y2="100" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#a4)"/>
    <line x1="265" y1="142" x2="298" y2="142" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#a4)"/>
    <defs><marker id="a4" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/></marker></defs>
  </svg>`,

  oopPillars: `<svg viewBox="0 0 820 200" width="100%" xmlns="http://www.w3.org/2000/svg">
    <style>.t{font-family:sans-serif;font-size:13px;fill:#f8fafc;text-anchor:middle;font-weight:700}.s{font-family:sans-serif;font-size:10px;fill:#94a3b8;text-anchor:middle}.h{font-family:sans-serif;font-size:14px;fill:#f8fafc;text-anchor:middle;font-weight:700}</style>
    <text x="410" y="22" class="h">The Four Pillars of Object-Oriented Programming</text>
    <rect x="30"  y="45" width="170" height="120" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    <text x="115" y="75"  class="t" style="fill:#38bdf8">Encapsulation</text>
    <text x="115" y="95"  class="s">Bundle data + methods</text>
    <text x="115" y="110" class="s">private fields hidden</text>
    <text x="115" y="125" class="s">access via getters/setters</text>
    <text x="115" y="143" class="s">prevents external mutation</text>
    <rect x="230" y="45" width="170" height="120" rx="10" fill="#1e293b" stroke="#a78bfa" stroke-width="2"/>
    <text x="315" y="75"  class="t" style="fill:#a78bfa">Abstraction</text>
    <text x="315" y="95"  class="s">Hide implementation</text>
    <text x="315" y="110" class="s">expose only interface</text>
    <text x="315" y="125" class="s">reduces complexity</text>
    <text x="315" y="143" class="s">abstract classes / interfaces</text>
    <rect x="430" y="45" width="170" height="120" rx="10" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
    <text x="515" y="75"  class="t" style="fill:#34d399">Inheritance</text>
    <text x="515" y="95"  class="s">extend base class</text>
    <text x="515" y="110" class="s">reuse parent methods</text>
    <text x="515" y="125" class="s">override behaviours</text>
    <text x="515" y="143" class="s">class Dog extends Animal</text>
    <rect x="630" y="45" width="170" height="120" rx="10" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
    <text x="715" y="75"  class="t" style="fill:#f59e0b">Polymorphism</text>
    <text x="715" y="95"  class="s">same method name</text>
    <text x="715" y="110" class="s">different behaviour</text>
    <text x="715" y="125" class="s">method overriding</text>
    <text x="715" y="143" class="s">runtime dispatch</text>
  </svg>`,

  solidPrinciples: `<svg viewBox="0 0 820 210" width="100%" xmlns="http://www.w3.org/2000/svg">
    <style>.t{font-family:sans-serif;font-size:12px;fill:#f8fafc;text-anchor:middle;font-weight:700}.s{font-family:sans-serif;font-size:9.5px;fill:#94a3b8;text-anchor:middle}.h{font-family:sans-serif;font-size:14px;fill:#f8fafc;text-anchor:middle;font-weight:700}</style>
    <text x="410" y="22" class="h">SOLID Design Principles</text>
    <rect x="10"  y="40" width="146" height="140" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    <text x="83" y="65"  class="t" style="fill:#38bdf8">S — SRP</text>
    <text x="83" y="83"  class="s">Single Responsibility</text>
    <text x="83" y="99"  class="s">One class = one reason</text>
    <text x="83" y="113" class="s">to change</text>
    <text x="83" y="132" class="s" style="fill:#fbbf24">✗ UserService handles</text>
    <text x="83" y="146" class="s" style="fill:#fbbf24">auth + billing + logging</text>
    <rect x="170" y="40" width="146" height="140" rx="8" fill="#1e293b" stroke="#818cf8" stroke-width="2"/>
    <text x="243" y="65"  class="t" style="fill:#818cf8">O — OCP</text>
    <text x="243" y="83"  class="s">Open / Closed</text>
    <text x="243" y="99"  class="s">Open for extension</text>
    <text x="243" y="113" class="s">Closed for modification</text>
    <text x="243" y="132" class="s" style="fill:#34d399">✓ Add new PaymentMethod</text>
    <text x="243" y="146" class="s" style="fill:#34d399">without editing core code</text>
    <rect x="330" y="40" width="146" height="140" rx="8" fill="#1e293b" stroke="#a78bfa" stroke-width="2"/>
    <text x="403" y="65"  class="t" style="fill:#a78bfa">L — LSP</text>
    <text x="403" y="83"  class="s">Liskov Substitution</text>
    <text x="403" y="99"  class="s">Subtypes must replace</text>
    <text x="403" y="113" class="s">parent without breaking</text>
    <text x="403" y="132" class="s" style="fill:#fbbf24">✗ Square extends Rect</text>
    <text x="403" y="146" class="s" style="fill:#fbbf24">breaks area invariant</text>
    <rect x="490" y="40" width="146" height="140" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
    <text x="563" y="65"  class="t" style="fill:#f59e0b">I — ISP</text>
    <text x="563" y="83"  class="s">Interface Segregation</text>
    <text x="563" y="99"  class="s">No client forced to depend</text>
    <text x="563" y="113" class="s">on unused methods</text>
    <text x="563" y="132" class="s" style="fill:#34d399">✓ Split Printer into</text>
    <text x="563" y="146" class="s" style="fill:#34d399">Print + Scan + Fax</text>
    <rect x="650" y="40" width="160" height="140" rx="8" fill="#1e293b" stroke="#f472b6" stroke-width="2"/>
    <text x="730" y="65"  class="t" style="fill:#f472b6">D — DIP</text>
    <text x="730" y="83"  class="s">Dependency Inversion</text>
    <text x="730" y="99"  class="s">Depend on abstractions</text>
    <text x="730" y="113" class="s">not concrete classes</text>
    <text x="730" y="132" class="s" style="fill:#34d399">✓ Inject IDatabase not</text>
    <text x="730" y="146" class="s" style="fill:#34d399">MySQLDatabase directly</text>
  </svg>`,

  scalableArchitecture: `<svg viewBox="0 0 820 230" width="100%" xmlns="http://www.w3.org/2000/svg">
    <style>.t{font-family:sans-serif;font-size:11px;fill:#f8fafc;text-anchor:middle}.s{font-family:sans-serif;font-size:9px;fill:#94a3b8;text-anchor:middle}.h{font-family:sans-serif;font-size:14px;fill:#f8fafc;text-anchor:middle;font-weight:700}</style>
    <text x="410" y="20" class="h">Scalable Distributed Architecture</text>
    <rect x="340" y="35" width="140" height="40" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/><text x="410" y="52" class="t">Load Balancer</text><text x="410" y="66" class="s">Round-robin / Least Conn</text>
    <rect x="80"  y="110" width="120" height="40" rx="6" fill="#1e293b" stroke="#818cf8" stroke-width="1.5"/><text x="140" y="127" class="t">API Server 1</text><text x="140" y="141" class="s">Node.js / Go</text>
    <rect x="340" y="110" width="120" height="40" rx="6" fill="#1e293b" stroke="#818cf8" stroke-width="1.5"/><text x="400" y="127" class="t">API Server 2</text><text x="400" y="141" class="s">Node.js / Go</text>
    <rect x="600" y="110" width="120" height="40" rx="6" fill="#1e293b" stroke="#818cf8" stroke-width="1.5"/><text x="660" y="127" class="t">API Server 3</text><text x="660" y="141" class="s">Node.js / Go</text>
    <rect x="80"  y="180" width="120" height="40" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/><text x="140" y="197" class="t">Redis Cache</text><text x="140" y="211" class="s">In-memory · TTL keys</text>
    <rect x="340" y="180" width="120" height="40" rx="6" fill="#1e293b" stroke="#34d399" stroke-width="1.5"/><text x="400" y="197" class="t">PostgreSQL</text><text x="400" y="211" class="s">Primary + Read Replicas</text>
    <rect x="600" y="180" width="120" height="40" rx="6" fill="#1e293b" stroke="#f472b6" stroke-width="1.5"/><text x="660" y="197" class="t">Kafka Queue</text><text x="660" y="211" class="s">Async event streaming</text>
    <line x1="380" y1="75" x2="170" y2="108" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#a5)"/>
    <line x1="410" y1="75" x2="410" y2="108" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#a5)"/>
    <line x1="440" y1="75" x2="640" y2="108" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#a5)"/>
    <line x1="140" y1="150" x2="140" y2="178" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#a5)"/>
    <line x1="400" y1="150" x2="400" y2="178" stroke="#34d399" stroke-width="1.5" marker-end="url(#a5)"/>
    <line x1="660" y1="150" x2="660" y2="178" stroke="#f472b6" stroke-width="1.5" marker-end="url(#a5)"/>
    <defs><marker id="a5" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/></marker></defs>
  </svg>`,

  cachePatterns: `<svg viewBox="0 0 820 200" width="100%" xmlns="http://www.w3.org/2000/svg">
    <style>.t{font-family:sans-serif;font-size:12px;fill:#f8fafc;text-anchor:middle;font-weight:700}.s{font-family:sans-serif;font-size:9.5px;fill:#94a3b8;text-anchor:middle}.h{font-family:sans-serif;font-size:14px;fill:#f8fafc;text-anchor:middle;font-weight:700}</style>
    <text x="410" y="22" class="h">Caching Patterns Comparison</text>
    <rect x="10"  y="40" width="185" height="140" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    <text x="102" y="64" class="t" style="fill:#38bdf8">Cache-Aside</text>
    <text x="102" y="82" class="s">App checks cache first</text>
    <text x="102" y="96" class="s">On miss → load DB → store</text>
    <text x="102" y="110" class="s">App fully controls logic</text>
    <text x="102" y="127" class="s" style="fill:#fbbf24">Lazy load · stale risk</text>
    <text x="102" y="141" class="s" style="fill:#34d399">✓ Redis + Postgres</text>
    <rect x="215" y="40" width="185" height="140" rx="8" fill="#1e293b" stroke="#818cf8" stroke-width="2"/>
    <text x="307" y="64" class="t" style="fill:#818cf8">Write-Through</text>
    <text x="307" y="82" class="s">Write to cache + DB</text>
    <text x="307" y="96" class="s">simultaneously</text>
    <text x="307" y="110" class="s">Always consistent</text>
    <text x="307" y="127" class="s" style="fill:#fbbf24">Higher write latency</text>
    <text x="307" y="141" class="s" style="fill:#34d399">✓ Banking / payments</text>
    <rect x="420" y="40" width="185" height="140" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
    <text x="512" y="64" class="t" style="fill:#f59e0b">Write-Behind</text>
    <text x="512" y="82" class="s">Write to cache only</text>
    <text x="512" y="96" class="s">async flush to DB</text>
    <text x="512" y="110" class="s">Very fast writes</text>
    <text x="512" y="127" class="s" style="fill:#fbbf24">Data loss risk on crash</text>
    <text x="512" y="141" class="s" style="fill:#34d399">✓ Analytics / logging</text>
    <rect x="625" y="40" width="185" height="140" rx="8" fill="#1e293b" stroke="#f472b6" stroke-width="2"/>
    <text x="717" y="64" class="t" style="fill:#f472b6">Read-Through</text>
    <text x="717" y="82" class="s">Cache fetches from DB</text>
    <text x="717" y="96" class="s">on miss automatically</text>
    <text x="717" y="110" class="s">App talks only to cache</text>
    <text x="717" y="127" class="s" style="fill:#fbbf24">Cold start latency</text>
    <text x="717" y="141" class="s" style="fill:#34d399">✓ CDN edge caching</text>
  </svg>`,

  kafkaQueue: `<svg viewBox="0 0 820 210" width="100%" xmlns="http://www.w3.org/2000/svg">
    <style>.t{font-family:sans-serif;font-size:11px;fill:#f8fafc;text-anchor:middle}.s{font-family:sans-serif;font-size:9px;fill:#94a3b8;text-anchor:middle}.h{font-family:sans-serif;font-size:14px;fill:#f8fafc;text-anchor:middle;font-weight:700}</style>
    <text x="410" y="20" class="h">Apache Kafka Event Streaming Architecture</text>
    <rect x="10"  y="50"  width="110" height="40" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/><text x="65" y="67" class="t">Producer A</text><text x="65" y="81" class="s">OrderService</text>
    <rect x="10"  y="110" width="110" height="40" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/><text x="65" y="127" class="t">Producer B</text><text x="65" y="141" class="s">PaymentService</text>
    <rect x="10"  y="170" width="110" height="40" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/><text x="65" y="187" class="t">Producer C</text><text x="65" y="201" class="s">UserService</text>
    <rect x="170" y="40" width="310" height="170" rx="10" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <text x="325" y="62" class="t" style="fill:#f59e0b;font-weight:700">Kafka Broker Cluster</text>
    <rect x="185" y="72"  width="280" height="28" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="1"/><text x="325" y="90" class="s">Topic: orders · Partitions: P0 P1 P2 P3</text>
    <rect x="185" y="108" width="280" height="28" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="1"/><text x="325" y="126" class="s">Topic: payments · Partitions: P0 P1 P2</text>
    <rect x="185" y="144" width="280" height="28" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="1"/><text x="325" y="162" class="s">Topic: users · Partitions: P0 P1</text>
    <text x="325" y="196" class="s" style="fill:#fbbf24">Replication Factor: 3 · Offset-based commit</text>
    <rect x="530" y="50"  width="130" height="40" rx="6" fill="#1e293b" stroke="#34d399" stroke-width="2"/><text x="595" y="67" class="t">Consumer G1</text><text x="595" y="81" class="s">Notification Svc</text>
    <rect x="530" y="110" width="130" height="40" rx="6" fill="#1e293b" stroke="#34d399" stroke-width="2"/><text x="595" y="127" class="t">Consumer G2</text><text x="595" y="141" class="s">Analytics Svc</text>
    <rect x="530" y="170" width="130" height="40" rx="6" fill="#1e293b" stroke="#34d399" stroke-width="2"/><text x="595" y="187" class="t">Consumer G3</text><text x="595" y="201" class="s">Audit Logger</text>
    <rect x="700" y="90"  width="110" height="40" rx="6" fill="#0f172a" stroke="#818cf8" stroke-width="2"/><text x="755" y="107" class="t">Schema</text><text x="755" y="121" class="s">Registry / Avro</text>
    <line x1="120" y1="70"  x2="168" y2="80"  stroke="#38bdf8" stroke-width="1.5" marker-end="url(#a6)"/>
    <line x1="120" y1="130" x2="168" y2="125" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#a6)"/>
    <line x1="120" y1="190" x2="168" y2="170" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#a6)"/>
    <line x1="480" y1="86"  x2="528" y2="70"  stroke="#34d399" stroke-width="1.5" marker-end="url(#a6)"/>
    <line x1="480" y1="125" x2="528" y2="130" stroke="#34d399" stroke-width="1.5" marker-end="url(#a6)"/>
    <line x1="480" y1="162" x2="528" y2="188" stroke="#34d399" stroke-width="1.5" marker-end="url(#a6)"/>
    <line x1="660" y1="110" x2="698" y2="110" stroke="#818cf8" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#a6)"/>
    <defs><marker id="a6" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/></marker></defs>
  </svg>`,

  raftConsensus: `<svg viewBox="0 0 820 210" width="100%" xmlns="http://www.w3.org/2000/svg">
    <style>.t{font-family:sans-serif;font-size:11px;fill:#f8fafc;text-anchor:middle}.s{font-family:sans-serif;font-size:9px;fill:#94a3b8;text-anchor:middle}.h{font-family:sans-serif;font-size:14px;fill:#f8fafc;text-anchor:middle;font-weight:700}</style>
    <text x="410" y="20" class="h">Raft Consensus Algorithm</text>
    <circle cx="200" cy="120" r="55" fill="#0f172a" stroke="#f59e0b" stroke-width="3"/>
    <text x="200" y="112" class="t" style="fill:#f59e0b;font-weight:700">LEADER</text>
    <text x="200" y="128" class="s">Node 1</text>
    <text x="200" y="142" class="s">Term 4 · Log idx 12</text>
    <circle cx="480" cy="80" r="45" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
    <text x="480" y="73" class="t" style="fill:#34d399;font-weight:700">FOLLOWER</text>
    <text x="480" y="89" class="s">Node 2</text>
    <text x="480" y="104" class="s">Synced @ idx 12</text>
    <circle cx="480" cy="170" r="45" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
    <text x="480" y="163" class="t" style="fill:#34d399;font-weight:700">FOLLOWER</text>
    <text x="480" y="179" class="s">Node 3</text>
    <text x="480" y="194" class="s">Synced @ idx 12</text>
    <circle cx="680" cy="120" r="45" fill="#1e293b" stroke="#818cf8" stroke-width="2"/>
    <text x="680" y="113" class="t" style="fill:#818cf8;font-weight:700">CANDIDATE</text>
    <text x="680" y="129" class="s">Node 4</text>
    <text x="680" y="144" class="s">RequestVote Term 5</text>
    <line x1="253" y1="95"  x2="433" y2="78"  stroke="#f59e0b" stroke-width="2" marker-end="url(#a7)"/>
    <line x1="253" y1="148" x2="433" y2="162" stroke="#f59e0b" stroke-width="2" marker-end="url(#a7)"/>
    <text x="343" y="72" class="s" style="fill:#f59e0b">AppendEntries</text>
    <text x="343" y="170" class="s" style="fill:#f59e0b">AppendEntries</text>
    <line x1="524" y1="95"  x2="633" y2="110" stroke="#818cf8" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#a7)"/>
    <line x1="524" y1="155" x2="633" y2="135" stroke="#818cf8" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#a7)"/>
    <text x="592" y="106" class="s" style="fill:#818cf8">VoteGranted</text>
    <text x="40" y="120" class="s" style="fill:#fbbf24">Majority quorum = (N/2)+1</text>
    <text x="40" y="136" class="s" style="fill:#fbbf24">Leader commits when</text>
    <text x="40" y="152" class="s" style="fill:#fbbf24">majority ACK received</text>
    <defs><marker id="a7" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/></marker></defs>
  </svg>`,

  upiSequence: `<svg viewBox="0 0 820 210" width="100%" xmlns="http://www.w3.org/2000/svg">
    <style>.t{font-family:sans-serif;font-size:11px;fill:#f8fafc;text-anchor:middle}.s{font-family:sans-serif;font-size:9px;fill:#94a3b8;text-anchor:middle}.h{font-family:sans-serif;font-size:14px;fill:#f8fafc;text-anchor:middle;font-weight:700}</style>
    <text x="410" y="20" class="h">UPI Payment Sequence Diagram</text>
    <rect x="20"  y="35" width="90" height="30" rx="5" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/><text x="65"  y="54" class="t">Payer App</text>
    <rect x="160" y="35" width="90" height="30" rx="5" fill="#1e293b" stroke="#818cf8" stroke-width="1.5"/><text x="205" y="54" class="t">PSP/Bank</text>
    <rect x="320" y="35" width="90" height="30" rx="5" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/><text x="365" y="54" class="t">NPCI/UPI</text>
    <rect x="480" y="35" width="90" height="30" rx="5" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/><text x="525" y="54" class="t">Payee PSP</text>
    <rect x="640" y="35" width="110" height="30" rx="5" fill="#1e293b" stroke="#34d399" stroke-width="2"/><text x="695" y="54" class="t">Payee Account</text>
    <line x1="65"  y1="65" x2="65"  y2="205" stroke="#38bdf8" stroke-width="1" stroke-dasharray="4,3"/>
    <line x1="205" y1="65" x2="205" y2="205" stroke="#818cf8" stroke-width="1" stroke-dasharray="4,3"/>
    <line x1="365" y1="65" x2="365" y2="205" stroke="#f59e0b" stroke-width="1" stroke-dasharray="4,3"/>
    <line x1="525" y1="65" x2="525" y2="205" stroke="#f59e0b" stroke-width="1" stroke-dasharray="4,3"/>
    <line x1="695" y1="65" x2="695" y2="205" stroke="#34d399" stroke-width="1" stroke-dasharray="4,3"/>
    <line x1="65"  y1="80"  x2="203" y2="80"  stroke="#38bdf8" stroke-width="1.5" marker-end="url(#a8)"/><text x="134" y="76" class="s">1. Initiate txn + MPIN</text>
    <line x1="205" y1="100" x2="363" y2="100" stroke="#818cf8" stroke-width="1.5" marker-end="url(#a8)"/><text x="284" y="96" class="s">2. Debit Auth Request</text>
    <line x1="365" y1="120" x2="523" y2="120" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#a8)"/><text x="444" y="116" class="s">3. Credit Auth to Payee PSP</text>
    <line x1="525" y1="140" x2="693" y2="140" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#a8)"/><text x="609" y="136" class="s">4. Credit Payee Account</text>
    <line x1="693" y1="158" x2="527" y2="158" stroke="#34d399" stroke-width="1.5" marker-end="url(#a8)"/><text x="610" y="154" class="s">5. Confirm credit ACK</text>
    <line x1="523" y1="176" x2="367" y2="176" stroke="#34d399" stroke-width="1.5" marker-end="url(#a8)"/><text x="445" y="172" class="s">6. Confirm to NPCI</text>
    <line x1="363" y1="194" x2="67"  y2="194" stroke="#34d399" stroke-width="1.5" marker-end="url(#a8)"/><text x="215" y="190" class="s">7. Success notification</text>
    <defs><marker id="a8" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/></marker></defs>
  </svg>`,

  ragPipeline: `<svg viewBox="0 0 820 180" width="100%" xmlns="http://www.w3.org/2000/svg">
    <style>.t{font-family:sans-serif;font-size:11px;fill:#f8fafc;text-anchor:middle}.s{font-family:sans-serif;font-size:9px;fill:#94a3b8;text-anchor:middle}.h{font-family:sans-serif;font-size:14px;fill:#f8fafc;text-anchor:middle;font-weight:700}</style>
    <text x="410" y="20" class="h">RAG Pipeline Architecture (Retrieval-Augmented Generation)</text>
    <rect x="10"  y="50" width="110" height="50" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/><text x="65"  y="71" class="t">User Query</text><text x="65"  y="87" class="s">Natural language</text>
    <rect x="155" y="50" width="120" height="50" rx="6" fill="#1e293b" stroke="#818cf8" stroke-width="1.5"/><text x="215" y="71" class="t">Embed Query</text><text x="215" y="87" class="s">text-embedding-3</text>
    <rect x="310" y="50" width="130" height="50" rx="6" fill="#1e293b" stroke="#a78bfa" stroke-width="1.5"/><text x="375" y="71" class="t">Vector Search</text><text x="375" y="87" class="s">Pinecone / pgvector</text>
    <rect x="475" y="50" width="130" height="50" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/><text x="540" y="71" class="t">Top-K Chunks</text><text x="540" y="87" class="s">cosine similarity</text>
    <rect x="640" y="50" width="170" height="50" rx="6" fill="#0f172a" stroke="#34d399" stroke-width="2"/><text x="725" y="71" class="t">LLM + Context</text><text x="725" y="87" class="s">GPT-4 / Claude / Llama</text>
    <rect x="340" y="130" width="140" height="35" rx="6" fill="#1e293b" stroke="#f472b6" stroke-width="1.5"/><text x="410" y="147" class="t">Knowledge Base</text><text x="410" y="160" class="s">Embedded docs stored in VectorDB</text>
    <line x1="120" y1="75" x2="153" y2="75" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#a9)"/>
    <line x1="275" y1="75" x2="308" y2="75" stroke="#818cf8" stroke-width="1.5" marker-end="url(#a9)"/>
    <line x1="440" y1="75" x2="473" y2="75" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#a9)"/>
    <line x1="605" y1="75" x2="638" y2="75" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#a9)"/>
    <line x1="410" y1="130" x2="410" y2="102" stroke="#f472b6" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#a9)"/>
    <defs><marker id="a9" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/></marker></defs>
  </svg>`,

  moneyEvolution: `<svg viewBox="0 0 820 190" width="100%" xmlns="http://www.w3.org/2000/svg">
    <style>.t{font-family:sans-serif;font-size:11px;fill:#f8fafc;text-anchor:middle;font-weight:700}.s{font-family:sans-serif;font-size:9px;fill:#94a3b8;text-anchor:middle}.h{font-family:sans-serif;font-size:14px;fill:#f8fafc;text-anchor:middle;font-weight:700}</style>
    <text x="410" y="20" class="h">Evolution of Money → Cryptocurrency</text>
    <rect x="10"  y="45" width="120" height="120" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
    <text x="70"  y="70"  class="t" style="fill:#f59e0b">Barter</text>
    <text x="70"  y="88"  class="s">Direct exchange</text>
    <text x="70"  y="102" class="s">of goods</text>
    <text x="70"  y="116" class="s">No fungibility</text>
    <text x="70"  y="130" class="s">High friction</text>
    <text x="70"  y="148" class="s">~10000 BCE</text>
    <rect x="155" y="45" width="120" height="120" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
    <text x="215" y="70"  class="t" style="fill:#f59e0b">Gold / Coins</text>
    <text x="215" y="88"  class="s">Intrinsic value</text>
    <text x="215" y="102" class="s">Portable + durable</text>
    <text x="215" y="116" class="s">Scarce supply</text>
    <text x="215" y="130" class="s">Gold standard</text>
    <text x="215" y="148" class="s">~600 BCE</text>
    <rect x="300" y="45" width="120" height="120" rx="8" fill="#1e293b" stroke="#818cf8" stroke-width="2"/>
    <text x="360" y="70"  class="t" style="fill:#818cf8">Fiat Paper</text>
    <text x="360" y="88"  class="s">Gov-backed trust</text>
    <text x="360" y="102" class="s">Central banks</text>
    <text x="360" y="116" class="s">Inflation risk</text>
    <text x="360" y="130" class="s">1971 Bretton Woods</text>
    <text x="360" y="148" class="s">USD off gold</text>
    <rect x="445" y="45" width="120" height="120" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    <text x="505" y="70"  class="t" style="fill:#38bdf8">Digital Money</text>
    <text x="505" y="88"  class="s">Bank databases</text>
    <text x="505" y="102" class="s">Visa / PayPal</text>
    <text x="505" y="116" class="s">Centralized</text>
    <text x="505" y="130" class="s">Internet era</text>
    <text x="505" y="148" class="s">~1990s</text>
    <rect x="590" y="45" width="220" height="120" rx="8" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
    <text x="700" y="70"  class="t" style="fill:#34d399">Cryptocurrency</text>
    <text x="700" y="88"  class="s">Trustless · Decentralized</text>
    <text x="700" y="102" class="s">Blockchain consensus</text>
    <text x="700" y="116" class="s">Fixed supply (BTC: 21M)</text>
    <text x="700" y="130" class="s">Permissionless global access</text>
    <text x="700" y="148" class="s">Bitcoin Genesis Block 2009</text>
    <line x1="130" y1="105" x2="153" y2="105" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#a10)"/>
    <line x1="275" y1="105" x2="298" y2="105" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#a10)"/>
    <line x1="420" y1="105" x2="443" y2="105" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#a10)"/>
    <line x1="565" y1="105" x2="588" y2="105" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#a10)"/>
    <defs><marker id="a10" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/></marker></defs>
  </svg>`,

  merkleTree: `<svg viewBox="0 0 820 220" width="100%" xmlns="http://www.w3.org/2000/svg">
    <style>.t{font-family:sans-serif;font-size:10px;fill:#f8fafc;text-anchor:middle}.s{font-family:sans-serif;font-size:9px;fill:#94a3b8;text-anchor:middle}.h{font-family:sans-serif;font-size:14px;fill:#f8fafc;text-anchor:middle;font-weight:700}</style>
    <text x="410" y="20" class="h">Merkle Tree — Hashing Architecture</text>
    <rect x="315" y="40" width="190" height="36" rx="6" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <text x="410" y="56" class="t" style="fill:#f59e0b;font-weight:700">Root Hash</text>
    <text x="410" y="69" class="s">H(AB) + H(CD)</text>
    <rect x="140" y="100" width="165" height="36" rx="6" fill="#1e293b" stroke="#818cf8" stroke-width="1.5"/>
    <text x="222" y="116" class="t" style="fill:#818cf8;font-weight:700">Hash AB</text>
    <text x="222" y="129" class="s">H(A) + H(B)</text>
    <rect x="515" y="100" width="165" height="36" rx="6" fill="#1e293b" stroke="#818cf8" stroke-width="1.5"/>
    <text x="597" y="116" class="t" style="fill:#818cf8;font-weight:700">Hash CD</text>
    <text x="597" y="129" class="s">H(C) + H(D)</text>
    <rect x="10"  y="160" width="85" height="30" rx="4" fill="#1e293b" stroke="#a78bfa" stroke-width="1.5"/>
    <text x="52"  y="178" class="t">Hash A</text>
    <rect x="110" y="160" width="85" height="30" rx="4" fill="#1e293b" stroke="#a78bfa" stroke-width="1.5"/>
    <text x="152" y="178" class="t">Hash B</text>
    <rect x="420" y="160" width="85" height="30" rx="4" fill="#1e293b" stroke="#a78bfa" stroke-width="1.5"/>
    <text x="462" y="178" class="t">Hash C</text>
    <rect x="520" y="160" width="85" height="30" rx="4" fill="#1e293b" stroke="#a78bfa" stroke-width="1.5"/>
    <text x="562" y="178" class="t">Hash D</text>
    <line x1="222" y1="100" x2="315" y2="60" stroke="#f59e0b" stroke-width="1.5"/>
    <line x1="597" y1="100" x2="505" y2="60" stroke="#f59e0b" stroke-width="1.5"/>
    <line x1="52"  y1="160" x2="140" y2="125" stroke="#818cf8" stroke-width="1.5"/>
    <line x1="152" y1="160" x2="222" y2="136" stroke="#818cf8" stroke-width="1.5"/>
    <line x1="462" y1="160" x2="515" y2="136" stroke="#818cf8" stroke-width="1.5"/>
    <line x1="562" y1="160" x2="597" y2="136" stroke="#818cf8" stroke-width="1.5"/>
  </svg>`
};

function parseInlineMarkdown(text: string) {
  if (!text) return '';
  // First escape HTML angle brackets to prevent raw HTML/link leakage
  let html = String(text)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Convert standard markdown structures
  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\n/g, '<br>');
  return html;
}

function normalizeData(rawData: any[], rawToc: any[] | null) {
  if (!rawData || !Array.isArray(rawData)) return { handbookData: [], handbookToc: [] };

  const slugify = (txt: string) => {
    if (!txt) return 'heading';
    return String(txt).toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Group flat items if needed
  let normalizedSections: any[] = [];
  const isFlat = rawData.length > 0 && rawData[0] && typeof rawData[0].type === 'string';

  if (isFlat) {
    let currentSection: any = null;
    rawData.forEach((item, idx) => {
      if (item.type === 'sectionHeader') {
        if (currentSection) {
          normalizedSections.push(currentSection);
        }
        currentSection = {
          num: item.num !== undefined ? item.num : normalizedSections.length,
          id: item.id || `section-${normalizedSections.length}`,
          title: item.title || '',
          items: [item]
        };
        item.id = currentSection.id;
        item.subtitle = item.subtitle || `Section ${currentSection.num}`;
      } else {
        if (!currentSection) {
          currentSection = {
            num: 0,
            id: 'section-0',
            title: 'Introduction',
            items: []
          };
        }
        currentSection.items.push(item);
      }
    });
    if (currentSection) {
      normalizedSections.push(currentSection);
    }
  } else {
    rawData.forEach((sec, secIdx) => {
      const rawItems = sec.items || sec.content || [];
      const sectionItems = Array.isArray(rawItems) ? rawItems : [];
      
      let items: any[] = [];
      let currentSectionHeader: any = null;
      
      sectionItems.forEach(item => {
        if (!item) return;
        if (item.type === 'sectionHeader') {
          currentSectionHeader = item;
        }
        items.push(item);
      });
      
      const secNum = sec.num !== undefined ? sec.num : secIdx;
      const secId = sec.id || (currentSectionHeader && currentSectionHeader.id) || `section-${secNum}`;
      
      if (!currentSectionHeader) {
        currentSectionHeader = {
          type: 'sectionHeader',
          num: secNum,
          title: sec.title || `Section ${secNum}`,
          subtitle: `Section ${secNum}`,
          id: secId
        };
        items.unshift(currentSectionHeader);
      } else {
        currentSectionHeader.id = currentSectionHeader.id || secId;
        currentSectionHeader.subtitle = currentSectionHeader.subtitle || `Section ${secNum}`;
      }
      
      normalizedSections.push({
        num: secNum,
        id: secId,
        title: sec.title || currentSectionHeader.title || '',
        items: items
      });
    });
  }

  // Element-level normalization
  normalizedSections.forEach(sec => {
    const mergedItems: any[] = [];
    
    sec.items.forEach((item: any) => {
      if (!item) return;
      
      if (item.type === 'h1' || item.type === 'h2' || item.type === 'h3' || item.type === 'h4') {
        item.id = item.id || slugify(item.text) || `heading-${Math.random().toString(36).substr(2, 5)}`;
      }
      // Assign unique IDs to interview/quiz cards if missing
      if ((item.type === 'interviewCard' || item.type === 'quizQuestion') && !item.id) {
        item.id = `${item.type}-${Math.random().toString(36).substr(2, 8)}`;
      }
      
      if (item.type === 'codeBlock') {
        if (Array.isArray(item.code)) {
          item.code = item.code.join('\n');
        }
        if (Array.isArray(item.codeText)) {
          item.code = item.codeText.join('\n');
        }
        if (Array.isArray(item.lines)) {
          item.code = item.lines.join('\n');
        }
      }
      
      if (item.type === 'tabbedCodeBlock') {
        if (!item.tabs && item.codeMap) {
          item.tabs = Object.entries(item.codeMap).map(([lang, codeVal]) => {
            let codeText = codeVal;
            if (Array.isArray(codeText)) {
              codeText = codeText.join('\n');
            }
            return {
              name: lang.toUpperCase(),
              lang: lang,
              code: codeText
            };
          });
        } else if (item.tabs && Array.isArray(item.tabs)) {
          item.tabs.forEach((tab: any) => {
            if (Array.isArray(tab.code)) {
              tab.code = tab.code.join('\n');
            }
            if (Array.isArray(tab.codeText)) {
              tab.code = tab.codeText.join('\n');
            }
          });
        }
      }
      
      if (item.type === 'table' || item.type === 'twoColTable') {
        item.type = 'twoColTable';
        if (item.headers && item.rows && item.rows.length > 0) {
          const firstRow = item.rows[0];
          const headers = item.headers;
          if (firstRow.length === headers.length && firstRow.every((val: any, i: number) => val === headers[i])) {
            item.rows.shift();
          }
        }
      }
      
      const prevItem = mergedItems[mergedItems.length - 1];
      if (item.type === 'bullet') {
        const currentTexts = item.items || (item.text ? [item.text] : []);
        if (prevItem && prevItem.type === 'bullet') {
          prevItem.items = prevItem.items.concat(currentTexts);
        } else {
          item.items = currentTexts;
          mergedItems.push(item);
        }
      } else if (item.type === 'numbered') {
        const currentTexts = item.items || (item.text ? [item.text] : []);
        if (prevItem && prevItem.type === 'numbered') {
          prevItem.items = prevItem.items.concat(currentTexts);
        } else {
          item.items = currentTexts;
          mergedItems.push(item);
        }
      } else {
        mergedItems.push(item);
      }
    });
    
    sec.items = mergedItems;
  });

  // ── ID Deduplication: prefix sub-item IDs with section index so that
  //    repeated names like "Summary", "Interview Questions" don't clash.
  const seenIds = new Set<string>();
  normalizedSections.forEach((sec, sidx) => {
    sec.items.forEach((item: any) => {
      if (!item || !item.id) return;
      if (seenIds.has(item.id)) {
        // Re-stamp with section prefix
        item.id = `s${sidx}-${item.id}`;
      } else {
        seenIds.add(item.id);
      }
    });
    // Also fix section id itself if duplicate
    if (seenIds.has(sec.id) && !seenIds.has(`s${sidx}-${sec.id}`)) {
      // section id was just consumed; no action needed (it was first)
    } else if (!seenIds.has(sec.id)) {
      seenIds.add(sec.id);
    }
  });

  // TOC Generation
  let generatedToc: any[] = [];
  const hasSubItems = rawToc && Array.isArray(rawToc) && rawToc.some((t: any) => t.level !== undefined && t.level !== null && t.level > 0);
  if (rawToc && Array.isArray(rawToc) && rawToc.length > 0 && hasSubItems) {
    // ── Section-aware ID remapping for rawToc ──────────────────────────────
    // The rawToc may have duplicate sub-item names across sections
    // (e.g. "Summary", "Interview Questions" repeat in every section).
    // A global idMap would map all of them to the FIRST occurrence's id.
    // Instead, we track the current section sequentially and look up ids
    // within that section's item list only.
    //
    // Per-section text→id lookup tables (built from deduped handbookData)
    const sectionItemMaps: Array<Record<string, string>> = normalizedSections.map(sec => {
      const map: Record<string, string> = {};
      sec.items.forEach((item: any) => {
        if (item && item.id && item.text) {
          const slug = slugify(item.text);
          if (!map[slug]) map[slug] = item.id; // first match per section wins
        }
      });
      return map;
    });

    // Process rawToc sequentially: each level-0 entry advances to next section
    let currentSectionIdx = -1;
    generatedToc = rawToc.map(item => {
      const lv = item.level === undefined || item.level === null ? 0 : item.level;

      if (lv === 0) {
        // Advance to next section (rawToc sections are always in order)
        currentSectionIdx++;
        const sec = normalizedSections[currentSectionIdx];
        if (!sec) return { ...item, level: lv };

        const secHeader = sec.items.find((it: any) => it.type === 'sectionHeader');
        const sectionId = secHeader?.id || sec.id;

        // Collect sub-item ids that are h1/h2/h3 for progress tracking
        const childIds: string[] = [];
        sec.items.forEach((it: any) => {
          if (it && it.id && (it.type === 'h1' || it.type === 'h2' || it.type === 'h3')) {
            childIds.push(it.id);
          }
        });

        return { ...item, level: lv, id: sectionId, sectionIdx: currentSectionIdx, childIds };
      } else {
        // Sub-item: look up id in current section's map only
        const slug = slugify(item.text || '');
        const secMap = sectionItemMaps[currentSectionIdx] || {};
        const remappedId = secMap[slug] || item.id;
        return { ...item, level: lv, id: remappedId, sectionIdx: currentSectionIdx };
      }
    });
  } else {
    normalizedSections.forEach((sec, sidx) => {
      const secHeader = sec.items.find((it: any) => it.type === 'sectionHeader');
      const secId = secHeader ? secHeader.id : sec.id;
      
      // Collect child sub-item IDs for this section
      const childIds: string[] = [];
      sec.items.forEach((item: any) => {
        if (item.type === 'h1' || item.type === 'h2' || item.type === 'h3') {
          childIds.push(item.id);
        }
      });

      generatedToc.push({
        level: 0,
        text: sec.title ? `Section ${sec.num}: ${sec.title}` : `Section ${sec.num}`,
        id: secId,
        sectionIdx: sidx,
        childIds
      });
      
      sec.items.forEach((item: any) => {
        if (item.type === 'h2' || item.type === 'h1') {
          generatedToc.push({
            level: 2,
            text: item.text,
            id: item.id,
            sectionIdx: sidx
          });
        } else if (item.type === 'h3') {
          generatedToc.push({
            level: 3,
            text: item.text,
            id: item.id,
            sectionIdx: sidx
          });
        }
      });
    });
  }

  return {
    handbookData: normalizedSections,
    handbookToc: generatedToc
  };
}

function PageComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL queries
  const rawCourse = searchParams.get('course');
  const courseKey = rawCourse ? (rawCourse.replace(/\s+/g, '++') === 'c++_dsa_masterclass' ? 'c++_dsa_masterclass' : rawCourse) : null;
  const themeQuery = searchParams.get('theme');

  // Client states
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedRole, setSelectedRole] = useState<'webdev' | 'devops' | 'web3' | 'ai'>('webdev');
  const [selectedExperience, setSelectedExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [roadmapGenerated, setRoadmapGenerated] = useState(false);
  const [compilationStarted, setCompilationStarted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hbSearchQuery, setHbSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [terminalLogs, setTerminalLogs] = useState<Array<{ time: string, message: string, type: 'info' | 'success' | 'error' }>>([
    { time: new Date().toLocaleTimeString(), message: 'Placement Hub initialized. Waiting for student interest inputs to generate curriculum...', type: 'info' }
  ]);

  // Loading handbook content
  const [handbookData, setHandbookData] = useState<any[] | null>(null);
  const [handbookToc, setHandbookToc] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interaction states
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, { selectedIdx: number; correct: boolean }>>({});
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [activeTocId, setActiveTocId] = useState<string>('');

  // ── Sidebar collapsible sections state (Set of section IDs that are EXPANDED)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // ── Progress tracking: { [handbookKey]: { [subItemId]: boolean } }
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  // ── Save point: last visited item id per course
  const [savePoint, setSavePoint] = useState<string | null>(null);

  // Scroll variables
  const [scrollTopVisible, setScrollTopVisible] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  // Initialize theme and configuration from localStorage/URL
  useEffect(() => {
    const savedTheme = themeQuery || localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme as 'dark' | 'light');
    
    const savedRole = localStorage.getItem('selectedRole');
    const savedExperience = localStorage.getItem('selectedExperience');
    const isGenerated = localStorage.getItem('roadmapGenerated') === 'true';

    if (savedRole) setSelectedRole(savedRole as any);
    if (savedExperience) setSelectedExperience(savedExperience as any);
    if (isGenerated) {
      setRoadmapGenerated(true);
      setCompilationStarted(true);
    }
  }, [themeQuery]);

  // Fetch course JSON on courseKey change
  useEffect(() => {
    if (!courseKey) {
      setHandbookData(null);
      setHandbookToc(null);
      return;
    }

    const meta = COURSE_MAP[courseKey];
    if (meta) {
      // Set accent variables scoped to placement-engine root wrapper
      const el = document.querySelector('.placement-engine-body') as HTMLElement;
      if (el) {
        el.style.setProperty('--accent', meta.accent);
        el.style.setProperty('--accent-rgb', meta.rgb);
        el.style.setProperty('--accent-hover', meta.hover);
      }
    }

    setLoading(true);
    setError(null);
    setRevealedAnswers({});
    setQuizAnswers({});
    setActiveTabs({});
    // Reset sidebar collapse state when switching handbooks
    setExpandedSections(new Set());

    // Load progress for this course from localStorage
    try {
      const savedProgress = localStorage.getItem(`hb_progress_${courseKey}`);
      if (savedProgress) {
        setCompletedItems(JSON.parse(savedProgress));
      } else {
        setCompletedItems({});
      }
      const savedPoint = localStorage.getItem(`hb_savepoint_${courseKey}`);
      setSavePoint(savedPoint || null);
    } catch {
      setCompletedItems({});
      setSavePoint(null);
    }

    fetch(`/placement-engine/data/${courseKey}.json`)
      .then(res => {
        if (!res.ok) throw new Error('Data file not found.');
        return res.json();
      })
      .then(json => {
        const normalized = normalizeData(json.handbookData, json.handbookToc);
        setHandbookData(normalized.handbookData);
        setHandbookToc(normalized.handbookToc);
        setLoading(false);
        // Resume from save point after a tick
        const sp = localStorage.getItem(`hb_savepoint_${courseKey}`);
        if (sp) {
          setTimeout(() => {
            const el = document.getElementById(sp);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 400);
        }
      })
      .catch(err => {
        console.error(err);
        setError(`Could not load masterclass data for "${courseKey}". Please ensure the file is available on the server.`);
        setLoading(false);
      });
  }, [courseKey]);

  // Scroll to results when roadmap compiled
  const resultsRef = useRef<HTMLDivElement>(null);
  const logToTerminal = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setTerminalLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString(), message, type }
    ]);
  };

  const handleRoleChange = (role: 'webdev' | 'devops' | 'web3' | 'ai') => {
    if (role === selectedRole) return;
    setSelectedRole(role);
    localStorage.setItem('selectedRole', role);
    setRoadmapGenerated(false);
    localStorage.removeItem('roadmapGenerated');
    logToTerminal(`Target track updated to [${ROADMAP_CONFIG[role].label}]. Click 'Compile' to rebuild.`, 'info');
  };

  const handleExperienceChange = (level: 'beginner' | 'intermediate' | 'advanced') => {
    if (level === selectedExperience) return;
    setSelectedExperience(level);
    localStorage.setItem('selectedExperience', level);
    setRoadmapGenerated(false);
    localStorage.removeItem('roadmapGenerated');
    logToTerminal(`Target seniority updated to [${level.toUpperCase()}]. Click 'Compile' to rebuild.`, 'info');
  };

  const activePhases = ROADMAP_CONFIG[selectedRole]?.[selectedExperience]?.phases || [];
  const getCardPhaseInfo = (cardId: string) => {
    const phaseIndex = activePhases.findIndex(p => p.cardId === cardId);
    return phaseIndex !== -1 ? { index: phaseIndex, label: activePhases[phaseIndex].label } : null;
  };

  const compileRoadmap = () => {
    setCompilationStarted(true);
    logToTerminal(`Profile: [${ROADMAP_CONFIG[selectedRole].label}] · Level: [${selectedExperience.toUpperCase()}]`, 'info');
    logToTerminal(`Generating roadmap: "${ROADMAP_CONFIG[selectedRole][selectedExperience].title}"`, 'info');
    
    const phases = ROADMAP_CONFIG[selectedRole][selectedExperience].phases;
    phases.forEach((phase, i) => {
      setTimeout(() => {
        logToTerminal(`  ${phase.label}: ${phase.desc}`, 'success');
      }, (i + 1) * 200);
    });

    setTimeout(() => {
      logToTerminal('✓ Curriculum roadmap ready! All handbooks unlocked.', 'success');
      setRoadmapGenerated(true);
      localStorage.setItem('roadmapGenerated', 'true');
      localStorage.setItem('selectedRole', selectedRole);
      localStorage.setItem('selectedExperience', selectedExperience);
      
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }, phases.length * 200 + 300);
  };

  const unlockAll = () => {
    logToTerminal('Full library unlocked — all 10 masterclass handbooks available.', 'success');
    setCompilationStarted(true);
    setRoadmapGenerated(true);
    localStorage.setItem('roadmapGenerated', 'true');
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  // ── Progress helper: toggle subsection completion
  const toggleItemComplete = (itemId: string) => {
    if (!courseKey) return;
    setCompletedItems(prev => {
      const next = { ...prev, [itemId]: !prev[itemId] };
      localStorage.setItem(`hb_progress_${courseKey}`, JSON.stringify(next));
      return next;
    });
  };

  // ── Save point: mark current active id as save point
  const markSavePoint = (id: string) => {
    if (!courseKey) return;
    setSavePoint(id);
    localStorage.setItem(`hb_savepoint_${courseKey}`, id);
  };

  // ── Sidebar section toggle
  const toggleSectionExpand = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Scroll observer for handbook headings
  useEffect(() => {
    if (!handbookData) return;
    
    const handleScroll = () => {
      const winScroll = window.scrollY;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      
      const pBar = document.getElementById('progress-bar-hb');
      if (pBar) pBar.style.width = `${scrolled}%`;

      setScrollTopVisible(window.scrollY > 500);

      // Find active section heading
      const headings = Array.from(document.querySelectorAll('.scroll-mt'));
      let currentActiveId = '';
      for (const heading of headings) {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 120) {
          currentActiveId = heading.id;
        }
      }
      if (currentActiveId) {
        setActiveTocId(currentActiveId);
        // Auto-save point
        if (courseKey) {
          localStorage.setItem(`hb_savepoint_${courseKey}`, currentActiveId);
        }
        // Auto-expand active section in sidebar
        if (handbookToc) {
          const activeGroup = handbookToc.find((t: any) => t.level === 0 && (
            t.id === currentActiveId || (t.childIds && t.childIds.includes(currentActiveId))
          ));
          if (activeGroup) {
            setExpandedSections(prev => {
              if (prev.has(activeGroup.id)) return prev;
              const next = new Set(prev);
              next.add(activeGroup.id);
              return next;
            });
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handbookData, handbookToc, courseKey]);

  // Auto-scroll terminal to bottom on new log entry
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // Copy code utility
  const copyCode = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
  };

  // Switch to handbook mode
  const openHandbook = (course: string) => {
    router.push(`?course=${encodeURIComponent(course)}&theme=${theme}`);
  };

  // Switch back to launcher hub
  const closeHandbook = () => {
    router.push(`?theme=${theme}`);
  };

  return (
    <div className="placement-engine-body" data-theme={theme}>
      
      {/* 1. HUB LAUNCHER VIEW */}
      {!courseKey && (
        <div id="hub-view" className="w-full min-h-screen p-6 md:p-12">
          <div className="container mx-auto max-w-7xl">
            
            {/* Floating theme toggle */}
            <div className="theme-toggle-floating">
              <button className="btn-theme" onClick={toggleTheme}>
                {theme === 'dark' ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            <header className="mb-12 text-center">
              <div className="badge-hub mb-4">
                <span className="pulse-dot"></span>
                <span>Placement Launcher Hub</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-4 font-display">
                SDE Masterclass Hub & Placement Launchpad
              </h1>
              <p className="subtitle text-lg max-w-3xl mx-auto text-slate-400">
                Select your target engineering profile and experience level to construct a customized curriculum roadmap and access course handbooks instantly.
              </p>
            </header>

            {/* Wizard section */}
            <section className="wizard-card p-6 md:p-8 mb-12">
              <h2 className="wizard-title text-xl md:text-2xl font-bold mb-6 font-display">Curriculum Roadmap Builder</h2>
              
              <div className="wizard-step mb-8">
                <span className="wizard-step-label text-sm font-semibold tracking-wider text-slate-400 block mb-4">Step 1: Choose Target Engineering Track</span>
                <div className="options-grid">
                  <button 
                    className={`option-btn ${selectedRole === 'webdev' ? 'selected' : ''}`}
                    onClick={() => handleRoleChange('webdev')}
                  >
                    <span className="option-title">Full Stack Architect</span>
                    <span className="option-desc">Web development, Cloud architectures, scaling, React and backend APIs.</span>
                  </button>
                  <button 
                    className={`option-btn ${selectedRole === 'devops' ? 'selected' : ''}`}
                    onClick={() => handleRoleChange('devops')}
                  >
                    <span className="option-title">DevOps & Infrastructure</span>
                    <span className="option-desc">SRE, Kubernetes orchestration, CI/CD automation and Linux.</span>
                  </button>
                  <button 
                    className={`option-btn ${selectedRole === 'web3' ? 'selected' : ''}`}
                    onClick={() => handleRoleChange('web3')}
                  >
                    <span className="option-title">Web3 & Cryptography</span>
                    <span className="option-desc">Blockchain protocols, Rust programming, smart contract audits, and DeFi.</span>
                  </button>
                  <button 
                    className={`option-btn ${selectedRole === 'ai' ? 'selected' : ''}`}
                    onClick={() => handleRoleChange('ai')}
                  >
                    <span className="option-title">AI & LLM Engineering</span>
                    <span className="option-desc">PyTorch, Transformers, Agentic workflows, RAG, and GPU servings.</span>
                  </button>
                </div>
              </div>

              <div className="wizard-step mb-8">
                <span className="wizard-step-label text-sm font-semibold tracking-wider text-slate-400 block mb-4">Step 2: Select Target Seniority / Level</span>
                <div className="options-grid">
                  <button 
                    className={`option-btn ${selectedExperience === 'beginner' ? 'selected' : ''}`}
                    onClick={() => handleExperienceChange('beginner')}
                  >
                    <span className="option-title">Absolute Beginner</span>
                    <span className="option-desc">Freshman / SDE-1 target. Core logic, basics, languages, and essential structures.</span>
                  </button>
                  <button 
                    className={`option-btn ${selectedExperience === 'intermediate' ? 'selected' : ''}`}
                    onClick={() => handleExperienceChange('intermediate')}
                  >
                    <span className="option-title">Intermediate</span>
                    <span className="option-desc">SDE-2 target. Medium difficulty algorithms, basic HLD, and core system properties.</span>
                  </button>
                  <button 
                    className={`option-btn ${selectedExperience === 'advanced' ? 'selected' : ''}`}
                    onClick={() => handleExperienceChange('advanced')}
                  >
                    <span className="option-title">Advanced</span>
                    <span className="option-desc">Senior SDE / Tech Lead. High scale system architecture, optimizations, and audits.</span>
                  </button>
                </div>
              </div>

              <div className="wizard-actions flex flex-col sm:flex-row gap-4">
                <button className="btn-card btn-primary flex-1 max-w-sm py-4 rounded-xl font-bold" onClick={compileRoadmap}>
                  Compile Curriculum Roadmap
                </button>
                <button className="btn-card btn-view-all flex-1 max-w-[260px] py-4 rounded-xl font-bold flex items-center justify-center gap-2" onClick={unlockAll}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  View All Handbooks
                </button>
              </div>
            </section>

            {/* Roadmap timeline & cards block (only shown when roadmap is compiled) */}
            {roadmapGenerated && (
              <div ref={resultsRef} className="scroll-mt">
                <section className="roadmap-timeline-wrapper mb-8" id="roadmapTimeline">
                  <div className="roadmap-header flex justify-between items-center mb-6">
                    <div className="roadmap-info-title">
                      <span id="roadmapTitleBadge" className="text-sm font-semibold text-white">
                        {ROADMAP_CONFIG[selectedRole]?.label || 'Curriculum Track'}
                      </span>
                      <div id="roadmapTitleText" className="text-xl md:text-2xl font-bold font-display">
                        {ROADMAP_CONFIG[selectedRole]?.[selectedExperience]?.title || 'All Masterclass Handbooks Unlocked'}
                      </div>
                    </div>
                    <button className="roadmap-reset-btn text-sm font-semibold px-4 py-2 rounded-lg" onClick={() => { setRoadmapGenerated(false); setCompilationStarted(false); }}>
                      Reset
                    </button>
                  </div>

                  {/* Timeline progress line */}
                  <div className="timeline-steps">
                    <div className="timeline-progress-line" id="timelineProgressLine" style={{ width: '100%' }}></div>
                    {ROADMAP_CONFIG[selectedRole]?.[selectedExperience]?.steps ? (
                      ROADMAP_CONFIG[selectedRole][selectedExperience].steps.map((step, idx) => (
                        <div key={idx} className="timeline-step-node active completed">
                          <div className="node-circle">{idx + 1}</div>
                          <div className="node-label text-xs md:text-sm mt-2">{step}</div>
                        </div>
                      ))
                    ) : (
                      ['Foundations', 'Engineering', 'Architecture', 'Mastery'].map((label, idx) => (
                        <div key={idx} className="timeline-step-node active completed">
                          <div className="node-circle">{idx + 1}</div>
                          <div className="node-label text-xs md:text-sm mt-2">{label}</div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* Filter and Search Panel */}
                <div className="controls-panel mb-8 flex flex-col md:flex-row justify-between items-center gap-4" id="controlsPanel">
                  <div className="search-wrapper flex items-center relative w-full md:max-w-md">
                    <svg className="search-icon absolute left-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input 
                      type="text" 
                      className="search-input w-full pl-12 pr-4 py-3 rounded-lg text-sm" 
                      id="searchInput" 
                      placeholder="Filter roadmap topics, subjects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="global-actions flex gap-3 w-full md:w-auto">
                    <button className="btn-action flex-1 px-8 py-3 rounded-lg text-sm font-semibold" onClick={() => logToTerminal('Handbook channels are online and available.', 'success')}>
                      Refresh Status
                    </button>
                    <button className="btn-action flex-1 px-5 py-3 rounded-lg text-sm font-semibold" onClick={() => logToTerminal('All masterclasses are already available.', 'success')}>
                      Unlock All
                    </button>
                  </div>
                </div>

                {/* Grid of Masterclass Cards */}
                <div className="masterclass-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="roadmapModulesContainer">
                  {/* WebDev */}
                  {(searchQuery === '' || 'Full Stack Web Development HTML CSS JS React Node SQL AWS DevOps cloud architecture webdev'.toLowerCase().includes(searchQuery.toLowerCase())) && (() => {
                    const phase = getCardPhaseInfo('card-3000');
                    return (
                      <div className="card-masterclass flex flex-col" id="card-3000" style={{ '--theme-color': 'var(--color-webdev)', '--glow-color': 'rgba(6, 182, 212, 0.15)', order: roadmapGenerated && phase ? (phase.index + 1) : (selectedRole === 'webdev' ? 1 : 99) } as any}>
                        {roadmapGenerated && phase && (
                          <div className="phase-badge">
                            <span className="phase-num">{phase.index + 1}</span>
                            <span className="phase-label">{phase.label}</span>
                          </div>
                        )}
                        <div className="card-header flex justify-between items-start mb-4">
                          <div className="icon-wrapper p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                              <line x1="8" y1="21" x2="16" y2="21"></line>
                              <line x1="12" y1="17" x2="12" y2="21"></line>
                            </svg>
                          </div>
                          <span className="status-badge online flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                            <span className="status-dot w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Available</span>
                          </span>
                        </div>
                        <h3 className="card-title text-xl font-bold mb-1 font-display">Full Stack Web Developer</h3>
                        <span className="card-port-label text-xs font-bold tracking-widest text-cyan-400 mb-3 block">HANDBOOK</span>
                        <p className="card-desc text-slate-400 text-sm mb-6 flex-grow">
                          Master frontend responsive design, vanilla Javascript DOM manipulation, modern frameworks, database designs, caching architectures, and server deployments.
                        </p>
                        <div className="card-topics mb-6">
                          <h4 className="card-topics-title text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Key Curriculum Modules</h4>
                          <ul className="topics-list space-y-2 text-sm text-slate-400">
                            <li>Frontend layouts (CSS Grid/Flexbox)</li>
                            <li>Backend Service APIs (REST/GraphQL)</li>
                            <li>Databases & Caching (SQL/Redis)</li>
                            <li>Cloud Architecture & Auto-Scaling</li>
                          </ul>
                        </div>
                        <button className="btn-card btn-launch w-full py-3 rounded-lg font-bold" onClick={() => openHandbook('webdev_master_class')}>
                          Open Book
                        </button>
                      </div>
                    );
                  })()}

                  {/* DevOps */}
                  {(searchQuery === '' || 'DevOps Infrastructure SRE Kubernetes Cloud AWS CI/CD Docker Linux Bash Terraform pipeline monitoring devops'.toLowerCase().includes(searchQuery.toLowerCase())) && (() => {
                    const phase = getCardPhaseInfo('card-3001');
                    return (
                      <div className="card-masterclass flex flex-col" id="card-3001" style={{ '--theme-color': 'var(--color-devops)', '--glow-color': 'rgba(139, 92, 246, 0.15)', order: roadmapGenerated && phase ? (phase.index + 1) : (selectedRole === 'devops' ? 1 : 99) } as any}>
                        {roadmapGenerated && phase && (
                          <div className="phase-badge">
                            <span className="phase-num">{phase.index + 1}</span>
                            <span className="phase-label">{phase.label}</span>
                          </div>
                        )}
                        <div className="card-header flex justify-between items-start mb-4">
                          <div className="icon-wrapper p-3 rounded-lg bg-purple-500/10 text-purple-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="22" y1="12" x2="2" y2="12"></line>
                              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                              <line x1="6" y1="16" x2="6.01" y2="16"></line>
                              <line x1="10" y1="16" x2="10.01" y2="16"></line>
                            </svg>
                          </div>
                          <span className="status-badge online flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                            <span className="status-dot w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Available</span>
                          </span>
                        </div>
                        <h3 className="card-title text-xl font-bold mb-1 font-display">DevOps, SRE & Systems</h3>
                        <span className="card-port-label text-xs font-bold tracking-widest text-purple-400 mb-3 block">HANDBOOK</span>
                        <p className="card-desc text-slate-400 text-sm mb-6 flex-grow">
                          Master infrastructure scaling, deployment automation, container orchestration, log monitoring, systems security, and CI/CD pipelines.
                        </p>
                        <div className="card-topics mb-6">
                          <h4 className="card-topics-title text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Key Curriculum Modules</h4>
                          <ul className="topics-list space-y-2 text-sm text-slate-400">
                            <li>Docker Containers & K8s Orchestrations</li>
                            <li>CI/CD Multi-Stage Actions Pipelines</li>
                            <li>Linux Systems, Bash, & Networking</li>
                            <li>Terraform Infrastructure as Code (IaC)</li>
                          </ul>
                        </div>
                        <button className="btn-card btn-launch w-full py-3 rounded-lg font-bold" onClick={() => openHandbook('devops_masterclass')}>
                          Open Book
                        </button>
                      </div>
                    );
                  })()}

                  {/* Web3 */}
                  {(searchQuery === '' || 'Web3 Cryptography Blockchain Solana Smart Contracts Rust DeFi Ethereum Protocol audit web3'.toLowerCase().includes(searchQuery.toLowerCase())) && (() => {
                    const phase = getCardPhaseInfo('card-3002');
                    return (
                      <div className="card-masterclass flex flex-col" id="card-3002" style={{ '--theme-color': 'var(--color-web3)', '--glow-color': 'rgba(16, 185, 129, 0.15)', order: roadmapGenerated && phase ? (phase.index + 1) : (selectedRole === 'web3' ? 1 : 99) } as any}>
                        {roadmapGenerated && phase && (
                          <div className="phase-badge">
                            <span className="phase-num">{phase.index + 1}</span>
                            <span className="phase-label">{phase.label}</span>
                          </div>
                        )}
                        <div className="card-header flex justify-between items-start mb-4">
                          <div className="icon-wrapper p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            </svg>
                          </div>
                          <span className="status-badge online flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                            <span className="status-dot w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Available</span>
                          </span>
                        </div>
                        <h3 className="card-title text-xl font-bold mb-1 font-display">Web3, Cryptography & Solana</h3>
                        <span className="card-port-label text-xs font-bold tracking-widest text-emerald-400 mb-3 block">HANDBOOK</span>
                        <p className="card-desc text-slate-400 text-sm mb-6 flex-grow">
                          Comprehensive smart contract, Rust backend, cryptography protocol, blockchain architecture, and security auditing guide designed for protocol SDEs.
                        </p>
                        <div className="card-topics mb-6">
                          <h4 className="card-topics-title text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Key Curriculum Modules</h4>
                          <ul className="topics-list space-y-2 text-sm text-slate-400">
                            <li>Blockchain Cryptography & Consensus</li>
                            <li>Rust Core & Solana Account Models</li>
                            <li>Anchor Smart Contract Audits</li>
                            <li>DeFi Market AMM Architectures</li>
                          </ul>
                        </div>
                        <button className="btn-card btn-launch w-full py-3 rounded-lg font-bold" onClick={() => openHandbook('web3_masterclass')}>
                          Open Book
                        </button>
                      </div>
                    );
                  })()}

                  {/* AI */}
                  {(searchQuery === '' || 'AI Machine Learning LLM Engineering PyTorch Transformers Agents RAG neural networks vector db vLLM gpu ai'.toLowerCase().includes(searchQuery.toLowerCase())) && (() => {
                    const phase = getCardPhaseInfo('card-3003');
                    return (
                      <div className="card-masterclass flex flex-col" id="card-3003" style={{ '--theme-color': 'var(--color-ai)', '--glow-color': 'rgba(236, 72, 153, 0.15)', order: roadmapGenerated && phase ? (phase.index + 1) : (selectedRole === 'ai' ? 1 : 99) } as any}>
                        {roadmapGenerated && phase && (
                          <div className="phase-badge">
                            <span className="phase-num">{phase.index + 1}</span>
                            <span className="phase-label">{phase.label}</span>
                          </div>
                        )}
                        <div className="card-header flex justify-between items-start mb-4">
                          <div className="icon-wrapper p-3 rounded-lg bg-pink-500/10 text-pink-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                              <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                          </div>
                          <span className="status-badge online flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                            <span className="status-dot w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Available</span>
                          </span>
                        </div>
                        <h3 className="card-title text-xl font-bold mb-1 font-display">AI & LLM Engineering</h3>
                        <span className="card-port-label text-xs font-bold tracking-widest text-pink-400 mb-3 block">HANDBOOK</span>
                        <p className="card-desc text-slate-400 text-sm mb-6 flex-grow">
                          Advanced ML development guide. Build Neural Networks from scratch in PyTorch, construct RAG pipelines, fine-tune LLMs, and serving with vLLM.
                        </p>
                        <div className="card-topics mb-6">
                          <h4 className="card-topics-title text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Key Curriculum Modules</h4>
                          <ul className="topics-list space-y-2 text-sm text-slate-400">
                            <li>Math, Linear Algebra & Vectorization</li>
                            <li>Neural Nets & Backpropagation</li>
                            <li>Transformers, Attention & LLMs Tuning</li>
                            <li>RAG, Vector Databases & Agentic graphs</li>
                          </ul>
                        </div>
                        <button className="btn-card btn-launch w-full py-3 rounded-lg font-bold" onClick={() => openHandbook('ai_masterclass')}>
                          Open Book
                        </button>
                      </div>
                    );
                  })()}

                  {/* C++ DSA */}
                  {(searchQuery === '' || 'C++ DSA Algorithms Competitive Programming Data Structures pointers recursion Segment Trees Dynamic Programming dp trees graphs'.toLowerCase().includes(searchQuery.toLowerCase())) && (() => {
                    const phase = getCardPhaseInfo('card-3004');
                    return (
                      <div className="card-masterclass flex flex-col" id="card-3004" style={{ '--theme-color': 'var(--color-dsa)', '--glow-color': 'rgba(239, 68, 68, 0.15)', order: roadmapGenerated && phase ? (phase.index + 1) : 99 } as any}>
                        {roadmapGenerated && phase && (
                          <div className="phase-badge">
                            <span className="phase-num">{phase.index + 1}</span>
                            <span className="phase-label">{phase.label}</span>
                          </div>
                        )}
                        <div className="card-header flex justify-between items-start mb-4">
                          <div className="icon-wrapper p-3 rounded-lg bg-red-500/10 text-red-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="16 18 22 12 16 6"></polyline>
                              <polyline points="8 6 2 12 8 18"></polyline>
                            </svg>
                          </div>
                          <span className="status-badge online flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                            <span className="status-dot w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Available</span>
                          </span>
                        </div>
                        <h3 className="card-title text-xl font-bold mb-1 font-display">C++ & Advanced DSA</h3>
                        <span className="card-port-label text-xs font-bold tracking-widest text-red-400 mb-3 block">HANDBOOK</span>
                        <p className="card-desc text-slate-400 text-sm mb-6 flex-grow">
                          Advanced algorithms handbook designed for top-tier competitive programmers and FAANG coding interviews. Covers STL internals, DP, and graph structures.
                        </p>
                        <div className="card-topics mb-6">
                          <h4 className="card-topics-title text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Key Curriculum Modules</h4>
                          <ul className="topics-list space-y-2 text-sm text-slate-400">
                            <li>C++ Memory Management & STL Internals</li>
                            <li>Tree & Graph Traversals, Segment Trees</li>
                            <li>Dynamic Programming State Compression</li>
                            <li>Coding Interview Rubrics & Contest Math</li>
                          </ul>
                        </div>
                        <button className="btn-card btn-launch w-full py-3 rounded-lg font-bold" onClick={() => openHandbook('c++_dsa_masterclass')}>
                          Open Book
                        </button>
                      </div>
                    );
                  })()}

                  {/* Multi-Language DSA */}
                  {(searchQuery === '' || 'Data Structures Algorithms Multi-Language Java Python JavaScript C++ Competitive Programming problem solving coding interviews DSA'.toLowerCase().includes(searchQuery.toLowerCase())) && (() => {
                    const phase = getCardPhaseInfo('card-3009');
                    return (
                      <div className="card-masterclass flex flex-col" id="card-3009" style={{ '--theme-color': 'var(--color-dsa)', '--glow-color': 'rgba(239, 110, 68, 0.15)', order: roadmapGenerated && phase ? (phase.index + 1) : 99 } as any}>
                        {roadmapGenerated && phase && (
                          <div className="phase-badge">
                            <span className="phase-num">{phase.index + 1}</span>
                            <span className="phase-label">{phase.label}</span>
                          </div>
                        )}
                        <div className="card-header flex justify-between items-start mb-4">
                          <div className="icon-wrapper p-3 rounded-lg bg-orange-500/10 text-orange-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 18l6-6-6-6M8 6l-6 6 6 6"></path>
                            </svg>
                          </div>
                          <span className="status-badge online flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                            <span className="status-dot w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Available</span>
                          </span>
                        </div>
                        <h3 className="card-title text-xl font-bold mb-1 font-display">Multi-Language DSA & Coding</h3>
                        <span className="card-port-label text-xs font-bold tracking-widest text-orange-400 mb-3 block">HANDBOOK</span>
                        <p className="card-desc text-slate-400 text-sm mb-6 flex-grow">
                          Comprehensive data structures, logic building, and algorithms masterclass in C++, Java, Python, and JavaScript. Optimized for coding interviews and FAANG placement prep.
                        </p>
                        <div className="card-topics mb-6">
                          <h4 className="card-topics-title text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Key Curriculum Modules</h4>
                          <ul className="topics-list space-y-2 text-sm text-slate-400">
                            <li>Code Implementations (C++, Java, Python, JS)</li>
                            <li>Linked Lists, Trees, Graphs & Traversals</li>
                            <li>Recursion, Backtracking & DP Patterns</li>
                            <li>Interview Practice & FAANG Roadmap</li>
                          </ul>
                        </div>
                        <button className="btn-card btn-launch w-full py-3 rounded-lg font-bold" onClick={() => openHandbook('dsa')}>
                          Open Book
                        </button>
                      </div>
                    );
                  })()}

                  {/* Aptitude */}
                  {(searchQuery === '' || 'Quant Aptitude SDE Reasoning Placement quant questions math logical analytical'.toLowerCase().includes(searchQuery.toLowerCase())) && (() => {
                    const phase = getCardPhaseInfo('card-3005');
                    return (
                      <div className="card-masterclass flex flex-col" id="card-3005" style={{ '--theme-color': 'var(--color-aptitude)', '--glow-color': 'rgba(245, 158, 11, 0.15)', order: roadmapGenerated && phase ? (phase.index + 1) : 99 } as any}>
                        {roadmapGenerated && phase && (
                          <div className="phase-badge">
                            <span className="phase-num">{phase.index + 1}</span>
                            <span className="phase-label">{phase.label}</span>
                          </div>
                        )}
                        <div className="card-header flex justify-between items-start mb-4">
                          <div className="icon-wrapper p-3 rounded-lg bg-amber-500/10 text-amber-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="20" x2="18" y2="10"></line>
                              <line x1="12" y1="20" x2="12" y2="4"></line>
                              <line x1="6" y1="20" x2="6" y2="14"></line>
                            </svg>
                          </div>
                          <span className="status-badge online flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                            <span className="status-dot w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Available</span>
                          </span>
                        </div>
                        <h3 className="card-title text-xl font-bold mb-1 font-display">Quant, Aptitude & SDE Reasoning</h3>
                        <span className="card-port-label text-xs font-bold tracking-widest text-amber-400 mb-3 block">HANDBOOK</span>
                        <p className="card-desc text-slate-400 text-sm mb-6 flex-grow">
                          Essential mathematical logic, quantitative reasoning, arithmetic algorithms, and placement puzzle-solving masterclass optimized for competitive exams and interviews.
                        </p>
                        <div className="card-topics mb-6">
                          <h4 className="card-topics-title text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Key Curriculum Modules</h4>
                          <ul className="topics-list space-y-2 text-sm text-slate-400">
                            <li>Probability, Permutations & Combinations</li>
                            <li>SDE Placement Reasoning Puzzles</li>
                            <li>Speed, Distance & Quantitative Relations</li>
                            <li>Data Interpretation & Statistical Inference</li>
                          </ul>
                        </div>
                        <button className="btn-card btn-launch w-full py-3 rounded-lg font-bold" onClick={() => openHandbook('aptitude_msterclass')}>
                          Open Book
                        </button>
                      </div>
                    );
                  })()}

                  {/* System Design */}
                  {(searchQuery === '' || 'Software Architecture System Design HLD LLD Scalability microservices databases caching design patterns load balancer'.toLowerCase().includes(searchQuery.toLowerCase())) && (() => {
                    const phase = getCardPhaseInfo('card-3006');
                    return (
                      <div className="card-masterclass flex flex-col" id="card-3006" style={{ '--theme-color': 'var(--color-system)', '--glow-color': 'rgba(99, 102, 241, 0.15)', order: roadmapGenerated && phase ? (phase.index + 1) : 99 } as any}>
                        {roadmapGenerated && phase && (
                          <div className="phase-badge">
                            <span className="phase-num">{phase.index + 1}</span>
                            <span className="phase-label">{phase.label}</span>
                          </div>
                        )}
                        <div className="card-header flex justify-between items-start mb-4">
                          <div className="icon-wrapper p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                              <line x1="6" y1="6" x2="6" y2="6.01"></line>
                              <line x1="6" y1="18" x2="6" y2="18.01"></line>
                            </svg>
                          </div>
                          <span className="status-badge online flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                            <span className="status-dot w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Available</span>
                          </span>
                        </div>
                        <h3 className="card-title text-xl font-bold mb-1 font-display">Software Architecture & System Design</h3>
                        <span className="card-port-label text-xs font-bold tracking-widest text-indigo-400 mb-3 block">HANDBOOK</span>
                        <p className="card-desc text-slate-400 text-sm mb-6 flex-grow">
                          High Level (HLD) and Low Level (LLD) software system design patterns. Master database sharding, CAP Theorem trade-offs, and microservices for billion-user scale.
                        </p>
                        <div className="card-topics mb-6">
                          <h4 className="card-topics-title text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Key Curriculum Modules</h4>
                          <ul className="topics-list space-y-2 text-sm text-slate-400">
                            <li>OOP Design Principles & LLD Design Patterns</li>
                            <li>Consistent Hashing, Load Balancing & DNS</li>
                            <li>Relational vs NoSQL DB Sharding & Replication</li>
                            <li>Event-Driven Microservices & Message Queues</li>
                          </ul>
                        </div>
                        <button className="btn-card btn-launch w-full py-3 rounded-lg font-bold" onClick={() => openHandbook('system_design_masterclass')}>
                          Open Book
                        </button>
                      </div>
                    );
                  })()}

                  {/* CS Core */}
                  {(searchQuery === '' || 'Computer Science Core Subjects CORE_SUBJECT operating systems database networks OS DBMS CN distributed systems'.toLowerCase().includes(searchQuery.toLowerCase())) && (() => {
                    const phase = getCardPhaseInfo('card-3007');
                    return (
                      <div className="card-masterclass flex flex-col" id="card-3007" style={{ '--theme-color': 'var(--color-core)', '--glow-color': 'rgba(16, 185, 129, 0.15)', order: roadmapGenerated && phase ? (phase.index + 1) : 99 } as any}>
                        {roadmapGenerated && phase && (
                          <div className="phase-badge">
                            <span className="phase-num">{phase.index + 1}</span>
                            <span className="phase-label">{phase.label}</span>
                          </div>
                        )}
                        <div className="card-header flex justify-between items-start mb-4">
                          <div className="icon-wrapper p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                              <rect x="9" y="9" width="6" height="6"></rect>
                              <line x1="9" y1="1" x2="9" y2="4"></line>
                              <line x1="15" y1="1" x2="15" y2="4"></line>
                              <line x1="9" y1="20" x2="9" y2="23"></line>
                              <line x1="15" y1="20" x2="15" y2="23"></line>
                              <line x1="20" y1="9" x2="23" y2="9"></line>
                              <line x1="20" y1="15" x2="23" y2="15"></line>
                              <line x1="1" y1="9" x2="4" y2="9"></line>
                              <line x1="1" y1="15" x2="4" y2="15"></line>
                            </svg>
                          </div>
                          <span className="status-badge online flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                            <span className="status-dot w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Available</span>
                          </span>
                        </div>
                        <h3 className="card-title text-xl font-bold mb-1 font-display">CS Core Subjects Handbook</h3>
                        <span className="card-port-label text-xs font-bold tracking-widest text-emerald-400 mb-3 block">HANDBOOK</span>
                        <p className="card-desc text-slate-400 text-sm mb-6 flex-grow">
                          Academic core concepts of Computer Science. Master memory paging, concurrency deadlocks, TCP/IP networking, and database ACID properties.
                        </p>
                        <div className="card-topics mb-6">
                          <h4 className="card-topics-title text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Key Curriculum Modules</h4>
                          <ul className="topics-list space-y-2 text-sm text-slate-400">
                            <li>OS Kernel Processes, Threads & Deadlocks</li>
                            <li>DBMS Transactions, Concurrency & SQL</li>
                            <li>Computer Networks, TCP/IP & Socket Programming</li>
                            <li>System Hardware & Assembly Fundamentals</li>
                          </ul>
                        </div>
                        <button className="btn-card btn-launch w-full py-3 rounded-lg font-bold" onClick={() => openHandbook('core_subject')}>
                          Open Book
                        </button>
                      </div>
                    );
                  })()}

                  {/* Behavioral */}
                  {(searchQuery === '' || 'Behavioral Interview Masterclass Behavioral_MASTERCLASS leadership negotiation communication star method amazon principles googleyness salary story bank'.toLowerCase().includes(searchQuery.toLowerCase())) && (() => {
                    const phase = getCardPhaseInfo('card-3008');
                    return (
                      <div className="card-masterclass flex flex-col" id="card-3008" style={{ '--theme-color': 'var(--color-behavioral)', '--glow-color': 'rgba(245, 158, 11, 0.15)', order: roadmapGenerated && phase ? (phase.index + 1) : 99 } as any}>
                        {roadmapGenerated && phase && (
                          <div className="phase-badge">
                            <span className="phase-num">{phase.index + 1}</span>
                            <span className="phase-label">{phase.label}</span>
                          </div>
                        )}
                        <div className="card-header flex justify-between items-start mb-4">
                          <div className="icon-wrapper p-3 rounded-lg bg-amber-500/10 text-amber-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                          </div>
                          <span className="status-badge online flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                            <span className="status-dot w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Available</span>
                          </span>
                        </div>
                        <h3 className="card-title text-xl font-bold mb-1 font-display">Behavioral Interview & Leadership</h3>
                        <span className="card-port-label text-xs font-bold tracking-widest text-amber-400 mb-3 block">HANDBOOK</span>
                        <p className="card-desc text-slate-400 text-sm mb-6 flex-grow">
                          Succeed in senior behavioral reviews. Craft high-impact STAR narratives, build a career story bank, negotiate compensation packages, and show leadership maturity.
                        </p>
                        <div className="card-topics mb-6">
                          <h4 className="card-topics-title text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Key Curriculum Modules</h4>
                          <ul className="topics-list space-y-2 text-sm text-slate-400">
                            <li>STAR Method & SBI Feedback Frameworks</li>
                            <li>Amazon Leadership Principles & Googleyness</li>
                            <li>Conflict Resolution & Executive Communication</li>
                            <li>Salary Negotiation Timelines & Pitch Scripts</li>
                          </ul>
                        </div>
                        <button className="btn-card btn-launch w-full py-3 rounded-lg font-bold" onClick={() => openHandbook('behavioral_masterclass')}>
                          Open Book
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
          
         
        </div>
      )}

      {/* 2. HANDBOOK VIEWER VIEW */}
      {courseKey && (
        <div id="handbook-view" className="w-full">
          
          {/* Scroll Progress Indicator */}
          <div id="progress-container-hb">
            <div id="progress-bar-hb"></div>
          </div>

          {/* Mobile Header Navbar */}
          <div className="mobile-header flex items-center justify-between">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
            <div className="sidebar-title text-base" id="mobile-sidebar-title">
              {COURSE_MAP[courseKey]?.sidebarTitle || 'Handbook'}
            </div>
            <div style={{ width: '24px' }}></div>
          </div>

          {/* Sidebar Component */}
          <div className={`sidebar ${sidebarOpen ? 'open' : ''}`} id="sidebar-nav">
            <div className="sidebar-header">
              <div className="sidebar-title mb-2" id="desktop-sidebar-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                <span id="sidebar-title-text">{COURSE_MAP[courseKey]?.sidebarTitle || 'Handbook'}</span>
              </div>
              <button 
                onClick={closeHandbook} 
                className="back-to-hub-btn flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-400 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Back to Dashboard
              </button>
            </div>
            
            {/* Search Box */}
            <div className="search-container">
              <input 
                type="text" 
                className="search-input" 
                id="doc-search" 
                placeholder="Search topics..."
                value={hbSearchQuery}
                onChange={(e) => setHbSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Nav Links */}
            <nav className="sidebar-nav" id="toc-nav">
              {handbookToc && (() => {
                // Group TOC items
                const groups: any[] = handbookToc.reduce((acc: any[], item: any) => {
                  if (item.level === 0) {
                    acc.push({ ...item, children: [] });
                  } else if (acc.length > 0) {
                    acc[acc.length - 1].children.push(item);
                  }
                  return acc;
                }, []);

                return (
                  <div className="space-y-1">
                    {groups.map((secGroup: any, idx: number) => {
                      const groupVisible = hbSearchQuery === '' || 
                        secGroup.text.toLowerCase().includes(hbSearchQuery.toLowerCase()) || 
                        secGroup.children.some((c: any) => c.text.toLowerCase().includes(hbSearchQuery.toLowerCase()));

                      if (!groupVisible) return null;

                      const isExpanded = expandedSections.has(secGroup.id) || hbSearchQuery !== '';
                      const childIds = secGroup.children.map((c: any) => c.id);
                      const completedCount = childIds.filter((id: string) => completedItems[id]).length;
                      const totalChildren = childIds.length;
                      const sectionDone = totalChildren > 0 && completedCount === totalChildren;
                      const progressPct = totalChildren > 0 ? Math.round((completedCount / totalChildren) * 100) : 0;
                      const isActive = activeTocId === secGroup.id || childIds.includes(activeTocId);

                      return (
                        <div key={idx} className="sidebar-section-group">
                          {/* Section header — clickable to collapse/expand */}
                          <button
                            className={`sidebar-section-header w-full text-left flex items-center justify-between gap-2 ${isActive ? 'active' : ''} ${sectionDone ? 'section-done' : ''}`}
                            onClick={() => toggleSectionExpand(secGroup.id)}
                            aria-expanded={isExpanded}
                          >
                            <span className="flex-1 min-w-0 truncate">{secGroup.text}</span>
                            <span className="flex items-center gap-1.5 flex-shrink-0">
                              {totalChildren > 0 && (
                                <span className="section-progress-badge">
                                  {sectionDone ? '✓' : `${completedCount}/${totalChildren}`}
                                </span>
                              )}
                              <svg
                                className={`sidebar-chevron ${isExpanded ? 'rotated' : ''}`}
                                xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                              >
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </span>
                          </button>

                          {/* Section progress bar */}
                          {totalChildren > 0 && (
                            <div className="section-mini-progress">
                              <div className="section-mini-progress-fill" style={{ width: `${progressPct}%` }} />
                            </div>
                          )}

                          {/* Sub-items — collapsible */}
                          {isExpanded && (
                            <div className="sidebar-section-subitems">
                              {secGroup.children.map((child: any, cidx: number) => {
                                const childVisible = hbSearchQuery === '' || child.text.toLowerCase().includes(hbSearchQuery.toLowerCase());
                                if (!childVisible) return null;
                                const isDone = !!completedItems[child.id];

                                return (
                                  <div key={cidx} className="sidebar-subitem-row">
                                    <a 
                                      href={`#${child.id}`} 
                                      className={`sidebar-link sidebar-subitem flex-1 ${activeTocId === child.id ? 'active' : ''} ${isDone ? 'completed-item' : ''}`}
                                      data-level={child.level}
                                      onClick={() => { setSidebarOpen(false); markSavePoint(child.id); }}
                                    >
                                      {isDone && <span className="item-check">✓</span>}
                                      <span className="item-text">{child.text}</span>
                                    </a>
                                    <button
                                      className={`mark-done-btn ${isDone ? 'done' : ''}`}
                                      title={isDone ? 'Mark incomplete' : 'Mark as complete'}
                                      onClick={(e) => { e.preventDefault(); toggleItemComplete(child.id); }}
                                    >
                                      {isDone ? '✓' : '○'}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </nav>
            
            {/* Sidebar Footer */}
            <div className="sidebar-footer">
              {savePoint && (
                <div className="sidebar-footer-top">
                  <button
                    className="resume-btn"
                    onClick={() => {
                      const el = document.getElementById(savePoint);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    Resume Reading
                  </button>
                </div>
              )}
              <div className="sidebar-footer-bottom">
                <button className="theme-toggle-btn" onClick={toggleTheme}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="theme-icon mr-1"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                  Theme
                </button>
                
              </div>
            </div>
          </div>

          {/* Main Content Container */}
          <main className="main-content" id="content-main" ref={scrollContainerRef}>
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>Retrieving handbook database on-demand...</p>
              </div>
            )}

            {error && (
              <div className="p-12 text-center text-slate-400">
                <p className="text-lg mb-2">{error}</p>
                <button className="px-4 py-2 bg-purple-600 rounded text-white" onClick={closeHandbook}>
                  Go Back
                </button>
              </div>
            )}

            {!loading && !error && handbookData && (
              <div className="max-w-4xl mx-auto">
                {/* Title Page */}
                <div className="title-page">
                  <div className="title-glow"></div>
                  <span className="subtitle font-bold text-xs uppercase tracking-wider block mb-2">{COURSE_MAP[courseKey]?.subtitle}</span>
                  <h1 className="main-title text-2xl md:text-4xl font-extrabold text-white">{COURSE_MAP[courseKey]?.mainTitle}</h1>
                  <h1 className="main-title-sub text-2xl md:text-4xl font-extrabold text-purple-400 mb-6">{COURSE_MAP[courseKey]?.mainTitleSub}</h1>
                  <p className="tagline text-base text-slate-300 italic mb-6">{COURSE_MAP[courseKey]?.tagline}</p>
                  <div className="title-divider-container my-6"><hr className="title-divider w-12" /></div>
                  <p className="covers text-sm text-slate-400 mb-4">{COURSE_MAP[courseKey]?.covers}</p>
                  <p className="languages text-sm text-slate-200" dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(COURSE_MAP[courseKey]?.languages || '') }}></p>
                  <div className="title-divider-container my-6"><hr className="title-divider w-12" /></div>
                  <p className="stats text-xs text-slate-500 italic">{COURSE_MAP[courseKey]?.stats}</p>
                </div>

                {/* Render Chapters/Sections dynamically */}
                {handbookData.map((section: any, sidx: number) => (
                  <div key={sidx} className="handbook-section mb-16" id={section.id}>
                    {section.items.map((item: any, iidx: number) => {
                      const itemKey = `item-${sidx}-${iidx}`;

                      if (item.type === 'sectionHeader') {
                        return (
                          <div key={itemKey} className="section-header-block scroll-mt" id={item.id}>
                            <span className="section-badge">{item.subtitle}</span>
                            <h1 className="text-2xl md:text-3xl font-black mt-2 text-white">{item.title}</h1>
                          </div>
                        );
                      }

                      if (item.type === 'chapterIntro') {
                        return (
                          <p key={itemKey} className="chapter-intro text-lg text-slate-400 border-l-4 border-slate-700 pl-4 py-1 italic mb-6" dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(item.text) }}></p>
                        );
                      }

                      if (['h1', 'h2', 'h3', 'h4'].includes(item.type)) {
                        const Tag = item.type as 'h1' | 'h2' | 'h3' | 'h4';
                        const clsMap = {
                          h1: 'text-2xl font-bold border-b pb-2 mt-8 mb-4 scroll-mt hb-heading-1',
                          h2: 'text-xl font-bold mt-8 mb-4 scroll-mt hb-heading-2',
                          h3: 'text-lg font-bold mt-6 mb-3 scroll-mt hb-heading-3',
                          h4: 'text-base font-semibold mt-4 mb-2 scroll-mt hb-heading-4'
                        };
                        return (
                          <Tag 
                            key={itemKey} 
                            id={item.id} 
                            className={clsMap[Tag]} 
                            dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(item.text) }}
                          />
                        );
                      }

                      if (item.type === 'para') {
                        let classes = [];
                        if (item.options?.bold) classes.push('font-bold');
                        if (item.options?.italic) classes.push('italic');
                        
                        return (
                          <p 
                            key={itemKey} 
                            className={`text-slate-300 mb-4 text-justify leading-relaxed ${classes.join(' ')}`}
                            style={item.options?.color ? { color: item.options.color } : {}}
                            dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(item.text) }}
                          />
                        );
                      }

                      if (item.type === 'bullet') {
                        return (
                          <ul key={itemKey} className="handbook-list bullet-list list-disc pl-6 space-y-2 mb-6">
                            {(item.items || []).map((b: string, idx: number) => (
                              <li key={idx} className="bullet-item text-slate-400" dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(b) }} />
                            ))}
                          </ul>
                        );
                      }

                      if (item.type === 'numbered') {
                        return (
                          <ol key={itemKey} className="handbook-list numbered-list list-decimal pl-6 space-y-2 mb-6">
                            {(item.items || []).map((n: string, idx: number) => (
                              <li key={idx} className="numbered-item text-slate-400" dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(n) }} />
                            ))}
                          </ol>
                        );
                      }

                      if (item.type === 'pageBreak') {
                        return <div key={itemKey} className="page-break border-t border-dashed border-slate-800 my-12" />;
                      }

                      if (item.type === 'divider') {
                        return <hr key={itemKey} className="section-divider border-slate-800 my-8" />;
                      }

                      if (item.type === 'spacer') {
                        const size = item.pt || item.size || 15;
                        return <div key={itemKey} style={{ height: `${Math.max(8, size / 2)}px` }} />;
                      }

                      if (item.type === 'callout') {
                        const calloutType = item.calloutType || 'info';
                        return (
                          <div key={itemKey} className={`callout callout-${calloutType} p-4 rounded-xl mb-6 flex gap-4 border-l-4`}>
                            <div className="callout-icon-wrapper flex-shrink-0 text-xl">
                              <div className="callout-icon"></div>
                            </div>
                            <div className="callout-body">
                              <div className="callout-title font-bold text-xs uppercase tracking-wider mb-1">
                                {item.title || calloutType}
                              </div>
                              <div className="callout-content text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(item.text) }} />
                            </div>
                          </div>
                        );
                      }

                      if (item.type === 'twoColTable') {
                        return (
                          <div key={itemKey} className="table-container w-full overflow-x-auto border border-slate-800 rounded-xl mb-6">
                            <table className="w-full text-left border-collapse text-sm">
                              {item.headers && item.headers.length > 0 && (
                                <thead>
                                  <tr className="bg-slate-800/50 border-b border-slate-800">
                                    {item.headers.map((h: string, idx: number) => (
                                      <th key={idx} className="p-3 font-semibold text-slate-200">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                              )}
                              <tbody>
                                {(item.rows || []).map((row: any[], rIdx: number) => (
                                  <tr key={rIdx} className="border-b border-slate-800 hover:bg-slate-800/10">
                                    {row.map((cell: any, cIdx: number) => (
                                      <td key={cIdx} className="p-3 text-slate-400" dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(String(cell ?? '')) }} />
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }

                      if (item.type === 'codeBlock') {
                        const escapedCode = String(item.code || '')
                          .replace(/&/g, "&amp;")
                          .replace(/</g, "&lt;")
                          .replace(/>/g, "&gt;");
                        const blockId = `cb-${sidx}-${iidx}`;

                        return (
                          <div key={itemKey} className="code-block-wrapper relative border border-slate-800 rounded-xl mb-6 overflow-hidden">
                            <button 
                              className={`copy-code-btn absolute top-3 right-3 px-3 py-1 text-xs rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 ${copiedStates[blockId] ? 'copied bg-emerald-600 text-white border-emerald-600' : ''}`}
                              onClick={() => copyCode(item.code, blockId)}
                            >
                              {copiedStates[blockId] ? 'Copied!' : 'Copy'}
                            </button>
                            <pre className="p-4 overflow-x-auto text-xs font-mono bg-slate-950 text-cyan-400">
                              <code className={`language-${item.lang || 'text'}`} dangerouslySetInnerHTML={{ __html: escapedCode }} />
                            </pre>
                          </div>
                        );
                      }

                      if (item.type === 'tabbedCodeBlock') {
                        const containerId = `tabbed-${sidx}-${iidx}`;
                        const tabs = item.tabs || [];
                        const activeTabLang = activeTabs[containerId] || (tabs[0]?.name?.toLowerCase() || '');

                        return (
                          <div key={itemKey} className="code-tab-container border border-slate-800 rounded-xl mb-6 overflow-hidden">
                            <div className="code-tab-headers flex bg-slate-900 border-b border-slate-800 px-3 py-1 gap-1">
                              {tabs.map((tab: any, idx: number) => {
                                const tabSlug = tab.name.toLowerCase();
                                return (
                                  <button
                                    key={idx}
                                    className={`tab-btn px-4 py-2 text-xs font-medium rounded-t-lg transition ${activeTabLang === tabSlug ? 'active text-purple-400 bg-slate-950 border-b-2 border-purple-500' : 'text-slate-400 hover:text-slate-200'}`}
                                    onClick={() => setActiveTabs(prev => ({ ...prev, [containerId]: tabSlug }))}
                                  >
                                    {tab.name}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="code-tab-contents bg-slate-950">
                              {tabs.map((tab: any, idx: number) => {
                                const tabSlug = tab.name.toLowerCase();
                                if (activeTabLang !== tabSlug) return null;

                                const escapedCode = String(tab.code || '')
                                  .replace(/&/g, "&amp;")
                                  .replace(/</g, "&lt;")
                                  .replace(/>/g, "&gt;");
                                const tabBlockId = `${containerId}-${tabSlug}`;

                                return (
                                  <div key={idx} className="tab-pane active relative">
                                    <button 
                                      className={`copy-code-btn absolute top-3 right-3 px-3 py-1 text-xs rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 transition ${copiedStates[tabBlockId] ? 'copied bg-emerald-600 text-white border-emerald-600' : ''}`}
                                      onClick={() => copyCode(tab.code, tabBlockId)}
                                    >
                                      {copiedStates[tabBlockId] ? 'Copied!' : 'Copy'}
                                    </button>
                                    <pre className="p-4 overflow-x-auto text-xs font-mono text-cyan-400">
                                      <code className={`language-${tab.lang || 'text'}`} dangerouslySetInnerHTML={{ __html: escapedCode }} />
                                    </pre>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      if (item.type === 'diagram') {
                        const diagramName = item.name || '';
                        const svgString = DIAGRAM_LIBRARY[diagramName];

                        if (svgString) {
                          return (
                            <div 
                              key={itemKey}
                              className="diagram-wrapper my-6 p-4 rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden shadow-lg"
                              dangerouslySetInnerHTML={{ __html: svgString }}
                            />
                          );
                        } else {
                          const formattedName = diagramName.replace(/([A-Z])/g, ' $1').replace(/^./, (s: string) => s.toUpperCase());
                          return (
                            <div key={itemKey} className="diagram-wrapper my-6 p-8 rounded-xl border border-slate-800 bg-slate-900/40 text-center flex flex-col items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                              <div className="font-semibold text-sm text-white">{formattedName}</div>
                              <div className="text-xs text-slate-500">Architecture diagram — see descriptions above.</div>
                            </div>
                          );
                        }
                      }

                      if (item.type === 'interviewCard') {
                        const cardId = item.id || `ic-${sidx}-${iidx}`;
                        const isRevealed = !!revealedAnswers[cardId];

                        return (
                          <div key={itemKey} className="interview-card p-6 border border-slate-800 rounded-xl mb-6 bg-slate-900/10 shadow-sm" id={cardId}>
                            <div className="interview-question font-bold text-slate-200 mb-4">Q: {item.question}</div>
                            <div className="interview-action">
                              <button 
                                className="reveal-btn px-4 py-2 rounded font-semibold text-xs transition"
                                onClick={() => setRevealedAnswers(prev => ({ ...prev, [cardId]: !isRevealed }))}
                              >
                                {isRevealed ? 'Hide Answer' : 'Reveal Answer'}
                              </button>
                            </div>
                            {isRevealed && (
                              <div className="interview-answer mt-4 pt-4 border-t border-dashed border-slate-800">
                                <div className="answer-label text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">Official Answer:</div>
                                <div className="answer-content text-sm text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(item.answer) }} />
                              </div>
                            )}
                          </div>
                        );
                      }

                      if (item.type === 'questionCard') {
                        const quizId = `qc-${sidx}-${iidx}`;
                        const userAns = quizAnswers[quizId];

                        return (
                          <div key={itemKey} className="question-quiz-card p-6 border border-slate-800 rounded-xl mb-6 bg-slate-900/10 shadow-sm">
                            <div className="quiz-question font-bold text-slate-200 mb-4">{item.question}</div>
                            <div className="quiz-choices space-y-2 mb-4">
                              {(item.choices || []).map((choice: string, idx: number) => {
                                let choiceClass = '';
                                if (userAns) {
                                  if (idx === item.correctIndex) {
                                    choiceClass = 'correct bg-emerald-500/10 border-emerald-500 text-emerald-400';
                                  } else if (userAns.selectedIdx === idx) {
                                    choiceClass = 'incorrect bg-rose-500/10 border-rose-500 text-rose-400';
                                  } else {
                                    choiceClass = 'opacity-50 pointer-events-none';
                                  }
                                }

                                return (
                                  <div 
                                    key={idx}
                                    className={`quiz-choice-option flex items-center gap-3 p-3 rounded-lg border border-slate-800 hover:border-purple-500 bg-slate-950/40 cursor-pointer transition ${choiceClass}`}
                                    onClick={() => {
                                      if (userAns) return;
                                      setQuizAnswers(prev => ({
                                        ...prev,
                                        [quizId]: { selectedIdx: idx, correct: idx === item.correctIndex }
                                      }));
                                    }}
                                  >
                                    <span className="choice-letter w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs bg-slate-800 text-slate-300">
                                      {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className="choice-text text-sm text-slate-300">{choice}</span>
                                  </div>
                                );
                              })}
                            </div>
                            {userAns && (
                              <div className="quiz-explanation p-4 rounded bg-slate-950/60 border border-slate-800 text-sm leading-relaxed">
                                <strong className="text-emerald-400 block mb-1">Correct Answer: {String.fromCharCode(65 + item.correctIndex)}</strong>
                                <span className="text-slate-400">{item.explanation}</span>
                              </div>
                            )}
                          </div>
                        );
                      }

                      if (item.type === 'rawHtml') {
                        // Skip rawHtml unless it has explicit SVGs to render. Inside Next.js, dangerouslySetInnerHTML on SVGs is safe
                        if (item.html?.includes('<svg') || item.html?.includes('<div')) {
                          return (
                            <div key={itemKey} dangerouslySetInnerHTML={{ __html: item.html }} />
                          );
                        }
                      }

                      return null;
                    })}
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Scroll to Top Button */}
          <button 
            className={`scroll-to-top flex items-center justify-center rounded-full ${scrollTopVisible ? 'visible' : ''}`}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          </button>
        </div>
      )}

    </div>
  );
}

export default function PlacementEngine() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading placement dashboard...</div>}>
      <PageComponent />
    </Suspense>
  );
}
