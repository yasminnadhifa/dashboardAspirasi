import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

const gradientColors = [
  "#7C3AED", "#A78BFA", "#C084FC", "#E879F9", "#F472B6",
  "#FB923C", "#FACC15", "#EAB308", "#4ADE80", "#22C55E",
  "#14B8A6", "#38BDF8", "#3B82F6", "#6366F1",
];

const ChartCard = ({ title, chartData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null); // 👈 simpan instance biar gak recreate terus

  useEffect(() => {
    if (!chartRef.current) return;

    // 🔧 inisialisasi chart hanya sekali
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const chart = chartInstance.current;
    let option = {};

    // === TIPE PIE ===
    if (chartData.type === "pie") {
      option = {
        tooltip: { trigger: "item" },
        color: gradientColors,
        series: [
          {
            type: "pie",
            radius: "70%",
            data: chartData.data,
            label: { show: true, color: "#374151" },
          },
        ],
      };
    }

    // === TIPE BAR ===
    else if (chartData.type === "bar") {
      const rankColors = [
        "#7C3AED", "#A78BFA", "#C084FC", "#E879F9",
        "#F472B6", "#FBBF24", "#FACC15", "#4ADE80",
        "#22C55E", "#86EFAC",
      ];
      const sortedData = [...chartData.data].sort((a, b) => b.value - a.value);

      if (chartData.orientation === "horizontal") {
        option = {
          tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            formatter: (params) => {
              const p = params[0];
              return `<strong>${p.name}</strong><br/>Jumlah: ${p.value}`;
            },
          },
          grid: { left: "12%", right: "8%", bottom: "10%", top: "5%", containLabel: true },
          xAxis: { type: "value", axisLabel: { color: "#4B5563" } },
          yAxis: {
            type: "category",
            data: sortedData.map((d) => d.name),
            axisLabel: { color: "#4B5563", fontWeight: 600 },
          },
          series: [
            {
              type: "bar",
              data: sortedData.map((d, i) => ({
                value: d.value,
                itemStyle: {
                  color:
                    rankColors[
                      Math.floor((i / sortedData.length) * rankColors.length)
                    ] || "#C4B5FD",
                },
              })),
              label: {
                show: true,
                position: "right",
                color: "#6B21A8",
                fontWeight: "bold",
              },
            },
          ],
        };
      } else {
        option = {
          tooltip: { trigger: "axis" },
          grid: { left: "10%", right: "5%", bottom: "12%", top: "5%", containLabel: true },
          xAxis: {
            type: "category",
            data: sortedData.map((d) => d.name),
            axisLabel: { color: "#4B5563", rotate: 30 },
          },
          yAxis: { type: "value", axisLabel: { color: "#4B5563" } },
          series: [
            {
              type: "bar",
              data: sortedData.map((d, i) => ({
                value: d.value,
                itemStyle: {
                  color:
                    rankColors[
                      Math.floor((i / sortedData.length) * rankColors.length)
                    ] || "#C4B5FD",
                },
              })),
              label: {
                show: true,
                position: "top",
                color: "#6B21A8",
                fontWeight: "bold",
              },
            },
          ],
        };
      }
    }

    // === TIPE MAP ==
    else if (chartData.type === "map") {
  option = {
    tooltip: {
      trigger: "item",
    },
    visualMap: {
      min: 0,
      max: Math.max(...chartData.data.map((d) => d.value)) || 10,
      text: ["Banyak", "Sedikit"],
      inRange: {
        color: ["#E0F2FE", "#CEE3CC", "#2C7026"],
      },
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 10,
    },
    series: [
      {
        name: "Sebaran Aspirasi",
        type: "map",
        map: "Indonesia",
        roam: false, // ❌ no zoom/pan
        nameProperty: "Propinsi", // 🧠 sesuaikan dengan geojson kamu
        mapValueCalculation: "sum",
        encode: { value: "value" },
        // 🧩 Data sudah dinormalisasi agar cocok
        data: chartData.data.map((d) => ({
          name: d.name.toUpperCase().replace(/^DI\.?\s*/i, ""), // hilangkan "DI." dan kapital
          value: d.value,
        })),
        // ✅ styling tiap provinsi
        itemStyle: {
          areaColor: "#EDE9FE",
          borderColor: "#A78BFA",
          borderWidth: 0.7,
        },
        emphasis: {
          label: {
            show: true,
            color: "#111",
            fontWeight: "bold",
            backgroundColor: "#fff",
            padding: 4,
            borderRadius: 4,
          },
          itemStyle: {
            areaColor: "#FACC15", // 💛 hanya provinsi yang dihover berubah
            borderColor: "#7C3AED",
            borderWidth: 1.5,
          },
        },
        select: {
          itemStyle: {
            areaColor: "#FB923C",
          },
        },
      },
    ],
  };
}


    // === TIPE LINE ===
    else if (chartData.type === "line") {
      option = {
        tooltip: { trigger: "axis" },
        grid: { left: "8%", right: "5%", top: "10%", bottom: "12%", containLabel: true },
        xAxis: {
          type: "category",
          data: chartData.data.map((d) => d.name),
          axisLabel: { color: "#4B5563" },
        },
        yAxis: { type: "value", axisLabel: { color: "#4B5563" } },
        series: [
          {
            type: "line",
            smooth: true,
            data: chartData.data.map((d) => d.value),
            lineStyle: { color: "#7C3AED", width: 3 },
            itemStyle: { color: "#FACC15" },
            areaStyle: { color: "rgba(124,58,237,0.1)" },
          },
        ],
      };
    }

    // === TIPE RADAR ===
    else if (chartData.type === "radar") {
      const { indicators, series } = chartData.data;
      option = {
        tooltip: { trigger: "item" },
        legend: {
          top: 10,
          textStyle: { color: "#6B21A8", fontWeight: 500 },
        },
        radar: {
          indicator: indicators,
          radius: "65%",
          splitNumber: 5,
          splitLine: { lineStyle: { color: "rgba(124,58,237,0.3)" } },
          splitArea: {
            areaStyle: {
              color: ["#F5F3FF", "#EDE9FE", "#DDD6FE", "#C4B5FD", "#A78BFA"],
            },
          },
          axisLine: { lineStyle: { color: "#7C3AED" } },
        },
        series: series.map((s) => ({
          type: "radar",
          name: s.name,
          data: [{ value: s.value, name: s.name }],
          lineStyle: { width: 2 },
          itemStyle: { color: "#FACC15" },
          areaStyle: { opacity: 0.2 },
        })),
      };
    }

    // 🧩 Render Chart
    chart.setOption(option);

    // 📱 Responsiveness
    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(chartRef.current);

    // 🧼 Cleanup
    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      chartInstance.current = null;
    };
  }, [chartData]);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md border border-purple-100 hover:shadow-lg transition">
      {title && (
        <h4 className="font-semibold mb-3 text-purple-700">{title}</h4>
      )}
      <div ref={chartRef} className="w-full" style={{ height: 340 }} />
    </div>
  );
};

export default ChartCard;
