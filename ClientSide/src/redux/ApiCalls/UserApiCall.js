import { toast } from "react-toastify";
import request from "../../utils/request";
import { userActions } from "../Slices/UserSlice";


export function updateBio(bio) {
  return async (dispatch, getState) => {
    try {
      const res = await request.post("/api/users/update-bio", { bio }, {
        headers: {Authorization : "Bearer " + getState().auth.user.token}
      });
        dispatch(userActions.setBio(res.data));
        const currentUser = JSON.parse(localStorage.getItem('userinfo'));
        const updatedUser = { ...currentUser, bio: res.data };
        localStorage.setItem('userinfo', JSON.stringify(updatedUser));
        window.location.reload();
        toast.success("Bio updated successfully");
    }
    catch (error) {
      toast.error(error.response?.data?.error || "Failed to update bio");
    }
}
}

export function getUserbyId(id) {
  return async (dispatch) => {
    try {
      const res = await request.get(`/api/users/getUserbyId/${id}`);
      dispatch(userActions.setUserById(res.data));
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch user");
    }

  }
}