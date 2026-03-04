import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { loginApi } from '../api/authApi';   // ← your actual auth api
import '../styles/auth.css';

// ── Google logo ────────────────────────────────────────────
function GoogleLogo() {
  return (
    <svg className="google-logo" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
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

// ── Login ──────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [errors,  setErrors]  = useState({});
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState({ show: false, msg: '', type: 'success' });

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  // ── validation ─────────────────────────────────────────
  function validate() {
    const errs = {};
    if (!form.email.trim())
      errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Enter a valid email';
    if (!form.password)
      errs.password = 'Password is required';
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
      const res = await loginApi({
        email:    form.email.trim(),
        password: form.password,
      });

      // Your axiosInstance returns res.data directly
      // Store token with key "token" — matches your axiosInstance interceptor
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
      }
      // Flag for Navbar Login → Logout swap
      localStorage.setItem('isLoggedIn', 'true');

      showToast('Welcome back! Redirecting…', 'success');
      setTimeout(() => navigate('/feed'), 1500);

    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Invalid credentials. Try again.';
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
      <Navbar activePage="login" />

      <main className="auth-page">
        <h1 className="auth-title">Login on Anonify</h1>

        <div className="auth-card">
          <form onSubmit={handleSubmit} noValidate>

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
                  autoFocus
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
                  placeholder="your lil secret"
                  value={form.password}
                  onChange={set('password')}
                  className={errors.password ? 'error-input' : ''}
                  autoComplete="current-password"
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
              {errors.password && <p className="field-error">⚠ {errors.password}</p>}
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? <><span className="btn-spinner" /> Logging in…</> : 'Login'}
            </button>

          </form>

          <div className="or-divider">OR</div>

          <button
            type="button"
            className="btn-google"
            onClick={() => { window.location.href = 'http://localhost:8080/api/auth/google'; }}
          >
            <GoogleLogo />
            Continue with Google
          </button>
        </div>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup">Sign up here</Link>
        </p>
      </main>

      <Toast show={toast.show} msg={toast.msg} type={toast.type} />
    </>
  );
}