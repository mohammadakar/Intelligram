// src/components/RegisterPage.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { register } from "../redux/ApiCalls/AuthApiCall";
import { loadModels } from "../utils/faceDetection";
import Modal from "./Modal";

const RegisterPage = () => {
  const [username, setUsername]           = useState("");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [faceEmbeddings, setFaceEmbeddings]   = useState(null);
  const [showFaceModal, setShowFaceModal]     = useState(false);
  const videoRef = useRef();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    loadModels().then(() => {
      console.log("Models loaded for Face Registration");
    });
  }, []);

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureFace = async () => {
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    return detection ? Array.from(detection.descriptor) : null;
  };

  const handleFaceRegistration = async () => {
    setShowFaceModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      videoRef.current.srcObject = stream;
      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          resolve();
        };
      });
      await new Promise((r) => setTimeout(r, 1000));
      const embedding = await captureFace();
      stopVideo();
      setShowFaceModal(false);
      if (embedding) {
        setFaceEmbeddings(embedding);
        toast.success("Face registered successfully!");
      } else {
        toast.error("No face detected, please try again.");
      }
    } catch (err) {
      console.error(err);
      stopVideo();
      setShowFaceModal(false);
      toast.error("Face registration failed. Try again.");
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      return toast.error("All fields are required.");
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    const payload = { username, email, password };
    if (faceEmbeddings) payload.faceEmbeddings = faceEmbeddings;
    dispatch(register(payload));
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen justify-center ">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-white shadow rounded-lg px-8 py-10">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
            Create your account
          </h2>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md 
                             placeholder-gray-400 focus:outline-none focus:ring-blue-500 
                             focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md 
                             placeholder-gray-400 focus:outline-none focus:ring-blue-500 
                             focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md 
                             placeholder-gray-400 focus:outline-none focus:ring-blue-500 
                             focus:border-blue-500 sm:text-sm"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md 
                             placeholder-gray-400 focus:outline-none focus:ring-blue-500 
                             focus:border-blue-500 sm:text-sm"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleFaceRegistration}
              className="w-full flex items-center justify-center py-2 px-4 border 
                         border-gray-300 rounded-md shadow-sm text-sm font-medium 
                         text-gray-700 bg-white hover:bg-gray-50 focus:outline-none 
                         focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span role="img" aria-label="face-id" className="mr-2">
                👤
              </span>
              Add Your FaceID (Optional)
            </button>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent 
                         rounded-md shadow-sm text-sm font-medium text-white 
                         bg-gradient-to-r from-blue-600 to-purple-600 
                         hover:from-blue-700 hover:to-purple-700 focus:outline-none 
                         focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/" className="font-medium text-blue-600 hover:text-blue-500">
                Login
              </Link>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              By continuing, you agree to our Terms of Service
            </p>
          </div>
        </div>
      </div>

      {showFaceModal && (
        <Modal onClose={() => { stopVideo(); setShowFaceModal(false); }}>
          <h3 className="text-lg font-bold mb-4">Register Your Face</h3>
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full rounded-md"
          />
        </Modal>
      )}
    </div>
  );
};

export default RegisterPage;
