import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { verifyEmail } from "../redux/ApiCalls/AuthApiCall";

const VerifyEmail = () => {
    const dispatch = useDispatch();
    const { isEmailVerified, loading, error } = useSelector((state) => state.auth);
    const { userId, token } = useParams();
    const hasCalled = useRef(false);

    useEffect(() => {
        if (!hasCalled.current) {
        dispatch(verifyEmail(userId, token));
        hasCalled.current = true;
        }
    }, [userId, token, dispatch]);

    if (loading) {
        return (
        <section className="flex items-center justify-center min-h-screen bg-gray-100">
            <p className="text-gray-700 text-xl">Verifying your email...</p>
        </section>
        );
    }

    return (
        <section className="flex items-center justify-center min-h-screen bg-gray-100 px-6">
        <div className="bg-white shadow-lg rounded-xl p-8 text-center max-w-md w-full">
            {error ? (
            <>
                <h1 className="text-2xl font-semibold text-red-500 mb-4">
                Verification Failed ❌
                </h1>
                <p className="text-gray-600">{error}</p>
            </>
            ) : (
            <>
                {isEmailVerified ? (
                <>
                    <div className="flex items-center justify-center mb-4">
                    <i className="bi bi-patch-check text-green-500 text-6xl animate-bounce"></i>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-800 mb-3">
                    Email Successfully Verified 🎉
                    </h1>
                    <p className="text-gray-600 mb-6">
                    Your email address has been verified. You can now log in.
                    </p>
                    <Link
                    to="/"
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-all duration-300"
                    >
                    Go to Login Page
                    </Link>
                </>
                ) : (
                <p className="text-gray-700 text-xl">Invalid verification link</p>
                )}
            </>
            )}
        </div>
        </section>
    );
};

export default VerifyEmail;
