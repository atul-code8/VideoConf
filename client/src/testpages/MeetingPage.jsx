import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { io } from 'socket.io-client';
import Peer from 'peerjs';

const MeetingPage = () => {
  const [peers, setPeers] = useState([]);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const { id: meetingId } = useParams();
  const socket = useRef();
  const userPeer = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [roomId, setRoomId] = useState('');
  const peerConnection = useRef();

  useEffect(() => {
    // Initialize Socket.io
    socket.current = io('http://localhost:5000');

    // Get user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localVideoRef.current.srcObject = stream;
      });

    // WebRTC handlers
    socket.current.on('existing-users', users => {
      users.forEach(userId => createPeerConnection(userId));
    });

    socket.current.on('user-connected', userId => {
      createPeerConnection(userId);
    });

    socket.current.on('offer', async ({ offer, from }) => {
      if (!peerConnection.current[from]) {
        createPeerConnection(from);
      }
      await peerConnection.current[from].setRemoteDescription(offer);
      const answer = await peerConnection.current[from].createAnswer();
      await peerConnection.current[from].setLocalDescription(answer);
      socket.current.emit('answer', { answer, to: from });
    });

    socket.current.on('answer', ({ answer, from }) => {
      peerConnection.current[from].setRemoteDescription(answer);
    });

    socket.current.on('ice-candidate', ({ candidate, from }) => {
      peerConnection.current[from].addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.current.on('user-disconnected', userId => {
      if (peerConnection.current[userId]) {
        peerConnection.current[userId].close();
        delete peerConnection.current[userId];
      }
    });
  }, []);

  const createPeerConnection = (userId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    // Add local stream
    localVideoRef.current.srcObject.getTracks().forEach(track => {
      pc.addTrack(track, localVideoRef.current.srcObject);
    });

    // Handle remote stream
    pc.ontrack = event => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    // ICE candidate handling
    pc.onicecandidate = event => {
      if (event.candidate) {
        socket.current.emit('ice-candidate', {
          candidate: event.candidate,
          to: userId
        });
      }
    };

    peerConnection.current = { ...peerConnection.current, [userId]: pc };

    // Create offer if initiator
    if (userId !== socket.current.id) {
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .then(() => {
          socket.current.emit('offer', {
            offer: pc.localDescription,
            to: userId
          });
        });
    }
  };

  const joinRoom = () => {
    if (roomId.trim()) {
      socket.current.emit('join-room', roomId);
    }
  };

  const sendMessage = () => {
    socket.current.emit('send-message', { meetingId, message });
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
    <div className="flex gap-4 mb-4">
      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter Room ID"
        className="p-2 border rounded flex-1"
      />
      <button
        onClick={joinRoom}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Join Room
      </button>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <video
        ref={localVideoRef}
        autoPlay
        muted
        className="w-full h-64 bg-gray-800 rounded-lg"
      />
      <video
        ref={remoteVideoRef}
        autoPlay
        className="w-full h-64 bg-gray-800 rounded-lg"
      />
    </div>
  </div>
  );
};

export default MeetingPage;