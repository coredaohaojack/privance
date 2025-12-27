"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

function NavbarWalletConnect() {
  const { address, isConnected } = useAccount();

  return (
    <div className="flex items-center gap-3">
      {isConnected && address ? (
        <ConnectButton.Custom>
          {({ openAccountModal }) => (
            <button
              onClick={openAccountModal}
              className="hidden md:flex items-center gap-2 px-4 py-2
                         glass rounded-lg border border-cyan-500/30
                         hover:border-cyan-400/60 transition-all duration-200
                         text-cyan-400 text-sm font-mono"
            >
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span>
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </button>
          )}
        </ConnectButton.Custom>
      ) : (
        <ConnectButton.Custom>
          {({ openConnectModal, mounted }) => {
            const ready = mounted;
            return (
              <div
                {...(!ready && {
                  "aria-hidden": true,
                  style: {
                    opacity: 0,
                    pointerEvents: "none",
                    userSelect: "none",
                  },
                })}
              >
                <button
                  onClick={openConnectModal}
                  type="button"
                  className="btn-cyber px-5 py-2.5 text-sm font-semibold text-black rounded-lg"
                >
                  Connect Wallet
                </button>
              </div>
            );
          }}
        </ConnectButton.Custom>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Borrow", href: "/borrow" },
    { name: "Lend", href: "/lend" },
    { name: "Marketplace", href: "/marketplace" },
  ];

  return (
    <nav className="fixed w-full z-50 glass-strong border-b border-white/5">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <span className="text-black font-bold text-xl">P</span>
            </div>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
          </div>
          <span className="text-xl font-bold text-white hidden sm:block">
            Privance
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 glass rounded-full px-2 py-1 border border-white/5">
          {navLinks.map(link => {
            const isActive = pathname === link.href || (link.href === "/" && pathname === "/home");
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-black bg-gradient-to-r from-cyan-400 to-purple-500"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Wallet Connect */}
        <div className="hidden md:flex">
          <NavbarWalletConnect />
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden w-10 h-10 rounded-lg glass border border-white/10 flex items-center justify-center text-white"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden glass border-t border-white/5 transition-all duration-300 ease-in-out overflow-hidden ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-4 space-y-2">
          {navLinks.map(link => {
            const isActive = pathname === link.href || (link.href === "/" && pathname === "/home");
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-400/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-white/10">
            <NavbarWalletConnect />
          </div>
        </div>
      </div>
    </nav>
  );
}
