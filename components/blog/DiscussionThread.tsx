"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Send,
  User,
  Clock,
  Sparkles,
  Share2,
  Check,
  CornerDownRight,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/settings";

interface CommentItem {
  id: string;
  author_name: string;
  content: string;
  upvotes: number;
  created_at: string;
}

export function DiscussionThread({
  postSlug,
  postTitle,
  initialUpvotes = 0,
  locale,
}: {
  postSlug: string;
  postTitle: string;
  initialUpvotes?: number;
  locale: Locale;
}) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentVotes, setCommentVotes] = useState<Record<string, 1 | -1 | 0>>({});
  const [authorName, setAuthorName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load comments
  useEffect(() => {
    async function loadComments() {
      try {
        const res = await fetch(`/api/blog/comment?slug=${encodeURIComponent(postSlug)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.comments)) {
            setComments(data.comments);
          }
        }
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadComments();
  }, [postSlug]);

  // Vote on post
  const handlePostVote = async (direction: 1 | -1) => {
    let newVote: 1 | -1 | 0 = direction;
    let delta: number = direction;

    if (userVote === direction) {
      newVote = 0;
      delta = -direction;
    } else if (userVote !== 0) {
      delta = direction * 2;
    }

    setUserVote(newVote);
    setUpvotes((prev) => Math.max(0, prev + delta));

    try {
      fetch("/api/blog/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "post", slug: postSlug, delta }),
      }).catch(() => {});
    } catch {}
  };

  // Vote on comment
  const handleCommentVote = async (commentId: string, direction: 1 | -1) => {
    const cur = commentVotes[commentId] || 0;
    let newVote: 1 | -1 | 0 = direction;
    let delta: number = direction;

    if (cur === direction) {
      newVote = 0;
      delta = -direction;
    } else if (cur !== 0) {
      delta = direction * 2;
    }

    setCommentVotes((prev) => ({ ...prev, [commentId]: newVote }));
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, upvotes: Math.max(0, c.upvotes + delta) } : c
      )
    );

    try {
      fetch("/api/blog/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "comment", id: commentId, delta }),
      }).catch(() => {});
    } catch {}
  };

  // Submit comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    const tempId = `temp-${Date.now()}`;
    const newComment: CommentItem = {
      id: tempId,
      author_name: authorName.trim() || "Thành viên Myso",
      content: commentText.trim(),
      upvotes: 0,
      created_at: new Date().toISOString(),
    };

    // Optimistic UI update
    setComments((prev) => [...prev, newComment]);
    setCommentText("");

    try {
      const res = await fetch("/api/blog/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_slug: postSlug,
          author_name: authorName.trim() || "Thành viên Myso",
          content: newComment.content,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setComments((prev) =>
            prev.map((c) => (c.id === tempId ? data.comment : c))
          );
        }
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="comments" className="mt-12 pt-8 border-t border-line">
      {/* Top Post Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-4 mb-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl bg-canvas border border-line p-1">
            <button
              onClick={() => handlePostVote(1)}
              className={`p-1.5 rounded-lg transition ${
                userVote === 1 ? "bg-accent/15 text-accent" : "text-muted hover:text-ink"
              }`}
              title="Đồng tình"
            >
              <ChevronUp className="h-5 w-5 stroke-[2.5]" />
            </button>
            <span
              className={`px-2 font-mono text-sm font-bold ${
                userVote === 1
                  ? "text-accent"
                  : userVote === -1
                  ? "text-rose-500"
                  : "text-ink"
              }`}
            >
              {upvotes}
            </span>
            <button
              onClick={() => handlePostVote(-1)}
              className={`p-1.5 rounded-lg transition ${
                userVote === -1 ? "bg-rose-500/15 text-rose-500" : "text-muted hover:text-rose-500"
              }`}
              title="Không đồng tình"
            >
              <ChevronDown className="h-5 w-5 stroke-[2.5]" />
            </button>
          </div>

          <span className="font-mono text-xs text-muted">
            {upvotes} lượt bình chọn
          </span>
        </div>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-3.5 py-2 text-xs font-semibold text-muted hover:text-ink hover:border-accent transition"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-teal" />
              <span className="text-teal font-mono">Đã sao chép link</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              <span>Chia sẻ bài viết</span>
            </>
          )}
        </button>
      </div>

      {/* Discussion Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-accent" />
        <h3 className="font-display text-xl font-bold text-ink">
          Thảo luận cộng đồng ({comments.length})
        </h3>
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="rounded-2xl border border-line bg-surface p-5 mb-8 shadow-sm">
        <div className="mb-3">
          <label className="block text-xs font-mono text-muted mb-1">
            Tên người gửi (tuỳ chọn)
          </label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Thành viên Myso..."
            className="w-full sm:w-64 rounded-xl border border-line bg-canvas px-3 py-2 text-xs text-ink placeholder:text-subtle focus:outline-none focus:border-accent"
          />
        </div>

        <div className="mb-3">
          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Chia sẻ quan điểm, phản biện hoặc đóng góp kinh nghiệm của bạn..."
            className="w-full rounded-xl border border-line bg-canvas p-3 text-sm text-ink placeholder:text-subtle focus:outline-none focus:border-accent resize-none leading-relaxed"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[0.7rem] font-mono text-subtle">
            Tuân thủ văn hóa thảo luận văn minh & khách quan
          </span>
          <button
            type="submit"
            disabled={submitting || !commentText.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white dark:text-[#04101F] hover:opacity-90 transition disabled:opacity-50 shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{submitting ? "Đang gửi..." : "Gửi thảo luận"}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-8 text-center text-xs font-mono text-muted">
            Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ quan điểm của bạn!
          </div>
        ) : (
          comments.map((comment) => {
            const v = commentVotes[comment.id] || 0;
            return (
              <div
                key={comment.id}
                className="rounded-2xl border border-line bg-surface/80 p-4 transition-all hover:border-line/80 flex gap-3 shadow-xs"
              >
                {/* Comment Vote */}
                <div className="flex flex-col items-center justify-start text-muted pt-0.5">
                  <button
                    onClick={() => handleCommentVote(comment.id, 1)}
                    className={`p-0.5 rounded hover:text-accent transition ${
                      v === 1 ? "text-accent" : ""
                    }`}
                  >
                    <ChevronUp className="h-4 w-4 stroke-[2.5]" />
                  </button>
                  <span
                    className={`font-mono text-[0.7rem] font-bold ${
                      v === 1
                        ? "text-accent"
                        : v === -1
                        ? "text-rose-500"
                        : "text-muted"
                    }`}
                  >
                    {comment.upvotes}
                  </span>
                  <button
                    onClick={() => handleCommentVote(comment.id, -1)}
                    className={`p-0.5 rounded hover:text-rose-500 transition ${
                      v === -1 ? "text-rose-500" : ""
                    }`}
                  >
                    <ChevronDown className="h-4 w-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Comment Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="grid h-5 w-5 place-items-center rounded-full bg-accent/15 text-accent text-[0.65rem] font-bold">
                      {comment.author_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-xs text-ink">
                      {comment.author_name}
                    </span>
                    <span className="text-subtle font-mono text-[0.65rem]">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-muted leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
