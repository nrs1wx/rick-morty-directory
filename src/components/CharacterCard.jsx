import { Link, useLocation } from "react-router-dom";
import CharacterImage from "./CharacterImage.jsx";

export default function CharacterCard({ character }) {
  const location = useLocation();

  return (
    <Link
      className="card"
      to={`/character/${character.id}`}
      // remember the list URL (filters, page) so "Back to list" can restore it
      state={{ from: `${location.pathname}${location.search}` }}
    >
      <CharacterImage src={character.image} name={character.name} />
      <div className="card-body">
        <h3>{character.name}</h3>
        <p className="muted">
          {character.species} · {character.gender}
        </p>
        <div className="card-row">
          <span className={`badge badge-${character.status.toLowerCase()}`}>
            {character.status}
          </span>
          <span className="muted">{character.episodeCount} episodes</span>
        </div>
      </div>
    </Link>
  );
}
