import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Controls from "./Controls.jsx";
import CharacterCard from "./CharacterCard.jsx";
import Pagination from "./Pagination.jsx";
import StatusMessage from "./StatusMessage.jsx";

const PAGE_SIZE = 12;

// Search, filters, sorting and the page number live in the URL (?q=rick&status=Alive&page=2),
// so they survive a reload and the browser "Back" button from the detail page.
export default function CharacterList({ characters, speciesList }) {
  const [params, setParams] = useSearchParams();

  const query = params.get("q") ?? "";
  const status = params.get("status") ?? "all";
  const species = params.get("species") ?? "all";
  const gender = params.get("gender") ?? "all";
  const sortBy = params.get("sort") ?? "default";
  const page = Math.max(1, Number(params.get("page")) || 1);

  // The text in the search box changes on every key press; the URL only after a pause
  const [searchInput, setSearchInput] = useState(query);

  // Set several URL params at once. Default values are removed to keep the URL short.
  const updateParams = useCallback(
    (changes, { replace = true } = {}) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(changes)) {
            const isDefault =
              value === "" || value === "all" || value === "default" || (key === "page" && value === 1);
            if (isDefault) next.delete(key);
            else next.set(key, String(value));
          }
          return next;
        },
        { replace }
      );
    },
    [setParams]
  );

  // When the URL changes from outside (Back / Forward / Reset), update the search box
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // Debounce: write the search text to the URL 300ms after the user stops typing
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === query) return;

    const timerId = setTimeout(() => {
      updateParams({ q: trimmed, page: 1 });
    }, 300);
    return () => clearTimeout(timerId); // cleanup: cancel the previous timer
  }, [searchInput, query, updateParams]);

  // Filter + sort ALL characters (recalculated only when a dependency changes)
  const visibleCharacters = useMemo(() => {
    const needle = query.toLowerCase();
    const result = characters.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(needle);
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
        result.sort((a, b) => b.episodeCount - a.episodeCount);
        break;
      default:
        break;
    }
    return result;
  }, [characters, query, status, species, gender, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(visibleCharacters.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = visibleCharacters.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Every filter change goes back to page 1
  function handleFilterChange(key, value) {
    updateParams({ [key]: value, page: 1 });
  }

  function handlePageChange(newPage) {
    updateParams({ page: newPage }, { replace: false }); // pages are real history entries
    window.scrollTo({ top: 0 });
  }

  function handleReset() {
    setSearchInput("");
    setParams({}, { replace: true });
  }

  return (
    <section>
      <Controls
        search={searchInput}
        onSearchChange={setSearchInput}
        status={status}
        onStatusChange={(value) => handleFilterChange("status", value)}
        species={species}
        onSpeciesChange={(value) => handleFilterChange("species", value)}
        speciesList={speciesList}
        gender={gender}
        onGenderChange={(value) => handleFilterChange("gender", value)}
        sortBy={sortBy}
        onSortChange={(value) => handleFilterChange("sort", value)}
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
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </section>
  );
}
