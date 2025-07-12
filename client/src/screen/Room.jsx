import { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "../context/websocket";
import { useLocation, useNavigate, useParams } from "react-router";
import {
  Check,
  ChevronLeft,
  Copy,
  MessageSquareText,
  Mic,
  MicOff,
  MonitorOff,
  ScreenShare,
  Send,
  Settings,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import Snackbar from "../components/Snackbar";

const Room = () => {
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const peersRef = useRef({});
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteVideosRef = useRef([]);
  const [copied, setCopied] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const socket = useSocket();

  const location = useLocation();
  const navigate = useNavigate();
  const { meetingId } = useParams();

  const messagesEndRef = useRef(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarType, setSnackbarType] = useState("info");
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [isScreenShareOn, setIsScreenShareOn] = useState(false);
  const screenShareStreamRef = useRef(null);
  const remoteUserRef = useRef(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const showSnackbar = (type, message) => {
    setSnackbarType(type);
    setIsSnackbarOpen(true);
    setSnackbarMessage(message);
  };

  const userData = location.state;

  useEffect(() => {
    if (!userData) {
      navigate("/lobby");
      return;
    }
  }, [navigate, userData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const copyMeetingId = () => {
    navigator.clipboard.writeText(meetingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initLocalStream = async () => {
    const constraints = {
      video: {
        width: { min: 640, ideal: 1920, max: 1920 },
        height: { min: 480, ideal: 1080, max: 1080 },
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
      showSnackbar("error", "Error accessing media devices");
    }
  };

  useEffect(() => {
    if (userData) {
      initLocalStream();
    }

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenShareStreamRef.current) {
        screenShareStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenShareOn) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const screenVideoTrack = screenStream.getVideoTracks()[0];
        const currentLocalStream = localStreamRef.current;
        const audioTrack = currentLocalStream.getAudioTracks()[0];

        // Stop current video track (camera)
        currentLocalStream.getVideoTracks().forEach((track) => track.stop());

        // Create new stream with screen video and existing audio
        const newStream = new MediaStream([screenVideoTrack, audioTrack]);
        localStreamRef.current = newStream;
        localVideoRef.current.srcObject = newStream;

        // Replace video tracks in all peers
        Object.values(peersRef.current).forEach((peer) => {
          const sender = peer
            .getSenders()
            .find((s) => s.track.kind === "video");
          if (sender) {
            sender.replaceTrack(screenVideoTrack);
          }
        });

        // Handle browser stop sharing
        screenVideoTrack.onended = () => {
          toggleScreenShare();
        };

        screenShareStreamRef.current = screenStream;
        setIsScreenShareOn(true);
        setIsCameraOn(false); // Camera is replaced by screen share
      } else {
        // Stop screen sharing
        screenShareStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        // Re-enable camera if needed
        const currentLocalStream = localStreamRef.current;
        const audioTrack = currentLocalStream.getAudioTracks()[0];
        let newStream;

        // if (isCameraOn) {
        //   const cameraStream = await navigator.mediaDevices.getUserMedia({
        //     video: true,
        //   });
        //   const cameraVideoTrack = cameraStream.getVideoTracks()[0];
        //   newStream = new MediaStream([cameraVideoTrack, audioTrack]);
        // } else {
        //   newStream = new MediaStream([audioTrack]);
        // }

        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const cameraVideoTrack = cameraStream.getVideoTracks()[0];
        newStream = new MediaStream([cameraVideoTrack, audioTrack]);

        localStreamRef.current = newStream;
        localVideoRef.current.srcObject = newStream;

        // Update peers with new video track
        Object.values(peersRef.current).forEach((peer) => {
          const sender = peer
            .getSenders()
            .find((s) => s.track.kind === "video");
          if (sender) {
            sender.replaceTrack(newStream.getVideoTracks()[0] || null);
          }
        });

        screenShareStreamRef.current = null;
        setIsScreenShareOn(false);
        setIsCameraOn(true);
      }
    } catch (error) {
      console.error("Screen share error:", error);
      showSnackbar("error", "Failed to toggle screen sharing");
      setIsScreenShareOn(false);
    }
  }, [isScreenShareOn, isCameraOn, peersRef.current]);

  const addParticipant = useCallback((userId, stream, user) => {
    setParticipants((prev) => {
      if (!prev.some((p) => p.id === userId)) {
        return [...prev, { id: userId, stream, user }];
      }
      return prev;
    });
  }, []);

  const removeParticipant = useCallback((userId) => {
    setParticipants((prev) => prev.filter((p) => p.id !== userId));
  }, []);

  const createPeer = (userId, user) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "failed") {
        removeParticipant(userId);
        console.error("Peer connection failed for user:", userId);
      }
    };

    peer.onsignalingstatechange = () => {
      if (peer.signalingState === "closed") {
        removeParticipant(userId);
      }
    };

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", {
          candidate: e.candidate,
          to: userId,
        });
      }
    };

    localStreamRef.current
      .getTracks()
      .forEach((track) => peer.addTrack(track, localStreamRef.current));

    peer.ontrack = (event) => {
      addParticipant(userId, event.streams[0], user);
    };

    peer
      .createOffer()
      .then((offer) => peer.setLocalDescription(offer))
      .then(() => {
        socket.emit("offer", {
          offer: peer.localDescription,
          to: userId,
        });
      });

    return peer;
  };

  const handleOffer = async ({ offer, from, user }) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "failed") {
        removeParticipant(from);
        console.error("Peer connection failed for user:", from);
      }
    };

    peer.onsignalingstatechange = () => {
      if (peer.signalingState === "closed") {
        removeParticipant(from);
      }
    };

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", {
          candidate: e.candidate,
          to: from,
        });
      }
    };

    localStreamRef.current
      .getTracks()
      .forEach((track) => peer.addTrack(track, localStreamRef.current));

    peer.ontrack = (e) => {
      addParticipant(from, e.streams[0], user);
    };

    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit("answer", {
      answer,
      to: from,
    });

    peersRef.current[from] = peer;
  };

  const handleAnswer = ({ answer, from }) => {
    const peer = peersRef.current[from];
    if (peer) {
      peer.setRemoteDescription(answer);
    }
  };

  const handleIceCandidate = ({ candidate, from }) => {
    const peer = peersRef.current[from];
    if (peer) {
      peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const toggleCamera = async () => {
    if (isScreenShareOn) {
      showSnackbar("warning", "Cannot toggle camera during screen share");
      return;
    }
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOn(!isCameraOn);
    } else if (!isCameraOn) {
      // Recreate camera stream if needed
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = localStreamRef.current.getAudioTracks()[0];

      const newStream = new MediaStream([videoTrack, audioTrack]);
      localStreamRef.current = newStream;
      localVideoRef.current.srcObject = newStream;
      setIsCameraOn(true);
    }
  };

  const toggleMicrophone = async () => {
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    setIsMicrophoneOn(!isMicrophoneOn);
  };

  const handleLeave = () => {
    localStreamRef.current.getTracks().forEach((track) => track.stop());
    Object.values(peersRef.current).forEach((peer) => peer.close());
    socket.emit("leave-meeting", meetingId);
    setParticipants([]);
    navigate("/");
  };

  const handleSend = () => {
    if (newMessage.trim() === "") return;

    const message = {
      id: chatMessages.length + 1,
      text: newMessage,
      sent: true,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
      user: "You",
    };

    setChatMessages([...chatMessages, message]);
    setNewMessage("");

    socket.emit("send-message", { meetingId, message });

    // Simulate auto-reply
    // setTimeout(() => {
    //   const autoReply = {
    //     id: chatMessages.length + 2,
    //     text: "Thanks for your message!",
    //     sent: false,
    //     time: new Date().toLocaleTimeString([], {
    //       hour: "2-digit",
    //       minute: "2-digit",
    //     }),
    //     status: "seen",
    //   };
    //   setChatMessages((prev) => [...prev, autoReply]);
    // }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (meetingId) {
      socket.emit("join-meeting", meetingId, userData);
    }
    socket.on("user-joined", (socketId, user) => {
      remoteUserRef.current = { socketId, user };
      const peer = createPeer(socketId, user);
      peersRef.current[socketId] = peer;
      showSnackbar("success", `${user.name} joined the meeting`);
    });

    socket.on("offer", (offer, socketId, user) => {
      setTimeout(() => {
        handleOffer(offer, socketId, user);
      }, 2000);
    });

    socket.on("answer", (answer, socketId) => {
      handleAnswer(answer, socketId);
    });

    socket.on("ice-candidate", (candidate, socketId) => {
      handleIceCandidate(candidate, socketId);
    });

    socket.on("new-message", ({ userId, message, user }) => {
      setChatMessages((prev) => [
        ...prev,
        { ...message, user: user.name, sent: userId === socket.id },
      ]);
      showSnackbar("info", `${user.name}: ${message.text}`);
      setIsDrawerOpen(true);
      setTimeout(() => {
        setIsDrawerOpen(false);
      }, 3000);
    });

    socket.on("user-left", (userId, user) => {
      if (peersRef.current[userId]) {
        peersRef.current[userId].close();
        delete peersRef.current[userId];
        setParticipants((prev) => prev.filter((p) => p.id !== userId));
        showSnackbar("warning", `${user.name} left the meeting`);
      }
    });

    socket.on("user-disconnected", (userId, user) => {
      if (peersRef.current[userId]) {
        peersRef.current[userId].close();
        delete peersRef.current[userId];
        setParticipants((prev) => prev.filter((p) => p.id !== userId));
        showSnackbar("warning", `${user.name} left the meeting`);
      }
    });

    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-disconnected");
      Object.values(peersRef.current).forEach((peer) => peer.close());
      peersRef.current = {};
    };
  }, []);

  return (
    <div className="w-full flex flex-col h-screen relative">
      {/* Message Drawer */}
      <div
        className={`fixed top-0 left-0 w-full sm:w-96 z-10 h-screen bg-white transition-all duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="bg-white h-full flex flex-col">
          <div className="bg-blue-600 text-white h-12 px-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold whitespace-nowrap">
              In Meeting Chats
            </h2>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={toggleDrawer}
                className="border-none!"
              >
                <ChevronLeft className="cursor-pointer hover:text-blue-200 transition-colors" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-2 overflow-y-auto overflow-x-hidden">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`flex flex-col mb-4 ${message.sent ? "items-end" : "items-start"
                  }`}
              >
                <div
                  className={`
              max-w-[80%] px-3 py-2 rounded-xl relative
              ${message.sent
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "text-gray-800 rounded-bl-none"
                    }
            `}
                >
                  <p className="break-words">{message.text}</p>
                  <div
                    className={`${message.sent
                        ? "text-right text-gray-300"
                        : "text-left text-gray-400"
                      } text-xs mt-1"`}
                  >
                    {message.user}
                  </div>
                </div>

                <div
                  className={`text-[10px] mt-1 ${message.sent ? "text-blue-600" : "text-gray-500"
                    }`}
                >
                  {message.time}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4">
            <div className="flex gap-3 border rounded-full outline-none border-blue-500 ring-1 ring-blue-500 group">
              <input
                type="text"
                className="flex-1 p-3 outline-none rounded-full"
                placeholder="Send your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button
                onClick={handleSend}
                className="border-none! rounded-full transition-colors"
              >
                <Send />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Drawer */}
      <div
        className={`fixed top-0 right-0 w-full sm:w-96 h-full transform transition-transform duration-300 ease-in-out ${isSettingsOpen ? "translate-x-0" : "translate-x-full"
          } flex flex-col`}
      >
        <div className="bg-blue-600 h-12 px-4 flex items-center justify-between">
          <h2 className="text-lg text-white font-medium">Settings</h2>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="rounded-full! p-2! bg-transparent! text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 stroke-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="bg-gray-200 flex-1 p-4">
          <p className="text-sm text-gray-600 mb-2">
            Share this ID with participants to join the meeting
          </p>
          <div className="flex items-center justify-between gap-x-2 bg-gray-300 px-4 py-2 rounded-lg">
            <code className="text-sm text-gray-500">{meetingId}</code>
            <button
              onClick={copyMeetingId}
              className="text-indigo-600 hover:text-indigo-700 border-none! p-2!"
              title="Copy meeting ID"
            >
              {copied ? (
                <Check className="h-5 w-5" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="block sm:hidden mt-4">
            <button
              type="button"
              className="bg-red-400 hover:bg-red-500 text-gray-100 border-none! w-full p-4"
              onClick={handleLeave}
            >
              Leave Meeting
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${isOpen ? "sm:ml-96" : "sm:ml-0"
          }`}
      >
        {/* Local Video */}
        <div className="fixed bottom-20 right-2 z-10 w-4/5 max-w-[254px] bg-black flex justify-center items-center rounded-[8px] shadow-lg shadow-black/30">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "8px",
              objectFit: "cover",
            }}
          />
        </div>

        {/* Participants */}
        <div
          className={`flex-1 overlflow-y-auto grid gap-4 p-4 ${isLandscape ? "grid-cols-2" : "grid-cols-1"
            }`}
        >
          {participants.map((participant, index) => (
            <Participant key={index} participant={participant} />
          ))}
        </div>

        {/* Actions */}
        <div
          className={`sticky bottom-0 bg-gray-200 px-4 py-2 flex items-center justify-between transition-all duration-300 ease-in-out ${isOpen ? "left-96" : "left-0"
            }`}
        >
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={toggleCamera}
              className="rounded-full! p-4!"
            >
              {isCameraOn ? (
                <>
                  <Video className="size-6" />
                </>
              ) : (
                <>
                  <VideoOff className="size-6" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={toggleMicrophone}
              className="rounded-full! p-4!"
            >
              {isMicrophoneOn ? (
                <Mic className="w-6 h-6" />
              ) : (
                <MicOff className="w-6 h-6" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex">
              <button
                type="button"
                className="rounded-full! p-4!"
                onClick={toggleDrawer}
              >
                <MessageSquareText className="size-6" />
              </button>
              <span
                className={`relative flex size-2 ${isDrawerOpen ? "" : "hidden"}`}
              >
                <span className="absolute top-2 -left-4 inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative top-2 -left-4 inline-flex size-2 rounded-full bg-sky-500"></span>
              </span>
            </div>
            <button
              type="button"
              className={`rounded-full! p-4! ${isScreenShareOn ? "bg-red-400 text-gray-100" : ""
                }`}
              onClick={toggleScreenShare}
            >
              {isScreenShareOn ? (
                <MonitorOff className="size-6" />
              ) : (
                <ScreenShare className="size-6" />
              )}
            </button>
            <button
              type="button"
              className="rounded-full! p-4!"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="size-6" />
            </button>
          </div>
          <button
            type="button"
            className="bg-red-400 hover:bg-red-500 text-gray-100 border-none! hidden sm:block"
            onClick={handleLeave}
          >
            <span className="">Leave</span>
          </button>
        </div>
      </div>

      <Snackbar
        isOpen={isSnackbarOpen}
        onClose={() => setIsSnackbarOpen(false)}
        type={snackbarType}
        message={snackbarMessage}
      />
    </div>
  );
};

const Participant = ({ participant }) => {
  const videoRef = useRef();
  const [mediaStatus, setMediaStatus] = useState({
    video: false,
    audio: false,
  });

  const [inFocus, setInFocus] = useState(false);

  const [isMuted, setIsMuted] = useState(false);

  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  const [isScreenShareOn, setIsScreenShareOn] = useState(false);

  const [isVideoOn, setIsVideoOn] = useState(false);

  const [isAudioOn, setIsAudioOn] = useState(false);

  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    const stream = participant.stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    const updateMediaStatus = () => {
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      // setIsVideoOn(videoTrack?.enabled);
      // setIsAudioOn(audioTrack?.enabled);

      setMediaStatus({
        video: videoTrack?.enabled && videoTrack.readyState === "live",
        audio: audioTrack?.enabled && audioTrack.readyState === "live",
      });
    };

    const handleTrackChange = () => updateMediaStatus();

    updateMediaStatus();

    stream.getVideoTracks().forEach((track) => {
      track.addEventListener("mute", handleTrackChange);
      track.addEventListener("unmute", handleTrackChange);
    });

    stream.getAudioTracks().forEach((track) => {
      track.addEventListener("mute", handleTrackChange);
      track.addEventListener("unmute", handleTrackChange);
    });

    return () => {
      stream.getVideoTracks().forEach((track) => {
        track.removeEventListener("mute", handleTrackChange);
        track.removeEventListener("unmute", handleTrackChange);
      });
      stream.getAudioTracks().forEach((track) => {
        track.removeEventListener("mute", handleTrackChange);
        track.removeEventListener("unmute", handleTrackChange);
      });
    };
  }, [participant.stream]);

  return (
    <div
      className={`relative rounded-lg group cursor-pointer border-2 border-gray-200`}
      onClick={() => setInFocus(!inFocus)}
    >
      {videoRef.current && inFocus && (
        <div className="absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-white bg-green-500" />
      )}
      {/* {isVideoOn ? ( */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover rounded-lg"
      />
      {/* ) : (
         <div className="w-full h-full flex items-center justify-center">
           <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center">
             <span className="text-white text-2xl">
               {participant.user?.name[0]}
             </span>
           </div>
         </div>
       )} */}
      <div className="absolute top-4 left-4">
        <div className="status-indicators">
          <span
            className={`media-indicator ${mediaStatus.video ? "active" : "inactive"
              }`}
          >
            {mediaStatus.video ? "📹" : "📷❌"}
          </span>
          <span
            className={`media-indicator ${mediaStatus.audio ? "active" : "inactive"
              }`}
          >
            {mediaStatus.audio ? "🎤" : "🎤❌"}
          </span>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 bg-[#333] text-white rounded-md participant-id px-4 py-2 text-sm capitalize">
        {participant.user && participant.user.name}
      </div>
    </div>
  );
};

export default Room;
