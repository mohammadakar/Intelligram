import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { toast } from "react-toastify";
import { useDispatch } from 'react-redux';
import { FaceLogin, loginUser, selectAccount } from '../redux/ApiCalls/AuthApiCall';
import { loadModels } from '../utils/faceDetection';
import Modal from './Modal';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [matchedAccounts, setMatchedAccounts] = useState([]);
    const [showAccountSelector, setShowAccountSelector] = useState(false);
    const [captureCount, setCaptureCount] = useState(0);
    const [captureProgress, setCaptureProgress] = useState(0);
    const [isCapturing, setIsCapturing] = useState(false);
    const navigate = useNavigate();
    const videoRef = useRef();
    const dispatch = useDispatch();

    useEffect(() => {
        loadModels().then(() => {
            console.log("Models loaded for Face Login");
        });
    }, []);

    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await new Promise((resolve) => {
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play();
                        resolve();
                    };
                });
            }
        } catch (err) {
            console.error("Error accessing webcam", err);
            toast.error("Error accessing webcam");
        }
    };

    const stopVideo = () => {
        const video = videoRef.current;
        if (video && video.srcObject) {
            const stream = video.srcObject;
            stream.getTracks().forEach((track) => track.stop());
            video.srcObject = null;
        }
    };

    const captureFace = async () => {
    if (!videoRef.current) return null;
    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();
    
    return detections.length > 0 
      ? detections.map(d => Array.from(d.descriptor)) 
      : null;
  };

  const handleFaceLogin = async () => {
    try {
      setIsCapturing(true);
      await startVideo();
      
      // Capture 3 different angles for better accuracy
      const embeddings = [];
      setCaptureCount(0);
      setCaptureProgress(0);
      
      for (let i = 0; i < 3; i++) {
        setCaptureProgress((i / 3) * 100);
        await new Promise(r => setTimeout(r, 1000));
        
        const newEmbeddings = await captureFace();
        if (newEmbeddings && newEmbeddings.length > 0) {
          embeddings.push(...newEmbeddings);
          setCaptureCount(prev => prev + 1);
        }
      }
      
      if (embeddings.length === 0) {
        setMessage("Face not detected. Please try again.");
        stopVideo();
        setIsCapturing(false);
        return;
      }
      
      // Use the most confident detection
      const bestEmbedding = embeddings.reduce((best, current) => 
        best.length > 0 && best[0].detectionScore > current.detectionScore ? best : current
      );
      
      const result = await dispatch(FaceLogin({ embedding: bestEmbedding }));
      stopVideo();
      setIsCapturing(false);
      
      if (result?.multiple) {
        setMatchedAccounts(result.accounts);
        setShowAccountSelector(true);
      }
    } catch (err) {
      console.error(err);
      setMessage("Face login failed.");
      stopVideo();
      setIsCapturing(false);
    }
  };

    const handleAccountSelection = (account) => {
        dispatch(selectAccount(account));
        toast.success(`Logged in as ${account.username}`);
        setShowAccountSelector(false);
    };

    const formSubmitHandler = (e) => {
        e.preventDefault();
        if (email.trim() === "") return toast.error('Email is required !!');
        if (password.trim() === "") return toast.error('Password is required !!');
        dispatch(loginUser({ email, password }));
        navigate("/home");
    };

    return (
        <div className="flex flex-col min-h-screen justify-center">
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-md bg-white shadow rounded-lg px-8 py-10">
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
                        Login to your account
                    </h2>
                    <form className="space-y-6" onSubmit={formSubmitHandler}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
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
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md 
                                            placeholder-gray-400 focus:outline-none focus:ring-blue-500 
                                            focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border 
                                    border-transparent rounded-md shadow-sm text-sm font-medium 
                                    text-white bg-gradient-to-r from-blue-600 to-purple-600 
                                    hover:from-blue-700 hover:to-purple-700 focus:outline-none 
                                    focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Login
                        </button>
                    </form>

                    <div className="mt-6">
                        <button
                            onClick={handleFaceLogin}
                            className="w-full flex items-center justify-center py-2 px-4 
                                    border border-gray-300 rounded-md shadow-sm text-sm font-medium 
                                    text-gray-700 bg-white hover:bg-gray-50 focus:outline-none 
                                    focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <span role="img" aria-label="face-id" className="mr-2">
                                👤
                            </span>
                            Join with your FaceID
                        </button>
                    </div>

                    <div className="mt-6 text-center hover:text-purple-600">
                        <Link to="/forget-password">Forgot your password?</Link>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don&apos;t have an account?{' '}
                            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                Register
                            </Link>
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                            By continuing, you agree to our Terms of Service
                        </p>
                    </div>
                    {message && <p className="mt-4 text-center text-red-500">{message}</p>}
                </div>
            </div>

            <video ref={videoRef} autoPlay muted style={{ display: 'none' }} />

            {showAccountSelector && (
                <Modal onClose={() => setShowAccountSelector(false)}>
                    <h2 className="text-xl font-bold mb-4">Select an account to login</h2>
                    {matchedAccounts.map((account) => (
                        <div
                            key={account._id}
                            onClick={() => handleAccountSelection(account)}
                            className="cursor-pointer p-3 border-b hover:bg-gray-100"
                        >
                            <p className="font-semibold">{account.username}</p>
                            <p className="text-sm text-gray-600">{account.email}</p>
                        </div>
                    ))}
                </Modal>
            )}
            {isCapturing && (
                <Modal onClose={() => { stopVideo(); setIsCapturing(false); }}>
                <h3 className="text-lg font-bold mb-4">Face Login in Progress</h3>
                <p className="mb-2">Position your face in different angles</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${captureProgress}%` }}
                    ></div>
                </div>
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full rounded-md"
                />
                <p className="mt-2">Captured {captureCount}/3 angles</p>
                </Modal>
            )}
        </div>
    );
};

export default LoginPage;