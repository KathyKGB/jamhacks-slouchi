import { BrowserRouter, Routes, Route } from "react-router";
import { HomePage } from "./components/HomePage";
import { PostureDetector } from "./components/PostureDetector";
import { FriendsPage } from "./components/FriendsPage";
import { StretchesPage } from "./components/StretchesPage";
import "../styles/fonts.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/posture" element={<PostureDetector />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/stretches" element={<StretchesPage />} />
      </Routes>
    </BrowserRouter>
  );
}
