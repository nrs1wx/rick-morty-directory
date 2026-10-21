import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { fetchAllCharacters, readCachedCharacters } from "./api";
import Header from "./components/Header.jsx";
import StatusMessage from "./components/StatusMessage.jsx";
import CharacterList from "./components/CharacterList.jsx";
import CharacterForm from "./components/CharacterForm.jsx";
import CharacterDetail from "./components/CharacterDetail.jsx";
import NotFound from "./components/NotFound.jsx";

const STORAGE_KEY = "rm-custom-characters";

// Read the characters added by the user. Also accepts the older format
// (with an `episode` array) so previously saved characters still work.
function loadCustomCharacters() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(data)) return [];
    return data.map((c) => ({
      ...c,
      episodeCount: c.episodeCount ?? c.episode?.length ?? 0,
    }));
  } catch {
    return [];
  }
}

export default function App() {
  const [apiCharacters, setApiCharacters] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "error" | "success"
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0); // bump to load again

  const [customCharacters, setCustomCharacters] = useState(loadCustomCharacters);
  const [storageFull, setStorageFull] = useState(false);

  // Load characters from the API (or from the tab cache on the first load)
  useEffect(() => {
    const cached = reloadKey === 0 ? readCachedCharacters() : null;
    if (cached) {
      setApiCharacters(cached);
      setStatus("success");
      return;
    }

    const controller = new AbortController();
    setStatus("loading");

    fetchAllCharacters(controller.signal)
      .then((data) => {
        setApiCharacters(data);
        setStatus("success");
      })
      .catch((err) => {
        if (err.name === "AbortError") return; // we cancelled it ourselves
        setError(err.message || "Could not load characters.");
        setStatus("error");
      });

    // cleanup: cancel the request if the component unmounts or reloadKey changes
    return () => controller.abort();
  }, [reloadKey]);

  // Save added characters
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customCharacters));
      setStorageFull(false);
    } catch {
      setStorageFull(true); // e.g. quota exceeded because of big photos
    }
  }, [customCharacters]);

  const characters = useMemo(
    () => [...customCharacters, ...apiCharacters],
    [customCharacters, apiCharacters]
  );

  const speciesList = useMemo(
    () => [...new Set(characters.map((c) => c.species))].sort(),
    [characters]
  );

  // Returns the id so the form can open the new character's page
  function handleAddCharacter(data) {
    const newCharacter = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, // unique and stable id
      name: data.name,
      status: data.status,
      species: data.species,
      type: "",
      gender: data.gender,
      origin: { name: data.origin || "unknown" },
      location: { name: data.location || "unknown" },
      image: data.image,
      episodeCount: 0,
      created: new Date().toISOString(),
    };
    setCustomCharacters((prev) => [newCharacter, ...prev]); // immutable update
    return newCharacter.id;
  }

  // What to show instead of the list while the data is not ready
  let dataMessage = null;
  if (status === "loading") {
    dataMessage = (
      <StatusMessage type="loading" message="Loading characters… this can take a few seconds." />
    );
  } else if (status === "error") {
    dataMessage = (
      <StatusMessage
        type="error"
        message={error}
        actionLabel="Try again"
        onAction={() => setReloadKey((k) => k + 1)}
      />
    );
  }

  return (
    <div className="app">
      <Header total={characters.length} />

      <main className="container">
        {storageFull && (
          <p className="notice" role="alert">
            Browser storage is full, so added characters will be lost after a reload. Try a smaller
            photo.
          </p>
        )}

        <Routes>
          <Route
            path="/"
            element={
              dataMessage ?? <CharacterList characters={characters} speciesList={speciesList} />
            }
          />
          <Route
            path="/character/:id"
            element={<CharacterDetail characters={characters} fallback={dataMessage} />}
          />
          <Route
            path="/add"
            element={<CharacterForm speciesList={speciesList} onSubmit={handleAddCharacter} />}
          />
          <Route path="/index.html" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound message="Page not found." />} />
        </Routes>
      </main>
    </div>
  );
}
