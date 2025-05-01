import { toast } from "react-toastify";
import request from "../../utils/request";
import { userActions } from "../Slices/UserSlice";
import { authActions } from "../Slices/AuthSlice";


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

export function SearchedUser(userId) {
  return async (dispatch) => {
    try {
      const res = await request.get(`/api/users/getUserbyId/${userId}`);
      dispatch(userActions.setSearchedUser(res.data));
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch user");
    }

  }
}

export function searchUsers(query) {
  return async (dispatch) => {
    try {
      const res = await request.get(`/api/users/search?query=${query}`);
      dispatch(userActions.setUsersReturned(res.data));
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch users");
    }
  }
}

export function toggleFollow(userId) {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      const res = await request.put(
        `/api/users/toggle-follow/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);

      // 1) re-fetch the searched user to update follower count
      dispatch(SearchedUser(userId));

      // 2) update currentUser.following (nested shape)
      const { user: current } = getState().auth;
      let newFollowing;
      if (res.data.message === "Followed user") {
        newFollowing = [ ...current.following, { user: userId } ];
      } else {
        newFollowing = current.following.filter(f => f.user !== userId);
      }

      // update Redux + localStorage
      dispatch(authActions.setFollowing(newFollowing));
      const stored = JSON.parse(localStorage.getItem("userinfo"));
      localStorage.setItem(
        "userinfo",
        JSON.stringify({ ...stored, following: newFollowing })
      );
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to follow/unfollow user");
    }
  };
}

