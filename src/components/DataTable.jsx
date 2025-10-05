import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

const DataTable = ({ data }) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  // ✅ Generate columns otomatis dari key data
  const columns = useMemo(() => {
    if (!data.length) return [];
    return Object.keys(data[0]).map((key) => ({
      accessorKey: key.trim(), // pastikan bersih dari spasi
      header: key.replaceAll("_", " ").toUpperCase(),
      cell: (info) => {
        const val = info.getValue();
        if (val === undefined || val === null || val === "") return "-";
        return String(val);
      },
    }));
  }, [data]);

  // ✅ Setup TanStack Table
  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(next.pageIndex ?? pageIndex);
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const value = String(row.getValue(columnId) ?? "").toLowerCase();
      return value.includes(filterValue.toLowerCase());
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (!data.length)
    return <p className="text-gray-500">Tidak ada data untuk ditampilkan.</p>;

  return (
    <div className="bg-white border border-yellow-200 rounded-xl shadow-sm p-4">
      {/* 🔍 Search + Page Size */}
      <div className="flex flex-wrap justify-between items-center mb-3">
        <input
          type="text"
          placeholder="🔍 Cari data..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="border border-purple-300 rounded-lg px-3 py-2 w-full md:w-1/3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="border border-purple-300 rounded-lg px-2 py-1 text-gray-700 focus:ring-2 focus:ring-yellow-400"
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} baris
            </option>
          ))}
        </select>
      </div>

      {/* 🧾 Table */}
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gradient-to-r from-yellow-200 via-orange-200 to-yellow-100 text-purple-900 font-semibold">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="p-2 text-left border-b border-yellow-300 cursor-pointer select-none hover:bg-yellow-100 transition"
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {isSorted === "asc" && (
                          <span className="text-xs text-purple-600">▲</span>
                        )}
                        {isSorted === "desc" && (
                          <span className="text-xs text-purple-600">▼</span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-purple-50 border-b border-gray-100 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2 text-gray-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📄 Pagination */}
      <div className="flex flex-wrap justify-between items-center mt-4 gap-3">
        <div className="text-sm text-gray-600">
          Menampilkan{" "}
          <span className="font-semibold text-purple-700">
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}
          </span>{" "}
          -{" "}
          <span className="font-semibold text-purple-700">
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              data.length
            )}
          </span>{" "}
          dari{" "}
          <span className="font-semibold text-purple-700">{data.length}</span>{" "}
          data
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              table.getCanPreviousPage()
                ? "bg-purple-500 text-white hover:bg-purple-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            ‹ Sebelumnya
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              table.getCanNextPage()
                ? "bg-purple-500 text-white hover:bg-purple-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Berikutnya ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
