import Head from "next/head";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/home/navbar/Navbar";
import Footer from "@/components/home/footer/Footer";
import {
  Briefcase,
  MapPin,
  Clock,
  ChevronRight,
  CheckCircle2,
  Users,
  Zap,
  Heart,
  Search,
  X,
  ArrowUpDown,
} from "lucide-react";
import { Loader } from "@/components/ui/feedback/Loader";

const values = [
  {
    icon: Zap,
    title: "Speed & Impact",
    desc: "We ship fast and measure what matters",
  },
  {
    icon: Heart,
    title: "Empathy First",
    desc: "We build for real schools with real problems",
  },
  {
    icon: Users,
    title: "Small Team, Big Mission",
    desc: "Every person here shapes the company",
  },
];

/** Strip markdown symbols for plain-text previews on cards. */
function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .trim();
}

export default function CareersPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [activeLocation, setActiveLocation] = useState("All");
  const [activeTag, setActiveTag] = useState("All");
  const [sortNewest, setSortNewest] = useState(true);

  useEffect(() => {
    fetch("/api/v1/careers/jobs")
      .then((res) => res.json())
      .then((data) => {
        setRoles(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Unique filter option sets derived from live data
  const types = ["All", ...Array.from(new Set(roles.map((r) => r.type).filter(Boolean)))];
  const locations = ["All", ...Array.from(new Set(roles.map((r) => r.location).filter(Boolean)))];
  const tags = ["All", ...Array.from(new Set(roles.map((r) => r.tag).filter(Boolean)))];

  const filteredRoles = roles
    .filter((r) => {
      const q = search.toLowerCase();
      const matchSearch = !q || r.title?.toLowerCase().includes(q) || r.tag?.toLowerCase().includes(q) || r.location?.toLowerCase().includes(q);
      const matchType = activeType === "All" || r.type === activeType;
      const matchLocation = activeLocation === "All" || r.location === activeLocation;
      const matchTag = activeTag === "All" || r.tag === activeTag;
      return matchSearch && matchType && matchLocation && matchTag;
    })
    .sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortNewest ? db - da : da - db;
    });

  const hasFilters = search || activeType !== "All" || activeLocation !== "All" || activeTag !== "All";

  const clearFilters = () => {
    setSearch("");
    setActiveType("All");
    setActiveLocation("All");
    setActiveTag("All");
  };

  return (
    <>
      <Head>
        <title>Careers - LearnXChain</title>
        <meta
          name="description"
          content="Join LearnXChain and help build India's intelligent school operating system with AI and blockchain at the core."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-white dark:bg-[#0B0E14] transition-colors duration-300 relative">
        {/* Global Page Background Architecture */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Radial Mesh Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#0057C815_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_-20%,#0057C820_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,#5CDD2B08_0%,transparent_40%)] dark:bg-[radial-gradient(circle_at_80%_40%,#5CDD2B10_0%,transparent_40%)]" />
            
            {/* Static Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            
            {/* Animated Ambient Light Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-[#0057C8] rounded-full blur-[120px]"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.05, 0.15, 0.05],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[20%] left-[-5%] w-[35%] h-[35%] bg-[#5CDD2B] rounded-full blur-[120px]"
            />
        </div>

        <div className="relative z-10">
          <Navbar />

          <main>
            {/* Hero - Odd (Deep Blue Wash) */}
            <section className="bg-transparent bg-gradient-to-b from-[#0057C8]/5 to-transparent pt-32 pb-24">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center max-w-4xl mx-auto"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0057C8]/20 bg-[#0057C8]/10 px-5 py-2 text-sm font-bold tracking-widest text-[#0057C8] dark:text-[#1A9FFF] uppercase"
                  >
                    <Briefcase size={14} className="text-[#0057C8] dark:text-[#1A9FFF]" />
                    <span>Join India&apos;s School OS</span>
                  </motion.div>

                  <h1 className="text-5xl font-[var(--font-grotesk)] font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
                    Build the Future of
                    <br />
                    <span className="bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] bg-clip-text text-transparent">
                      Intelligent Education
                    </span>
                  </h1>

                  <p className="mt-8 text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto font-medium">
                    LearnXChain is assembling a{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                      small, world-class team
                    </span>{" "}
                    of engineers and designers building the backbone of digital schools.
                  </p>

                  <div className="mt-10 flex flex-wrap justify-center gap-4">
                    {[
                      { text: "Early‑stage equity", icon: Zap },
                      { text: "Hybrid & remote‑friendly", icon: Users },
                      { text: "Impact-driven culture", icon: Heart },
                    ].map((perk, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 shadow-xl backdrop-blur-xl"
                      >
                        <perk.icon className="h-4 w-4 text-[#5CDD2B]" />
                        {perk.text}
                      </span>
                    ))}
                  </div>
                </motion.div>

                {/* Values Card Grid */}
                <div className="mt-20 grid gap-6 sm:grid-cols-3 max-w-5xl mx-auto">
                  {values.map((v, i) => {
                    const Icon = v.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="rounded-3xl border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] p-8 text-center shadow-xl backdrop-blur-xl group hover:border-[#0057C8]/30 transition-all duration-300"
                      >
                        <div className="inline-flex rounded-2xl bg-[#0057C8]/10 p-4 mb-6 group-hover:scale-110 transition-transform">
                          <Icon className="h-7 w-7 text-[#0057C8] dark:text-[#1A9FFF]" />
                        </div>
                        <h3 className="text-lg font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                          {v.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 font-medium leading-relaxed">
                          {v.desc}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Open Roles - Even (Neon Green Wash) */}
            <section className="bg-transparent bg-gradient-to-b from-[#5CDD2B]/5 to-transparent pb-32">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                  <div>
                    <h2 className="text-3xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white sm:text-4xl">
                      Open Opportunities
                    </h2>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 font-medium">
                      Join us in shipping the tools that empower educators.
                    </p>
                  </div>
                  {!loading && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#5CDD2B]/30 bg-[#5CDD2B]/10 px-6 py-2 text-sm font-bold text-[#5CDD2B] backdrop-blur-xl">
                      <span className="w-2 h-2 rounded-full bg-[#5CDD2B] animate-pulse" />
                      {filteredRoles.length} Available Roles
                    </span>
                  )}
                </div>

                {/* Filters */}
                {!loading && roles.length > 0 && (
                  <div className="mb-12 space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="relative flex-1 min-w-[280px]">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search roles or teams..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] pl-12 pr-12 py-3.5 text-base font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#0057C8]/50 transition-all backdrop-blur-xl shadow-lg"
                        />
                        {search && (
                          <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors">
                            <X size={18} />
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => setSortNewest(!sortNewest)}
                        className="flex items-center gap-2 rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] px-6 py-3.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:border-[#0057C8]/30 transition-all shadow-lg backdrop-blur-xl"
                      >
                        <ArrowUpDown size={16} />
                        {sortNewest ? "Recent" : "Oldest"}
                      </button>

                      {hasFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors px-4"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Filter Chips */}
                      {types.length > 1 && types.map((t) => (
                        <button
                          key={`type-${t}`}
                          onClick={() => setActiveType(t)}
                          className={`rounded-xl px-5 py-2 text-xs font-bold transition-all shadow-sm ${activeType === t
                              ? "bg-[#0057C8] text-white"
                              : "border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] text-gray-600 dark:text-gray-400 hover:border-[#0057C8]/30 backdrop-blur-xl"
                            }`}
                        >
                          {t}
                        </button>
                      ))}
                      
                      <div className="w-px h-6 bg-gray-200 dark:bg-white/10 hidden sm:block" />

                      {tags.length > 1 && tags.map((t) => (
                        <button
                          key={`tag-${t}`}
                          onClick={() => setActiveTag(t)}
                          className={`rounded-xl px-5 py-2 text-xs font-bold transition-all shadow-sm ${activeTag === t
                              ? "bg-[#5CDD2B] text-black"
                              : "border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] text-gray-600 dark:text-gray-400 hover:border-[#5CDD2B]/30 backdrop-blur-xl"
                            }`}
                        >
                          {t === "All" ? "All Teams" : t}
                        </button>
                      ))}

                      <div className="w-px h-6 bg-gray-200 dark:bg-white/10 hidden sm:block" />

                      {locations.length > 1 && locations.map((l) => (
                        <button
                          key={`loc-${l}`}
                          onClick={() => setActiveLocation(l)}
                          className={`rounded-xl px-5 py-2 text-xs font-bold transition-all shadow-sm ${activeLocation === l
                              ? "bg-[#1A9FFF] text-white"
                              : "border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] text-gray-600 dark:text-gray-400 hover:border-[#1A9FFF]/30 backdrop-blur-xl"
                            }`}
                        >
                          {l === "All" ? "All Locations" : l}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="flex justify-center py-32"><Loader size="lg" /></div>
                ) : filteredRoles.length === 0 ? (
                  <div className="text-center py-24 bg-white/40 dark:bg-[#0C1018]/40 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/5 backdrop-blur-xl">
                    <Briefcase className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-700 mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-[var(--font-grotesk)]">
                      {roles.length === 0 ? "No active openings" : "No matches found"}
                    </h3>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-md mx-auto font-medium">
                      Try adjusting your filters or check back soon for new opportunities.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {filteredRoles.map((role, i) => (
                      <motion.div
                        key={role.id}
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="group relative"
                      >
                        <Link href={`/careers/${role.id}`} className="block h-full">
                          <div className="relative h-full rounded-[2rem] border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] p-8 transition-all duration-500 hover:border-[#0057C8]/30 hover:shadow-2xl hover:shadow-[#0057C8]/10 backdrop-blur-xl overflow-hidden">
                            {/* Decorative Brand Gradient Bar */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0057C8] via-[#1A9FFF] to-[#5CDD2B] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <div className="flex items-start justify-between gap-4 mb-6">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white font-[var(--font-grotesk)] leading-tight group-hover:text-[#0057C8] dark:group-hover:text-[#1A9FFF] transition-colors">
                                {role.title}
                              </h3>
                              <span className="flex-shrink-0 rounded-full bg-[#0057C8]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#0057C8] dark:text-[#1A9FFF]">
                                {role.tag}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-3 mb-6">
                              <span className="inline-flex items-center gap-1.5 rounded-xl bg-gray-50 dark:bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-400">
                                <MapPin size={12} className="text-[#5CDD2B]" />
                                {role.location}
                              </span>
                              <span className="inline-flex items-center gap-1.5 rounded-xl bg-gray-50 dark:bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-400">
                                <Clock size={12} className="text-[#1A9FFF]" />
                                {role.type}
                              </span>
                            </div>

                            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-8 line-clamp-3 font-medium">
                              {stripMarkdown(role.description ?? "")}
                            </p>

                            <div className="mt-auto flex items-center gap-2 text-sm font-bold text-[#0057C8] dark:text-[#1A9FFF] opacity-80 group-hover:opacity-100 transition-all">
                              <span>Explore Position</span>
                              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Don't see a role */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-16 rounded-[2.5rem] border-2 border-dashed border-[#0057C8]/20 bg-[#0057C8]/5 p-10 text-center backdrop-blur-xl"
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white font-[var(--font-grotesk)]">
                    Passive Opportunities
                  </h3>
                  <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto">
                    Exceptional talent doesn&apos;t always wait for an opening. If you&apos;re passionate about education tech, reach out to us at{" "}
                    <a
                      href="mailto:contact@learnxchain.com"
                      className="text-[#0057C8] dark:text-[#1A9FFF] font-bold hover:underline"
                    >
                      contact@learnxchain.com
                    </a>
                  </p>
                </motion.div>
              </div>
            </section>
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}
