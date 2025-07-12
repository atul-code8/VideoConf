import "./App.css";
import { Routes, Route, Navigate } from "react-router";
import LandingPage from "./screen/LandingPage";
import Login from "./screen/Login";
import Signup from "./screen/Signup";
import Room from "./screen/Room";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { SocketProvider } from "./context/websocket";
import Lobby from "./screen/Lobby";
import MeetingPage from "./testpages/MeetingPage";
import Home from "./testpages/Home";
import VideoChat from "./testpages/VideoChat";

function App() {
  const { user } = useAuth();
  return (
    <SocketProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {!user && (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </>
        )}

        {/* <Route element={<ProtectedRoute />}> */}
          <Route path="/meeting" element={<Lobby />} />
          <Route path="/meeting/:meetingId" element={<Room />} />
        {/* </Route> */}

        {/* <Route path="/:id" element={<MeetingPage />} /> */}
        {/* <Route path="/chat" element={<VideoChat />} /> */}
        {/* <Route path="/test" element={<Home />} /> */}
        <Route path="*" element={<Navigate to={"/"} />} />
      </Routes>
    </SocketProvider>
  );
}

export default App;
