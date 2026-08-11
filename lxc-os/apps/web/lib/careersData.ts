export interface Role {
  id: string;
  title: string;
  location: string;
  type: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  gradient: string;
  borderHover: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  perks: string[];
}

export const roles: Role[] = [
  {
    id: "founding-fullstack",
    title: "Founding Full‑Stack Engineer",
    location: "New Delhi / Remote (India)",
    type: "Full‑time",
    tag: "Engineering",
    tagColor: "text-indigo-600 dark:text-indigo-400",
    tagBg: "bg-indigo-50 dark:bg-indigo-500/10",
    gradient: "from-indigo-500 to-purple-600",
    borderHover: "hover:border-indigo-200/70 dark:hover:border-indigo-500/20",
    description:
      "Own core product surfaces across admin, teacher, and student experiences. Ship fast, with strong engineering fundamentals and a bias for impact.",
    responsibilities: [
      "Build and own full-stack features from design to deployment",
      "Work directly with founders to define architecture and technical direction",
      "Scale systems for thousands of concurrent school users",
      "Mentor future engineering hires and set coding standards",
      "Drive technical decisions across React/Next.js, Node.js, and databases",
    ],
    requirements: [
      "5+ years experience in modern web stacks (React / Next.js, Node, TypeScript)",
      "Comfort working in early‑stage ambiguity and owning features end‑to‑end",
      "Experience with data‑heavy and workflow platforms is a plus",
      "Strong fundamentals in CS, databases, and system design",
      "Passion for building products that impact Indian education",
    ],
    perks: [
      "Founding team equity",
      "Flexible remote work",
      "Direct founder access",
      "Learning budget",
    ],
  },
  {
    id: "product-manager",
    title: "Product Manager – School OS",
    location: "New Delhi / Remote (India)",
    type: "Full‑time",
    tag: "Product",
    tagColor: "text-emerald-600 dark:text-emerald-400",
    tagBg: "bg-emerald-50 dark:bg-emerald-500/10",
    gradient: "from-emerald-500 to-green-600",
    borderHover: "hover:border-emerald-200/70 dark:hover:border-emerald-500/20",
    description:
      "Translate school problems into crisp product specs. Work closely with founders, engineering, and design to shape the LearnXChain roadmap.",
    responsibilities: [
      "Drive product strategy and roadmap for School OS modules",
      "Conduct user research with principals, teachers, and parents",
      "Write detailed PRDs and work with engineering on execution",
      "Analyze product metrics and iterate on features for adoption",
      "Collaborate with customer success for feedback loops",
    ],
    requirements: [
      "3–7 years in B2B SaaS or ed‑tech product roles",
      "Strong user research instincts; comfortable in school offices and classrooms",
      "Ability to prioritize ruthlessly and communicate clearly with stakeholders",
      "Data-driven mindset with experience in analytics tools",
      "Passion for Indian education and school management",
    ],
    perks: [
      "Shape the product vision",
      "Equity participation",
      "Hybrid flexibility",
      "Conference budget",
    ],
  },
  {
    id: "customer-success",
    title: "Implementation & Customer Success Lead",
    location: "Pan‑India",
    type: "Full‑time",
    tag: "Customer",
    tagColor: "text-amber-600 dark:text-amber-400",
    tagBg: "bg-amber-50 dark:bg-amber-500/10",
    gradient: "from-amber-500 to-orange-600",
    borderHover: "hover:border-amber-200/70 dark:hover:border-amber-500/20",
    description:
      "Lead roll‑outs for new partner schools, drive adoption, and ensure measurable outcomes for leadership, teachers, and parents.",
    responsibilities: [
      "Onboard new schools and ensure smooth platform adoption",
      "Build relationships with school leadership and key stakeholders",
      "Train teachers and admin staff on LearnXChain features",
      "Track success metrics: adoption, NPS, retention",
      "Relay field insights to product and engineering teams",
    ],
    requirements: [
      "Experience with enterprise onboarding, account management, or school operations",
      "High empathy and communication skills across CXOs, principals, and teachers",
      "Willingness to travel to school campuses when required",
      "Problem-solving mindset with attention to detail",
      "Fluency in Hindi and English; regional languages are a plus",
    ],
    perks: [
      "Travel allowance",
      "Impact-driven role",
      "Growth into leadership",
      "Health insurance",
    ],
  },
];
