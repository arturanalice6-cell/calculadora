import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import Layout from "../components/Layout";

// Páginas
import Home from "./Home";
import Login from "./Login";
import CreatePost from "./CreatePost";
import Communities from "./Communities";
import Challenges from "./Challenges";
import Profile from "./Profile";
import Explore from "./Explore";
import Notifications from "./Notifications";

export default function Pages() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>

        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/home" replace />}
        />

        <Route
          path="/home"
          element={user ? <Layout><Home /></Layout> : <Navigate to="/login" replace />}
        />

        <Route
          path="/create-post"
          element={user ? <Layout><CreatePost /></Layout> : <Navigate to="/login" replace />}
        />

        <Route
          path="/communities"
          element={user ? <Layout><Communities /></Layout> : <Navigate to="/login" replace />}
        />

        <Route
          path="/challenges"
          element={user ? <Layout><Challenges /></Layout> : <Navigate to="/login" replace />}
        />

        <Route
          path="/profile"
          element={user ? <Layout><Profile /></Layout> : <Navigate to="/login" replace />}
        />

        <Route
          path="/explore"
          element={user ? <Layout><Explore /></Layout> : <Navigate to="/login" replace />}
        />

        <Route
          path="/notifications"
          element={user ? <Layout><Notifications /></Layout> : <Navigate to="/login" replace />}
        />

        <Route
          path="/"
          element={<Navigate to={user ? "/home" : "/login"} replace />}
        />

      </Routes>
    </Router>
  );
}