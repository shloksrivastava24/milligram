import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // logged in user object
    const [user, setUser] = useState(null);  
    // true while checking /auth/me    
    const [loading, setLoading] = useState(true); 
    const [authError, setAuthError] = useState(null);

    // On first load, try to get current user
    useEffect(() => {
        const fetchMe = async () => {
            try {
                setLoading(true);
                const res = await api.get("/auth/me");
                setUser(res.data.user);
                setAuthError(null);
            } catch (err) {
                // 401 is normal if not logged in
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchMe();
    }, []);

    const signup = async ({ name, username, email, password }) => {
        try {
            setAuthError(null);
            const res = await api.post("/auth/register", {
                name,
                username,
                email,
                password,
            });
            setUser(res.data.user);
            return { success: true };
        } catch (err) {
            console.error("signup error:", err);
            const message =
                err.response?.data?.message || "Could not sign up. Please try again.";
            setAuthError(message);
            return { success: false, message };
        }
    };

    const login = async ({ email, password }) => {
        try {
            setAuthError(null);
            const res = await api.post("/auth/login", { email, password });
            setUser(res.data.user);
            return { success: true };
        } catch (err) {
            console.error("login error:", err);
            const message =
                err.response?.data?.message || "Could not log in. Please try again.";
            setAuthError(message);
            return { success: false, message };
        }
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (err) {
            console.error("logout error:", err);
        } finally {
            setUser(null);
        }
    };

    const value = {
        user,
        loading,
        authError,
        signup,
        login,
        logout,
        setAuthError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
};
