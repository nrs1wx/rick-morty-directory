export default function CharacterCard({ character, onSelect }) {
  return (
    <button className="card" onClick={() => onSelect(character.id)}>
      {character.image ? (
        <img src={character.image} alt={character.name} loading="lazy" />
      ) : (
        <div className="thumb-placeholder">{character.name[0]?.toUpperCase()}</div>
      )}
      <div className="card-body">
        <h3>{character.name}</h3>
        <p className="muted">
          {character.species} · {character.gender}
        </p>
        <div className="card-row">
          <span className={`badge badge-${character.status.toLowerCase()}`}>
            {character.status}
          </span>
          <span className="muted">{character.episode.length} episodes</span>
        </div>
      </div>
    </button>
  );
}
