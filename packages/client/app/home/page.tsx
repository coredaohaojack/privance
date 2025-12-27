"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Animated particles component
const ParticleField = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
};

// Floating orbs background
const FloatingOrbs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );
};

// Cyber grid lines
const CyberGrid = () => {
  return (
    <div className="absolute inset-0 cyber-grid opacity-30" />
  );
};

// Stats counter animation
const AnimatedCounter = ({ end, suffix = "" }: { end: number; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [end]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

export default function HomePage() {
  const [showDownArrow, setShowDownArrow] = useState(true);
  const router = useRouter();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollDown = () => {
    scrollToSection("features");
    setShowDownArrow(false);
  };

  const handleScrollUp = () => {
    scrollToSection("hero");
    setShowDownArrow(true);
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#0a0a0f]">
      {/* ===== HERO SECTION ===== */}
      <section id="hero" className="relative min-h-screen flex flex-col justify-center items-center pt-20 overflow-hidden">
        <CyberGrid />
        <FloatingOrbs />
        <ParticleField />

        {/* Animated gradient border frame */}
        <div className="absolute inset-4 md:inset-8 border border-cyan-500/20 rounded-lg pointer-events-none">
          <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-purple-400 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-purple-400 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 border border-cyan-500/30">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-cyan-400 text-sm font-medium">Powered by Fully Homomorphic Encryption</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            <span className="text-white">Privacy-First</span>
            <br />
            <span className="gradient-text">DeFi Lending</span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Compute your credit score and match with lenders —
            <span className="text-cyan-400"> without revealing your financial data</span>.
            Your data stays encrypted, always.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => router.push("/borrow")}
              className="btn-cyber px-8 py-4 text-black font-bold text-lg rounded-lg"
            >
              Start Borrowing
            </button>
            <button
              onClick={() => router.push("/lend")}
              className="btn-outline-cyber px-8 py-4 font-semibold text-lg rounded-lg"
            >
              Become a Lender
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { value: 100, suffix: "%", label: "Data Encrypted" },
              { value: 0, suffix: "", label: "Data Exposed" },
              { value: 24, suffix: "/7", label: "Privacy Protected" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-1">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        {showDownArrow && (
          <button
            onClick={handleScrollDown}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors animate-bounce"
          >
            <span className="text-sm">Explore</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="relative py-32 px-6">
        <FloatingOrbs />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Core <span className="gradient-text">Features</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Three pillars of privacy-preserving DeFi built on cutting-edge cryptography
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: "Confidential Borrowing",
                desc: "Encrypt your income, liabilities, and repayment history. Your financial data never leaves your control.",
                color: "cyan",
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Private Lending",
                desc: "Analyze encrypted borrower data without ever accessing personal details. Fair evaluation guaranteed.",
                color: "purple",
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                ),
                title: "Decentralized Trust",
                desc: "Smart contracts manage all scoring and matching. No intermediaries, no central databases, no trust issues.",
                color: "fuchsia",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group card-cyber rounded-xl p-8 hover-lift"
              >
                <div className={`w-16 h-16 rounded-xl bg-${feature.color}-500/10 border border-${feature.color}-500/30 flex items-center justify-center mb-6 text-${feature.color}-400 group-hover:glow-${feature.color} transition-all duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-32 px-6">
        <CyberGrid />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How <span className="gradient-text">Privance</span> Works
            </h2>
            <p className="text-gray-400 text-lg">Four simple steps to private lending</p>
          </div>

          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Encrypt Your Financial Data",
                desc: "Your income, liabilities, and repayment history are encrypted in your browser before anything touches the blockchain.",
              },
              {
                step: "02",
                title: "On-Chain Confidential Computation",
                desc: "FHEVM smart contracts compute your credit score directly on encrypted data using homomorphic operations.",
              },
              {
                step: "03",
                title: "Private Decryption",
                desc: "Only you can decrypt your computed credit score locally using your wallet-linked FHE keys.",
              },
              {
                step: "04",
                title: "Secure Marketplace Matching",
                desc: "Lenders set encrypted criteria. Matching happens on-chain without revealing scores or identities.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 group">
                <div className="flex-shrink-0 relative">
                  <div className="w-16 h-16 rounded-xl glass flex items-center justify-center border border-cyan-500/30 group-hover:border-cyan-400/60 transition-all">
                    <span className="text-2xl font-bold gradient-text">{item.step}</span>
                  </div>
                  {i < 3 && (
                    <div className="absolute top-16 left-1/2 w-px h-8 bg-gradient-to-b from-cyan-500/50 to-transparent" />
                  )}
                </div>
                <div className="flex-1 glass rounded-xl p-6 border border-white/5 group-hover:border-cyan-500/20 transition-all">
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY FHEVM ===== */}
      <section className="relative py-32 px-6 overflow-hidden">
        <FloatingOrbs />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why <span className="gradient-text">FHEVM</span>?
            </h2>
            <p className="text-gray-400 text-lg">The future of confidential computing on blockchain</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🔐",
                title: "True Privacy",
                desc: "End-to-end encryption. No plaintext ever touches the blockchain.",
              },
              {
                icon: "⚡",
                title: "Confidential Compute",
                desc: "Smart contracts operate on encrypted data without decryption.",
              },
              {
                icon: "⚖️",
                title: "Fair Lending",
                desc: "Objective assessment without personal bias or data exposure.",
              },
              {
                icon: "✓",
                title: "Compliant",
                desc: "Aligned with GDPR and PDPA privacy frameworks by design.",
              },
            ].map((item, i) => (
              <div key={i} className="glass rounded-xl p-6 border border-white/5 hover:border-purple-500/30 transition-all hover-lift text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TECH STACK ===== */}
      <section className="relative py-32 px-6">
        <CyberGrid />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="card-cyber rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Built on <span className="gradient-text">FHEVM</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Privance leverages Fully Homomorphic Encryption to enable confidential smart contracts.
              Deployed on Sepolia testnet, pioneering privacy-preserving DeFi.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="glass rounded-xl p-6 border border-cyan-500/20">
                <div className="text-cyan-400 font-bold text-lg mb-2">Sepolia Testnet</div>
                <p className="text-gray-400 text-sm">Test with Sepolia ETH. Experience encrypted lending risk-free.</p>
              </div>
              <div className="glass rounded-xl p-6 border border-purple-500/20">
                <div className="text-purple-400 font-bold text-lg mb-2">FHEVM Technology</div>
                <p className="text-gray-400 text-sm">Computation on encrypted data without exposing plaintext values.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/zama-ai/fhevm"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cyber px-6 py-3 text-black font-semibold rounded-lg inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Explore FHEVM
              </a>
              <a
                href="https://www.zama.ai/fhevm"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-cyber px-6 py-3 font-semibold rounded-lg"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative py-32 px-6" id="cta">
        <FloatingOrbs />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Experience <span className="gradient-text">Encrypted Finance</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Privance is live on Sepolia. Compute your confidential credit score
            and join the future of privacy-preserving DeFi lending.
          </p>
          <button
            onClick={() => router.push("/borrow")}
            className="btn-cyber px-10 py-5 text-black font-bold text-xl rounded-xl"
          >
            Try the MVP Now
          </button>
        </div>
      </section>

      {/* Scroll to top button */}
      {!showDownArrow && (
        <button
          onClick={handleScrollUp}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-xl glass border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:border-cyan-400 hover:glow-cyan transition-all z-50"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
