import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Create from "./pages/Create"
import Post from "./pages/Post";
import Profile from "./pages/Profile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path:"/feed",
    element:<Feed/>
  },
  {
    path:"/login",
    element:<Login/>
  },
  {
    path:"/signup",
    element:<Signup/>
  },
  {
    path:"/create",
    element:<Create/>
  },
  {
    path:"/post/:id",
    element:<Post/>
  },
  {
    path:"/profile",
    element:<Profile/>
  }
]);

export default router;