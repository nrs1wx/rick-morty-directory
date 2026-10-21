import { Link } from "react-router-dom";

export default function NotFound({ message = "Page not found." }) {
  return (
    <div className="message message-empty" role="status">
      <p>{message}</p>
      <Link className="btn" to="/">
        Back to list
      </Link>
    </div>
  );
}
