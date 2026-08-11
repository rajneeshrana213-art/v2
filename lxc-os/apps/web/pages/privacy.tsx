import Head from 'next/head'
import Navbar from '@/components/home/navbar/Navbar'
import Footer from '@/components/home/footer/Footer'
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy - LearnXChain</title>
        <meta
          name="description"
          content="Learn how LearnXChain collects, uses, and protects data for schools, students, educators, and partners."
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
            {/* Section 1: Header - Odd (Deep Blue Wash) */}
            <section className="bg-transparent bg-gradient-to-b from-[#0057C8]/5 to-transparent pt-32 pb-20">
              <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <header className="space-y-4 text-center sm:text-left">
                  <p className="inline-flex items-center rounded-full border border-[#0057C8]/20 bg-[#0057C8]/10 px-4 py-1.5 text-xs font-bold tracking-widest text-[#0057C8] dark:text-[#1A9FFF] uppercase">
                    Trust & Compliance
                  </p>
                  <h1 className="text-4xl font-[var(--font-grotesk)] font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                    Privacy Policy
                  </h1>
                  <p className="max-w-3xl text-lg text-gray-600 dark:text-gray-400 font-medium">
                    This Privacy Policy explains how LearnXChain (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) collects, uses,
                    and protects information when schools, educators, students, parents, and partners use our
                    products and services.
                  </p>
                  <p className="text-sm font-bold text-[#0057C8]/60 dark:text-[#1A9FFF]/60">
                    Last updated: {new Date().getFullYear()}
                  </p>
                </header>
              </div>
            </section>

            {/* Section 2: Content - Even (Neon Green Wash) */}
            <section className="bg-transparent bg-gradient-to-b from-[#5CDD2B]/5 to-transparent pb-32">
              <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
                  {/* Main policy body */}
                  <div className="space-y-10 rounded-3xl border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] p-6 text-base leading-relaxed text-gray-700 shadow-xl backdrop-blur-xl dark:text-gray-300 sm:p-10">
                    <section id="scope" className="space-y-4">
                      <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                        1. Scope and applicability
                      </h2>
                      <p className="font-medium">
                        This Policy applies to data processed through the LearnXChain platform, mobile or web
                        applications, APIs, and related services we provide to schools and educational institutions
                        (collectively, &quot;Institutions&quot;). In many cases, LearnXChain acts as a
                        &quot;data processor&quot; or &quot;service provider&quot; on behalf of the Institution,
                        which remains the primary &quot;data controller&quot; for student and academic data.
                      </p>
                    </section>

                    <section id="data-we-collect" className="space-y-4">
                      <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                        2. Information we collect
                      </h2>
                      <p className="font-medium">We collect information in the following broad categories:</p>
                      <ul className="ml-5 list-disc space-y-3 font-medium">
                        <li>
                          <span className="font-bold text-gray-900 dark:text-white">Institution and account data</span> – details about the
                          school, administrators, staff, and configuration choices required to operate the
                          platform.
                        </li>
                        <li>
                          <span className="font-bold text-gray-900 dark:text-white">Student and guardian data</span> – identifiers, academic
                          records, attendance, communication history, and other information provided by the
                          Institution in the course of delivering education.
                        </li>
                        <li>
                          <span className="font-bold text-gray-900 dark:text-white">Usage and device data</span> – technical information such
                          as IP address, browser type, device identifiers, and interaction logs used for security,
                          analytics, and product improvement.
                        </li>
                        <li>
                          <span className="font-bold text-gray-900 dark:text-white">AI and analytics data</span> – derived insights and models
                          generated to provide recommendations, alerts, or predictive analytics for Institutions.
                        </li>
                      </ul>
                    </section>

                    <section id="how-we-use" className="space-y-4">
                      <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                        3. How we use information
                      </h2>
                      <p className="font-medium">We use information strictly to:</p>
                      <ul className="ml-5 list-disc space-y-3 font-medium">
                        <li>Operate, maintain, and secure the LearnXChain platform.</li>
                        <li>
                          Provide contracted services to Institutions, including workflow automation, reporting,
                          and communication.
                        </li>
                        <li>
                          Improve reliability, performance, and user experience through aggregated, de‑identified
                          analytics.
                        </li>
                        <li>
                          Comply with applicable legal, regulatory, and audit requirements in the jurisdictions in
                          which we operate.
                        </li>
                      </ul>
                      <p className="font-medium">
                        We do <span className="font-bold text-[#0057C8] dark:text-[#1A9FFF]">not</span> sell personal data, and we do not use
                        student-level information for advertising or other unrelated commercial profiling.
                      </p>
                    </section>

                    <section id="legal-basis" className="space-y-4">
                      <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                        4. Legal basis and consent
                      </h2>
                      <p className="font-medium">
                        Where required by law, we rely on the Institution&apos;s authorization, contracts, or
                        explicit consent from data subjects or guardians as the legal basis for processing. The
                        Institution is responsible for ensuring that appropriate notices and consents are in place
                        before providing data to LearnXChain.
                      </p>
                    </section>

                    <section id="sharing" className="space-y-4">
                      <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                        5. How we share information
                      </h2>
                      <p className="font-medium">
                        We may share information with carefully selected third parties strictly under contract,
                        including:
                      </p>
                      <ul className="ml-5 list-disc space-y-3 font-medium">
                        <li>Cloud infrastructure, hosting, and communication service providers.</li>
                        <li>Identity, security, and analytics partners that help us protect the platform.</li>
                        <li>
                          Professional advisers (legal, audit, compliance) under confidentiality obligations.
                        </li>
                      </ul>
                      <p className="font-medium">
                        All such partners are required to implement appropriate safeguards and may only process
                        data in line with our documented instructions.
                      </p>
                    </section>

                    <section id="security" className="space-y-4">
                      <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                        6. Security and data retention
                      </h2>
                      <p className="font-medium">
                        Security is core to LearnXChain&apos;s architecture. We implement technical and
                        organizational measures including encryption in transit, strict access controls, activity
                        logging, and regular security reviews. On certain modules, we additionally leverage
                        blockchain to provide tamper‑evident audit trails.
                      </p>
                      <p className="font-medium">
                        Data is retained only for as long as necessary to provide services to the Institution or to
                        comply with legal obligations. We support Institution‑level data deletion and export
                        requests, subject to contractual and regulatory constraints.
                      </p>
                    </section>

                    <section id="rights" className="space-y-4">
                      <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                        7. Your rights and choices
                      </h2>
                      <p className="font-medium">
                        Depending on your jurisdiction, students, parents, and staff may have rights to access,
                        correct, or request deletion of certain personal data. We work with Institutions to respond
                        to such requests in accordance with applicable law and our contractual commitments.
                      </p>
                      <p className="font-medium">
                        If you have a privacy request, please first contact your Institution. You may also reach
                        out to us using the contact details below, and we will coordinate with the relevant
                        Institution.
                      </p>
                    </section>

                    <section id="changes" className="space-y-4">
                      <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                        8. Changes to this Policy
                      </h2>
                      <p className="font-medium">
                        We may update this Privacy Policy from time to time to reflect product, legal, or
                        operational changes. When we do, we will revise the &quot;Last updated&quot; date above
                        and, where appropriate, provide additional notice through the platform or to Institutional
                        administrators.
                      </p>
                    </section>

                    <section id="contact" className="space-y-4">
                      <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                        9. How to contact us
                      </h2>
                      <p className="font-medium">
                        For questions about this Policy or our data protection practices, you can contact the
                        LearnXChain team at{' '}
                        <a
                          href="mailto:contact@learnxchain.com"
                          className="font-bold text-[#0057C8] hover:text-[#1A9FFF] dark:text-[#1A9FFF] dark:hover:text-[#5CDD2B] transition-colors"
                        >
                          contact@learnxchain.com
                        </a>
                        .
                      </p>
                    </section>
                  </div>

                  {/* Side panel: quick facts */}
                  <aside className="space-y-8">
                    <div className="rounded-3xl border-2 border-[#0057C8]/20 bg-[#0057C8]/5 p-6 text-sm text-[#0057C8] shadow-xl backdrop-blur-xl dark:border-[#0057C8]/30 dark:bg-[#0057C8]/10 dark:text-[#1A9FFF]">
                      <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em]">
                        Designed for schools
                      </h3>
                      <p className="text-sm font-medium leading-relaxed opacity-80">
                        LearnXChain is built specifically for Indian schools and aligned with institutional data
                        governance models. We are happy to work with your legal and compliance teams during
                        evaluation.
                      </p>
                    </div>

                    <div className="space-y-6 rounded-3xl border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] p-6 text-sm shadow-xl backdrop-blur-xl">
                      <h3 className="text-lg font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                        Summary at a glance
                      </h3>
                      <ul className="ml-4 list-disc space-y-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
                        <li>No sale of personal data.</li>
                        <li>No ads targeting students.</li>
                        <li>Institution controls student records.</li>
                        <li>Encryption in transit and at rest.</li>
                        <li>Formal agreements available.</li>
                      </ul>
                    </div>
                  </aside>
                </div>
              </div>
            </section>
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}

