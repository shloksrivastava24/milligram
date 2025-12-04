import { Link, Route, Routes, useNavigate } from "react-router-dom";
import FeedPage from "./pages/FeedPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function App() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();        // clears cookie + user in context
    navigate("/login");    // or navigate("/") if you prefer
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold">
            Milligram
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-blue-500">
              Feed
            </Link>
            <Link to="/upload" className="hover:text-green-500">
              Upload
            </Link>

            {loading ? (
              <span className="text-sm text-gray-500">Checking auth...</span>
            ) : user ? (
              <>
                <Link
                  to={`/profile/${user.username}`}
                  className="hover:text-yellow-500 font-bold"
                >
                  {user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="hover:text-red-500 hover:cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-yellow-500">
                  Login
                </Link>
                <Link to="/signup" className="hover:text-red-500">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<FeedPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
        </Routes>
      </main>
      {/* Footer */}
      <footer className="bg-gray-300 border-t mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-3 text-center text-black text-medium">
          Made with <span className="text-red-500">❤️</span> and{" "}
          <span role="img" aria-label="chai">☕</span>
        </div>
      </footer>

    </div>
  );
}

export default App;
