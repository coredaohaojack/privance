"use client";

import React, { useEffect, useMemo, useState } from "react";
import { encryptData, getContract, hasCreditScore, hasSubmittedData } from "../lib/contract";
import { useFhevm } from "fhevm-sdk";
import { useAccount } from "wagmi";

interface FormData {
  income: string;
  repaymentScore: string;
  liabilities: string;
}

type FormState = "initial" | "submitted" | "editing";

export default function BorrowerForm() {
  const [form, setForm] = useState<FormData>({
    income: "",
    repaymentScore: "",
    liabilities: "",
  });
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<FormState>("initial");
  const [hasData, setHasData] = useState(false);
  const [hasComputedScore, setHasComputedScore] = useState(false);
  const { address, chain } = useAccount();

  const chainId = chain?.id;

  // Use working public RPC URL for SDK initialization
  // This fixes issues with MetaMask using old/dead RPC endpoints
  const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";

  const provider = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    // Use RPC URL instead of window.ethereum to avoid RPC issues
    // SDK will use this for contract queries
    return chainId === 11155111 ? SEPOLIA_RPC : (window as any).ethereum;
  }, [chainId]);

  const initialMockChains = { 31337: "http://localhost:8545" };

  const { instance: fhevmInstance, error: fhevmError, status: fhevmStatus } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: !!provider && !!chainId && !!address,
  });

  // Debug logging
  useEffect(() => {
    console.log("[BorrowerForm] FHEVM Status:", fhevmStatus);
    if (fhevmError) {
      console.error("[BorrowerForm] FHEVM Error:", fhevmError);
    }
    if (fhevmInstance) {
      console.log("[BorrowerForm] FHEVM Instance created successfully");
    }
  }, [fhevmStatus, fhevmError, fhevmInstance]);

  // Calculate preview metrics
  const previewMetrics = useMemo(() => {
    const income = parseFloat(form.income) || 0;
    const repaymentScore = parseFloat(form.repaymentScore) || 0;
    const liabilities = parseFloat(form.liabilities) || 0;

    // Debt-to-Income Ratio
    const dtiRatio = income > 0 ? (liabilities / income) * 100 : 0;

    // Estimated Credit Score (same formula as contract)
    // repaymentComponent = 300 + (repaymentScore * 2)
    const repaymentComponent = 300 + (repaymentScore * 2);

    // debtComponent based on DTI
    let debtComponent = 0;
    if (dtiRatio <= 30) {
      debtComponent = 350;
    } else if (dtiRatio < 50) {
      debtComponent = 200;
    } else {
      debtComponent = 0;
    }

    // Raw score clamped between 300-850
    let estimatedScore = repaymentComponent + debtComponent;
    estimatedScore = Math.max(300, Math.min(850, estimatedScore));

    // Risk level
    let riskLevel = "Unknown";
    let riskColor = "text-gray-400";
    if (estimatedScore >= 750) {
      riskLevel = "Excellent";
      riskColor = "text-green-400";
    } else if (estimatedScore >= 700) {
      riskLevel = "Good";
      riskColor = "text-cyan-400";
    } else if (estimatedScore >= 650) {
      riskLevel = "Fair";
      riskColor = "text-yellow-400";
    } else if (estimatedScore >= 550) {
      riskLevel = "Poor";
      riskColor = "text-orange-400";
    } else {
      riskLevel = "Very Poor";
      riskColor = "text-red-400";
    }

    return {
      income,
      repaymentScore,
      liabilities,
      dtiRatio,
      estimatedScore,
      riskLevel,
      riskColor,
      isComplete: income > 0 && repaymentScore >= 0 && repaymentScore <= 100,
    };
  }, [form]);

  useEffect(() => {
    checkOnchainState();
  }, [address]);

  const checkOnchainState = async () => {
    if (!address) return;

    try {
      console.log("Checking on-chain state...");
      const [submitted, computed] = await Promise.all([hasSubmittedData(), hasCreditScore()]);

      setHasData(submitted);
      setHasComputedScore(computed);

      if (submitted && !computed) {
        setFormState("submitted");
      } else if (computed) {
        setFormState("submitted");
      }

      console.log("On-chain state:", { submitted, computed });
    } catch (error) {
      console.error("Error checking on-chain state:", error);
    }
  };

  const toHexString = (bytes: Uint8Array) =>
    "0x" +
    Array.from(bytes)
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fhevmInstance) {
      alert("FHEVM instance not initialized. Please wait and try again.");
      return;
    }

    if (!address) {
      alert("Please connect your wallet first.");
      return;
    }

    const income = BigInt(form.income);
    const repaymentScore = BigInt(form.repaymentScore);
    const liabilities = BigInt(form.liabilities);

    if (income === 0n) {
      alert("Income cannot be zero");
      return;
    }

    if (repaymentScore > 100n) {
      alert("Repayment score must be between 0 and 100");
      return;
    }

    setLoading(true);

    try {
      console.log("=== Starting Submission ===");
      console.log("Input values:", { income, repaymentScore, liabilities });

      const incomeEncrypted = await encryptData(fhevmInstance, income, address);
      const repaymentScoreEncrypted = await encryptData(fhevmInstance, repaymentScore, address);
      const liabilitiesEncrypted = await encryptData(fhevmInstance, liabilities, address);

      const contract = await getContract();

      const params = [
        incomeEncrypted.handles[0],
        toHexString(incomeEncrypted.inputProof),
        repaymentScoreEncrypted.handles[0],
        toHexString(repaymentScoreEncrypted.inputProof),
        liabilitiesEncrypted.handles[0],
        toHexString(liabilitiesEncrypted.inputProof),
      ];

      const tx = await contract.submitBorrowerData(...params, {
        gasLimit: 5000000,
      });

      const receipt = await tx.wait();
      console.log("Transaction confirmed in block:", receipt.blockNumber);

      setHasData(true);
      setFormState("submitted");

      alert("Data submitted successfully! Your information is encrypted on-chain.");

      if (!hasData) {
        setForm({
          income: "",
          repaymentScore: "",
          liabilities: "",
        });
      }
    } catch (err: any) {
      console.error("Submission error:", err);

      let errorMessage = "Transaction failed. ";

      if (err.message.includes("user rejected")) {
        errorMessage = "Transaction was rejected by user.";
      } else if (err.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas fees.";
      } else if (err.message.includes("execution reverted")) {
        errorMessage =
          "Contract execution reverted. Please check:\n" +
          "1. Contract is properly deployed\n" +
          "2. FHEVM gateway is running\n" +
          "3. You're on the correct network";
      } else if (err.reason) {
        errorMessage += `Reason: ${err.reason}`;
      } else if (err.message) {
        errorMessage += err.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditData = () => {
    setFormState("initial");
  };

  const handleResetData = () => {
    setFormState("initial");
    setHasData(false);
    setHasComputedScore(false);
    setForm({
      income: "",
      repaymentScore: "",
      liabilities: "",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderPreviewPanel = () => {
    const hasAnyInput = form.income || form.repaymentScore || form.liabilities;

    if (!hasAnyInput) return null;

    return (
      <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Live Preview</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Income */}
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-slate-400">Annual Income</span>
            </div>
            <p className="text-lg font-bold text-white">
              {previewMetrics.income > 0 ? formatCurrency(previewMetrics.income) : "--"}
            </p>
          </div>

          {/* Liabilities */}
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              <span className="text-xs text-slate-400">Total Liabilities</span>
            </div>
            <p className="text-lg font-bold text-white">
              {previewMetrics.liabilities > 0 ? formatCurrency(previewMetrics.liabilities) : "--"}
            </p>
          </div>

          {/* Repayment Score */}
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-slate-400">Repayment Score</span>
            </div>
            <p className="text-lg font-bold text-white">
              {form.repaymentScore ? `${previewMetrics.repaymentScore}/100` : "--"}
            </p>
          </div>

          {/* DTI Ratio */}
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs text-slate-400">Debt-to-Income</span>
            </div>
            <p className={`text-lg font-bold ${previewMetrics.dtiRatio > 50 ? "text-red-400" : previewMetrics.dtiRatio > 30 ? "text-yellow-400" : "text-green-400"}`}>
              {previewMetrics.income > 0 ? `${previewMetrics.dtiRatio.toFixed(1)}%` : "--"}
            </p>
          </div>
        </div>

        {/* Estimated Credit Score */}
        {previewMetrics.isComplete && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Estimated Credit Score</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-white">{previewMetrics.estimatedScore}</span>
                  <span className={`text-sm font-medium ${previewMetrics.riskColor}`}>
                    {previewMetrics.riskLevel}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 relative">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-slate-700"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${((previewMetrics.estimatedScore - 300) / 550) * 176} 176`}
                      className="text-cyan-400"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-slate-400">/ 850</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score breakdown hint */}
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <p className="text-xs text-slate-500">
                Score = Repayment Component ({300 + previewMetrics.repaymentScore * 2}) +
                Debt Component ({previewMetrics.dtiRatio <= 30 ? 350 : previewMetrics.dtiRatio < 50 ? 200 : 0})
              </p>
            </div>
          </div>
        )}

        {!previewMetrics.isComplete && (
          <div className="p-3 rounded-lg bg-slate-800/30 border border-dashed border-slate-600">
            <p className="text-xs text-slate-500 text-center">
              Complete all fields to see your estimated credit score
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderFormContent = () => {
    switch (formState) {
      case "submitted":
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-600 flex items-center justify-center mx-auto rounded-full">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Data Successfully Submitted!</h3>
              <p className="text-slate-400 text-sm">
                Your financial information is securely encrypted on the blockchain.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleEditData}
                className="px-6 py-2 bg-[#98E29D] text-gray-900 font-medium transition rounded-lg hover:bg-[#7ed183]"
              >
                Update Data
              </button>
              <button
                onClick={handleResetData}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium transition rounded-lg"
              >
                Start Over
              </button>
            </div>
            {hasComputedScore && (
              <div className="mt-4 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <p className="text-sm text-slate-400">
                  Your credit score has been computed. Check the Credit Score section to view it.
                </p>
              </div>
            )}
            {!hasComputedScore && (
              <div className="mt-4 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <p className="text-sm text-slate-400">
                  Ready to compute your credit score? Navigate to the Credit Score section.
                </p>
              </div>
            )}
          </div>
        );

      case "initial":
      default:
        return (
          <>
            <h2 className="text-xl font-semibold text-white mb-6">
              {hasData ? "Update Your Information" : "Submit Your Information"}
            </h2>

            {!address && (
              <div className="mb-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-purple-300 font-medium">Wallet Required</p>
                    <p className="text-purple-400/70 text-sm">Please connect your wallet to submit encrypted data</p>
                  </div>
                </div>
              </div>
            )}

            {address && !fhevmInstance && !fhevmError && (
              <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <p className="text-blue-400 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Initializing encryption system... (Status: {fhevmStatus})
                </p>
              </div>
            )}

            {fhevmError && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                <p className="text-red-400 text-sm">
                  <strong>Encryption Error:</strong> {fhevmError.message}
                </p>
                <p className="text-red-400/70 text-xs mt-1">
                  Please check console for details. Status: {fhevmStatus}
                </p>
              </div>
            )}

            {hasData && (
              <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
                <p className="text-blue-400 text-sm">
                  You have existing data on-chain. Updating will overwrite your current information.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Annual Income</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    placeholder="50000"
                    value={form.income}
                    onChange={e => setForm({ ...form, income: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                    required
                    min="1"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">Must be greater than 0</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Repayment Score</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0-100"
                    min="0"
                    max="100"
                    value={form.repaymentScore}
                    onChange={e => setForm({ ...form, repaymentScore: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                    required
                  />
                  {form.repaymentScore && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                        <span className={`text-xs font-bold ${parseFloat(form.repaymentScore) >= 70 ? "text-green-400" : parseFloat(form.repaymentScore) >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                          {form.repaymentScore}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-2 h-1 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      parseFloat(form.repaymentScore) >= 70 ? "bg-green-400" :
                      parseFloat(form.repaymentScore) >= 40 ? "bg-yellow-400" : "bg-red-400"
                    }`}
                    style={{ width: `${Math.min(100, parseFloat(form.repaymentScore) || 0)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">Enter a score between 0 and 100</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Total Liabilities</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    placeholder="10000"
                    value={form.liabilities}
                    onChange={e => setForm({ ...form, liabilities: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* Live Preview Panel */}
              {renderPreviewPanel()}

              <button
                type="submit"
                disabled={loading || !fhevmInstance || !address}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white disabled:from-slate-600 disabled:to-slate-700 rounded-lg font-semibold transition-all duration-200 transform disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {hasData ? "Updating Data..." : "Encrypting & Submitting..."}
                  </span>
                ) : !address ? (
                  "Connect Wallet to Continue"
                ) : !fhevmInstance ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Initializing encryption...
                  </span>
                ) : hasData ? (
                  "Update Encrypted Data"
                ) : (
                  "Submit Encrypted Data"
                )}
              </button>
            </form>
          </>
        );
    }
  };

  return (
    <div className="glass rounded-xl border border-white/5 p-8">
      {renderFormContent()}

      {formState === "initial" && (
        <div className="mt-6 p-4 glass rounded-xl border border-cyan-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-400">
                Your data is fully encrypted using homomorphic encryption before being sent to the blockchain
              </p>
              <p className="text-xs text-gray-500">
                <span className="text-cyan-400">✓</span> End-to-end encryption <span className="text-cyan-400">✓</span> Privacy-preserving computation <span className="text-cyan-400">✓</span> No plaintext exposure
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
