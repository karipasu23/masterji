import "./App.css";
import Home from "./Home";
import NavSideMenu from "./components/NavSideMenu";
import { LoginProvider, useLogin } from "./context/LoginContext";
import { Logout } from "./pages/Logout";
import Login from "./pages/Login";
import TailorDashboard from "./pages/TailorDashboard";
import TailorRegistration from "./pages/TailorRegistration";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import TailorPage from "./pages/TailorPage";
import Appointments from "./pages/Appointments";

const ProtectedRoute = ({ children }) => {
  const { isLog, user } = useLogin();

  if (!isLog) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== "tailor") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">Only tailors can access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

function AppContent() {
  const { showLogin } = useLogin();
  return (
    <div className="h-screen bg-[#dcdcdc]">
      <Router>
        <div className="relative h-full">
          <div className="fixed top-0 left-0 right-0 z-50">
            <NavSideMenu />
          </div>

          {showLogin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <Login />
            </div>
          )}
          <main
            className={`h-full pt-16 overflow-y-auto ${
              showLogin ? "filter blur-sm pointer-events-none" : ""
            }`}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/logout" element={<Logout />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <TailorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/join-as-tailor" element={<TailorRegistration />} />
              <Route path="/tailor/:id" element={<TailorPage />} />
              <Route path="/appointments" element={<Appointments />} />
            </Routes>
          </main>
        </div>
      </Router>
    </div>
  );
}

function App() {
  return (
    <LoginProvider>
      <AppContent />
    </LoginProvider>
  );
}

export default App;