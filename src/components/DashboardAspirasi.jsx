import React, { useState, useEffect } from "react";
import * as echarts from "echarts";
import { motion } from "framer-motion";
import { readExcelFile } from "../utils/excelReader";
import ChartCard from "./ChartCard";
import DataTable from "./DataTable";
import FilterBar from "./FilterBar";
import indonesiaGeo from "../../public/indonesia.json";

const DashboardAspirasi = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    "Kategori Aspirasi": "Semua",
    "Status Aspirasi": "Semua",
    "Prioritas": "Semua",
  });

  useEffect(() => {
    echarts.registerMap("Indonesia", indonesiaGeo);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const result = await readExcelFile(file);
      const normalized = result.map((item) => {
        const newItem = {};
        Object.keys(item).forEach((key) => {
          const cleanKey = key
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[()]/g, "")
            .replace(/\//g, "_");
          newItem[cleanKey] = item[key];
        });
        return newItem;
      });
      setData(normalized);
    }
  };

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gradient-to-br from-purple-50 to-white">
        <h1 className="text-4xl font-extrabold text-purple-700 mb-4">
          📊 
        </h1>
        <p className="text-gray-600 mb-6 max-w-lg">
          Unggah file Excel berisi data aspirasi untuk menampilkan analisis
          visual yang interaktif dan informatif.
        </p>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="border border-purple-400 bg-white rounded-lg px-4 py-2 text-gray-700 cursor-pointer shadow hover:shadow-md transition"
        />
      </div>
    );
  }

  // === Filtered data ===
  const filtered = data.filter((row) =>
    Object.keys(filters).every(
      (key) => filters[key] === "Semua" || row[key] === filters[key]
    )
  );

  const countBy = (key) =>
    filtered.reduce((acc, d) => {
      acc[d[key]] = (acc[d[key]] || 0) + 1;
      return acc;
    }, {});

  const statusCount = countBy("status_aspirasi");
  const kategoriCount = countBy("kategori_aspirasi");
  const prioritasCount = countBy("prioritas");

  const provCount = filtered.reduce((acc, d) => {
    const prov = d.asal_daerah_prov_kab_kec_desa?.split("/")[0]?.trim();
    if (prov) acc[prov] = (acc[prov] || 0) + 1;
    return acc;
  }, {});

  const totalAnggaran = filtered
    .map((d) => Number(String(d.estimasi_anggaran).replace(/\D/g, "")) || 0)
    .reduce((a, b) => a + b, 0);

  const progressRata =
    filtered.length > 0
      ? filtered
          .map(
            (d) => parseFloat(String(d.progress_update).replace("%", "")) || 0
          )
          .reduce((a, b) => a + b, 0) / filtered.length
      : 0;

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="bg-gradient-to-br from-white via-purple-50/30 to-white min-h-screen text-gray-800">
      <div className="max-w-[90rem] mx-auto px-8 md:px-10 py-6 md:py-8 space-y-16">


        {/* === HERO & SUMMARY === */}
        <motion.section initial="hidden" whileInView="show" variants={fadeIn}>
          <h1 className="text-4xl font-extrabold text-purple-700 mb-2">
            Aspirasi Masyarakat Indonesia
          </h1>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Dashboard interaktif yang menampilkan analisis sebaran, prioritas, dan status penanganan aspirasi masyarakat.
          </p>
          <FilterBar filters={filters} setFilters={setFilters} data={data} />

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            {[
              { title: "Total Aspirasi", value: filtered.length, color: "bg-purple-600 text-white" },
              { title: "Total Anggaran", value: `Rp ${totalAnggaran.toLocaleString()}`, color: "bg-yellow-400 text-gray-900" },
              { title: "Sedang Diproses", value: statusCount["Diproses"] || 0, color: "bg-green-400 text-gray-900" },
              { title: "Direalisasikan", value: statusCount["Direalisasikan"] || 0, color: "bg-orange-400 text-gray-900" },
              { title: "Rata-rata Progress", value: `${progressRata.toFixed(1)}%`, color: "bg-purple-200 text-gray-900" },
            ].map((c, i) => (
              <div key={i} className={`${c.color} p-4 rounded-xl shadow text-center`}>
                <p className="text-sm opacity-80">{c.title}</p>
                <h3 className="text-2xl font-bold">{c.value}</h3>
              </div>
            ))}
          </div>
        </motion.section>

        {/* === CHARTS === */}
        <motion.section variants={fadeIn} initial="hidden" whileInView="show">
          <h2 className="text-3xl font-bold border-l-4 border-purple-500 pl-3 mb-6">
            Sebaran & Status Aspirasi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Sebaran Aspirasi per Provinsi" chartData={{ type: "map", data: Object.entries(provCount).map(([n, v]) => ({ name: n, value: v })) }} />
            <ChartCard title="Distribusi Status Aspirasi" chartData={{ type: "pie", data: Object.entries(statusCount).map(([n, v]) => ({ name: n, value: v })) }} />
          </div>
        </motion.section>

        <motion.section variants={fadeIn} initial="hidden" whileInView="show">
          <h2 className="text-3xl font-bold border-l-4 border-purple-500 pl-3 mb-6">
            Kategori & Prioritas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Kategori Aspirasi" chartData={{ type: "bar", orientation: "horizontal", data: Object.entries(kategoriCount).map(([n, v]) => ({ name: n, value: v })) }} />
            <ChartCard title="Prioritas Aspirasi" chartData={{ type: "bar", data: Object.entries(prioritasCount).map(([n, v]) => ({ name: n, value: v })) }} />
          </div>
        </motion.section>

        <motion.section variants={fadeIn} initial="hidden" whileInView="show">
          <h2 className="text-3xl font-bold border-l-4 border-purple-500 pl-3 mb-6">
            Tren Partisipasi Waktu ke Waktu
          </h2>
          <ChartCard title="" chartData={{
            type: "line",
            data: (() => {
              const g = {};
              filtered.forEach(d => {
                const t = new Date(d.tanggal_input).toISOString().slice(0, 10);
                g[t] = (g[t] || 0) + 1;
              });
              return Object.entries(g).map(([name, value]) => ({ name, value }));
            })(),
          }} />
        </motion.section>

        <motion.section variants={fadeIn} initial="hidden" whileInView="show">
          <h2 className="text-3xl font-bold border-l-4 border-purple-500 pl-3 mb-6">
            Anggaran & Instansi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Estimasi Anggaran per Kategori" chartData={{
              type: "bar", orientation: "horizontal",
              data: (() => {
                const g = {};
                filtered.forEach(d => {
                  const cat = d.kategori_aspirasi || "Tidak Diketahui";
                  const val = Number(String(d.estimasi_anggaran).replace(/\D/g, "")) || 0;
                  g[cat] = (g[cat] || 0) + val;
                });
                return Object.entries(g).map(([name, value]) => ({ name, value }));
              })(),
            }} />
            <ChartCard title="Jumlah Aspirasi per OPD" chartData={{
              type: "bar", orientation: "horizontal",
              data: (() => {
                const g = {};
                filtered.forEach(d => {
                  const opd = d.opd_instansi_terkait || "Tidak Diketahui";
                  g[opd] = (g[opd] || 0) + 1;
                });
                return Object.entries(g).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));
              })(),
            }} />
          </div>
        </motion.section>

        <motion.section variants={fadeIn} initial="hidden" whileInView="show">
          <h2 className="text-3xl font-bold border-l-4 border-purple-500 pl-3 mb-6">
            Profil Aspirasi Berdasarkan Prioritas
          </h2>
          <ChartCard title="" chartData={{
            type: "radar",
            data: (() => {
              const kSet = new Set(filtered.map(d => d.kategori_aspirasi || "Tidak Diketahui"));
              const pSet = new Set(filtered.map(d => d.prioritas || "Tidak Diketahui"));
              const kList = Array.from(kSet);
              const pList = Array.from(pSet);
              const g = {};
              pList.forEach(p => {
                g[p] = kList.map(k => ({
                  name: k,
                  value: filtered.filter(d => d.kategori_aspirasi === k && d.prioritas === p).length,
                }));
              });
              return {
                indicators: kList.map(k => ({
                  name: k,
                  max: Math.max(...Object.values(g).flat().map(x => x.value)) + 1,
                })),
                series: Object.entries(g).map(([p, vals]) => ({
                  name: p,
                  value: vals.map(v => v.value),
                })),
              };
            })(),
          }} />
        </motion.section>

        <motion.section variants={fadeIn} initial="hidden" whileInView="show">
          <h2 className="text-2xl font-semibold text-purple-700 mb-3">
            📋 Data Aspirasi Lengkap
          </h2>
          <DataTable data={filtered} />
        </motion.section>
      </div>
    </div>
  );
};

export default DashboardAspirasi;
