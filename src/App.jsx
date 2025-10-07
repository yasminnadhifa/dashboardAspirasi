import React from "react";
import DashboardAspirasi from "./components/DashboardAspirasi";
import FloatingHelpButton from "./components/FloatingHelpButton";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-white to-purple-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="p-6 bg-gradient-to-r from-purple-700 via-purple-500 to-purple-400 text-white shadow-lg">
        <div className="flex items-center space-x-4">
          <img src="/logo.png" alt="Logo" className="h-12 w-15" />
          <h1 className="text-3xl font-extrabold tracking-wide">
            SIMO’ODI (Sistem Informasi Monitoring Data Aspirasi)
          </h1>
        </div>
      </header>

      {/* Main */}
      <main className="p-6">
        <DashboardAspirasi />
      </main>
      <FloatingHelpButton></FloatingHelpButton>
      {/* Footer */}
      <footer className="p-4 text-center bg-gradient-to-r from-yellow-400 via-orange-300 to-purple-400 text-gray-900 font-medium shadow-inner mt-6">
        © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;
