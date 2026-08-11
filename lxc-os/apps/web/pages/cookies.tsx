import Head from 'next/head'
import Navbar from '@/components/home/navbar/Navbar'
import Footer from '@/components/home/footer/Footer'
import { motion } from "framer-motion";

export default function CookiePolicyPage() {
  return (
    <>
      <Head>
        <title>Cookie Policy - LearnXChain</title>
        <meta
          name="description"
          content="Learn how LearnXChain uses cookies and similar technologies to secure and improve the platform."
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
                    Cookies & Analytics
                  </p>
                  <h1 className="text-4xl font-[var(--font-grotesk)] font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                    Cookie Policy
                  </h1>
                  <p className="max-w-3xl text-lg text-gray-600 dark:text-gray-400 font-medium">
                    This Cookie Policy explains how LearnXChain uses cookies and similar technologies on our
                    websites and applications.
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
                      1. What are cookies?
                    </h2>
                    <p className="font-medium">
                      Cookies are small text files that are stored on your device when you visit a website or use a
                      web application. They help websites remember your actions and preferences, and they enable
                      secure, reliable experiences for authenticated users.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                      2. How we use cookies
                    </h2>
                    <p className="font-medium">LearnXChain uses cookies and similar technologies for purposes such as:</p>
                    <ul className="ml-5 list-disc space-y-3 font-medium">
                      <li>Maintaining secure sessions for logged‑in users.</li>
                      <li>Remembering basic preferences such as language or theme.</li>
                      <li>Measuring product usage in aggregate to improve performance and usability.</li>
                      <li>
                        Protecting the platform from abuse and unauthorized access using security cookies and
                        tokens.
                      </li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                      3. Types of cookies we may use
                    </h2>
                    <ul className="ml-5 list-disc space-y-3 font-medium">
                      <li>
                        <span className="font-bold text-gray-900 dark:text-white">Strictly necessary cookies</span> – required for core
                        functionality such as login, navigation, and secure access to platform features.
                      </li>
                      <li>
                        <span className="font-bold text-gray-900 dark:text-white">Performance and analytics cookies</span> – help us
                        understand how the platform is used so we can optimize flows and reliability.
                      </li>
                      <li>
                        <span className="font-bold text-gray-900 dark:text-white">Preference cookies</span> – store limited information about
                        your choices (for example, selected theme) to personalize your experience.
                      </li>
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                      4. Third‑party services
                    </h2>
                    <p className="font-medium">
                      Where we use third‑party infrastructure or analytics providers, those partners may also set
                      cookies in accordance with their own policies. We work only with reputable providers and
                      restrict their use of data to the purposes defined in our agreements.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                      5. Managing cookies
                    </h2>
                    <p className="font-medium">
                      Most browsers allow you to control cookies through their settings, including blocking or
                      deleting them. Please note that disabling certain cookies may impact your ability to log in
                      or use key LearnXChain features reliably.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                      6. Updates to this Policy
                    </h2>
                    <p className="font-medium">
                      We may update this Cookie Policy periodically to reflect changes in technology, regulation,
                      or our product. When we do, we will revise the &quot;Last updated&quot; date and, where
                      appropriate, provide additional notice via the platform.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white">
                      7. Contact
                    </h2>
                    <p className="font-medium">
                      If you have questions about our use of cookies, please contact us at{' '}
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


