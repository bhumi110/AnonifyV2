import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createPostApi } from "../api/postApi";
import "../styles/create.css";

// ─── constants ─────────────────────────────────────────────
const CATEGORIES = [
  "Relationship",
  "Family",
  "Advice",
  "Friendship",
  "Drama",
  "Hot Take",
];

const POPULAR_TAGS = [
  "toxic-friend",
  "breakup",
  "college",
  "work",
  "parents",
  "roommate",
  "dating",
  "school",
  "social-media",
  "mental-health",
  "money",
  "future",
];

const MAX_TITLE = 120;
const MAX_STORY = 2000;
const MAX_TAGS = 5;

// ─── Toast ─────────────────────────────────────────────────
function Toast({ msg, type, show }) {
  return (
    <div className={`toast ${type}${show ? " show" : ""}`}>
      <span>{type === "success" ? "✅" : "❌"}</span>
      {msg}
    </div>
  );
}

// ─── SpillTea ───────────────────────────────────────────────
export default function Create() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [story, setStory] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [anon, setAnon] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const tagInputRef = useRef(null);

  // ── tag helpers ─────────────────────────────────────────
  function addTag(val) {
    const clean = val.trim().toLowerCase().replace(/\s+/g, "-");
    if (!clean || tags.includes(clean) || tags.length >= MAX_TAGS) return;
    setTags((prev) => [...prev, clean]);
    setTagInput("");
    tagInputRef.current?.focus();
  }

  function removeTag(tag) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function togglePopularTag(tag) {
    if (tags.includes(tag)) removeTag(tag);
    else if (tags.length < MAX_TAGS) setTags((prev) => [...prev, tag]);
  }

  // ── validation ──────────────────────────────────────────
  function validate() {
    const errs = {};
    if (!title.trim()) errs.title = "Give your story a title";
    else if (title.length > MAX_TITLE)
      errs.title = `Max ${MAX_TITLE} characters`;

    if (!category) errs.category = "Pick a category";

    if (!story.trim()) errs.story = "Tell us your story!";
    else if (story.trim().length < 10) errs.story = "At least 10 characters";
    else if (story.length > MAX_STORY)
      errs.story = `Max ${MAX_STORY} characters`;

    return errs;
  }

  // ── submit → createPostApi ───────────────────────────────
  // Payload: { title, category, content, tags, isAnonymous }
  // axiosInstance interceptor auto-attaches Bearer token from localStorage("token")
  async function handleSubmit(e) {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      // Payload fields match Post model exactly
      const payload = {
        title: title.trim(),
        category,
        story: story.trim(), // <-- change this
        tags,
        anonymous: anon,
      };

      await createPostApi(payload);

      showToast("Tea spilled! 🍵 Redirecting…", "success");
      setTimeout(() => navigate("/feed"), 1800);
    } catch (err) {
      const serverErr = err?.response?.data;
      const msg =
        serverErr?.message ||
        (serverErr?.errors
          ? Object.values(serverErr.errors)
              .map((e) => e.message)
              .join(", ")
          : null) ||
        err?.message ||
        "Something went wrong. Try again.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg, type) {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3400);
  }

  const storyPct = story.length / MAX_STORY;
  const counterCls = storyPct >= 1 ? "over" : storyPct >= 0.85 ? "warn" : "";

  // ─── render ─────────────────────────────────────────────
  return (
    <>
      <Navbar activePage="" />

      <div className="spill-page">
        {/* Back link */}
        <button className="back-link" onClick={() => navigate("/feed")}>
          ← Back to Feed
        </button>

        {/* Hero */}
        <div className="spill-hero">
          <span className="hero-icon">🍵</span>
        </div>

        {/* Heading */}
        <div className="spill-heading">
          <h1>Spill the Tea</h1>
          <p>Share your story anonymously and get advice from the community</p>
        </div>

        {/* Form card */}
        <div className="spill-card">
          <form onSubmit={handleSubmit} noValidate>
            <p className="card-section-title">Your Story</p>

            {/* Title */}
            <div className="field">
              <label htmlFor="post-title">Title:</label>
              <input
                id="post-title"
                type="text"
                placeholder="Give your story a catchy title"
                value={title}
                maxLength={MAX_TITLE + 10}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((x) => ({ ...x, title: "" }));
                }}
                className={errors.title ? "err" : ""}
                autoFocus
              />
              {errors.title && <p className="field-error">⚠ {errors.title}</p>}
            </div>

            {/* Category */}
            <div className="field">
              <label htmlFor="post-cat">Category:</label>
              <div className="select-wrap">
                <select
                  id="post-cat"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setErrors((x) => ({ ...x, category: "" }));
                  }}
                  className={errors.category ? "err" : ""}
                >
                  <option value="">Choose a category…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              {errors.category && (
                <p className="field-error">⚠ {errors.category}</p>
              )}
            </div>

            {/* Story textarea */}
            <div className="field">
              <label htmlFor="post-story">Your Story:</label>
              <textarea
                id="post-story"
                placeholder="Tell us what happened…Don't hold back! 🍵"
                value={story}
                onChange={(e) => {
                  setStory(e.target.value);
                  setErrors((x) => ({ ...x, story: "" }));
                }}
                className={errors.story ? "err" : ""}
              />
              <div className={`char-counter ${counterCls}`}>
                {story.length} / {MAX_STORY}
              </div>
              {errors.story && <p className="field-error">⚠ {errors.story}</p>}
            </div>

            <div className="form-divider" />

            {/* Tags */}
            <div className="tags-section">
              <label>Tags (Optional):</label>

              <div className="tag-input-row">
                <input
                  ref={tagInputRef}
                  type="text"
                  placeholder="Add a custom tag…"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  maxLength={30}
                />
                <button
                  type="button"
                  className="btn-add-tag"
                  onClick={() => addTag(tagInput)}
                >
                  Add
                </button>
              </div>

              <p className="popular-label">Popular tags:</p>
              <div className="tag-pool">
                {POPULAR_TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`tag-chip${tags.includes(t) ? " selected" : ""}`}
                    onClick={() => togglePopularTag(t)}
                    disabled={!tags.includes(t) && tags.length >= MAX_TAGS}
                  >
                    {t}
                    {tags.includes(t) && <span className="chip-x">✕</span>}
                  </button>
                ))}
              </div>

              {tags.length > 0 && (
                <div className="selected-tags">
                  {tags.map((t) => (
                    <span key={t} className="sel-tag">
                      #{t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        aria-label={`Remove ${t}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <p className="tag-count">
                {tags.length}/{MAX_TAGS} tags selected
              </p>
            </div>

            <div className="form-divider" />

            {/* Anonymous toggle */}
            <div className="anon-row">
              <div className="anon-text">
                <h4>Post Anonymously</h4>
                <p>Your identity will be completely hidden</p>
              </div>
              <label className="toggle" aria-label="Toggle anonymous posting">
                <input
                  type="checkbox"
                  checked={anon}
                  onChange={(e) => setAnon(e.target.checked)}
                />
                <span className="toggle-track" />
              </label>
            </div>

            {/* Guidelines */}
            <div className="guidelines">
              <span className="g-icon">⚠️</span>
              <div className="guidelines-text">
                <h4>Community Guidelines</h4>
                <p>
                  Keep it respectful, no hate speech, and remember - what you
                  share here stays here. Be kind to others going through tough
                  times.
                </p>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-spill-it" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner" /> Spilling…
                </>
              ) : (
                <>Spill It 🍵</>
              )}
            </button>
          </form>
        </div>
      </div>

      <Toast show={toast.show} msg={toast.msg} type={toast.type} />
    </>
  );
}
