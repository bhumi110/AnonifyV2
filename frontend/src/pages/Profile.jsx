import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { getProfileApi } from '../api/userApi';
import '../styles/profile.css';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)      return `${Math.floor(diff)}s ago`;
  if (diff < 3600)    return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)   return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(dateStr).toLocaleDateString();
}

function joinedDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function tagClass(cat) {
  const map = {
    'Hot Take':     'tag-hot-take',
    'Relationship': 'tag-relationship',
    'Family':       'tag-family',
    'Friendship':   'tag-friendship',
    'Drama':        'tag-drama',
    'Advice':       'tag-advice',
  };
  return map[cat] || 'tag-default';
}

const REACTIONS = [
  { key: 'fire',  emoji: '🔥' },
  { key: 'drama', emoji: '👀' },
  { key: 'skull', emoji: '💀' },
  { key: 'shock', emoji: '😮' },
];

function PostCard({ post, onClick }) {
  const totalReactions = REACTIONS.reduce(
    (sum, r) => sum + (Array.isArray(post.reactions?.[r.key]) ? post.reactions[r.key].length : 0),
    0
  );
  const commentCount = Array.isArray(post.comments) ? post.comments.length : 0;

  return (
    <article className="profile-post-card" onClick={onClick}>
      <div className="ppc-top">
        <span className={`tag ${tagClass(post.category)}`}>{post.category}</span>
        {post.anonymous && <span className="ppc-anon-badge">Anonymous</span>}
        <span className="ppc-time">{timeAgo(post.createdAt)}</span>
      </div>
      <h3 className="ppc-title">{post.title}</h3>
      <p className="ppc-story">{post.story}</p>
      <div className="ppc-footer">
        <div className="ppc-reactions">
          {REACTIONS.map((r) => {
            const count = Array.isArray(post.reactions?.[r.key]) ? post.reactions[r.key].length : 0;
            return count > 0 ? (
              <span key={r.key} className="ppc-reaction">
                {r.emoji} {count}
              </span>
            ) : null;
          })}
          {totalReactions === 0 && <span className="ppc-no-reactions">No reactions yet</span>}
        </div>
        <span className="ppc-comments">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {commentCount}
        </span>
      </div>
    </article>
  );
}

function SkeletonProfile() {
  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="skel" style={{ width: 88, height: 88, borderRadius: '50%', marginBottom: 16 }} />
        <div className="skel skel-line" style={{ width: '40%', height: 22, marginBottom: 10 }} />
        <div className="skel skel-line" style={{ width: '25%', height: 14 }} />
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate   = useNavigate();
  const [user,     setUser]    = useState(null);
  const [posts,    setPosts]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState(null);

  const { user: authUser } = useContext(AuthContext);
  const username = authUser?.username || '';
  const initial  = username ? username[0].toUpperCase() : '?';

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // GET /users/profile  → { success, user, posts }
      const res = await getProfileApi();
      setUser(res.data.user);
      setPosts(res.data.posts || []);
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err?.response?.data?.message || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) return (
    <>
      <Navbar activePage="profile" />
      <SkeletonProfile />
    </>
  );

  if (error) return (
    <>
      <Navbar activePage="profile" />
      <div className="profile-page">
        <div className="profile-error">
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={fetchProfile}>Try again</button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navbar activePage="profile" />

      <div className="profile-page">

        {/* ── Profile card ── */}
        <div className="profile-card">

          {/* Glow blobs */}
          <div className="profile-blob profile-blob-1" aria-hidden="true" />
          <div className="profile-blob profile-blob-2" aria-hidden="true" />

          <div className="profile-card-inner">
            {/* Avatar */}
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                <span className="profile-avatar-initial">{initial}</span>
              </div>
              <div className="profile-avatar-ring" aria-hidden="true" />
            </div>

            {/* Info */}
            <div className="profile-info">
              <h1 className="profile-username">@{user?.username}</h1>
              <p className="profile-email">{user?.email}</p>
              <p className="profile-joined">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8"  y1="2" x2="8"  y2="6"/>
                  <line x1="3"  y1="10" x2="21" y2="10"/>
                </svg>
                Joined {joinedDate(user?.createdAt)}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="profile-divider" />

          {/* Stats row */}
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="stat-value">{posts.length}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="profile-stat-sep" />
            <div className="profile-stat">
              <span className="stat-value">
                {posts.reduce((sum, p) =>
                  sum + REACTIONS.reduce((s, r) =>
                    s + (Array.isArray(p.reactions?.[r.key]) ? p.reactions[r.key].length : 0), 0
                  ), 0
                )}
              </span>
              <span className="stat-label">Reactions</span>
            </div>
            <div className="profile-stat-sep" />
            <div className="profile-stat">
              <span className="stat-value">
                {posts.reduce((sum, p) =>
                  sum + (Array.isArray(p.comments) ? p.comments.length : 0), 0
                )}
              </span>
              <span className="stat-label">Comments</span>
            </div>
          </div>
        </div>

        {/* ── My Posts header ── */}
        <div className="profile-posts-header">
          <button className="btn-my-posts" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            My Posts
          </button>
          <button className="btn-spill-profile" onClick={() => navigate('/create')}>
            <i class="fa-solid fa-plus"></i> Spill Tea
          </button>
        </div>

        {/* ── Posts list ── */}
        {posts.length === 0 ? (
          <div className="profile-empty">
            <div className="profile-empty-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <p>No posts yet</p>
            <button className="btn-spill-empty" onClick={() => navigate('/spill')}>
              Spill your first tea ☕
            </button>
          </div>
        ) : (
          <div className="profile-posts-list">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onClick={() => navigate(`/post/${post._id}`)}
              />
            ))}
          </div>
        )}

      </div>
    </>
  );
}