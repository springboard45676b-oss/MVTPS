function LiveTrackingSidebar({
  search,
  setSearch,
  categories,
  setCategories,
  flags,
  setFlags,
  onUpdate,
}) {
  const toggle = (state, setState, key) => {
    setState({ ...state, [key]: !state[key] });
  };

  return (
    <div className="w-80 bg-slate-800 text-white p-4 overflow-y-auto">

      {/* Header */}
      <h2 className="text-lg font-semibold mb-2">MaritimeTrack</h2>
      <p className="text-xs text-slate-300 mb-4">Live Vessel Tracking</p>

      {/* Search */}
      <input
        placeholder="Search vessels..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 mb-3 rounded bg-slate-700 text-white outline-none"
      />

      {/* Update Button */}
      <button
        onClick={onUpdate}
        className="w-full bg-blue-600 hover:bg-blue-700 transition py-2 rounded mb-4"
      >
        Update All Positions
      </button>

      {/* Vessel Category */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2">Vessel Category</h3>

        {Object.keys(categories).map((c) => (
          <label key={c} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={categories[c]}
              onChange={() => toggle(categories, setCategories, c)}
            />
            {c}
          </label>
        ))}
      </div>

      {/* Flag State */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Flag State</h3>

        {Object.keys(flags).map((f) => (
          <label key={f} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={flags[f]}
              onChange={() => toggle(flags, setFlags, f)}
            />
            {f}
          </label>
        ))}
      </div>

    </div>
  );
}

export default LiveTrackingSidebar;
