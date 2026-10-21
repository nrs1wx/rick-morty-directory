import { useEffect } from "react";

export default function CharacterDetail({ character, onClose }) {
  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown); // cleanup
  }, [onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {character.image ? (
          <img className="modal-img" src={character.image} alt={character.name} />
        ) : (
          <div className="thumb-placeholder modal-img">{character.name[0]?.toUpperCase()}</div>
        )}

        <h2>{character.name}</h2>
        <span className={`badge badge-${character.status.toLowerCase()}`}>
          {character.status}
        </span>

        <ul className="details">
          <li>Species: {character.species}</li>
          {character.type && <li>Type: {character.type}</li>}
          <li>Gender: {character.gender}</li>
          <li>Origin: {character.origin.name}</li>
          <li>Last known location: {character.location.name}</li>
          <li>Episodes: {character.episode.length}</li>
          <li>Added to database: {new Date(character.created).toLocaleDateString()}</li>
        </ul>

        <button className="btn" onClick={onClose}>
          Back to list
        </button>
      </div>
    </div>
  );
}
