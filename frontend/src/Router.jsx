import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Create from "./pages/Create"

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
  }
]);

export default router;