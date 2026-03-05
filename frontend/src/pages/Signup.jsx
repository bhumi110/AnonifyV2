import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import '../styles/auth.css';

// ── password strength ──────────────────────────────────────
function getStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const STRENGTH_LABELS = ['', 'Weak', 'Okay', 'Good', 'Strong 💪'];

function StrengthBar({ password }) {
  const s   = getStrength(password);
  const cls = s <= 1 ? 'filled-weak' : s <= 2 ? 'filled-medium' : 'filled-strong';
  return (
    <>
      <div className="strength-bar">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`strength-seg${i < s ? ` ${cls}` : ''}`} />
        ))}
      </div>
      {password && <p className="strength-label">{STRENGTH_LABELS[s]}</p>}
    </>
  );
}

// ── Toast ──────────────────────────────────────────────────
function Toast({ msg, type, show }) {
  return (
    <div className={`toast ${type}${show ? ' show' : ''}`}>
      <span>{type === 'success' ? '✅' : '❌'}</span>
      {msg}
    </div>
  );
}

// ── Signup ─────────────────────────────────────────────────
export default function Signup() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const [form,    setForm]    = useState({ username: '', email: '', password: '' });
  const [errors,  setErrors]  = useState({});
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState({ show: false, msg: '', type: 'success' });

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  // ── validation ─────────────────────────────────────────
  function validate() {
    const errs = {};
    if (!form.username.trim())    errs.username = 'Username is required';
    else if (form.username.trim().length < 3) errs.username = 'At least 3 characters';

    if (!form.email.trim())       errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Enter a valid email';

    if (!form.password)           errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'At least 8 characters';

    return errs;
  }

  // ── submit ─────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      await register({
        username: form.username.trim(),
        email:    form.email.trim(),
        password: form.password,
      });

      showToast('Account created! Redirecting…', 'success');
      setTimeout(() => navigate('/feed'), 1600);

    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Signup failed. Try again.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg, type) {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3200);
  }

  // ── render ─────────────────────────────────────────────
  return (
    <>
      <Navbar activePage="signup" />

      <main className="auth-page">
        <h1 className="auth-title">Signup on Anonify</h1>

        <div className="auth-card">
          <form onSubmit={handleSubmit} noValidate>

            {/* Username */}
            <div className="field">
              <label htmlFor="username">Username:</label>
              <div className="field-wrap">
                <span className="field-icon">👤</span>
                <input
                  id="username"
                  type="text"
                  placeholder="yourVibe"
                  value={form.username}
                  onChange={set('username')}
                  className={errors.username ? 'error-input' : ''}
                  autoComplete="username"
                  autoFocus
                />
              </div>
              {errors.username && <p className="field-error">⚠ {errors.username}</p>}
            </div>

            {/* Email */}
            <div className="field">
              <label htmlFor="email">Email:</label>
              <div className="field-wrap">
                <span className="field-icon">✉️</span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@gmail.com"
                  value={form.email}
                  onChange={set('email')}
                  className={errors.email ? 'error-input' : ''}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="field-error">⚠ {errors.email}</p>}
            </div>

            {/* Password */}
            <div className="field">
              <label htmlFor="password">Password:</label>
              <div className="field-wrap">
                <span className="field-icon">🔒</span>
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Make it legendary (use 8+ chars)"
                  value={form.password}
                  onChange={set('password')}
                  className={errors.password ? 'error-input' : ''}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="field-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {form.password && <StrengthBar password={form.password} />}
              {errors.password && <p className="field-error">⚠ {errors.password}</p>}
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? <><span className="btn-spinner" /> Signing up…</> : 'Signup'}
            </button>

          </form>
        </div>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Login here</Link>
        </p>
      </main>

      <Toast show={toast.show} msg={toast.msg} type={toast.type} />
    </>
  );
}