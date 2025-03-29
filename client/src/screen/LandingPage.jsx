import { useNavigate } from "react-router";
import {
  Video,
  Users,
  Globe,
  Shield,
  ArrowRight,
  MessageSquare,
  Calendar,
  Play,
  Check,
} from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";

const LandingPage = () => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-lg fixed w-full z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Video className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">
                  VideoConf
                </span>
              </div>
              {/* Navigation links */}
              {!user && (
                <div className="flex items-center gap-4">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
              {user && (
                <div className="flex items-center gap-4">
                  {/* profile */}
                  <div className="flex items-center gap-2">
                    <svg
                      viewBox="0 0 43.015 43.015"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8 text-blue-600"
                    >
                      <path
                        id="profile"
                        d="M527.352,255.432a2.6,2.6,0,0,1-1.915,1.915,98.592,98.592,0,0,1-35.891,0,2.6,2.6,0,0,1-1.915-1.915,98.571,98.571,0,0,1,0-35.888,2.6,2.6,0,0,1,1.915-1.915,98.592,98.592,0,0,1,35.891,0,2.6,2.6,0,0,1,1.915,1.915A98.567,98.567,0,0,1,527.352,255.432ZM520.825,244.6a24.835,24.835,0,0,0-6.644-4.225,9.1,9.1,0,1,0-12.647.136,25.24,25.24,0,0,0-6.31,4.089q-12.8,11.021,12.8,11.021T520.825,244.6Zm-12.8-6.049c-1.477,0-2.674-.716-2.674-1.6a1,1,0,0,1,.094-.4,2.626,2.626,0,0,1-.094-.663h.688a3.939,3.939,0,0,1,3.973,0h.688a2.626,2.626,0,0,1-.094.663,1,1,0,0,1,.094.4C510.7,237.832,509.5,238.548,508.024,238.548Z"
                        transform="translate(-485.984 -215.983)"
                        fill="#2d5be2"
                      />
                    </svg>
                    <span className="text-gray-600 font-medium">
                      {user.name}
                    </span>
                  </div>

                  <Link
                    to="/logout"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                    onClick={handleLogout}
                  >
                    Logout
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative hero-gradient overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                  Transform Your{" "}
                  <span className="text-blue-200">Virtual Meetings</span>{" "}
                  Experience
                </h1>
                <p className="text-xl text-blue-100">
                  Experience crystal-clear video meetings with enterprise-grade
                  security and reliability. Connect with anyone, anywhere,
                  anytime.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-50 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    onClick={() => {
                      user ? navigate("/meeting") : navigate("/login");
                    }}
                  >
                    Get Started <ArrowRight size={20} />
                  </button>
                  {/* <button className="bg-blue-700/30 backdrop-blur-lg text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700/40 transition border border-white/20">
                    <Play size={20} /> Watch Demo
                  </button> */}
                </div>
              </div>
              <div className="relative animate-float">
                <img
                  src="https://images.unsplash.com/photo-1609921212029-bb5a28e60960?auto=format&fit=crop&q=80&w=800"
                  alt="Video Conference"
                  className="rounded-2xl shadow-2xl border-4 border-white/20 backdrop-blur-lg"
                />
                <div
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-xl shadow-xl flex items-center gap-4 animate-float"
                  style={{ animationDelay: "1s" }}
                >
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-800 font-medium">
                    Connect with pepole
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl font-bold text-gray-900">
                Everything You Need for Perfect Meetings
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Powerful features designed for modern collaboration, making your
                virtual meetings more productive and engaging.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Video className="w-8 h-8 text-blue-600" />,
                  title: "HD Video Quality",
                  description:
                    "Crystal clear video with adaptive quality for any connection",
                  features: [
                    "4K video support",
                    "Smart bandwidth management",
                    "Low latency streaming",
                  ],
                  available: true,
                },
                {
                  icon: <Users className="w-8 h-8 text-blue-600" />,
                  title: "Large Meetings",
                  description:
                    "Host up to 100 participants with grid view support",
                  features: [
                    "Dynamic grid layout",
                    "Active speaker view",
                    "Breakout rooms",
                  ],
                  available: true,
                },
                {
                  icon: <Shield className="w-8 h-8 text-blue-600" />,
                  title: "Enterprise Security",
                  description:
                    "End-to-end encryption and advanced security features",
                  features: [
                    "End-to-end encryption",
                    "Meeting password",
                    "Waiting room",
                  ],
                  available: true,
                },
                {
                  icon: <MessageSquare className="w-8 h-8 text-blue-600" />,
                  title: "Chat & Collaboration",
                  description: "Built-in chat and file sharing capabilities",
                  features: [
                    "Group & private chat",
                    "File sharing",
                    "Screen sharing",
                  ],
                  available: true,
                },
                {
                  icon: <Calendar className="w-8 h-8 text-blue-600" />,
                  title: "Smart Scheduling",
                  description: "Easy calendar integration and meeting planning",
                  features: [
                    "Calendar sync",
                    "Recurring meetings",
                    "Time zone support",
                  ],
                  available: false,
                },
                {
                  icon: <Globe className="w-8 h-8 text-blue-600" />,
                  title: "Global Access",
                  description:
                    "Connect from anywhere with low-latency servers worldwide",
                  features: [
                    "Global server network",
                    "Auto region selection",
                    "24/7 availability",
                  ],
                  available: false,
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-xl shadow-lg feature-card-hover"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-lg mb-6">
                    {feature.icon}
                  </div>
                  {!feature.available && (
                    <div className="absolute text-sm font-semibold top-4 right-4 bg-teal-50 text-teal-600 py-1 px-2 rounded">
                      Available Soon
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.features.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <Check className="w-5 h-5 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="hidden bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  number: "10M+",
                  label: "Users Worldwide",
                  sublabel: "Growing every day",
                },
                {
                  number: "99.9%",
                  label: "Uptime",
                  sublabel: "Enterprise reliability",
                },
                {
                  number: "150+",
                  label: "Countries",
                  sublabel: "Global presence",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="stat-card bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl text-center"
                >
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-xl font-semibold text-gray-800 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-gray-600">{stat.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Virtual Meetings?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join millions of satisfied users who have already upgraded their
              virtual meeting experience. Start your free trial today. No credit
              card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              onClick={() => {
                user ? navigate("/meeting") : navigate("/login");
              }}>
                Start Free Trial
              </button>
              {/* <button className="bg-blue-700/30 backdrop-blur-lg text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700/40 transition border border-white/20">
              Contact Sales
            </button> */}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">VideoConf</h3>
                <p className="text-gray-400">
                  Making virtual meetings feel more personal and productive.
                </p>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    <span className="sr-only">Twitter</span>
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    <span className="sr-only">LinkedIn</span>
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    <span className="sr-only">GitHub</span>
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                    </svg>
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Product</h4>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition"
                    >
                      Features
                    </a>
                  </li>
                  {/* <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition"
                    >
                      Pricing
                    </a>
                  </li> */}
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition"
                    >
                      Security
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition"
                    >
                      Enterprise
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Company</h4>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition"
                    >
                      About
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition"
                    >
                      Blog
                    </a>
                  </li>
                  {/* <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition"
                    >
                      Careers
                    </a>
                  </li> */}
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Resources</h4>
                <ul className="space-y-3">
                  {/* <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition"
                    >
                      Documentation
                    </a>
                  </li> */}
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition"
                    >
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition"
                    >
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
              <p>© 2025 VideoConf. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
