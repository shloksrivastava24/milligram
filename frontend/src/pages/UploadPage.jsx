import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../lib/api.js";

const UploadPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [caption, setCaption] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const fileInputRef = useRef(null);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
        }
    }, [loading, user, navigate]);

    // Clean up object URL on unmount / change
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        setError(null);

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        if (file) {
            if (!file.type.startsWith("image/")) {
                setError("Please select an image file.");
                setImageFile(null);
                setPreviewUrl(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                return;
            }
            setImageFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setImageFile(null);
            setPreviewUrl(null);
        }
    };

    const handleClearImage = () => {
        setImageFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile) {
            setError("Please choose an image.");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const formData = new FormData();
            formData.append("image", imageFile);
            formData.append("caption", caption);

            await api.post("/posts", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            navigate("/");
        } catch (err) {
            console.error("upload error:", err);
            const message =
                err.response?.data?.message || "Could not upload post. Please try again.";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-md mx-auto py-8 px-4">
                <p className="text-sm text-gray-500">Checking auth...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-md mx-auto py-8 px-4">
                <p className="text-sm text-gray-500">Redirecting to login...</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Create a new post</h1>

            <form
                onSubmit={handleSubmit}
                className="space-y-4 bg-white p-6 rounded-lg shadow"
            >
                {/* Custom file input */}
                <div>
                    <label className="block text-sm font-medium mb-1">Image</label>

                    <div className="flex items-center gap-3">
                        <label
                            htmlFor="image"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-gray-50 hover:bg-gray-100 cursor-pointer"
                        >
                            Choose image
                        </label>
                        <input
                            id="image"
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        <span className="text-xs text-gray-500 truncate max-w-[140px]">
                            {imageFile ? imageFile.name : "No file selected"}
                        </span>
                        {imageFile && (
                            <button
                                type="button"
                                onClick={handleClearImage}
                                className="text-xs text-red-500 hover:underline"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                </div>

                {/* Preview */}
                {previewUrl && (
                    <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">Preview:</p>
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full rounded-md border max-h-80 object-cover"
                        />
                    </div>
                )}

                {/* Caption */}
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="caption">
                        Caption
                    </label>
                    <textarea
                        id="caption"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                        rows={3}
                        placeholder="Say something about this photo..."
                    />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-500 text-white py-2 rounded font-semibold text-sm hover:bg-blue-600 disabled:opacity-60"
                >
                    {submitting ? "Uploading..." : "Post"}
                </button>
            </form>
        </div>
    );
};

export default UploadPage;
