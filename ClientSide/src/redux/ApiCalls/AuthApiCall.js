import { toast } from "react-toastify";
import request from "../../utils/request";
import { authActions } from "../Slices/AuthSlice";

export function register(newUser) {
    return async (dispatch) => {
        try {
            const res = await request.post("/api/auth/register", newUser);
            dispatch(authActions.register(res.data.message));
            toast.success(res.data.message);
        } catch (error) {
            const errorMessage = error?.response?.data?.message || "An error occurred";
            toast.error(errorMessage);
        }
    }
}

export function loginUser(user) {
    return async (dispatch) => {
        try {
            const res = await request.post("/api/auth/login", user);
            dispatch(authActions.login(res.data));
            toast.success("Logged in successfully");
        } catch (error) {
            if (error.response && error.response.status === 429) {
                toast.error(
                    error.response.data.message ||
                    "Too many requests. Please try again later."
                );
            } else {
                toast.error(
                    error.response?.data?.message ||
                    "Login failed. Please check your credentials."
                );
            }
        }
    }
}

export function FaceLogin({ embedding }) {
  return async (dispatch) => {
    try {
      const res = await request.post("/api/auth/faceLogin", { embedding });
      if (res.data.multiple) {
        return { multiple: true, accounts: res.data.accounts };
      } else {
        dispatch(authActions.login(res.data));
        toast.success("Logged in successfully");
        return { multiple: false };
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Face login failed");
      throw error;
    }
  }
}

export function verifyEmail(userId, token) {
    return async (dispatch) => {
        try {
            dispatch(authActions.verifyEmailStart());
            await request.get(`/api/auth/${userId}/verify/${token}`);
            dispatch(authActions.verifyEmailSuccess());
            toast.success("Email verified successfully. Go to login page.");
        } catch (error) {
            dispatch(authActions.verifyEmailFailure(error.response.data.message));
            toast.error(error.response.data.message);
        }
    }
}

export function selectAccount(account) {
    return async (dispatch) => {
        try {
            const res = await request.post("/api/auth/selectAccount", { accountId: account._id });
            dispatch(authActions.login(res.data));
        } catch (error) {
            toast.error(error.response?.data?.message || "Account selection failed");
        }
    }
}