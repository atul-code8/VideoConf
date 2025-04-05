import React, { useEffect, useRef } from "react";
import {
  BadgeInfo,
  CheckCircleIcon,
  CircleAlert,
  XIcon,
} from "lucide-react";

const Snackbar = ({
  isOpen,
  message,
  type = "info",
  onClose,
  duration = 6000,
}) => {
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const remainingTimeRef = useRef(duration);

  useEffect(() => {
    if (isOpen) {
      startTimeRef.current = Date.now();
      remainingTimeRef.current = duration;
      timerRef.current = setTimeout(onClose, duration);
    }

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [isOpen, duration, onClose]);

  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    const elapsedTime = Date.now() - startTimeRef.current;
    remainingTimeRef.current = duration - elapsedTime;
  };

  const handleMouseLeave = () => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(onClose, remainingTimeRef.current);
  };

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="w-5 h-5 text-white" />;
      case "error":
        return <CircleAlert className="w-5 h-5 text-white" />;
      case "warning":
        return <BadgeInfo className="w-5 h-5 text-white" />;
      case "info":
        return;
      default:
        return <XIcon className="w-5 h-5 text-white" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      case "warning":
        return "bg-orange-500 text-white";
      case "info":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-500 text-white";
    }
  };

  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 min-w-[300px] max-w-[600px] flex items-center justify-between p-3 rounded-lg shadow-lg z-50 ${getColor()} animate-slideIn`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
    >
      <div className="flex items-center gap-3">
        {getIcon()}
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button
        className="bg-transparent border-none! cursor-pointer p-1 ml-4 opacity-80 hover:opacity-100 transition-opacity"
        onClick={onClose}
        aria-label="Close"
      >
        <XIcon className="w-5 h-5 text-white" />
      </button>
    </div>
  );
};

export default Snackbar;
