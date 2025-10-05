import React, { useState } from "react";
import { MessageCircle, Mail, HelpCircle } from "lucide-react";

const FloatingHelpButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end z-50">
      {/* Tombol anak: WA & Email */}
      <div
        className={`flex flex-col items-end mb-3 space-y-3 transition-all duration-300 ${
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* WhatsApp */}
        <a
          href="https://wa.me/6281188819656"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-full shadow-md text-sm font-medium transition"
        >
          <MessageCircle size={18} />
          WhatsApp
        </a>

        {/* Email */}
        <a
          href="mailto:simoodi.dpdri@gmail.com"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-full shadow-md text-sm font-medium transition"
        >
          <Mail size={18} />
          Email
        </a>
      </div>

      {/* Tombol utama (Help) */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg hover:scale-105 transition-transform"
        aria-label="Help"
      >
        <HelpCircle size={26} />
      </button>
    </div>
  );
};

export default FloatingHelpButton;
