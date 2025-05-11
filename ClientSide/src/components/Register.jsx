import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { register } from "../redux/ApiCalls/AuthApiCall";
import { loadModels } from "../utils/faceDetection";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [faceEmbeddings, setFaceEmbedding] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    loadModels();
  }, []);

  // Stop any running camera stream
  const stopVideoStream = () => {
    const video = document.getElementById("video");
    if (video && video.srcObject) {
      const tracks = video.srcObject.getTracks() || [];
      tracks.forEach((t) => t.stop());
      video.srcObject = null;
    }
  };

  // Capture face descriptor and convert to plain number[]
  const handleFaceRegistration = async () => {
    try {
      const video = document.getElementById("video");
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      video.srcObject = stream;
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });
      // brief delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        // convert Float32Array to number[]
        setFaceEmbedding(Array.from(detection.descriptor));
        toast.success("Face registered successfully!");
      } else {
        toast.error("No face detected, please try again.");
      }
    } catch (error) {
      console.error("Face detection error:", error);
      toast.error("Face detection error. Please try again.");
    } finally {
      stopVideoStream();
    }
  };

  // Handle form submission
  const formSubmitHandler = (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      return toast.error("All fields are required.");
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    const payload = { username, email, password };
    if (faceEmbeddings) {
      payload.faceEmbeddings = faceEmbeddings;
    }

    dispatch(register(payload));
    navigate("/");
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
          Create your account
        </h2>
        <form className="space-y-6" onSubmit={formSubmitHandler}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Create password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm password"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={handleFaceRegistration}
              className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-gray-50"
            >
              <span role="img" aria-label="face-id" className="mr-2">👤</span>
              Add Your FaceID (Optional)
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md shadow-sm hover:from-blue-700 hover:to-purple-700"
          >
            Create Account
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          Already have an account?{' '}
          <Link to="/" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>

      <video
        id="video"
        width="0"
        height="0"
        autoPlay
        muted
        style={{ position: 'absolute', top: '-9999px' }}
      />
    </div>
  );
};

export default RegisterPage;
