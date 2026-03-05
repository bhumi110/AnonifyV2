import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getPostsApi } from '../api/postApi';
import '../styles/feed.css';

const CATEGORIES = [
  'All', 'Relationship', 'Family', 'Advice',
  'Friendship', 'Drama', 'Hot Take',
];

const REACTIONS = [
  { key: 'fire',  emoji: '🔥', label: 'Fire'  },
  { key: 'drama', emoji: '👀', label: 'Drama' },
  { key: 'skull', emoji: '💀', label: 'Skull' },
  { key: 'shock', emoji: '😮', label: 'Shock' },
];

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

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)      return `${Math.floor(diff)}s ago`;
  if (diff < 3600)    return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)   return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(dateStr).toLocaleDateString();
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skel skel-title" />
      <div className="skel skel-tag" style={{ marginBottom: 10 }} />
      <div className="skel skel-body" />
      <div className="skel skel-body s2" />
      <div className="skel skel-body s3" />
      <div className="skel skel-foot" />
    </div>
  );
}

function PostCard({ post }) {
  const navigate = useNavigate();


  const reactionCounts = REACTIONS.map((r) => ({
    ...r,
    count: Array.isArray(post.reactions?.[r.key])
      ? post.reactions[r.key].length
      : 0,
  }));

  const authorLabel = post.anonymous
    ? 'Anonymous'
    : post.owner?.username || 'Anonymous';

  return (
    <article
      className="post-card"
      onClick={() => navigate(`/post/${post._id}`)}
      style={{ cursor: 'pointer' }}
    >
      <h2 className="post-title">{post.title}</h2>

      <div className="post-tags">
        <span className={`tag ${tagClass(post.category)}`}>{post.category}</span>
        <span className="tag-anon">{authorLabel}</span>
      </div>

      <p className="post-body">{post.story}</p>

      <div className="post-reactions">
        {reactionCounts.map((r) => (
          <span className="reaction" key={r.key} title={r.label}>
            <span className="r-emoji">{r.emoji}</span>
            <span className="r-count">{r.count.toLocaleString()}</span>
          </span>
        ))}
      </div>

      <div className="post-meta">
        <span className="meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {Array.isArray(post.comments) ? post.comments.length : 0}
        </span>
        <span className="meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {timeAgo(post.createdAt)}
        </span>
      </div>
    </article>
  );
}

export default function Feed() {
  const [allPosts,  setAllPosts]  = useState([]);  // raw API response
  const [displayed, setDisplayed] = useState([]);  // after client-side filter/sort
  const [category,  setCategory]  = useState('All');
  const [sort,      setSort]      = useState('trending');
  const [searchDraft, setSearchDraft] = useState('');
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPostsApi();
      const posts = res.data?.posts ?? [];
      setAllPosts(posts);
    } catch (err) {
      console.error('[Feed]', err?.response?.data || err.message);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load posts'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    let result = [...allPosts];

    if (category !== 'All') {
      result = result.filter((p) => p.category === category);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.story?.toLowerCase().includes(q)
      );
    }

    const totalReactions = (p) =>
      ['fire', 'drama', 'skull', 'shock'].reduce(
        (sum, k) => sum + (Array.isArray(p.reactions?.[k]) ? p.reactions[k].length : 0),
        0
      );

    if (sort === 'latest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sort === 'top') {
      result.sort((a, b) => totalReactions(b) - totalReactions(a));
    } else if (sort === 'trending') {
      result.sort((a, b) => {
        const score = (p) => {
          const r = totalReactions(p);
          const c = Array.isArray(p.comments) ? p.comments.length : 0;
          const ageHours = (Date.now() - new Date(p.createdAt)) / 3_600_000;
          return (r + c * 2) / Math.pow(ageHours + 2, 1.5);
        };
        return score(b) - score(a);
      });
    }

    setDisplayed(result);
  }, [allPosts, category, sort, search]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchDraft), 420);
    return () => clearTimeout(t);
  }, [searchDraft]);

  return (
    <>
      <Navbar activePage="feed" />

      <main className="feed-page">

        {/* Header */}
        <div className="feed-header">
          <h1>Feed 🔥</h1>
          <p>The latest drama and advice from the community</p>
        </div>

        {/* Search */}
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search drama, advice, or confessions..."
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSearch(searchDraft)}
            aria-label="Search posts"
          />
          <button className="btn-search" onClick={() => setSearch(searchDraft)}>
            Search
          </button>
        </div>

        <div className="filter-bar">
          <div className="sort-wrapper">
            <select
              className="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort posts"
            >
              <option value="trending">🔥 Trending</option>
              <option value="latest">✨ Latest</option>
              <option value="top">⬆️ Top</option>
              <option value="oldest">🕐 Oldest</option>
            </select>
          </div>

          <div className="category-pills" role="group" aria-label="Filter by category">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`pill${category === cat ? ' active' : ''}`}
                onClick={() => setCategory(cat)}
                aria-pressed={category === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {!loading && !error && (
          <p className="post-count">
            {displayed.length.toLocaleString()} post{displayed.length !== 1 ? 's' : ''} found
          </p>
        )}

        {loading ? (
          <div className="posts-list">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>

        ) : error ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button
              onClick={fetchPosts}
              style={{
                marginTop: 16, padding: '8px 20px', cursor: 'pointer',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8, color: '#fff', fontFamily: 'inherit',
              }}
            >
              Try again
            </button>
          </div>

        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍵</div>
            <h3>No tea to spill here</h3>
            <p>Try a different category or search term</p>
          </div>

        ) : (
          <div className="posts-list">
            {displayed.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}

      </main>
    </>
  );
}