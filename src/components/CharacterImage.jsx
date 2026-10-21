import { useState } from "react";


export default function CharacterImage({ src, name, className = "" }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`thumb-placeholder ${className}`} role="img" aria-label={`${name} (no photo)`}>
        {name[0]?.toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`img-wrap ${className}`}>
      {!loaded && <div className="img-skeleton" />}
      <img
        src={src}
        alt={name}
        loading="lazy"
        className={loaded ? "loaded" : ""}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
