import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import EventEditor from "./pages/EventEditor";
import LiveGallery from "./pages/LiveGallery";
import PhotographerDesk from "./pages/PhotographerDesk";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import JoinEvent from "./pages/JoinEvent";
import PhotographerDashboard from "./pages/PhotographerDashboard";

function AppLayout() {
  const location = useLocation();
  // Don't show the standard header navbar on the dedicated deep black gallery page
  const isGalleryView = location.pathname.startsWith("/galerie/");

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F9F9]">
      {!isGalleryView && <Navbar />}
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/join/:token" element={<JoinEvent />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/events/new" element={<EventEditor />} />
          <Route path="/dashboard/events/edit/:id" element={<EventEditor />} />
          <Route path="/galerie/:slug" element={<LiveGallery />} />
          <Route path="/photographe" element={<PhotographerDashboard />} />
          <Route path="/photographe/:eventId" element={<PhotographerDesk />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
