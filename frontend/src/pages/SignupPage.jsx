import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const SignupPage = () => {
    const { signup, authError, setAuthError } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
    });

    const [submitting, setSubmitting] = useState(false);

    const onChange = (e) => {
        setAuthError(null); // clear old errors when typing
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const { success } = await signup(form);

        setSubmitting(false);

        if (success) {
            // Go to feed after successful signup
            navigate("/");
        }
    };

    return (
        <div className="max-w-md mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Sign up for Milligram</h1>

            <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="name">
                        Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Your full name"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="username">
                        Username
                    </label>
                    <input
                        id="username"
                        name="username"
                        value={form.username}
                        onChange={onChange}
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="username"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        This will be used in your profile URL.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="you@example.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={onChange}
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="********"
                        required
                    />
                </div>

                {authError && (
                    <p className="text-sm text-red-500">
                        {authError}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-500 text-white py-2 rounded font-semibold text-sm hover:bg-blue-600 disabled:opacity-60 cursor-pointer"
                >
                    {submitting ? "Signing up..." : "Sign Up"}
                </button>
            </form>
        </div>
    );
};

export default SignupPage;
