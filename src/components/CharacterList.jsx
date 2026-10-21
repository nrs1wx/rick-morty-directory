import { useEffect, useMemo, useState } from "react";
import Controls from "./Controls.jsx";
import CharacterCard from "./CharacterCard.jsx";
import Pagination from "./Pagination.jsx";
import StatusMessage from "./StatusMessage.jsx";

const PAGE_SIZE = 12;

export default function CharacterList({ characters, speciesList, onSelect }) {
  // Filter state lives here, not in App
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [species, setSpecies] = useState("all");
  const [gender, setGender] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [page, setPage] = useState(1);

  // Debounce: update the real search term 300ms after the user stops typing
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase());
      setPage(1);
    }, 300);
    return () => clearTimeout(timerId); // cleanup: cancel the previous timer
  }, [search]);

  // Filter + sort ALL characters (recalculated only when a dependency changes)
  const visibleCharacters = useMemo(() => {
    const result = characters.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(debouncedSearch);
      const matchesStatus = status === "all" || c.status === status;
      const matchesSpecies = species === "all" || c.species === species;
      const matchesGender = gender === "all" || c.gender === gender;
      return matchesSearch && matchesStatus && matchesSpecies && matchesGender;
    });

    // `filter` returned a new array, so sorting it does not mutate props
    switch (sortBy) {
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "episodes-desc":
        result.sort((a, b) => b.episode.length - a.episode.length);
        break;
      default:
        break;
    }
    return result;
  }, [characters, debouncedSearch, status, species, gender, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(visibleCharacters.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = visibleCharacters.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Every filter change goes back to page 1
  function handleStatusChange(value) {
    setStatus(value);
    setPage(1);
  }
  function handleSpeciesChange(value) {
    setSpecies(value);
    setPage(1);
  }
  function handleGenderChange(value) {
    setGender(value);
    setPage(1);
  }
  function handleSortChange(value) {
    setSortBy(value);
    setPage(1);
  }
  function handleReset() {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
    setSpecies("all");
    setGender("all");
    setSortBy("default");
    setPage(1);
  }

  return (
    <section>
      <Controls
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={handleStatusChange}
        species={species}
        onSpeciesChange={handleSpeciesChange}
        speciesList={speciesList}
        gender={gender}
        onGenderChange={handleGenderChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onReset={handleReset}
      />

      <p className="muted results-count">
        {visibleCharacters.length} result{visibleCharacters.length === 1 ? "" : "s"}
      </p>

      {visibleCharacters.length === 0 ? (
        <StatusMessage
          type="empty"
          message="No characters match your filters."
          actionLabel="Reset filters"
          onAction={handleReset}
        />
      ) : (
        <>
          <div className="grid">
            {pageItems.map((character) => (
              <CharacterCard key={character.id} character={character} onSelect={onSelect} />
            ))}
          </div>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}
