"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

// Dynamic navigation links data
const navLinks = [
  { href: "/customer", label: "Customer" },
  { href: "/retailer", label: "Retailer" },
  { href: "/dealer", label: "Dealer" },
  { href: "/admin", label: "Admin" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-md">
      <nav className="border-gray-500 px-4 lg:px-4 py-2.5">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen5xl">
          <Link href="/" className="flex items-center">
            <span className="self-center text-xl font-semibold whitespace-nowrap">
              Vital-E
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            type="button"
            className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-controls="mobile-menu"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Toggle menu</span>
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:order-1 lg:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-black bg-transparent hover:bg-gray-100 font-medium rounded-lg text-lg px-5 py-2.5 transition-colors ${
                  pathname === link.href ? "bg-gray-200" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile navigation */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } lg:hidden w-full transition-all duration-300 ease-in-out`}
          id="mobile-menu"
        >
          <div className="flex flex-col space-y-2 mt-4 pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-black hover:bg-gray-100 font-medium rounded-lg text-lg px-4 py-2.5 block transition-colors ${
                  pathname === link.href ? "bg-gray-200" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
