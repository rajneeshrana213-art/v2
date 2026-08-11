"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { User, Mail, Phone, School, Users, BookOpen, MessageSquare, Calendar, CheckCircle2, Sparkles, Clock, Video, Building2 } from 'lucide-react';
import { useApi } from "@/hooks/useApi";
import Loader from '@/components/ui/feedback/Loader';

export default function DemoForm() {
  const { post, loading } = useApi();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    schoolName: "",
    studentCount: "",
    board: "",
    problem: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    if (!formData.schoolName.trim()) newErrors.schoolName = "School name is required";
    if (!formData.studentCount.trim()) newErrors.studentCount = "Student count is required";
    if (!formData.board) newErrors.board = "Please select a board";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const response = await post("/v1/demo/book", formData, {
      successMessage: "Demo request submitted successfully!",
      onError: (err) => {
        console.error("Error submitting form:", err);
        // If the error object has an 'errors' property (validation errors), set them
        if (err.errors) {
          setErrors(err.errors);
        }
      }
    });

    if (response) {
      setIsSubmitted(true);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (isSubmitted) {
    return (
      <section className="bg-transparent py-32">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex p-6 rounded-full bg-gradient-to-r from-[#5CDD2B] to-[#1A9FFF] mb-6 shadow-xl shadow-[#5CDD2B]/20"
          >
            <CheckCircle2 className="h-12 w-12 text-white" />
          </motion.div>
          <h2 className="text-4xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white mb-4">Demo Request Submitted!</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 font-medium">
            Thank you for your interest. Our team will contact you within 24 hours to schedule your personalized demo.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                fullName: "",
                email: "",
                phone: "",
                schoolName: "",
                studentCount: "",
                board: "",
                problem: "",
              });
            }}
            className="rounded-xl bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] px-10 py-4 text-white font-bold shadow-lg shadow-[#0057C8]/20 transition-all"
          >
            Submit Another Request
          </motion.button>
        </div>
      </section>
    );
  }

  return (
    <section id="form" className="bg-transparent py-32 relative overflow-hidden">

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-[var(--font-grotesk)] font-bold text-gray-900 dark:text-white mb-4">
            Book Your Demo
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Fill out the form below and we'll get back to you within 24 hours
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="grid gap-6"
        >
          {/* Full Name */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2.5 text-sm font-bold">
              <User size={16} className="text-[#0057C8] dark:text-[#1A9FFF]" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="Enter your full name"
              className={`w-full rounded-xl bg-white/50 dark:bg-[#0C1018]/50 border-2 backdrop-blur-md px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-[#0057C8]/10 transition-all font-medium ${errors.fullName ? "border-red-500/50" : "border-gray-100 dark:border-white/10 focus:border-[#0057C8]"
                }`}
            />
            {errors.fullName && (
              <p className="mt-2 text-sm text-red-500 font-bold">{errors.fullName}</p>
            )}
          </div>

          {/* Email and Phone */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2.5 text-sm font-bold">
                <Mail size={16} className="text-[#0057C8] dark:text-[#1A9FFF]" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="your.email@school.com"
                className={`w-full rounded-xl bg-white/50 dark:bg-[#0C1018]/50 border-2 backdrop-blur-md px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-[#0057C8]/10 transition-all font-medium ${errors.email ? "border-red-500/50" : "border-gray-100 dark:border-white/10 focus:border-[#0057C8]"
                  }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2.5 text-sm font-bold">
                <Phone size={16} className="text-[#0057C8] dark:text-[#1A9FFF]" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="10-digit mobile number"
                className={`w-full rounded-xl bg-white/50 dark:bg-[#0C1018]/50 border-2 backdrop-blur-md px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-[#0057C8]/10 transition-all font-medium ${errors.phone ? "border-red-500/50" : "border-gray-100 dark:border-white/10 focus:border-[#0057C8]"
                  }`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* School Name */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2.5 text-sm font-bold">
              <School size={16} className="text-[#0057C8] dark:text-[#1A9FFF]" />
              School Name
            </label>
            <input
              type="text"
              value={formData.schoolName}
              onChange={(e) => handleChange("schoolName", e.target.value)}
              placeholder="Enter your school name"
              className={`w-full rounded-xl bg-white/50 dark:bg-[#0C1018]/50 border-2 backdrop-blur-md px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-[#0057C8]/10 transition-all font-medium ${errors.schoolName ? "border-red-500/50" : "border-gray-100 dark:border-white/10 focus:border-[#0057C8]"
                }`}
            />
            {errors.schoolName && (
              <p className="mt-1 text-sm text-red-400">{errors.schoolName}</p>
            )}
          </div>

          {/* Student Count and Board */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2.5 text-sm font-bold">
                <Users size={16} className="text-[#0057C8] dark:text-[#1A9FFF]" />
                Number of Students
              </label>
              <input
                type="text"
                value={formData.studentCount}
                onChange={(e) => handleChange("studentCount", e.target.value)}
                placeholder="e.g., 500, 1000-2000"
                className={`w-full rounded-xl bg-white/50 dark:bg-[#0C1018]/50 border-2 backdrop-blur-md px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-[#0057C8]/10 transition-all font-medium ${errors.studentCount ? "border-red-500/50" : "border-gray-100 dark:border-white/10 focus:border-[#0057C8]"
                  }`}
              />
              {errors.studentCount && (
                <p className="mt-2 text-sm text-red-500 font-bold">{errors.studentCount}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2.5 text-sm font-bold">
                <BookOpen size={16} className="text-[#0057C8] dark:text-[#1A9FFF]" />
                Education Board
              </label>
              <select
                value={formData.board}
                onChange={(e) => handleChange("board", e.target.value)}
                className={`w-full rounded-xl bg-white/50 dark:bg-[#0C1018]/50 border-2 backdrop-blur-md px-4 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#0057C8]/10 transition-all font-medium appearance-none ${errors.board ? "border-red-500/50" : "border-gray-100 dark:border-white/10 focus:border-[#0057C8]"
                  }`}
              >
                <option value="" className="bg-white dark:bg-[#0C1018]">Select a board</option>
                <option value="CBSE" className="bg-white dark:bg-[#0C1018]">CBSE</option>
                <option value="ICSE" className="bg-white dark:bg-[#0C1018]">ICSE</option>
                <option value="State Board" className="bg-white dark:bg-[#0C1018]">State Board</option>
                <option value="IB" className="bg-white dark:bg-[#0C1018]">IB (International Baccalaureate)</option>
                <option value="IGCSE" className="bg-white dark:bg-[#0C1018]">IGCSE</option>
                <option value="Other" className="bg-white dark:bg-[#0C1018]">Other</option>
              </select>
              {errors.board && (
                <p className="mt-2 text-sm text-red-500 font-bold">{errors.board}</p>
              )}
            </div>
          </div>

          {/* Problem Description */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2.5 text-sm font-bold">
              <MessageSquare size={16} className="text-[#0057C8] dark:text-[#1A9FFF]" />
              What problem are you trying to solve?
            </label>
            <textarea
              value={formData.problem}
              onChange={(e) => handleChange("problem", e.target.value)}
              placeholder="Tell us about the challenges your school is facing..."
              rows={5}
              className="w-full rounded-xl bg-white/50 dark:bg-[#0C1018]/50 border-2 border-gray-100 dark:border-white/10 backdrop-blur-md px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-[#0057C8]/10 focus:border-[#0057C8] transition-all resize-none font-medium"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative mt-4 rounded-xl bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] px-10 py-5 text-white font-bold text-lg shadow-xl shadow-[#0057C8]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-6 w-6 rounded-full border-2 border-white/30 border-t-white"
                />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Calendar size={22} />
                <span>Schedule My Personalized Demo</span>
              </>
            )}
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
}

