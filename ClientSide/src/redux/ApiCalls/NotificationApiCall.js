import { toast } from "react-toastify";
import request from "../../utils/request";
import { notificationActions } from "../Slices/notificationSlice";

export const fetchNotifications = () => async (dispatch, getState) => {
  try {
    const token = getState().auth.user.token;
    const res = await request.get("/api/notifications", { headers:{Authorization:`Bearer ${token}`} });
    dispatch(notificationActions.setList(res.data));
  } catch (err) {
    toast.error(err || "Failed to load notifications");
  }
};

export const markNotificationsRead = () => async (dispatch, getState) => {
  try {
    const token = getState().auth.user.token;
    await request.put("/api/notifications/mark-read", {}, { headers:{Authorization:`Bearer ${token}`} });
    dispatch(notificationActions.markAllRead());
  } catch {
    toast.error("Failed to mark notifications read");
  }
};