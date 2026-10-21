import { useEffect, useMemo, useState } from "react";
import { fetchAllCharacters } from "./api";
import Header from "./components/Header.jsx";
import StatusMessage from "./components/StatusMessage.jsx";
import CharacterList from "./components/CharacterList.jsx";
import CharacterForm from "./components/CharacterForm.jsx";
import CharacterDetail from "./components/CharacterDetail.jsx";

const STORAGE_KEY = "rm-custom-characters";

function loadCustomCharacters() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function App() {
  
  const [apiCharacters, setApiCharacters] = useState([]);
  const [status, setStatus] = useState("loading"); 
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0); 

  
  const [customCharacters, setCustomCharacters] = useState(loadCustomCharacters);

  
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formKey, setFormKey] = useState(0); 

  
  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");

    fetchAllCharacters(controller.signal)
      .then((data) => {
        setApiCharacters(data);
        setStatus("success");
      })
      .catch((err) => {
        if (err.name === "AbortError") return; 
        setError(err.message || "Could not load characters.");
        setStatus("error");
      });

    
    return () => controller.abort();
  }, [reloadKey]);

  
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customCharacters));
    } catch {
      
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

  const selectedCharacter = characters.find((c) => c.id === selectedId);

  function handleAddCharacter(data) {
    const newCharacter = {
      id: `local-${Date.now()}`, // unique and stable id
      name: data.name,
      status: data.status,
      species: data.species,
      type: "",
      gender: data.gender,
      origin: { name: data.origin || "unknown" },
      location: { name: data.location || "unknown" },
      image: "",
      episode: [],
      created: new Date().toISOString(),
    };
    setCustomCharacters((prev) => [newCharacter, ...prev]); // immutable update
    setShowForm(false);
    setFormKey((k) => k + 1);
  }

  return (
    <div className="app">
      <Header
        total={characters.length}
        canAdd={status === "success"}
        showForm={showForm}
        onToggleForm={() => setShowForm((s) => !s)}
      />

      <main className="container">
        {showForm && (
          <CharacterForm
            key={formKey}
            speciesList={speciesList}
            onSubmit={handleAddCharacter}
            onCancel={() => setShowForm(false)}
          />
        )}

        {status === "loading" && (
          <StatusMessage
            type="loading"
            message="Loading all characters… this can take a few seconds."
          />
        )}

        {status === "error" && (
          <StatusMessage
            type="error"
            message={error}
            actionLabel="Try again"
            onAction={() => setReloadKey((k) => k + 1)}
          />
        )}

        {status === "success" && (
          <CharacterList
            characters={characters}
            speciesList={speciesList}
            onSelect={setSelectedId}
          />
        )}
      </main>

      {selectedCharacter && (
        <CharacterDetail
          key={selectedCharacter.id}
          character={selectedCharacter}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
