import React, { useState, useEffect } from "react";
import * as echarts from "echarts";
import { motion } from "framer-motion";
import { readExcelFile } from "../utils/excelReader";
import ChartCard from "./ChartCard";
import DataTable from "./DataTable";
import FilterBar from "./FilterBar";
import indonesiaGeo from "../assets/indonesia.json";
import { PROV_RENAME_MAP } from "../utils/prov";

const DashboardAspirasi = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    "Kategori Aspirasi": "Semua",
    "Status Aspirasi": "Semua",
    Prioritas: "Semua",
  });

  useEffect(() => {
    if (!indonesiaGeo) return;

    const fixedGeo = {
      ...indonesiaGeo,
      features: indonesiaGeo.features.map((f) => {
        // Ambil nama dari properti geoJSON (huruf besar semua)
        const rawName = f.properties?.Propinsi || "";

        // Normalisasi (hapus spasi ekstra dan ubah ke Title Case)
        const upper = rawName.trim().toUpperCase();
        const mappedName = PROV_RENAME_MAP[upper] || toTitleCase(upper);

        return {
          ...f,
          name: mappedName,
        };
      }),
    };

    echarts.registerMap("Indonesia", fixedGeo);
  }, []);

  // Helper: ubah "SUMATERA UTARA" → "Sumatera Utara"
  function toTitleCase(str) {
    return str
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

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
    <div className="flex flex-col items-center justify-center min-h-[80vh] sm:min-h-screen px-6 py-12 text-center bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* 📊 Icon / Heading */}
      <h1 className="text-3xl sm:text-5xl font-extrabold text-purple-700 mb-4 drop-shadow-sm">
        📊 
      </h1>

      {/* 📝 Deskripsi */}
      <p className="text-gray-600 text-sm sm:text-base mb-8 max-w-md sm:max-w-lg leading-relaxed">
        Unggah file Excel berisi data aspirasi masyarakat untuk menampilkan
        analisis visual yang interaktif dan informatif.
      </p>

      {/* 📁 Input Upload */}
      <label
        htmlFor="file-upload"
        className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg px-5 py-3 shadow-md transition duration-200 ease-in-out w-full sm:w-auto"
      >
        Pilih File Excel
        <input
          id="file-upload"
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>

      {/* 🧩 Tips kecil di bawah */}
      <p className="text-xs sm:text-sm text-gray-400 mt-4">
        Format yang didukung: <strong>.xlsx</strong> atau <strong>.xls</strong>
      </p>
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

  const progressRata = (() => {
    // Ambil hanya aspirasi valid (bukan "Ditolak" & progress valid)
    const validProgress = filtered
      .filter(
        (d) =>
          d.status_aspirasi?.toLowerCase() !== "ditolak" &&
          d.progress_update &&
          d.progress_update !== "-"
      )
      .map((d) => {
        const val = String(d.progress_update)
          .trim()
          .replace("%", "")
          .replace(",", ".");
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
      })
      .filter((v) => v !== null);

    if (validProgress.length === 0) return 0;

    const total = validProgress.reduce((a, b) => a + b, 0);
    return total / validProgress.length;
  })();

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
            Dashboard interaktif yang menampilkan analisis sebaran, prioritas,
            dan status penanganan aspirasi masyarakat.
          </p>
          <FilterBar filters={filters} setFilters={setFilters} data={data} />

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            {[
              {
                title: "Total Aspirasi",
                value: filtered.length,
                color: "bg-purple-600 text-white",
              },
              {
                title: "Total Anggaran",
                value: `Rp ${totalAnggaran.toLocaleString()}`,
                color: "bg-yellow-400 text-gray-900",
              },
              {
                title: "Sedang Diproses",
                value: statusCount["Diproses"] || 0,
                color: "bg-green-400 text-gray-900",
              },
              {
                title: "Direalisasikan",
                value: statusCount["Direalisasikan"] || 0,
                color: "bg-orange-400 text-gray-900",
              },
              {
                title: "Rata-rata Progress",
                value: `${progressRata.toFixed(1)}%`,
                color: "bg-purple-200 text-gray-900",
              },
            ].map((c, i) => (
              <div
                key={i}
                className={`${c.color} p-4 rounded-xl shadow text-center`}
              >
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
            <ChartCard
              title="Sebaran Aspirasi per Provinsi"
              chartData={{
                type: "map",
                data: Object.entries(provCount).map(([n, v]) => ({
                  name: n,
                  value: v,
                })),
              }}
            />
            <ChartCard
              title="Distribusi Status Aspirasi"
              chartData={{
                type: "pie",
                data: Object.entries(statusCount).map(([n, v]) => ({
                  name: n,
                  value: v,
                })),
              }}
            />
          </div>
        </motion.section>

        <motion.section variants={fadeIn} initial="hidden" whileInView="show">
          <h2 className="text-3xl font-bold border-l-4 border-purple-500 pl-3 mb-6">
            Kategori & Prioritas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard
              title="Kategori Aspirasi"
              chartData={{
                type: "bar",
                orientation: "horizontal",
                data: Object.entries(kategoriCount).map(([n, v]) => ({
                  name: n,
                  value: v,
                })),
              }}
            />
            <ChartCard
              title="Prioritas Aspirasi"
              chartData={{
                type: "bar",
                data: Object.entries(prioritasCount).map(([n, v]) => ({
                  name: n,
                  value: v,
                })),
              }}
            />
          </div>
          <div className="mt-6">
            <ChartCard
              title="Estimasi Anggaran per Kategori"
              chartData={{
                type: "bar",
                orientation: "horizontal",
                data: (() => {
                  const g = {};

                  filtered.forEach((d) => {
                    const cat = d.kategori_aspirasi || "Tidak Diketahui";
                    const val =
                      Number(String(d.estimasi_anggaran).replace(/\D/g, "")) ||
                      0;
                    g[cat] = (g[cat] || 0) + val;
                  });

                  return Object.entries(g)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value) // 🔽 urut dari nilai tertinggi ke terendah
                    .slice(0, 10); // 🎯 ambil hanya 10 kategori teratas
                })(),
                extra: { isCurrency: true }, // 💰 biar format Rp di ChartCard aktif (opsional)
              }}
            />
          </div>
        </motion.section>

        <motion.section variants={fadeIn} initial="hidden" whileInView="show">
          <h2 className="text-3xl font-bold border-l-4 border-purple-500 pl-3 mb-6">
            Tren Partisipasi Waktu ke Waktu
          </h2>
          <ChartCard
            title="Tren Waktu Aspirasi"
            chartData={{
              type: "line",
              data: (() => {
                const g = {};
                filtered.forEach((d) => {
                  const t = new Date(d.tanggal_input)
                    .toISOString()
                    .slice(0, 10);
                  g[t] = (g[t] || 0) + 1;
                });
                return Object.entries(g)
                  .sort(([a], [b]) => new Date(a) - new Date(b)) // ⬅️ urut dari lama ke baru (timeline natural)
                  .map(([name, value]) => ({ name, value }));
              })(),
            }}
          />
        </motion.section>

        <motion.section variants={fadeIn} initial="hidden" whileInView="show">
          <h2 className="text-3xl font-bold border-l-4 border-purple-500 pl-3 mb-6">
            Anggaran & Instansi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard
              title="Jumlah Aspirasi per OPD"
              chartData={{
                type: "bar",
                orientation: "horizontal",
                data: (() => {
                  const g = {};
                  filtered.forEach((d) => {
                    const opd = d.opd_instansi_terkait || "Tidak Diketahui";
                    g[opd] = (g[opd] || 0) + 1;
                  });
                  return Object.entries(g)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([name, value]) => ({ name, value }));
                })(),
              }}
            />
            <ChartCard
              title="Rata-rata Progress Aspirasi per OPD / Instansi"
              chartData={{
                type: "bar",
                orientation: "horizontal",
                data: (() => {
                  const group = {};

                  filtered.forEach((d) => {
                    const status = (d.status_aspirasi || "").toLowerCase();
                    if (status === "ditolak") return; // ❌ Skip aspirasi yang ditolak

                    const opd = d.opd_instansi_terkait || "Tidak Diketahui";
                    const val = parseFloat(
                      String(d.progress_update || "")
                        .replace("%", "")
                        .replace(",", ".")
                    );

                    if (!isNaN(val)) {
                      if (!group[opd]) group[opd] = [];
                      group[opd].push(val);
                    }
                  });

                  const avgPerOpd = Object.entries(group).map(
                    ([name, values]) => ({
                      name,
                      value: values.reduce((a, b) => a + b, 0) / values.length, // 💡 rata-rata persen
                    })
                  );

                  return avgPerOpd
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 10); // ambil top 10
                })(),
                extra: {
                  isPercentage: true, // ⚙️ info tambahan buat ChartCard
                },
              }}
            />
          </div>
          <div className="mt-6">
            <ChartCard
              title="Estimasi Anggaran per OPD / Instansi"
              chartData={{
                type: "bar",
                orientation: "horizontal",
                data: (() => {
                  const g = {};

                  filtered.forEach((d) => {
                    const opd = d.opd_instansi_terkait || "Tidak Diketahui";
                    const val =
                      Number(String(d.estimasi_anggaran).replace(/\D/g, "")) ||
                      0;
                    g[opd] = (g[opd] || 0) + val;
                  });

                  return Object.entries(g)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value) // 🔽 urut dari yang tertinggi ke terendah
                    .slice(0, 10); // tampilkan Top 10 biar visual tetap rapi
                })(),
              }}
            />
          </div>
        </motion.section>

        <motion.section variants={fadeIn} initial="hidden" whileInView="show">
          <h2 className="text-3xl font-bold border-l-4 border-purple-500 pl-3 mb-6">
            Profil Aspirasi Berdasarkan Prioritas
          </h2>
          <ChartCard
            title=""
            chartData={{
              type: "radar",
              data: (() => {
                const kSet = new Set(
                  filtered.map((d) => d.kategori_aspirasi || "Tidak Diketahui")
                );
                const pSet = new Set(
                  filtered.map((d) => d.prioritas || "Tidak Diketahui")
                );
                const kList = Array.from(kSet);
                const pList = Array.from(pSet);
                const g = {};
                pList.forEach((p) => {
                  g[p] = kList.map((k) => ({
                    name: k,
                    value: filtered.filter(
                      (d) => d.kategori_aspirasi === k && d.prioritas === p
                    ).length,
                  }));
                });
                return {
                  indicators: kList.map((k) => ({
                    name: k,
                    max:
                      Math.max(
                        ...Object.values(g)
                          .flat()
                          .map((x) => x.value)
                      ) + 1,
                  })),
                  series: Object.entries(g).map(([p, vals]) => ({
                    name: p,
                    value: vals.map((v) => v.value),
                  })),
                };
              })(),
            }}
          />
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
