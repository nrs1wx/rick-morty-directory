// One component for loading / error / empty states
export default function StatusMessage({ type, message, actionLabel, onAction }) {
  return (
    <div
      className={`message message-${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      {type === "loading" && <div className="spinner" />}
      <p>{message}</p>
      {actionLabel && (
        <button className="btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
