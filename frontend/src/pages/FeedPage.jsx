import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const FeedPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [likedMap, setLikedMap] = useState({}); // { [postId]: true }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activePostId, setActivePostId] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentError, setCommentError] = useState(null);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                setLoading(true);
                const res = await api.get("/posts");
                setPosts(res.data.posts || []);
                setError(null);
            } catch (err) {
                console.error("feed error:", err);
                const message =
                    err.response?.data?.message || "Could not load feed. Please try again.";
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, []);

    const requireAuth = () => {
        if (!user) {
            navigate("/login");
            return false;
        }
        return true;
    };

    const handleToggleLike = async (postId) => {
        if (!requireAuth()) return;

        const isLiked = likedMap[postId] === true;

        try {
            // optimistic UI update
            setLikedMap((prev) => ({
                ...prev,
                [postId]: !isLiked,
            }));

            setPosts((prev) =>
                prev.map((p) =>
                    p._id === postId
                        ? {
                            ...p,
                            likesCount: (p.likesCount || 0) + (isLiked ? -1 : 1),
                        }
                        : p
                )
            );

            if (isLiked) {
                await api.delete(`/posts/${postId}/likes`);
            } else {
                await api.post(`/posts/${postId}/likes`);
            }
        } catch (err) {
            console.error("like error:", err);
            // revert UI on error
            setLikedMap((prev) => ({
                ...prev,
                [postId]: isLiked,
            }));
            setPosts((prev) =>
                prev.map((p) =>
                    p._id === postId
                        ? {
                            ...p,
                            likesCount: (p.likesCount || 0) + (isLiked ? 1 : -1),
                        }
                        : p
                )
            );
        }
    };

    const handleToggleComments = async (postId) => {
        if (activePostId === postId) {
            // collapse
            setActivePostId(null);
            setComments([]);
            setCommentError(null);
            setNewComment("");
            return;
        }

        setActivePostId(postId);
        setComments([]);
        setCommentError(null);
        setNewComment("");
        setCommentsLoading(true);

        try {
            const res = await api.get(`/posts/${postId}/comments`);
            setComments(res.data.comments || []);
        } catch (err) {
            console.error("comments error:", err);
            const message =
                err.response?.data?.message ||
                "Could not load comments. Please try again.";
            setCommentError(message);
        } finally {
            setCommentsLoading(false);
        }
    };

    const handleAddComment = async (postId) => {
        if (!requireAuth()) return;
        if (!newComment.trim()) return;

        try {
            const text = newComment.trim();
            setNewComment("");

            const res = await api.post(`/posts/${postId}/comments`, { text });
            const comment = res.data.comment;

            setComments((prev) => [comment, ...prev]);

            setPosts((prev) =>
                prev.map((p) =>
                    p._id === postId
                        ? {
                            ...p,
                            commentsCount: (p.commentsCount || 0) + 1,
                        }
                        : p
                )
            );
        } catch (err) {
            console.error("add comment error:", err);
            const message =
                err.response?.data?.message ||
                "Could not add comment. Please try again.";
            setCommentError(message);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto py-6 px-4">
                <p className="text-sm text-gray-500">Loading feed...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto py-6 px-4">
                <p className="text-sm text-red-500">{error}</p>
            </div>
        );
    }

    if (!posts.length) {
        return (
            <div className="max-w-2xl mx-auto py-6 px-4">
                <h1 className="text-2xl font-bold mb-4">Milligram Feed</h1>
                <p className="text-sm text-gray-600">
                    No posts yet.{" "}
                    <Link to="/upload" className="text-blue-500 hover:underline">
                        Be the first to post!
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
            <h1 className="text-2xl font-bold mb-4">See what others are up to !!</h1>

            {posts.map((post) => {
                const isLiked = likedMap[post._id] === true;

                return (
                    <article
                        key={post._id}
                        className="bg-white rounded-lg shadow border overflow-hidden"
                    >
                        {/* Header */}
                        <header className="px-4 py-3 flex items-center justify-between">
                            <Link
                                to={`/profile/${post.author?.username || ""}`}
                                className="text-sm font-semibold hover:text-cyan-500"
                            >
                                {post.author?.username || "unknown"}
                            </Link>
                            <span className="text-xs text-gray-500">
                                {post.createdAt
                                    ? new Date(post.createdAt).toLocaleString()
                                    : ""}
                            </span>
                        </header>

                        {/* Image */}
                        <div className="bg-gray-100">
                            <img
                                src={post.imageUrl}
                                alt={post.caption || "Post image"}
                                className="w-full max-h-[480px] object-contain bg-black"
                            />
                        </div>

                        {/* Caption & actions */}
                        <div className="px-4 py-3 space-y-2">
                            {post.caption && (
                                <p className="text-sm">
                                    <span className="font-semibold mr-1">
                                        {post.author?.username || "user"}
                                    </span>
                                    {post.caption}
                                </p>
                            )}

                            <div className="flex items-center justify-between text-xs text-gray-600">
                                <span>
                                    {post.likesCount || 0} likes • {post.commentsCount || 0} comments
                                </span>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleToggleLike(post._id)}
                                        className="flex items-center gap-1 text-xs font-medium hover:text-pink-600 cursor-pointer"
                                    >
                                        <span>{isLiked ? "❤️" : "🤍"}</span>
                                        <span>{isLiked ? "Unlike" : "Like"}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleToggleComments(post._id)}
                                        className="text-xs font-medium hover:text-cyan-600 cursor-pointer"
                                    >
                                        {activePostId === post._id ? "Hide comments" : "Comments"}
                                    </button>
                                </div>
                            </div>

                            {/* Comments section */}
                            {activePostId === post._id && (
                                <div className="mt-3 border-t pt-3 space-y-2">
                                    {commentError && (
                                        <p className="text-xs text-red-500">{commentError}</p>
                                    )}

                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder={
                                                user ? "Add a comment..." : "Login to comment..."
                                            }
                                            disabled={!user}
                                            className="flex-1 border rounded px-2 py-1 text-xs"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleAddComment(post._id)}
                                            disabled={!user || !newComment.trim()}
                                            className="text-xs bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50"
                                        >
                                            Post
                                        </button>
                                    </div>

                                    {commentsLoading ? (
                                        <p className="text-xs text-gray-500">Loading comments...</p>
                                    ) : comments.length ? (
                                        <ul className="space-y-1 max-h-40 overflow-y-auto">
                                            {comments.map((c) => (
                                                <li key={c._id} className="text-xs">
                                                    <span className="font-semibold mr-1">
                                                        {c.author?.username || "user"}:
                                                    </span>
                                                    <span>{c.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-gray-400">No comments yet.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </article>
                );
            })}
        </div>
    );
};

export default FeedPage;
