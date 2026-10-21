export default function Header({ total, canAdd, showForm, onToggleForm }) {
  return (
    <header className="header">
      <div className="container header-inner">
        <div>
          <h1>Rick and Morty Characters</h1>
          <p className="muted">{total > 0 ? `${total} characters` : "Character directory"}</p>
        </div>
        <button className="btn btn-primary" onClick={onToggleForm} disabled={!canAdd}>
          {showForm ? "Close form" : "Add character"}
        </button>
      </div>
    </header>
  );
}
