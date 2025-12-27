"use client";

import React, { useState } from "react";
import BorrowerForm from "../_components/BorrowerForm";
import BorrowerLoanRequest from "../_components/BorrowerLoanRequest";
import CollateralManager from "../_components/CollateralManager";
import CreditScoreDisplay from "../_components/CreditScoreDisplay";
import RepaymentTracker from "../_components/RepaymentTracker";
import WalletAuthGuard from "../_components/WalletGuard";

const tabs = [
  { id: "profile", label: "Profile & Credit", icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )},
  { id: "collateral", label: "Collateral", icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )},
  { id: "loans", label: "Loan Requests", icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )},
  { id: "repayment", label: "Repayments", icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )},
];

export default function Borrow() {
  const [borrowerTab, setBorrowerTab] = useState<"profile" | "collateral" | "loans" | "repayment">("profile");

  return (
    <WalletAuthGuard
      title="Borrower Portal"
      description="Submit your financial data confidentially and get matched with lenders based on your encrypted credit score."
      requireConnection={true}
    >
      <div className="relative w-full min-h-screen bg-[#0a0a0f] px-4 sm:px-8 py-8">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto pt-24">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-cyan-500/30 text-cyan-400 text-sm mb-4">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              Borrower Dashboard
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Your <span className="gradient-text">Encrypted</span> Profile
            </h1>
            <p className="text-gray-500">Manage your borrower data with complete privacy</p>
          </div>

          {/* Tab Navigation */}
          <div className="card-cyber rounded-xl mb-6">
            <div className="flex flex-wrap gap-2 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setBorrowerTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                    borrowerTab === tab.id
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30"
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="card-cyber rounded-xl p-6 md:p-8">
            {borrowerTab === "profile" && (
              <div className="space-y-8">
                <CreditScoreDisplay />
                <BorrowerForm />
              </div>
            )}
            {borrowerTab === "collateral" && <CollateralManager />}
            {borrowerTab === "loans" && <BorrowerLoanRequest />}
            {borrowerTab === "repayment" && <RepaymentTracker />}
          </div>
        </div>
      </div>
    </WalletAuthGuard>
  );
}
