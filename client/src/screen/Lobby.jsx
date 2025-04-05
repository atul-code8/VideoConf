import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Video,
  UserPlus,
  Users,
  ArrowRight,
  Settings,
  LoaderCircle,
} from "lucide-react";
import { useSocket } from "../context/websocket";

const Lobby = () => {
  const [meetingId, setMeetingId] = useState("");
  const [name, setName] = useState("");
  const [form, setForm] = useState({
    meetingTitle: "",
    userName: "",
  });
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createdMeetingId, setCreatedMeetingId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const socket = useSocket();
  const navigate = useNavigate();

  const handleCreateMeeting = (e) => {
    e.preventDefault();
    setIsCreating(true);

    if (!form.meetingTitle || !form.userName) {
      alert("Please enter a meeting title and name.");
      setIsCreating(false);
      return;
    }

    const newMeetingId = Math.random().toString(36).substring(2, 12);
    setCreatedMeetingId(newMeetingId);

    socket.emit("create-meeting", newMeetingId, form.meetingTitle || "Meeting");

    setTimeout(() => {
      navigate(`/meeting/${newMeetingId}`, { state: { name: form.userName } });
    }, 1000);

    setIsCreating(false);

    // Request camera and microphone permission
    // navigator.mediaDevices
    //   .getUserMedia({ video: true, audio: true })
    //   .then(() => {
    //     const newMeetingId = Math.random().toString(36).substring(2, 12);
    //     setCreatedMeetingId(newMeetingId);

    //     socket.emit(
    //       "create-meeting",
    //       newMeetingId,
    //       form.meetingTitle || "Meeting"
    //     );

    //     setTimeout(() => {
    //       navigate(`/meeting/${newMeetingId}`, {
    //         state: { name: form.userName },
    //       });
    //     }, 1000);
    //   })
    //   .catch((err) => {
    //     alert(
    //       "Camera and microphone permissions are required to start the meeting."
    //     );
    //   });
  };

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    setIsJoining(true);

    // socket.emit("check-meeting-exists", meetingId);

    // socket.once("meeting-exists", (exists) => {
    //   if (exists) {
    //     setTimeout(() => {
    //       navigate(`/meeting/${meetingId}`, { state: { name } });
    //     }, 1000);
    //   } else {
    //     alert("The meeting does not exist.");
    //   }
    // });

    // Request camera and microphone permission
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(() => {
        socket.emit("check-meeting-exists", meetingId);

        socket.once("meeting-exists", (exists) => {
          if (exists) {
            setTimeout(() => {
              navigate(`/meeting/${meetingId}`, { state: { name } });
            }, 1000);
          } else {
            alert("The meeting does not exist.");
          }
        });
      })
      .catch((err) => {
        alert(
          "Camera and microphone permissions are required to join the meeting."
        );
      })
      .finally(() => {
        setIsJoining(false);
      });
  };

  return (
    <div className="min-h-screen flex items-center">
      <div className="min-h-screen flex-1 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg">
                <Video className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4">Virtual Meeting</h1>
            <p className="text-xl text-gray-600">
              Connect with anyone, anywhere, anytime
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Create Meeting Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-6">
                <div className="bg-indigo-100 p-3 rounded-xl">
                  <UserPlus className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 ml-4">
                  Create Meeting
                </h2>
              </div>

              {!showCreateForm ? (
                <>
                  <p className="text-gray-600 mb-8">
                    Start a new instant meeting and invite participants
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="w-full bg-indigo-600 text-white rounded-xl px-6 py-3 hover:bg-indigo-700 transition-colors flex items-center justify-center font-medium"
                  >
                    Create Instant Meeting
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </>
              ) : createdMeetingId ? (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-green-800 font-medium mb-2">
                      Meeting Created Successfully!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setCreatedMeetingId("");
                    }}
                    className="w-full border-2 border-indigo-600 text-indigo-600 rounded-xl px-6 py-3 hover:bg-indigo-50"
                  >
                    Create Another Meeting
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateMeeting} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Title (Optional)
                    </label>
                    <div className="relative">
                      <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={form.meetingTitle}
                        onChange={(e) =>
                          setForm({ ...form, meetingTitle: e.target.value })
                        }
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent focus:outline-none"
                        placeholder="My Instant Meeting"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={form.userName}
                      onChange={(e) =>
                        setForm({ ...form, userName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center bg-indigo-600 text-white rounded-xl px-6 py-3 hover:bg-indigo-700 transition-colors mt-6"
                    disabled={isCreating}
                  >
                    {!isCreating ? "Create Meeting" : "Creating..."}
                    {isCreating && (
                      <span className="ml-2">
                        <LoaderCircle className="animate-spin text-white" />
                      </span>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Join Meeting Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-6">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 ml-4">
                  Join Meeting
                </h2>
              </div>

              {!showJoinForm ? (
                <>
                  <p className="text-gray-600 mb-8">
                    Join an existing meeting using a meeting ID
                  </p>
                  <button
                    onClick={() => setShowJoinForm(true)}
                    className="w-full border-2 border-purple-600 text-purple-600 rounded-xl px-6 py-3 hover:bg-purple-50 transition-colors flex items-center justify-center font-medium"
                  >
                    Join Existing Meeting
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </>
              ) : (
                <form onSubmit={handleJoinMeeting} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting ID
                    </label>
                    <input
                      type="text"
                      value={meetingId}
                      onChange={(e) => setMeetingId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                      placeholder="Enter meeting ID"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center bg-purple-600 text-white rounded-xl px-6 py-3 hover:bg-purple-700 transition-colors mt-6"
                    disabled={isJoining}
                  >
                    {!isJoining ? "Join Meeting" : "Joining..."}
                    {isJoining && (
                      <span className="ml-2">
                        <LoaderCircle className="animate-spin text-white" />
                      </span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact <a href="mailto:support@virtualmeetings.com" className="text-indigo-600 hover:text-indigo-700">support@virtualmeetings.com</a>
          </p>
        </div> */}
        </div>
      </div>
    </div>
  );
};

export default Lobby;
