import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { toast } from 'react-toastify';
import { useDispatch } from "react-redux";
import { register } from '../redux/ApiCalls/AuthApiCall';
import { loadModels } from '../utils/faceDetection';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [faceEmbeddings, setFaceEmbedding] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        loadModels();
    }, []);

    // Helper function to stop the camera stream
    const stopVideoStream = () => {
        const video = document.getElementById('video');
        if (video && video.srcObject) {
        const stream = video.srcObject;
        stream.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
        }
    };

    const formSubmitHandler = (e) => {
        e.preventDefault();

        if (username.trim() === "") return toast.error('Username is required !!');
        if (email.trim() === "") return toast.error('Email is required !!');
        if (password.trim() === "") return toast.error('Password is required !!');
        if (confirmPassword.trim() === "") return toast.error('Confirm Password is required !!');
        if (password !== confirmPassword) return toast.error("Passwords do not match!");

        const payload = { username, email, password };
        if (faceEmbeddings) {
        payload.faceEmbeddings = [faceEmbeddings];
        }

        dispatch(register(payload));
        stopVideoStream();
        navigate("/")
    };

    const handleFaceRegistration = async () => {
        try {
        const video = document.getElementById('video');
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;

        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
            video.play();
            resolve();
            };
        });
        // Allow a brief delay to ensure the video feed is ready
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const detection = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (detection) {
            console.log('Face registered!', detection.descriptor);
            setFaceEmbedding(detection.descriptor);
            toast.success("Face registered successfully!");
        } else {
            toast.error("No face detected, please try again.");
        }
        } catch (error) {
        console.error('Face detection error:', error);
        toast.error("Face detection error. Please try again.");
        }
    };

    return (
        <div className="flex justify-center min-h-screen">
        <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md bg-white shadow rounded-lg px-8 py-10">
            <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
                Create your account
            </h2>
            <form className="space-y-6" onSubmit={formSubmitHandler}>
                <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                </label>
                <div className="mt-1">
                    <input
                    id="username"
                    name="username"
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 
                        rounded-md placeholder-gray-400 focus:outline-none 
                        focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                </div>
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
                    className="block w-full px-3 py-2 border border-gray-300 
                        rounded-md placeholder-gray-400 focus:outline-none 
                        focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    className="block w-full px-3 py-2 border border-gray-300 
                        rounded-md placeholder-gray-400 focus:outline-none 
                        focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                </div>
                <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                </label>
                <div className="mt-1">
                    <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className="block w-full px-3 py-2 border border-gray-300 
                        rounded-md placeholder-gray-400 focus:outline-none 
                        focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                </div>
                <div>
                <button
                    type="button"
                    onClick={handleFaceRegistration}
                    className="w-full flex items-center justify-center py-2 px-4 
                    border border-gray-300 rounded-md shadow-sm text-sm font-medium 
                    text-gray-700 bg-white hover:bg-gray-50 focus:outline-none 
                    focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <span role="img" aria-label="face-id" className="mr-2">
                    👤
                    </span>
                    Add Your FaceID (Optional)
                </button>
                </div>
                <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 
                    border border-transparent rounded-md shadow-sm text-sm 
                    font-medium text-white bg-gradient-to-r from-blue-600 
                    to-purple-600 hover:from-blue-700 hover:to-purple-700 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-blue-500"
                >
                Create Account
                </button>
            </form>
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                    to="/"
                    className="font-medium text-blue-600 hover:text-blue-500"
                >
                    Login
                </Link>
                </p>
                <p className="mt-2 text-xs text-gray-500">
                By creating an account, you agree to our Terms of Service
                </p>
            </div>
            </div>
        </div>
        <video
            id="video"
            width="720"
            height="560"
            autoPlay
            muted
            style={{ position: 'absolute', left: '-9999px' }}
        />
        </div>
    );
};

export default RegisterPage;
