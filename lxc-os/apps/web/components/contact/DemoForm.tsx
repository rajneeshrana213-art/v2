"use client";

import { useApi } from "@/hooks/useApi";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, School, Users, BookOpen, MessageSquare, Calendar, CheckCircle2, Sparkles, Clock, Video, Building2 } from 'lucide-react';
import Loader from '@/components/ui/feedback/Loader';
import { getISTDateString } from "@/lib/utils/date-utils";

export default function DemoForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    schoolName: "",
    studentCount: "",
    board: "",
    preferredDate: "",
    preferredTime: "",
    problem: "",
    demoType: "product",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

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
    if (!formData.studentCount.trim())
      newErrors.studentCount = "Student count is required";
    if (!formData.board) newErrors.board = "Please select a board";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { post, loading } = useApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setErrors({});

    const response = await post("/api/v1/demo/book", formData, {
      successMessage: "Demo request submitted successfully!",
      onError: (err) => {
        console.error("Submission error:", err);
        setErrors({ submit: err.message || "Failed to submit form." });
      }
    });

    if (response) {
      setIsSubmitted(true);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (isSubmitted) {
    return (
      <section className="py-32 bg-transparent">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex p-6 rounded-full bg-gradient-to-r from-[#5CDD2B] to-[#1A9FFF] mb-6 shadow-lg shadow-[#5CDD2B]/30"
          >
            <CheckCircle2 className="h-12 w-12 text-white" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-[var(--font-grotesk)]"
          >
            Demo Request Submitted!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 font-medium"
          >
            Thank you for your interest. Our team will contact you within 24 hours
            to schedule your personalized demo.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                fullName: "",
                email: "",
                phone: "",
                schoolName: "",
                studentCount: "",
                board: "",
                preferredDate: "",
                preferredTime: "",
                problem: "",
                demoType: "product",
              });
            }}
            className="rounded-xl bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] px-8 py-3 text-white font-bold hover:shadow-xl transition-all shadow-lg shadow-[#0057C8]/30"
          >
            Submit Another Request
          </motion.button>
        </div>
      </section>
    );
  }

  return (
    <section id="form" className="py-32 bg-transparent relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0057C8]/5 dark:bg-[#0057C8]/10 border border-[#0057C8]/20 mb-6 backdrop-blur-md">
            <Calendar className="w-4 h-4 text-[#0057C8] dark:text-[#1A9FFF]" />
            <span className="text-sm font-bold text-[#0057C8] dark:text-[#1A9FFF]">
              Fill out the form below
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent font-[var(--font-grotesk)]">
            Book Your Free Demo
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">
            We'll get back to you within 24 hours to schedule your personalized
            demonstration
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
          {/* Demo Type Selection */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-4 text-sm font-bold">
              <Video size={18} className="text-[#0057C8] dark:text-[#1A9FFF]" />
              What would you like to see?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { value: "product", label: "Product Demo", icon: Sparkles },
                { value: "implementation", label: "Implementation", icon: Building2 },
                { value: "custom", label: "Custom Solution", icon: MessageSquare },
              ].map(({ value, label, icon: Icon }) => (
                <motion.button
                  key={value}
                  type="button"
                  onClick={() => handleChange("demoType", value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl border-2 transition-all backdrop-blur-md ${formData.demoType === value
                    ? "border-[#0057C8] bg-[#0057C8]/5 dark:bg-[#0057C8]/10 shadow-lg shadow-[#0057C8]/10"
                    : "border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0C1018] hover:border-[#0057C8]/50 dark:hover:border-[#0057C8]/50"
                    }`}
                >
                  <Icon
                    className={`w-5 h-5 mb-2 transition-colors duration-300 ${formData.demoType === value
                      ? "text-[#0057C8] dark:text-[#1A9FFF]"
                      : "text-gray-400 dark:text-gray-500"
                      }`}
                  />
                  <p
                    className={`text-sm font-bold transition-colors duration-300 ${formData.demoType === value
                      ? "text-[#0057C8] dark:text-[#1A9FFF]"
                      : "text-gray-600 dark:text-gray-400"
                      }`}
                  >
                    {label}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2 text-sm font-bold">
              <User size={16} className="text-[#0057C8] dark:text-[#1A9FFF]" />
              Full Name *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              onFocus={() => setActiveField("fullName")}
              onBlur={() => setActiveField(null)}
              placeholder="Enter your full name"
              className={`w-full rounded-xl bg-white/60 dark:bg-[#0C1018] border-2 backdrop-blur-md ${errors.fullName
                ? "border-red-500"
                : activeField === "fullName"
                  ? "border-[#0057C8]"
                  : "border-gray-200 dark:border-white/10"
                } px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0057C8]/30 transition-all shadow-sm font-medium`}
            />
            <AnimatePresence>
              {errors.fullName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-1 text-sm font-bold text-red-500"
                >
                  {errors.fullName}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Email and Phone */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2 text-sm font-bold">
                <Mail size={16} className="text-[#0057C8] dark:text-[#1A9FFF]" />
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onFocus={() => setActiveField("email")}
                onBlur={() => setActiveField(null)}
                placeholder="your.email@school.com"
                className={`w-full rounded-xl bg-white/60 dark:bg-[#0C1018] border-2 backdrop-blur-md ${errors.email
                  ? "border-red-500"
                  : activeField === "email"
                    ? "border-[#0057C8]"
                    : "border-gray-200 dark:border-white/10"
                  } px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0057C8]/30 transition-all shadow-sm font-medium`}
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 text-sm font-bold text-red-500"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2 text-sm font-bold">
                <Phone size={16} className="text-[#0057C8] dark:text-[#1A9FFF]" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                onFocus={() => setActiveField("phone")}
                onBlur={() => setActiveField(null)}
                placeholder="10-digit mobile number"
                className={`w-full rounded-xl bg-white/60 dark:bg-[#0C1018] border-2 backdrop-blur-md ${errors.phone
                  ? "border-red-500"
                  : activeField === "phone"
                    ? "border-[#0057C8]"
                    : "border-gray-200 dark:border-white/10"
                  } px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0057C8]/30 transition-all shadow-sm font-medium`}
              />
              <AnimatePresence>
                {errors.phone && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 text-sm font-bold text-red-500"
                  >
                    {errors.phone}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* School Name */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2 text-sm font-bold">
              <School size={16} className="text-[#0057C8] dark:text-[#1A9FFF]" />
              School Name *
            </label>
            <input
              type="text"
              value={formData.schoolName}
              onChange={(e) => handleChange("schoolName", e.target.value)}
              onFocus={() => setActiveField("schoolName")}
              onBlur={() => setActiveField(null)}
              placeholder="Enter your school name"
              className={`w-full rounded-xl bg-white/60 dark:bg-[#0C1018] border-2 backdrop-blur-md ${errors.schoolName
                ? "border-red-500"
                : activeField === "schoolName"
                  ? "border-[#0057C8]"
                  : "border-gray-200 dark:border-white/10"
                } px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0057C8]/30 transition-all shadow-sm font-medium`}
            />
            <AnimatePresence>
              {errors.schoolName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-1 text-sm font-bold text-red-500"
                >
                  {errors.schoolName}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Student Count and Board */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2 text-sm font-bold">
                <Users size={16} className="text-[#0057C8] dark:text-[#1A9FFF]" />
                Number of Students *
              </label>
              <input
                type="text"
                value={formData.studentCount}
                onChange={(e) => handleChange("studentCount", e.target.value)}
                onFocus={() => setActiveField("studentCount")}
                onBlur={() => setActiveField(null)}
                placeholder="e.g., 500, 1000-2000"
                className={`w-full rounded-xl bg-white/60 dark:bg-[#0C1018] border-2 backdrop-blur-md ${errors.studentCount
                  ? "border-red-500"
                  : activeField === "studentCount"
                    ? "border-[#0057C8]"
                    : "border-gray-200 dark:border-white/10"
                  } px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0057C8]/30 transition-all shadow-sm font-medium`}
              />
              <AnimatePresence>
                {errors.studentCount && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 text-sm font-bold text-red-500"
                  >
                    {errors.studentCount}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2 text-sm font-bold">
                <BookOpen size={16} className="text-[#0057C8] dark:text-[#1A9FFF]" />
                Education Board *
              </label>
              <select
                value={formData.board}
                onChange={(e) => handleChange("board", e.target.value)}
                onFocus={() => setActiveField("board")}
                onBlur={() => setActiveField(null)}
                className={`w-full rounded-xl bg-white/60 dark:bg-[#0C1018] border-2 backdrop-blur-md ${errors.board
                  ? "border-red-500"
                  : activeField === "board"
                    ? "border-[#0057C8]"
                    : "border-gray-200 dark:border-white/10"
                  } px-4 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0057C8]/30 transition-all shadow-sm font-medium`}
              >
                <option value="" className="bg-white dark:bg-[#0C1018]">
                  Select a board
                </option>
                <option value="CBSE" className="bg-white dark:bg-[#0C1018]">CBSE</option>
                <option value="ICSE" className="bg-white dark:bg-[#0C1018]">ICSE</option>
                <option value="State Board" className="bg-white dark:bg-[#0C1018]">
                  State Board
                </option>
                <option value="IB" className="bg-white dark:bg-[#0C1018]">
                  IB (International Baccalaureate)
                </option>
                <option value="IGCSE" className="bg-white dark:bg-[#0C1018]">IGCSE</option>
                <option value="Other" className="bg-white dark:bg-[#0C1018]">Other</option>
              </select>
              <AnimatePresence>
                {errors.board && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 text-sm font-bold text-red-500"
                  >
                    {errors.board}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Preferred Date and Time */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2 text-sm font-bold">
                <Calendar size={16} className="text-[#0057C8] dark:text-[#1A9FFF]" />
                Preferred Date
              </label>
              <input
                type="date"
                value={formData.preferredDate}
                onChange={(e) => handleChange("preferredDate", e.target.value)}
                onFocus={() => setActiveField("preferredDate")}
                onBlur={() => setActiveField(null)}
                min={getISTDateString()}
                className={`w-full rounded-xl bg-white/60 dark:bg-[#0C1018] border-2 backdrop-blur-md ${activeField === "preferredDate"
                  ? "border-[#0057C8]"
                  : "border-gray-200 dark:border-white/10"
                  } px-4 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0057C8]/30 transition-all shadow-sm font-medium`}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2 text-sm font-bold">
                <Clock size={16} className="text-[#0057C8] dark:text-[#1A9FFF]" />
                Preferred Time
              </label>
              <select
                value={formData.preferredTime}
                onChange={(e) => handleChange("preferredTime", e.target.value)}
                onFocus={() => setActiveField("preferredTime")}
                onBlur={() => setActiveField(null)}
                className={`w-full rounded-xl bg-white/60 dark:bg-[#0C1018] border-2 backdrop-blur-md ${activeField === "preferredTime"
                  ? "border-[#0057C8]"
                  : "border-gray-200 dark:border-white/10"
                  } px-4 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0057C8]/30 transition-all shadow-sm font-medium`}
              >
                <option value="" className="bg-white dark:bg-[#0C1018]">
                  Select preferred time
                </option>
                <option value="9-10 AM" className="bg-white dark:bg-[#0C1018]">
                  9:00 AM - 10:00 AM
                </option>
                <option value="10-11 AM" className="bg-white dark:bg-[#0C1018]">
                  10:00 AM - 11:00 AM
                </option>
                <option value="11-12 PM" className="bg-white dark:bg-[#0C1018]">
                  11:00 AM - 12:00 PM
                </option>
                <option value="2-3 PM" className="bg-white dark:bg-[#0C1018]">
                  2:00 PM - 3:00 PM
                </option>
                <option value="3-4 PM" className="bg-white dark:bg-[#0C1018]">
                  3:00 PM - 4:00 PM
                </option>
                <option value="4-5 PM" className="bg-white dark:bg-[#0C1018]">
                  4:00 PM - 5:00 PM
                </option>
              </select>
            </div>
          </div>

          {/* Problem Description */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2 text-sm font-bold">
              <MessageSquare size={16} className="text-[#0057C8] dark:text-[#1A9FFF]" />
              What problem are you trying to solve?
            </label>
            <textarea
              value={formData.problem}
              onChange={(e) => handleChange("problem", e.target.value)}
              onFocus={() => setActiveField("problem")}
              onBlur={() => setActiveField(null)}
              placeholder="Tell us about the challenges your school is facing or what you'd like to see in the demo..."
              rows={5}
              className={`w-full rounded-xl bg-white/60 dark:bg-[#0C1018] border-2 backdrop-blur-md ${activeField === "problem"
                ? "border-[#0057C8]"
                : "border-gray-200 dark:border-white/10"
                } px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0057C8]/30 transition-all resize-none shadow-sm font-medium`}
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="relative mt-4 rounded-xl bg-gradient-to-r from-[#0057C8] to-[#1A9FFF] px-10 py-4 text-white font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0057C8]/30"
          >
            {loading ? (
              <>
                <Loader className="" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Calendar size={20} />
                <span>Schedule Demo</span>
              </>
            )}
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
}
