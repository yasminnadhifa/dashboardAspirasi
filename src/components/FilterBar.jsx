import React from "react";

const FilterBar = ({ filters, setFilters, data }) => {
  // Ambil nilai unik dari kolom tertentu
  const uniqueValues = (key) => {
    const values = Array.from(new Set(data.map((d) => d[key]).filter(Boolean)));
    return ["Semua", ...values];
  };

  return (
    <div className="flex flex-wrap gap-4 bg-gradient-to-r from-purple-50 via-yellow-50 to-purple-50 p-4 rounded-xl mb-6 shadow-sm border border-purple-200">
      {[
        { key: "kategori_aspirasi", label: "Kategori Aspirasi" },
        { key: "status_aspirasi", label: "Status Aspirasi" },
        { key: "prioritas", label: "Prioritas" },
      ].map(({ key, label }) => (
        <div key={key}>
          <label className="block text-sm font-semibold text-purple-800 mb-1">
            {label}
          </label>
          <select
            value={filters[key]}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, [key]: e.target.value }))
            }
            className="border border-yellow-300 rounded-lg p-2 bg-white text-gray-800 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          >
            {uniqueValues(key).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

export default FilterBar;
