import { useState } from "react";
import { STATUSES, GENDERS } from "../constants";

export default function CharacterForm({ speciesList, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    species: speciesList[0] ?? "",
    status: "Alive",
    gender: "unknown",
    origin: "",
    location: "",
  });
  const [errors, setErrors] = useState({});

  // One handler for all inputs (controlled by `name`)
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters.";
    if (!form.species) e.species = "Choose a species.";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSubmit({
      name: form.name.trim(),
      species: form.species,
      status: form.status,
      gender: form.gender,
      origin: form.origin.trim(),
      location: form.location.trim(),
    });
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
          <select name="species" value={form.species} onChange={handleChange}>
            {speciesList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
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

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Save character
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
