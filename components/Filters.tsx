"use client";

import { useAppState } from "@/store/appState";

export default function Filters({ onApplyFilters }: { onApplyFilters: () => void }) {
  const { filters, setFilters, resetFilters } = useAppState();

  return (
    <div className="bg-white border-b p-4 flex flex-wrap gap-4 items-center text-sm shadow-sm">
      <input
        type="text"
        placeholder="Search keyword..."
        value={filters.keyword}
        onChange={(e) => setFilters({ keyword: e.target.value })}
        className="px-3 py-1.5 border rounded-md text-zinc-800 focus:outline-blue-500"
      />

      <input
        type="text"
        placeholder="From: address..."
        value={filters.sender}
        onChange={(e) => setFilters({ sender: e.target.value })}
        className="px-3 py-1.5 border rounded-md text-zinc-800 focus:outline-blue-500"
      />

      <div className="flex items-center gap-2 text-zinc-600">
        <label>After:</label>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ startDate: e.target.value })}
          className="px-2 py-1 border rounded-md"
        />
      </div>

      <div className="flex items-center gap-2 text-zinc-600">
        <label>Before:</label>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ endDate: e.target.value })}
          className="px-2 py-1 border rounded-md"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer text-zinc-700">
        <input
          type="checkbox"
          checked={filters.unreadOnly}
          onChange={(e) => setFilters({ unreadOnly: e.target.checked })}
          className="rounded text-blue-600 focus:ring-blue-500"
        />
        Unread
      </label>

      <button
        onClick={onApplyFilters}
        className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-900 text-white font-medium rounded-md transition"
      >
        Apply Filters
      </button>

      <button
        onClick={() => {
          resetFilters();
          setTimeout(onApplyFilters, 0);
        }}
        className="px-3 py-1.5 text-zinc-500 hover:text-zinc-800 transition"
      >
        Reset
      </button>
    </div>
  );
}