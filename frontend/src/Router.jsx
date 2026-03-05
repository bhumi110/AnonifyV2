import { createBrowserRouter, Navigate } from "react-router-dom";
import Home        from "./pages/Home";
import Feed        from "./pages/Feed";
import Login       from "./pages/Login";
import Signup      from "./pages/Signup";
import Create      from "./pages/Create";
import Post        from "./pages/Post";
import Profile     from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
  { path: "/",       element: <Home /> },
  { path: "/feed",   element: <Feed /> },
  { path: "/login",  element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/post/:id", element: <Post /> },

  {
    path: "/create",
    element: (
      <ProtectedRoute>
        <Create />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);

export default router;