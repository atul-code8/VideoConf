import {
  Loader,
  Maximize,
  Pause,
  Play,
  Send,
  Settings,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const Home = () => {
  const [state, setState] = useState(false);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // Update progress bar
  const updateProgress = () => {
    if (videoRef.current) {
      const currentProgress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  // Handle video loaded
  const handleVideoLoaded = () => {
    setIsLoading(false);
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Get current time
  const getCurrentTime = () => {
    return videoRef.current ? formatTime(videoRef.current.currentTime) : "0:00";
  };

  // Get duration time
  const getDurationTime = () => {
    return formatTime(duration);
  };

  const handleToggle = () => {
    setState((prev) => !prev);
  };

  const initStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    videoRef.current.play();
    setIsLoading(false);
    setDuration(videoRef.current.duration);
    videoRef.current.addEventListener("timeupdate", updateProgress);
    videoRef.current.addEventListener("loadedmetadata", handleVideoLoaded);
    videoRef.current.addEventListener("ended", () => setIsPlaying(false));
    videoRef.current.addEventListener("canplay", () => setIsLoading(false));
    videoRef.current.addEventListener("canplaythrough", () => setIsLoading(false));
    videoRef.current.addEventListener("playing", () => setIsLoading(false));
    videoRef.current.addEventListener("waiting", () => setIsLoading(true));
    videoRef.current.addEventListener("pause", () => setIsLoading(false));
    videoRef.current.addEventListener("ended", () => setIsLoading(false));
    videoRef.current.addEventListener("error", () => setIsLoading(false));
    videoRef.current.addEventListener("abort", () => setIsLoading(false));
    videoRef.current.addEventListener("stalled", () => setIsLoading(false));
    videoRef.current.addEventListener("loadedmetadata", () => setIsLoading(false));
    videoRef.current.addEventListener("loadeddata", () => setIsLoading(false));
    videoRef.current.addEventListener("progress", () => setIsLoading(false));
    videoRef.current.addEventListener("durationchange", () => setIsLoading(false));
    videoRef.current.addEventListener("suspend", () => setIsLoading(false));
    videoRef.current.addEventListener("emptied", () => setIsLoading(false));
  };

  useEffect(() => {
    initStream();
  }, []);


  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div
        className={`fixed w-[400px] h-screen bg-violet-100 transition-all duration-300 ${
          state ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <p className="text-3xl font-bold text-center text-gray-700">Slider</p>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col justify-center bg-sky-100 transition-all duration-300 ${
          state ? "ml-[400px]" : "ml-0"
        }`}
      >
        <button
          type="button"
          className="bg-violet-500 w-40 mx-auto text-gray-100 border-none hover:bg-violet-600 mb-4"
          onClick={handleToggle}
        >
          Toggle Chat
        </button>
        <div className="relative w-full max-w-3xl mx-auto overflow-hidden rounded-lg group">
          {/* Video Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 rounded-lg">
              <Loader className="w-12 h-12 text-white animate-spin" />
            </div>
          )}

          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full h-[300px] object-cover rounded-lg"
            playsInline
            onTimeUpdate={updateProgress}
            onLoadedData={handleVideoLoaded}
            onLoadedMetadata={handleVideoLoaded}
            src="/placeholder.mp4"
          />

          {/* Gradient Overlay for Controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Progress Bar */}
            <div className="relative w-full h-1 mb-3 bg-gray-600 rounded cursor-pointer">
              <div
                className="absolute top-0 left-0 h-full bg-fuchsia-500 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlay}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-fuchsia-500/80 hover:bg-fuchsia-600 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white" />
                  )}
                </button>

                <button
                  onClick={toggleMute}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-fuchsia-500/80 hover:bg-fuchsia-600 transition-colors text-white!"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white" />
                  )}
                </button>

                <div className="text-xs text-white">
                  {getCurrentTime()} / {getDurationTime()}
                </div>
              </div>

              {/* Right Controls */}
              <div>
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-fuchsia-500/80 hover:bg-fuchsia-600 transition-colors"
                >
                  <Maximize className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Play Button Overlay (when paused) */}
          {!isPlaying && !isLoading && (
            <button
              onClick={() => videoRef.current.getTracks()[0].stop()}
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                w-16 h-16 flex items-center justify-center rounded-full
                bg-fuchsia-500/80 hover:bg-fuchsia-600 transition-all duration-300 group-hover:scale-110`}
            >
              <Play className="w-8 h-8 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

{
  /* <div className="relative">
  <div
    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
      user.online ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
    }`}
  >
    {user.avatar}
  </div>
  <span
    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
      user.online ? "bg-green-500" : "bg-gray-400"
    }`}
  />
</div>; */
}
