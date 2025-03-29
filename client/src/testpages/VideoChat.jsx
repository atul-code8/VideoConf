// Frontend (React)
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import io from "socket.io-client";
import "./VideoChat.css";

const VideoChat = () => {
  const [roomId, setRoomId] = useState("");
  const [participants, setParticipants] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [peerStatuses, setPeerStatuses] = useState({});
  const socketRef = useRef();
  const userVideoRef = useRef();
  const peersRef = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        userVideoRef.current.srcObject = stream;
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
        alert("Please allow camera and microphone access");
      });

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const joinRoom = () => {
    if (!roomId.trim()) return;

    socketRef.current = io("http://localhost:8000");
    socketRef.current.emit("join-room", roomId);

    socketRef.current.on("user-connected", (userId) => {
      const peer = createPeer(userId);
      peersRef.current[userId] = peer;
    });

    socketRef.current.on("user-disconnected", (userId) => {
      if (peersRef.current[userId]) {
        peersRef.current[userId].close();
        delete peersRef.current[userId];
        setParticipants((prev) => prev.filter((p) => p.id !== userId));
      }
    });

    socketRef.current.on("offer", handleOffer);
    socketRef.current.on("answer", handleAnswer);
    socketRef.current.on("ice-candidate", handleIceCandidate);
  };

  const addParticipant = useCallback((userId, stream) => {
    setParticipants((prev) => {
      // Only add the participant if not already in the list
      if (!prev.some((p) => p.id === userId)) {
        return [...prev, { id: userId, stream }];
      }
      return prev;
    });
  }, []);

  const removeParticipant = useCallback((userId) => {
    setParticipants((prev) => prev.filter((p) => p.id !== userId));
  }, []);

  const createPeer = (userId) => {
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
        socketRef.current.emit("ice-candidate", {
          candidate: e.candidate,
          to: userId,
        });
      }
    };

    localStream
      .getTracks()
      .forEach((track) => peer.addTrack(track, localStream));

    peer.ontrack = (e) => {
      //   setParticipants((prev) => [
      //     ...prev,
      //     {
      //       id: userId,
      //       stream: e.streams[0],
      //     },
      //   ]);
      addParticipant(userId, e.streams[0]);
    };

    peer
      .createOffer()
      .then((offer) => peer.setLocalDescription(offer))
      .then(() => {
        socketRef.current.emit("offer", {
          offer: peer.localDescription,
          to: userId,
        });
      });

    return peer;
  };

  const handleOffer = async ({ offer, from }) => {
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
        socketRef.current.emit("ice-candidate", {
          candidate: e.candidate,
          to: from,
        });
      }
    };

    localStream
      .getTracks()
      .forEach((track) => peer.addTrack(track, localStream));

    peer.ontrack = (e) => {
      // setParticipants(prev => [...prev, {
      //   id: from,
      //   stream: e.streams[0]
      // }]);
      addParticipant(from, e.streams[0]);
    };

    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socketRef.current.emit("answer", {
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

  const toggleAudio = () => {
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setMuted(!muted);
  };

  const toggleVideo = () => {
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setCameraOff(!cameraOff);
  };

  const leaveRoom = () => {
    localStream.getTracks().forEach((track) => track.stop());
    socketRef.current?.disconnect();
    Object.values(peersRef.current).forEach((peer) => peer.close());
    setParticipants([]);
    setRoomId("");
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <div className="video-chat-container">
      <div className="controls">
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter Room ID"
        />
        <button onClick={joinRoom}>Join Room</button>
        <button onClick={toggleAudio}>{muted ? "Unmute" : "Mute"}</button>
        <button onClick={toggleVideo}>
          {cameraOff ? "Start Camera" : "Stop Camera"}
        </button>
        <button onClick={leaveRoom}>Leave Room</button>
      </div>

      <div className="video-grid">
        <div className="video-item local-participant">
          <video ref={userVideoRef} autoPlay muted />
          <div className="participant-info">
            <div className="status-indicators">
              <span className="connection-status connected">Connected</span>
              <span
                className={`media-indicator ${
                  !cameraOff ? "active" : "inactive"
                }`}
              >
                {!cameraOff ? "📹" : "📷❌"}
              </span>
              <span
                className={`media-indicator ${!muted ? "active" : "inactive"}`}
              >
                {!muted ? "🎤" : "🎤❌"}
              </span>
            </div>
            <div className="participant-id">You</div>
          </div>
        </div>
        {participants.map((participant) => (
          <Participant
            key={participant.id}
            participant={participant}
            connectionStatus={peerStatuses[participant.id] || "connecting"}
          />
        ))}
      </div>
    </div>
  );
};

const Participant = ({ participant, connectionStatus }) => {
  const videoRef = useRef();
  const [mediaStatus, setMediaStatus] = useState({
    video: false,
    audio: false,
  });

  useEffect(() => {
    const stream = participant.stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    const updateMediaStatus = () => {
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

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

  //   useEffect(() => {
  //     if (videoRef.current) {
  //       videoRef.current.srcObject = participant.stream;
  //     }
  //   }, [participant.stream]);

  return (
    <div className="video-item">
      <video ref={videoRef} autoPlay />
      <div className="participant-info">
        <div className="status-indicators">
          <span className={`connection-status ${connectionStatus}`}>
            {connectionStatus}
          </span>
          <span
            className={`media-indicator ${
              mediaStatus.video ? "active" : "inactive"
            }`}
          >
            {mediaStatus.video ? "📹" : "📷❌"}
          </span>
          <span
            className={`media-indicator ${
              mediaStatus.audio ? "active" : "inactive"
            }`}
          >
            {mediaStatus.audio ? "🎤" : "🎤❌"}
          </span>
        </div>
        <div className="participant-id">{participant.id}</div>
      </div>
    </div>
  );
};

export default VideoChat;
