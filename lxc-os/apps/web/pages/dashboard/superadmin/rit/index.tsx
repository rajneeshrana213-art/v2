import Head from "next/head";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { Sparkles, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function RitDashboardPage() {
  return (
    <DashboardLayout role="superadmin">
      <Head>
        <title>RIT AI Dashboard | LearnXChain</title>
        <meta name="description" content="RIT AI Product Workspace Dashboard" />
      </Head>

      <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1600px] mx-auto w-full min-h-[80vh]">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">RIT AI Dashboard</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Fresh workspace layout ready for the integration of the RIT AI Classroom and services.
          </p>
        </div>

        {/* Empty State Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="group relative flex flex-col justify-between p-6 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-white/50 dark:bg-gray-900/10 backdrop-blur-sm hover:border-indigo-500/50 hover:bg-white dark:hover:bg-gray-900/25 transition-all duration-300 min-h-[200px] cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 transition">
                <Plus className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-50 group-hover:text-indigo-500 transition">Add AI Component</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Integrate models, chatbot modules, or telemetry tools here.
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 group-hover:text-indigo-400 transition">
              Ready to configure
            </span>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="group relative flex flex-col justify-between p-6 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-white/50 dark:bg-gray-900/10 backdrop-blur-sm hover:border-indigo-500/50 hover:bg-white dark:hover:bg-gray-900/25 transition-all duration-300 min-h-[200px] cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 transition">
                <Plus className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-50 group-hover:text-indigo-500 transition">Interactive Widgets</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Place charts, performance logs, or pipeline metrics here.
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 group-hover:text-indigo-400 transition">
              Ready to configure
            </span>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="group relative flex flex-col justify-between p-6 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-white/50 dark:bg-gray-900/10 backdrop-blur-sm hover:border-indigo-500/50 hover:bg-white dark:hover:bg-gray-900/25 transition-all duration-300 min-h-[200px] cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 transition">
                <Plus className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-50 group-hover:text-indigo-500 transition">Agent Orchestrations</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Embed classrooms, active sessions, or direct pipelines here.
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 group-hover:text-indigo-400 transition">
              Ready to configure
            </span>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="group relative flex flex-col justify-between p-6 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-white/50 dark:bg-gray-900/10 backdrop-blur-sm hover:border-indigo-500/50 hover:bg-white dark:hover:bg-gray-900/25 transition-all duration-300 min-h-[200px] cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 transition">
                <Plus className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-50 group-hover:text-indigo-500 transition">Custom Action Tools</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Hook custom triggers, solver testing, or telemetry indicators.
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 group-hover:text-indigo-400 transition">
              Ready to configure
            </span>
          </motion.div>
        </div>

        {/* Bottom blank premium area */}
        <div className="flex-1 min-h-[350px] rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-black/5 flex items-center justify-center p-8">
          <div className="text-center max-w-sm">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Central Canvas Area</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 leading-relaxed">
              This area is ready to host the primary workspace visualization, chat interface, or model tracking monitors.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
