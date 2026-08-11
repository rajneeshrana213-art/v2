import Head from 'next/head'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import Navbar from "@/components/home/navbar/Navbar";
import Footer from "@/components/home/footer/Footer";
import ContactHero from "@/components/contact/Hero";
import ContactWays from "@/components/contact/Ways";
import DemoForm from "@/components/contact/DemoForm";
import Benefits from "@/components/contact/Benefits";

// Dynamic imports for below-fold components
const ContactLocations = dynamic(() => import("@/components/contact/Locations"), { ssr: false })
const ContactFAQ = dynamic(() => import("@/components/contact/FAQ"), { ssr: false })
const ContactCTA = dynamic(() => import("@/components/contact/CTA"), { ssr: false })

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contact Us - LearnXChain</title>
        <meta name="description" content="Get in touch with LearnXChain. Book a free demo or speak with our experts to see how our AI-powered platform transforms school management." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
                    opacity: [0.15, 0.25, 0.15],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[20%] left-[-5%] w-[35%] h-[35%] bg-[#0057C8] rounded-full blur-[120px]"
            />
        </div>

        <div className="relative z-10">
          <Navbar />
          
          {/* Section wrappers with alternating gradients */}
          <div className="bg-transparent">
            <ContactHero />
          </div>

          <div className="bg-gradient-to-b from-transparent via-[#0057C8]/5 to-transparent dark:via-[#0057C8]/5">
            <ContactWays />
          </div>

          <div className="bg-transparent">
            <Benefits />
          </div>

          <div className="bg-gradient-to-b from-transparent via-[#5CDD2B]/5 to-transparent dark:via-[#5CDD2B]/5">
            <DemoForm />
          </div>

          <div className="bg-transparent">
            <ContactLocations />
          </div>

          <div className="bg-gradient-to-b from-transparent via-[#0057C8]/5 to-transparent dark:via-[#0057C8]/5">
            <ContactFAQ />
          </div>

          <div className="bg-gradient-to-b from-transparent via-[#5CDD2B]/5 to-transparent dark:via-[#5CDD2B]/5">
            <ContactCTA />
          </div>

          <Footer />
        </div>
      </div>
    </>
  );
}
