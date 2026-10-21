import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { STATUSES, GENDERS } from "../constants";

// The photo is stored in localStorage as a data URL, so it has to stay small
const MAX_IMAGE_BYTES = 300 * 1024;

export default function CharacterForm({ speciesList, onSubmit }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    species: "Human",
    status: "Alive",
    gender: "unknown",
    origin: "",
    location: "",
    image: "", // data URL of the chosen photo
  });
  const [errors, setErrors] = useState({});
  // A file input cannot be controlled, so a new `key` is used to reset it
  const [fileInputKey, setFileInputKey] = useState(0);
  const lastReadId = useRef(0); // ignore the result of an outdated file read

  // One handler for all text inputs (controlled by `name`)
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function clearImage(error) {
    lastReadId.current += 1;
    setForm((prev) => ({ ...prev, image: "" }));
    setErrors((prev) => ({ ...prev, image: error }));
    setFileInputKey((k) => k + 1);
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      clearImage("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      clearImage(`Photo is too big. Maximum size is ${MAX_IMAGE_BYTES / 1024} KB.`);
      return;
    }

    const readId = ++lastReadId.current;
    const reader = new FileReader();
    reader.onload = () => {
      if (readId !== lastReadId.current) return;
      setForm((prev) => ({ ...prev, image: String(reader.result) }));
      setErrors((prev) => ({ ...prev, image: undefined }));
    };
    reader.onerror = () => {
      if (readId !== lastReadId.current) return;
      setErrors((prev) => ({ ...prev, image: "Could not read the file." }));
    };
    reader.readAsDataURL(file);
  }

  function validate() {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters.";
    if (form.species.trim().length < 2) e.species = "Enter a species (at least 2 characters).";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors((prev) => ({ ...found, image: prev.image }));
    if (Object.keys(found).length > 0) return;

    const newId = onSubmit({
      name: form.name.trim(),
      species: form.species.trim(),
      status: form.status,
      gender: form.gender,
      origin: form.origin.trim(),
      location: form.location.trim(),
      image: form.image,
    });
    navigate(`/character/${newId}`); // show the new character right away
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <h2>New character</h2>

      <label>
        Name
        <input name="name" value={form.name} onChange={handleChange} />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </label>

      <div className="form-row">
        <label>
          Species
          <input
            name="species"
            list="species-options"
            value={form.species}
            onChange={handleChange}
          />
          <datalist id="species-options">
            {speciesList.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          {errors.species && <span className="field-error">{errors.species}</span>}
        </label>

        <label>
          Status
          <select name="status" value={form.status} onChange={handleChange}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label>
          Gender
          <select name="gender" value={form.gender} onChange={handleChange}>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-row">
        <label>
          Origin (optional)
          <input name="origin" value={form.origin} onChange={handleChange} />
        </label>

        <label>
          Last known location (optional)
          <input name="location" value={form.location} onChange={handleChange} />
        </label>
      </div>

      <div className="photo-field">
        <label>
          Photo (optional, up to {MAX_IMAGE_BYTES / 1024} KB)
          <input
            key={fileInputKey}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>
        {errors.image && <span className="field-error">{errors.image}</span>}

        {form.image && (
          <div className="photo-preview">
            <img src={form.image} alt="Preview of the chosen photo" />
            <button type="button" className="btn" onClick={() => clearImage(undefined)}>
              Remove photo
            </button>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Save character
        </button>
        <Link className="btn" to="/">
          Cancel
        </Link>
      </div>
    </form>
  );
}
