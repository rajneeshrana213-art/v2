"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // TODO: Connect to API endpoint when backend is ready
      // const response = await fetch("/api/contact", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });

      // Simulate API call for now

      setSubmitStatus("success");
      setFormData({ name: "", email: "", organization: "", message: "" });
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-[#0B0E14] py-28">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="font-[var(--font-grotesk)] text-4xl text-white mb-10">
          Send Us a Message
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <input
            name="name"
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-gray-300 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors"
          />
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-gray-300 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors"
          />
          <input
            name="organization"
            type="text"
            placeholder="School / Organization"
            value={formData.organization}
            onChange={handleChange}
            className="rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-gray-300 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors"
          />
          <textarea
            name="message"
            placeholder="How can we help you?"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            required
            className="rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-gray-300 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors resize-none"
          />
          {submitStatus === "success" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-green-500/20 border border-green-500/50 px-4 py-3 text-green-400 text-sm"
            >
              Thank you! We'll get back to you within 24 hours.
            </motion.div>
          )}
          {submitStatus === "error" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-red-500/20 border border-red-500/50 px-4 py-3 text-red-400 text-sm"
            >
              Something went wrong. Please try again or email us directly.
            </motion.div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-primary px-8 py-4 text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? "Sending..." : "Submit Message"}
          </button>
        </form>
      </div>
    </section>
  );
}

