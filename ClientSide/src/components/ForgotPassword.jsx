import { useState } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { forgotPassword } from "../redux/ApiCalls/PasswordApiCall";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");

    const navigate=useNavigate();

    const formSubmitHandler = (e) => {
        e.preventDefault();
        if (email.trim() === "") return toast.error("Email is required");
        dispatch(forgotPassword(email));
        navigate("/")
    };

    return (
        <section className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Forgot Password
            </h1>
            <form onSubmit={formSubmitHandler}>
            <div className="mb-4">
                <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-2"
                >
                Email
                </label>
                <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>
            <button
                type="submit"
                className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition duration-300"
            >
                Submit
            </button>
            </form>
        </div>
        </section>
    );
};

export default ForgotPassword;
