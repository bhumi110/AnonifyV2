import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import '../styles/feed.css';

const CATEGORIES = [
  'All', 'Relationship', 'Family', 'Friendship',
  'Hot Take', 'Drama', 'Advice',
];
const PAGE_SIZE = 10;

function tagClass(cat) {
  const map = {
    'Hot Take':     'tag-hot-take',
    'Relationship': 'tag-relationship',
    'Family':       'tag-family',
    'Friendship':   'tag-friendship',
    'Drama':        'tag-drama',
    'Advice':       'tag-advice',
    'Confession':   'tag-confession',
  };
  return map[cat] || 'tag-default';
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return `${Math.floor(diff)}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
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
  return (
    <article className="post-card">
      <h2 className="post-title">{post.title}</h2>

      <div className="post-tags">
        <span className={`tag ${tagClass(post.category)}`}>{post.category}</span>
        <span className="tag-anon">Anonymous</span>
      </div>

      <p className="post-body">{post.body}</p>

      {/* Reactions */}
      <div className="post-reactions">
        {post.reactions?.map((r) => (
          <span className="reaction" key={r.emoji} title={r.label}>
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
          {post.comments?.toLocaleString()}
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
  const [posts,       setPosts]       = useState([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [category,    setCategory]    = useState('All');
  const [sort,        setSort]        = useState('trending');
  const [search,      setSearch]      = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error,       setError]       = useState(null);

  const fetchPosts = useCallback(async (pg, cat, srt, q, append = false) => {
    pg === 1 ? setLoading(true) : setLoadingMore(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page:  pg,
        limit: PAGE_SIZE,
        sort:  srt,
        ...(cat !== 'All' && { category: cat }),
        ...(q.trim()      && { search:   q.trim() }),
      });

      const res = await fetch(`/api/posts?${params}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const data = await res.json();

      setPosts((prev) => append ? [...prev, ...data.posts] : data.posts);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchPosts(1, category, sort, search, false);
  }, [category, sort, search, fetchPosts]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchDraft), 420);
    return () => clearTimeout(t);
  }, [searchDraft]);

  const handleSearchBtn = () => setSearch(searchDraft);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(next, category, sort, search, true);
  };

  const hasMore = posts.length < total;

  return (
    <>
      <Navbar activePage="feed" />

      <main className="feed-page">

        {/* Header */}
        <div className="feed-header">
          <h1>Feed 🔥</h1>
          <p>The latest drama and advice from the community</p>
        </div>

        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search drama, advice, or confessions..."
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchBtn()}
            aria-label="Search posts"
          />
          <button className="btn-search" onClick={handleSearchBtn}>
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
            {total.toLocaleString()} post{total !== 1 ? 's' : ''} found
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
          </div>

        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍵</div>
            <h3>No tea to spill here</h3>
            <p>Try a different category or search term</p>
          </div>

        ) : (
          <div className="posts-list">
            {posts.map((post) => (
              <PostCard key={post._id ?? post.id} post={post} />
            ))}
            {loadingMore && Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={`sk-${i}`} />
            ))}
          </div>
        )}

        {!loading && !error && hasMore && (
          <div className="feed-actions">
            <button
              className="btn-load-more"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore
                ? <><span className="spinner" /> Loading…</>
                : 'Load more posts'
              }
            </button>
          </div>
        )}

      </main>
    </>
  );
}