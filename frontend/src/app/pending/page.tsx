"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 text-white font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className="bg-[#0A0A0A] border border-neutral-800 rounded-2xl p-10 shadow-2xl">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="text-blue-500" size={32} />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Registration Received</h1>
          <p className="text-neutral-400 mb-8 leading-relaxed">
            Your account has been created successfully. For security reasons, all new accounts require manual verification by an administrator before access is granted.
          </p>
          
          <div className="space-y-4">
             <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-500">
                Contact your team lead or administrator to expedite this process.
             </div>
             
             <Link href="/login" className="block w-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 rounded-lg transition-colors">
                Back to Login
             </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
