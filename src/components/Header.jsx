import { Link } from "react-router-dom";

export default function Header({ total }) {
  return (
    <header className="header">
      <div className="container header-inner">
        <div>
          <h1>
            <Link to="/">Rick and Morty Characters</Link>
          </h1>
          <p className="muted">{total > 0 ? `${total} characters` : "Character directory"}</p>
        </div>
        <Link className="btn btn-primary" to="/add">
          Add character
        </Link>
      </div>
    </header>
  );
}
