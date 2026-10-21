import { STATUSES, GENDERS } from "../constants";

// Search + filters + sorting. Has no own state — everything comes via props.
export default function Controls({
  search,
  onSearchChange,
  status,
  onStatusChange,
  species,
  onSpeciesChange,
  speciesList,
  gender,
  onGenderChange,
  sortBy,
  onSortChange,
  onReset,
}) {
  return (
    <div className="controls" role="search">
      <input
        type="search"
        placeholder="Search by name…"
        aria-label="Search by name"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <select
        aria-label="Filter by status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option value="all">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by species"
        value={species}
        onChange={(e) => onSpeciesChange(e.target.value)}
      >
        <option value="all">All species</option>
        {speciesList.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by gender"
        value={gender}
        onChange={(e) => onGenderChange(e.target.value)}
      >
        <option value="all">All genders</option>
        {GENDERS.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      <select aria-label="Sort" value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
        <option value="default">Sort: default</option>
        <option value="name-asc">Name: A–Z</option>
        <option value="name-desc">Name: Z–A</option>
        <option value="episodes-desc">Most episodes</option>
      </select>

      <button type="button" className="btn" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}
