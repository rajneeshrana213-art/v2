import Head from 'next/head'
import dynamic from 'next/dynamic'
import DemoHero from "@/components/book-demo/Hero/Hero";
import Navbar from "@/components/home/navbar/Navbar";
import Footer from "@/components/home/footer/Footer";

// Dynamic imports for below-fold sections
const DemoWhy = dynamic(() => import("@/components/book-demo/Why/Why"), { ssr: true });
const DemoProcess = dynamic(() => import("@/components/book-demo/Process/Process"), { ssr: true });
const DemoForm = dynamic(() => import("@/components/book-demo/Form/Form"), { ssr: true });
const DemoExpect = dynamic(() => import("@/components/book-demo/Expect/Expect"), { ssr: false });
const DemoCTA = dynamic(() => import("@/components/book-demo/CTA/CTA"), { ssr: true });

import { motion } from "framer-motion";

export default function BookDemoPage() {
  return (
    <>
      <Head>
        <title>Book a Demo - LearnXChain</title>
        <meta name="description" content="See LearnXChain in action. A guided demo tailored to your school's size, board, and challenges." />
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
            {/* Section 1: Hero - Odd (Deep Blue Wash) */}
            <section className="bg-transparent bg-gradient-to-b from-[#0057C8]/5 to-transparent">
              <DemoHero />
            </section>

            {/* Section 2: Why - Even (Neon Green Wash) */}
            <section className="bg-transparent bg-gradient-to-b from-[#5CDD2B]/5 to-transparent">
              <DemoWhy />
            </section>

            {/* Section 3: Process - Odd (Deep Blue Wash) */}
            <section className="bg-transparent bg-gradient-to-b from-[#0057C8]/5 to-transparent">
              <DemoProcess />
            </section>

            {/* Section 4: Form - Even (Neon Green Wash) */}
            <section id="demo-form" className="bg-transparent bg-gradient-to-b from-[#5CDD2B]/5 to-transparent">
              <DemoForm />
            </section>

            {/* Section 5: Expect - Odd (Deep Blue Wash) */}
            <section className="bg-transparent bg-gradient-to-b from-[#0057C8]/5 to-transparent">
              <DemoExpect />
            </section>

            {/* Section 6: CTA - Even (Neon Green Wash) */}
            <section className="bg-transparent bg-gradient-to-b from-[#5CDD2B]/5 to-transparent">
              <DemoCTA />
            </section>
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}

