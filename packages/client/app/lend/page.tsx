"use client";

import React, { useState } from "react";
import LenderDashboard from "../_components/LenderDashboard";
import RepaymentTracker from "../_components/RepaymentTracker";
import WalletAuthGuard from "../_components/WalletGuard";

const tabs = [
  { id: "offers", label: "Create Offers", icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  )},
  { id: "repayment", label: "Track Repayments", icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )},
];

export default function Lender() {
  const [lenderTab, setLenderTab] = useState<"offers" | "repayment">("offers");

  return (
    <WalletAuthGuard
      title="Lender Portal"
      description="Create confidential lending offers and automatically match with qualified borrowers based on encrypted credit scores."
      requireConnection={true}
    >
      <div className="relative w-full min-h-screen bg-[#0a0a0f] px-4 sm:px-8 py-8">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto pt-24">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-purple-500/30 text-purple-400 text-sm mb-4">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              Lender Dashboard
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              <span className="gradient-text">Confidential</span> Lending
            </h1>
            <p className="text-gray-500">Create offers and match with borrowers privately</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Active Offers", value: "0", icon: "📋" },
              { label: "Total Lent", value: "0 ETH", icon: "💰" },
              { label: "Expected Returns", value: "0%", icon: "📈" },
              { label: "Active Loans", value: "0", icon: "🤝" },
            ].map((stat, i) => (
              <div key={i} className="glass rounded-xl p-4 border border-white/5 hover:border-purple-500/20 transition-all">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">{stat.label}</div>
                <div className="text-white font-bold text-lg">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="card-cyber rounded-xl mb-6">
            <div className="flex gap-2 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLenderTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                    lenderTab === tab.id
                      ? "bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-400 border border-purple-500/30"
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="card-cyber rounded-xl p-6 md:p-8">
            {lenderTab === "offers" && <LenderDashboard />}
            {lenderTab === "repayment" && <RepaymentTracker />}
          </div>
        </div>
      </div>
    </WalletAuthGuard>
  );
}
