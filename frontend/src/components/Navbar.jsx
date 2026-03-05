import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/navbar.css';

export default function Navbar({ activePage = '' }) {
  const navigate      = useNavigate();
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [avatarOpen,  setAvatarOpen]  = useState(false);
  const avatarRef     = useRef(null);

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const username   = localStorage.getItem('username') || '';
  const initial    = username ? username[0].toUpperCase() : '?';

  const close = () => setMobileOpen(false);
  const lc    = (page) => `nav-link${activePage === page ? ' active' : ''}`;

  // Close avatar dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    close();
    setAvatarOpen(false);
    navigate('/');
  }

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="nav-inner">

          {/* Brand */}
          <Link to="/" className="nav-brand" aria-label="Anonify home">
            <span className="brand-icon">🍵</span>
            <span className="brand-name">Anonify</span>
          </Link>

          {/* Desktop links */}
          <div className="nav-links">
            <Link to="/feed" className={lc('feed')}>
              Feed <span className="link-icon"><i className="fa-solid fa-fire-flame-curved" style={{color: "rgb(245, 116, 0)"}}></i></span>
            </Link>

            {!isLoggedIn && (
              <Link to="/signup" className={lc('signup')}>
                Signup <span className="link-icon"><i className="fa-solid fa-user-plus"></i></span>
              </Link>
            )}

            {!isLoggedIn && (
              <Link to="/login" className={lc('login')}>
                Login <span className="link-icon"><i className="fa-solid fa-right-to-bracket"></i></span>
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="nav-right">
            <Link to="/create" className="btn-spill-nav"><i className="fa-solid fa-plus"></i> Spill Tea</Link>

            {/* Avatar dropdown — only when logged in */}
            {isLoggedIn && (
              <div className="nav-avatar-wrap" ref={avatarRef}>
                <button
                  className="nav-avatar-btn"
                  onClick={() => setAvatarOpen((v) => !v)}
                  aria-label="Account menu"
                  aria-expanded={avatarOpen}
                >
                  <span className="nav-avatar-initial">{initial}</span>
                </button>

                {avatarOpen && (
                  <div className="nav-avatar-dropdown" role="menu">
                    <div className="nav-avatar-user">
                      <span className="nav-avatar-initial nav-avatar-initial--lg">{initial}</span>
                      <div>
                        <p className="nav-avatar-name">@{username}</p>
                        <p className="nav-avatar-sub">Your profile</p>
                      </div>
                    </div>
                    <div className="nav-avatar-divider" />
                    <Link
                      to="/profile"
                      className="nav-avatar-item"
                      onClick={() => setAvatarOpen(false)}
                      role="menuitem"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      Profile
                    </Link>
                    
                    <div className="nav-avatar-divider" />
                    <button
                      className="nav-avatar-item nav-avatar-logout"
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Log out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="nav-hamburger"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span style={{ transform: mobileOpen ? 'rotate(45deg) translate(5px,5px)'  : 'none' }} />
            <span style={{ opacity:   mobileOpen ? 0 : 1 }} />
            <span style={{ transform: mobileOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
          </button>

        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`nav-mobile${mobileOpen ? ' open' : ''}`} role="menu">
        <Link to="/feed" className={lc('feed')} onClick={close}>Feed <i className="fa-solid fa-fire-flame-curved" style={{color: "rgb(245, 116, 0)"}}></i></Link>

        {isLoggedIn ? (
          <>
            <Link to="/profile" className={lc('profile')} onClick={close}>Profile 👤</Link>
            <button className="nav-link nav-logout-btn" onClick={handleLogout}>Log out 🚪</button>
          </>
        ) : (
          <>
            <Link to="/signup" className={lc('signup')} onClick={close}>Signup 👤</Link>
            <Link to="/login"  className={lc('login')}  onClick={close}>Login <i className="fa-solid fa-right-to-bracket"></i></Link>
          </>
        )}

        <div className="nav-mobile-footer">
          <Link to="/create" className="btn-spill-nav" onClick={close}><i className="fa-solid fa-plus"></i> Spill Tea</Link>
        </div>
      </div>
    </>
  );
}