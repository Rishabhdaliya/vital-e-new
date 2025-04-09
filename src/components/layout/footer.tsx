"use client";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="  border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-8 md:py-8">
        {/* Bottom Bar */}
        <div className=" flex flex-col md:flex-row justify-center items-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © {currentYear}{" "}
            <span className="text-[#f04d46] font-bold">VITAL-E</span>&nbsp;
            Voucher System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
