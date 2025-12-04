import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const LoginPage = () => {
    const { login, authError, setAuthError } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [submitting, setSubmitting] = useState(false);

    const onChange = (e) => {
        setAuthError(null);
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const { success } = await login(form);

        setSubmitting(false);

        if (success) {
            navigate("/");
        }
    };

    return (
        <div className="max-w-md mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Login to Milligram</h1>

            <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
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
                    {submitting ? "Logging in..." : "Login"}
                </button>

                <p className="text-xs text-gray-600 mt-3 text-center">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-blue-500 hover:underline">
                        Sign up
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default LoginPage;
