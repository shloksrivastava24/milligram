import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const ProfilePage = () => {
    const { username } = useParams();
    const { user: loggedInUser } = useAuth();

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // For image modal
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);

                const [userRes, postsRes] = await Promise.all([
                    api.get(`/users/${username}`),
                    api.get(`/users/${username}/posts`),
                ]);

                setUser(userRes.data.user);
                setPosts(postsRes.data.posts || []);
                setError(null);
            } catch (err) {
                console.error("profile error:", err);
                const message =
                    err.response?.data?.message || "Profile could not be loaded.";
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username]);

    const handleDeletePost = async (postId) => {
        const confirm = window.confirm("Delete this post permanently?");
        if (!confirm) return;

        try {
            await api.delete(`/posts/${postId}`);

            // Remove from UI
            setPosts((prev) => prev.filter((p) => p._id !== postId));

            // Close modal
            setSelectedPost(null);
        } catch (err) {
            console.error("delete error:", err);
            alert(err.response?.data?.message || "Could not delete post");
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-sm text-gray-500">
                Loading profile...
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 text-sm text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Profile header */}
            <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full border overflow-hidden bg-gray-200">
                    {user.avatarUrl ? (
                        <img
                            src={user.avatarUrl}
                            alt="avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xl">
                            {user.username[0].toUpperCase()}
                        </div>
                    )}
                </div>

                <div>
                    <h1 className="text-xl font-bold">{user.username}</h1>
                    <p className="text-sm text-gray-600">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {posts.length} posts
                    </p>
                </div>
            </div>

            {/* Posts grid */}
            {posts.length === 0 ? (
                <p className="text-sm text-gray-500">No posts yet.</p>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {posts.map((post) => (
                        <button
                            key={post._id}
                            type="button"
                            onClick={() => setSelectedPost(post)}
                            className="block aspect-square overflow-hidden bg-gray-100 focus:outline-none"
                        >
                            <img
                                src={post.imageUrl}
                                alt={post.caption || "post"}
                                className="w-full h-full object-cover hover:opacity-80"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Image Modal */}
            {selectedPost && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                    onClick={() => setSelectedPost(null)}
                >
                    <div
                        className="bg-white rounded-lg overflow-hidden max-w-3xl w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-4 py-3 border-b">
                            <span className="text-sm font-semibold">{user.username}</span>
                            <div className="flex gap-3 items-center">
                                {/* Delete ONLY if owner */}
                                {loggedInUser?.username === user.username && (
                                    <button
                                        onClick={() => handleDeletePost(selectedPost._id)}
                                        className="text-sm text-red-500 hover:underline"
                                    >
                                        Delete
                                    </button>
                                )}

                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="text-sm text-gray-600 hover:underline"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="bg-black">
                            <img
                                src={selectedPost.imageUrl}
                                alt="Full"
                                className="w-full max-h-[80vh] object-contain"
                            />
                        </div>

                        {/* Caption */}
                        {selectedPost.caption && (
                            <div className="px-4 py-3 text-sm">
                                <span className="font-semibold mr-2">{user.username}</span>
                                {selectedPost.caption}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
