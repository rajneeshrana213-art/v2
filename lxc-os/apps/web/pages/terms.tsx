import Head from 'next/head'
import Navbar from '@/components/home/navbar/Navbar'
import Footer from '@/components/home/footer/Footer'
import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms of Service - LearnXChain</title>
        <meta
          name="description"
          content="Understand the terms and conditions that govern your use of the LearnXChain platform and services."
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
                    Legal Framework
                  </p>
                  <h1 className="text-4xl font-[var(--font-grotesk)] font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                    Terms of Service
                  </h1>
                  <p className="max-w-3xl text-lg text-gray-600 dark:text-gray-400 font-medium">
                    These Terms of Service (&quot;Terms&quot;) govern access to and use of the LearnXChain platform,
                    products, and services by Institutions, administrators, staff, and other authorized users.
                  </p>
                  <p className="text-sm font-bold text-[#0057C8]/60 dark:text-[#1A9FFF]/60">
                    Please read these Terms carefully before using LearnXChain.
                  </p>
                </header>
              </div>
            </section>

            {/* Section 2: Content - Even (Neon Green Wash) */}
            <section className="bg-transparent bg-gradient-to-b from-[#5CDD2B]/5 to-transparent pb-32">
              <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="space-y-10 rounded-3xl border-2 border-gray-100 dark:border-white/5 bg-white/60 dark:bg-[#0C1018] p-6 text-base leading-relaxed text-gray-700 shadow-xl backdrop-blur-xl dark:text-gray-300 sm:p-10">
                  <section className="space-y-4">
                    <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                      1. Contracting entity
                    </h2>
                    <p className="font-medium">
                      &quot;LearnXChain&quot;, &quot;we&quot;, &quot;our&quot; or &quot;us&quot; refers to the entity
                      that provides the LearnXChain platform and services. The contracting entity and governing
                      law may vary based on your geography and the specific commercial agreement executed with your
                      Institution.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                      2. Customers, users, and administrators
                    </h2>
                    <p className="font-medium">
                      Our direct customer is typically an Institution or organization that enters into a commercial
                      agreement with LearnXChain (&quot;Customer&quot;). The Customer designates administrators
                      who configure and manage access for staff, teachers, students, and guardians (&quot;Users&quot;).
                    </p>
                    <p className="font-medium">
                      Customers are responsible for: (a) the actions of their Users; (b) maintaining the security
                      of access credentials; and (c) ensuring that their use of LearnXChain complies with
                      applicable laws and internal policies.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                      3. Acceptable use
                    </h2>
                    <p className="font-medium">Users agree not to:</p>
                    <ul className="ml-5 list-disc space-y-3 font-medium">
                      <li>Use the services in violation of any applicable law or regulation.</li>
                      <li>
                        Interfere with or disrupt the integrity, performance, or security of the platform or its
                        underlying infrastructure.
                      </li>
                      <li>
                        Attempt to gain unauthorized access to the services or related systems and networks.
                      </li>
                      <li>
                        Misuse access to data, including by attempting to re‑identify anonymized datasets or
                        extracting data at scale without authorization.
                      </li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                      4. Intellectual property
                    </h2>
                    <p className="font-medium">
                      LearnXChain owns all rights, title, and interest in and to the platform, including all
                      underlying software, models, designs, documentation, and brand elements, subject to any
                      open‑source components used in accordance with their licenses.
                    </p>
                    <p className="font-medium">
                      Customers retain ownership of their data and content. By using the services, Customers grant
                      LearnXChain a limited license to process such data solely to provide, secure, and improve the
                      services, in line with our Privacy Policy and applicable agreements.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                      5. Service availability and changes
                    </h2>
                    <p className="font-medium">
                      We strive to provide a highly available, reliable platform suitable for mission‑critical
                      school operations. However, we do not guarantee uninterrupted service and may perform planned
                      maintenance or urgent security updates from time to time.
                    </p>
                    <p className="font-medium">
                      We may introduce new features, change existing ones, or discontinue non‑core components, while
                      maintaining the overall value of the service. Material changes impacting contracted service
                      levels will be communicated to Customers in advance where reasonably possible.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                      6. Disclaimers
                    </h2>
                    <p className="font-medium">
                      Except as expressly stated in a written agreement with your Institution, the services are
                      provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the maximum extent
                      permitted by law, we disclaim all implied warranties, including merchantability, fitness for a
                      particular purpose, and non‑infringement.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                      7. Limitation of liability
                    </h2>
                    <p className="font-medium">
                      To the fullest extent permitted by law, LearnXChain&apos;s aggregate liability arising out of
                      or relating to the services is limited to the amounts actually paid by the Customer for the
                      services giving rise to the claim during the twelve (12) months preceding the event.
                    </p>
                    <p className="font-medium">
                      We are not liable for indirect, incidental, special, consequential, or punitive damages, or
                      for any loss of profits, revenues, data, or goodwill, even if we have been advised of the
                      possibility of such damages.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                      8. Termination
                    </h2>
                    <p className="font-medium">
                      Either party may suspend or terminate access to the services in accordance with the
                      underlying commercial agreement or if there is a material breach of these Terms. Upon
                      termination, we will retain or delete Customer data as described in our agreements and
                      Privacy Policy, subject to applicable law.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                      9. Governing law and disputes
                    </h2>
                    <p className="font-medium">
                      The governing law and dispute‑resolution mechanism will be defined in the applicable order
                      form or commercial agreement executed with your Institution. In the absence of such an
                      agreement, default jurisdiction will be determined based on the contracting entity.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                      10. Changes to these Terms
                    </h2>
                    <p className="font-medium">
                      We may update these Terms from time to time. When we make material changes, we will notify
                      Customers through the admin dashboard, email, or other appropriate channels. Continued use of
                      the services after such updates constitutes acceptance of the revised Terms.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                      11. Contact
                    </h2>
                    <p className="font-medium">
                      If you have questions about these Terms, please contact us at{' '}
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
              </div>
            </section>
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}


