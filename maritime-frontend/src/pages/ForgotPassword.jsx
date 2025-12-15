import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call backend password reset API in future
    setSent(true);
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter the email linked with your account. We’ll send reset instructions."
    >
      {sent && (
        <div className="auth-success">
          If an account exists with this email, reset instructions have been sent.
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label">
          Email
          <input
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <button type="submit" className="auth-button primary">
          Send reset link
        </button>
      </form>

      <div className="auth-footer-text">
        Remembered your password?{" "}
        <Link to="/login" className="auth-link-strong">
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}
