import { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../AuthContext';
import {
  getPostByIdApi,
  reactPostApi,
  updatePostApi,
  deletePostApi,
} from '../api/postApi';
import {
  createCommentApi,
  deleteCommentApi,
  reviewCommentApi,
  createReplyApi,
} from '../api/commentApi';
import '../styles/post.css';

const REACTIONS = [
  { key: 'fire',  emoji: '🔥', label: 'Fire'  },
  { key: 'drama', emoji: '👀', label: 'Drama' },
  { key: 'skull', emoji: '💀', label: 'Skull' },
  { key: 'shock', emoji: '😮', label: 'Shock' },
];

const MAX_COMMENT = 500;
const CATEGORIES = ['Relationship', 'Family', 'Advice', 'Friendship', 'Drama', 'Hot Take'];

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

function getInitial(name) {
  return (name || 'A')[0].toUpperCase();
}

function Toast({ msg, type, show }) {
  return (
    <div className={`toast ${type}${show ? ' show' : ''}`}>
      <span>{type === 'success' ? '✅' : '❌'}</span>
      {msg}
    </div>
  );
}

function CommentSkeleton() {
  return (
    <div className="skel-comment">
      <div className="skel skel-line skel-short" style={{ marginBottom: 12 }} />
      <div className="skel skel-line skel-long" />
      <div className="skel skel-line skel-med" />
    </div>
  );
}

function CommentCard({ comment, currentUserId, postId, onDelete, onReview, onReply }) {
  const [showReplyInput,  setShowReplyInput]  = useState(false);
  const [replyText,       setReplyText]       = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const authorName = 'Anonymous';
  const isOwner    = currentUserId && comment.author?._id === currentUserId;

  const hearts       = Array.isArray(comment.review?.hearts)       ? comment.review.hearts.length       : 0;
  const brokenhearts = Array.isArray(comment.review?.brokenhearts) ? comment.review.brokenhearts.length : 0;

  const hasHeart  = currentUserId && Array.isArray(comment.review?.hearts)
    && comment.review.hearts.some(id => id === currentUserId || id?._id === currentUserId);
  const hasBroken = currentUserId && Array.isArray(comment.review?.brokenhearts)
    && comment.review.brokenhearts.some(id => id === currentUserId || id?._id === currentUserId);

  async function handleReply() {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      await onReply(comment._id, replyText.trim());
      setReplyText('');
      setShowReplyInput(false);
    } finally {
      setSubmittingReply(false);
    }
  }

  return (
    <div className="comment-card">
      {/* Header */}
      <div className="comment-header">
        <div className="comment-avatar">A</div>
        <span className="comment-author">{authorName}</span>
        <span className="comment-time">{timeAgo(comment.createdAt)}</span>
      </div>
      <p className="comment-body">{comment.comment}</p>

      <div className="comment-actions">
        <button
          className={`review-btn hearts${hasHeart ? ' active' : ''}`}
          onClick={() => onReview(comment._id, 'hearts')}
          title="This helped"
        >
          <i className="fa-solid fa-heart"></i> {hearts}
        </button>

        <button
          className={`review-btn brokenhearts${hasBroken ? ' active' : ''}`}
          onClick={() => onReview(comment._id, 'brokenhearts')}
          title="Not helpful"
        >
          <i className="fa-solid fa-heart-crack"></i> {brokenhearts}
        </button>

        <button
          className="reply-toggle-btn"
          onClick={() => setShowReplyInput((v) => !v)}
        >
          <i className="fa-solid fa-comment-dots"></i> Reply
          {comment.replies?.length > 0 && ` (${comment.replies.length})`}
        </button>

        {isOwner && (
          <button className="delete-btn" onClick={() => onDelete(comment._id)}>
            <i className="fa-solid fa-trash-can"></i> Delete
          </button>
        )}
      </div>

      {(comment.replies?.length > 0 || showReplyInput) && (
        <div className="replies-section">
          {comment.replies?.map((reply, idx) => (
            <div className="reply-item" key={reply._id || idx}>
              <div className="reply-avatar">A</div>
              <div className="reply-content">
                <div>
                  <span className="reply-author">Anonymous</span>
                  <span className="reply-time">{timeAgo(reply.createdAt)}</span>
                </div>
                <p className="reply-body">{reply.reply}</p>
              </div>
            </div>
          ))}

          {showReplyInput && (
            <div className="reply-input-row">
              <input
                className="reply-input"
                type="text"
                placeholder="Write a reply…"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                maxLength={300}
                autoFocus
              />
              <button
                className="btn-post-reply"
                onClick={handleReply}
                disabled={submittingReply || !replyText.trim()}
              >
                {submittingReply ? '…' : 'Reply'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ─── EditPostForm ────────────────────────────────────────────
function EditPostForm({ post, onSave, onCancel, saving }) {
  const [title,    setTitle]    = useState(post.title);
  const [category, setCategory] = useState(post.category);
  const [story,    setStory]    = useState(post.story);
  const [tags,     setTags]     = useState((post.tags || []).join(', '));
  const [anon,     setAnon]     = useState(post.anonymous || false);

  const canSave = title.trim() && story.trim().length >= 10 && !saving;

  function handleSubmit() {
    if (!canSave) return;
    const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 5);
    onSave({ title: title.trim(), category, story: story.trim(), tags: parsedTags, anonymous: anon });
  }

  return (
    <div className="edit-post-form">
      <div className="edit-form-header">
        <h2 className="edit-form-title">
          <i className="fa-solid fa-pen-to-square"></i> Edit Post
        </h2>
        <button className="btn-cancel-edit-icon" onClick={onCancel} title="Cancel">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div className="edit-field">
        <label className="edit-label">Title</label>
        <input className="edit-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="What's the tea?" maxLength={150} />
        <span className={`edit-char ${title.length > 140 ? 'warn' : ''}`}>{title.length}/150</span>
      </div>

      <div className="edit-field">
        <label className="edit-label">Category</label>
        <select className="edit-select" value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="edit-field">
        <label className="edit-label">Story</label>
        <textarea className="edit-textarea" value={story} onChange={e => setStory(e.target.value)} placeholder="Tell the story…" rows={7} />
        <span className={`edit-char ${story.trim().length < 10 ? 'warn' : ''}`}>
          {story.trim().length < 10 ? `${10 - story.trim().length} more chars needed` : `${story.length} chars`}
        </span>
      </div>

      <div className="edit-field">
        <label className="edit-label">Tags <span className="edit-label-hint">(comma separated, max 5)</span></label>
        <input className="edit-input" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. breakup, toxic-friend" />
      </div>

      <label className="edit-anon-label">
        <input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)} />
        Post anonymously
      </label>

      <div className="edit-form-actions">
        <button className="btn-cancel-edit" onClick={onCancel}>Cancel</button>
        <button className="btn-save-edit" onClick={handleSubmit} disabled={!canSave}>
          {saving
            ? <><span className="btn-spinner" /> Saving…</>
            : <><i className="fa-solid fa-floppy-disk"></i> Save Changes</>
          }
        </button>
      </div>
    </div>
  );
}

export default function Post() {
  const { id }   = useParams();
  const navigate = useNavigate();

  // ── Auth from context ──────────────────────────────────────
  const { user } = useContext(AuthContext);
  const isLoggedIn    = !!user;
  const currentUserId = user?._id || user?.id || null;

  const [post,        setPost]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [toast,       setToast]       = useState({ show: false, msg: '', type: 'success' });

  // ── Edit / Delete state
  const [editMode,    setEditMode]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPostByIdApi(id);
      const post = res.data.post;
      if (post && Array.isArray(post.comments)) {
        post.comments = post.comments.filter(Boolean);
      }
      setPost(post);
    } catch (err) {
      setError(err?.response?.data?.message || 'Post not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchPost(); }, [fetchPost]);

  async function handleReact(reaction) {
    if (!isLoggedIn) { navigate('/login'); return; }
    try {
      await reactPostApi(id, reaction);
      const updated = await getPostByIdApi(id);
      setPost(updated.data.post);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to react', 'error');
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!isLoggedIn) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      await createCommentApi(id, { comment: commentText.trim() });
      setCommentText('');
      showToast('Comment added!', 'success');
      await fetchPost();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to add comment', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      await deleteCommentApi(commentId);
      showToast('Comment deleted', 'success');
      await fetchPost();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete', 'error');
    }
  }

  async function handleReviewComment(commentId, type) {
    if (!isLoggedIn) { navigate('/login'); return; }
    try {
      await reviewCommentApi(commentId, type);
      await fetchPost();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to review', 'error');
    }
  }

  async function handleReply(commentId, replyText) {
    if (!isLoggedIn) { navigate('/login'); return; }
    try {
      await createReplyApi(commentId, { reply: replyText });
      await fetchPost();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to add reply', 'error');
    }
  }

  // ── Post owner check
  const isPostOwner = !!(currentUserId && post && (
    post.owner?._id === currentUserId || post.owner === currentUserId
  ));

  async function handleSaveEdit(data) {
    setSaving(true);
    try {
      await updatePostApi(id, data);
      showToast('Post updated!', 'success');
      setEditMode(false);
      await fetchPost();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to update', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePost() {
    try {
      await deletePostApi(id);
      setShowConfirm(false);
      showToast('Post deleted', 'success');
      setTimeout(() => navigate('/feed'), 1200);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete post', 'error');
    }
  }

  function showToast(msg, type) {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  }

  function getReactionCount(key) {
    return Array.isArray(post?.reactions?.[key]) ? post.reactions[key].length : 0;
  }

  function hasReacted(key) {
    if (!currentUserId || !post?.reactions?.[key]) return false;
    return post.reactions[key].some(
      (uid) => uid === currentUserId || uid?._id === currentUserId
    );
  }

  const authorLabel = post?.anonymous
    ? 'Anonymous'
    : post?.owner?.username || 'Anonymous';

  const populatedComments = Array.isArray(post?.comments)
    ? post.comments.filter((c) => c && typeof c === 'object' && c._id && c.comment)
    : [];
  const commentCount = populatedComments.length;
  const charPct      = commentText.length / MAX_COMMENT;
  const charCls      = charPct >= 1 ? 'over' : charPct >= 0.85 ? 'warn' : '';

  if (loading) {
    return (
      <>
        <Navbar activePage="feed" />
        <div className="post-page">
          <div className="post-detail-card">
            <div className="skel skel-line" style={{ height: 28, width: '70%', marginBottom: 16 }} />
            <div className="skel skel-line skel-short" style={{ marginBottom: 16 }} />
            <div className="skel skel-line skel-long" />
            <div className="skel skel-line skel-med" />
            <div className="skel skel-line skel-long" />
          </div>
          <CommentSkeleton />
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Navbar activePage="feed" />
        <div className="post-page">
          <div className="comments-empty">
            <div className="e-icon">⚠️</div>
            <p>{error || 'Post not found'}</p>
            <button className="back-link" onClick={() => navigate('/feed')} style={{ marginTop: 16 }}>
              <i className="fa-solid fa-arrow-left"></i> Back to Feed
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar activePage="feed" />

      <div className="post-page">

        {/* Back */}
        <button className="back-link" onClick={() => navigate('/feed')}>
          <i className="fa-solid fa-arrow-left"></i> Back to Feed
        </button>

        {/* ── Post detail card ── */}
        <div className="post-detail-card">
          {editMode ? (
            <EditPostForm
              post={post}
              saving={saving}
              onSave={handleSaveEdit}
              onCancel={() => setEditMode(false)}
            />
          ) : (
            <>
              {isPostOwner && (
                <div className="post-owner-actions">
                  <button className="btn-edit-post" onClick={() => setEditMode(true)}>
                    <i className="fa-solid fa-pen-to-square"></i> Edit
                  </button>
                  <button className="btn-delete-post" onClick={() => setShowConfirm(true)}>
                    <i className="fa-solid fa-trash-can"></i> Delete
                  </button>
                </div>
              )}

              <h1 className="post-detail-title">{post.title}</h1>

              <div className="post-detail-tags">
                <span className={`tag ${tagClass(post.category)}`}>{post.category}</span>
                <span className="tag-anon">{authorLabel}</span>
                <span className="tag-meta">
                  <i className="fa-regular fa-clock"></i> {timeAgo(post.createdAt)}
                </span>
              </div>

              {post.tags?.length > 0 && (
                <div className="post-detail-chips">
                  {post.tags.map((t) => (
                    <span key={t} className="post-chip">#{t}</span>
                  ))}
                </div>
              )}

              <p className="post-detail-story">{post.story}</p>

              <div className="reactions-row">
                {REACTIONS.map((r) => (
                  <button
                    key={r.key}
                    className={`reaction-btn${hasReacted(r.key) ? ' reacted' : ''}`}
                    onClick={() => handleReact(r.key)}
                    title={r.label}
                  >
                    <span className="r-emoji">{r.emoji}</span>
                    {getReactionCount(r.key)}
                  </button>
                ))}
                <span className="reactions-spacer" />
                <span className="comment-count-pill">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {commentCount} comment{commentCount !== 1 ? 's' : ''}
                </span>
              </div>
            </>
          )}
        </div>

        {/* ── Comment form ── */}
        {!editMode && <div className="comment-form-card">
          <h3 className="comment-form-title">Share Your Advice</h3>
          <form onSubmit={handleAddComment} noValidate>
            <textarea
              className="comment-textarea"
              placeholder={isLoggedIn ? "What would you do in this situation? Share your thoughts..." : "Login to share your advice…"}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={MAX_COMMENT + 10}
              onClick={() => { if (!isLoggedIn) navigate('/login'); }}
              readOnly={!isLoggedIn}
            />
            <div className="comment-form-footer">
              <span className={`comment-char ${charCls}`}>
                {commentText.length}/{MAX_COMMENT} characters
              </span>
              {isLoggedIn ? (
                <button
                  type="submit"
                  className="btn-add-comment"
                  disabled={submitting || !commentText.trim() || commentText.length > MAX_COMMENT}
                >
                  {submitting
                    ? <><span className="btn-spinner" /> Adding…</>
                    : <><i className="fa-solid fa-circle-plus"></i> Add Comment</>
                  }
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-add-comment"
                  onClick={() => navigate('/login')}
                >
                  Login to Comment
                </button>
              )}
            </div>
          </form>
        </div>}

        {/* ── Comments list ── */}
        {!editMode && <div className="comments-section">
          <h3 className="comments-heading">
            Advice &amp; Opinions ({commentCount})
          </h3>

          {commentCount === 0 ? (
            <div className="comments-empty">
              <div className="e-icon">🤐</div>
              <p>No comments yet. Be the first to share your advice!</p>
            </div>
          ) : (
            populatedComments.map((comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                currentUserId={currentUserId}
                postId={id}
                onDelete={handleDeleteComment}
                onReview={handleReviewComment}
                onReply={handleReply}
              />
            ))
          )}
        </div>}
      </div>

      {showConfirm && (
        <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">🗑️</div>
            <h3>Delete this post?</h3>
            <p>This cannot be undone. All comments will also be removed.</p>
            <div className="confirm-actions">
              <button className="btn-confirm-cancel" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn-confirm-delete" onClick={handleDeletePost}>
                <i className="fa-solid fa-trash-can"></i> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast show={toast.show} msg={toast.msg} type={toast.type} />
    </>
  );
}