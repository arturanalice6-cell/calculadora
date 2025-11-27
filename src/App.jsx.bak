import './App.css'
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { Toaster } from "sonner"
import Login from "./pages/Login"
import Home from "./pages/Home"
import CreatePost from "./pages/CreatePost"

function RequireAuth({ children }) {
  const isAuthenticated = Boolean(localStorage.getItem('supabase.auth.token'))
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

function App() {
  const isAuthenticated = Boolean(localStorage.getItem('supabase.auth.token'))

  return (
    <>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/create-post" element={<RequireAuth><CreatePost /></RequireAuth>} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App
