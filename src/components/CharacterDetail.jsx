import { Link, useLocation, useParams } from "react-router-dom";
import CharacterImage from "./CharacterImage.jsx";
import NotFound from "./NotFound.jsx";

// Detail page: /character/:id
// `fallback` is shown instead of "not found" while the list is still loading (or failed).
export default function CharacterDetail({ characters, fallback }) {
  const { id } = useParams();
  const location = useLocation();

  const character = characters.find((c) => String(c.id) === id);

  if (!character) {
    return fallback ?? <NotFound message="Character not found." />;
  }

  const backTo = location.state?.from ?? "/";

  return (
    <article className="detail">
      <CharacterImage
        key={character.id}
        src={character.image}
        name={character.name}
        className="detail-img"
      />

      <div className="detail-body">
        <Link className="btn" to={backTo}>
          ← Back to list
        </Link>

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
          <li>Episodes: {character.episodeCount}</li>
          <li>Added to database: {new Date(character.created).toLocaleDateString()}</li>
        </ul>
      </div>
    </article>
  );
}
