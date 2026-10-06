import { useState, type FormEvent } from 'react';

const PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? 'admin123';

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value === PASSWORD) onSuccess();
    else setError(true);
  };

  return (
    <section className="admin admin--login">
      <form className="login" onSubmit={submit}>
        <h1>Admin sign in</h1>
        <p>Enter the admin password to manage products and orders.</p>
        <div className="field">
          <label htmlFor="admin-pw">Password</label>
          <input
            id="admin-pw"
            type="password"
            className="input"
            autoComplete="current-password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            aria-invalid={error}
            autoFocus
          />
          {error && (
            <p className="field__error" role="alert">
              That password isn’t right. Try again.
            </p>
          )}
        </div>
        <button type="submit" className="btn btn--ink btn--block">
          Sign in
        </button>
      </form>
    </section>
  );
}
