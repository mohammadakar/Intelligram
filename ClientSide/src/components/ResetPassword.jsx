import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getResetPassword, resetPassword } from "../redux/ApiCalls/PasswordApiCall";

const ResetPassword = () => {
    const dispatch = useDispatch();
    const { isError } = useSelector((state) => state.password);
    const navigate = useNavigate();
    const [password, setPassword] = useState("");

    const { userId, token } = useParams();

    useEffect(() => {
        dispatch(getResetPassword(userId, token));
    }, [userId, token, dispatch]);

    const formSubmitHandler = (e) => {
        e.preventDefault();

        if (password.trim() === "") return toast.error("Password is required");

        dispatch(resetPassword(password, { userId, token }));
        navigate("/");
    };

    if (isError) {
        return (
        <section className="flex items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl font-semibold text-red-500">Not Found</h1>
        </section>
        );
    }

    return (
        <section className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Reset Password
            </h1>
            <form onSubmit={formSubmitHandler}>
            <div className="mb-4">
                <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-2"
                >
                New Password
                </label>
                <input
                type="password"
                id="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>
            <button
                type="submit"
                className="w-full cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition duration-300"
            >
                Submit
            </button>
            </form>
        </div>
        </section>
    );
};

export default ResetPassword;
