import React from "react";
import DashboardAspirasi from "./components/DashboardAspirasi";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-white to-purple-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="p-6 bg-gradient-to-r from-purple-700 via-purple-500 to-purple-400 text-white shadow-lg">
        <h1 className="text-3xl font-extrabold tracking-wide">
          📈 Dashboard Aspirasi Masyarakat
        </h1>
      </header>

      {/* Main */}
      <main className="p-6">
        <DashboardAspirasi />
      </main>

      {/* Footer */}
      <footer className="p-4 text-center bg-gradient-to-r from-yellow-400 via-orange-300 to-purple-400 text-gray-900 font-medium shadow-inner mt-6">
        © {new Date().getFullYear()} 
      </footer>
    </div>
  );
}

export default App;
