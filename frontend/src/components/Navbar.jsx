import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/navbar.css';


export default function Navbar({ activePage = '' }) {
  const navigate    = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Re-reads on every render → always in sync after login/logout
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  const close = () => setMobileOpen(false);
  const lc    = (page) => `nav-link${activePage === page ? ' active' : ''}`;

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    close();
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
              Feed <span className="link-icon"><i className="fa-solid fa-fire" style={{color: "rgb(245, 116, 0)"}}></i></span>
            </Link>

            {!isLoggedIn && (
              <Link to="/signup" className={lc('signup')}>
                Signup <span className="link-icon"><i className="fa-solid fa-user-plus"></i></span>
              </Link>
            )}

            {isLoggedIn ? (
              <button className="nav-link nav-logout-btn" onClick={handleLogout}>
                Logout <span className="link-icon"> <i className="fa-solid fa-right-from-bracket"></i></span>
              </button>
            ) : (
              <Link to="/login" className={lc('login')}>
                Login <span className="link-icon"><i className="fa-solid fa-arrow-right-to-bracket"></i></span>
              </Link>
            )}
          </div>

          {/* Right CTA */}
          <div className="nav-right">
            <Link to="/create" className="btn-spill-nav"><i className="fa-solid fa-plus"></i> Spill Tea</Link>
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
        <Link to="/feed" className={lc('feed')} onClick={close}>Feed <i className="fa-solid fa-fire" style={{color: "rgb(245, 116, 0)"}}></i></Link>

        {!isLoggedIn && (
          <Link to="/signup" className={lc('signup')} onClick={close}>Signup <i className="fa-solid fa-user-plus"></i></Link>
        )}

        {isLoggedIn ? (
          <button className="nav-link nav-logout-btn" onClick={handleLogout}>
            Logout <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        ) : (
          <Link to="/login" className={lc('login')} onClick={close}>Login <i className="fa-solid fa-arrow-right-to-bracket"></i></Link>
        )}

        <div className="nav-mobile-footer">
          <Link to="/create" className="btn-spill-nav" onClick={close}><i className="fa-solid fa-plus"></i> Spill Tea</Link>
        </div>
      </div>
    </>
  );
}