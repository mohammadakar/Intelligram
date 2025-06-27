import { toast } from "react-toastify";
import request from "../../utils/request";
import { userActions } from "../Slices/UserSlice";
import { authActions } from "../Slices/AuthSlice";
import { fetchNotifications } from "./NotificationApiCall";


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

      await dispatch(SearchedUser(userId));

      const { user: current } = getState().auth;
      let newFollowing;

      if (res.data.message.startsWith("Followed user")) {
        const { searchedUser } = getState().user;
        newFollowing = [
          ...current.following,
          {
            user: searchedUser._id,
            username: searchedUser.username,
            profilePhoto: searchedUser.profilePhoto,
          },
        ];
      } else if (res.data.message === "Unfollowed user") {
        newFollowing = current.following.filter(
          (f) => f.user.toString() !== userId
        );
      } else if (res.data.message.startsWith("Cancelled follow request")) {
        newFollowing = current.following;
      } else {
        newFollowing = current.following;
      }

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

export function respondFollowRequest(requesterId, action) {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      const res = await request.put(
        `/api/users/respond-follow/${requesterId}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);

      await dispatch(fetchNotifications());

      const meRes = await request.get(
        `/api/users/getUserbyId/${getState().auth.user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = {
        ...meRes.data,
        token: getState().auth.user.token,
      };
      dispatch(authActions.login(updatedUser));

    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to respond to request");
    }
  };
}

export function toggleSavePost(postId) {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      const res = await request.put(
        `/api/users/save-post/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);

      dispatch(userActions.setSavedPosts(res.data.savedPosts));
      dispatch(authActions.setAuthSavedPosts(res.data.savedPosts));

      const stored = JSON.parse(localStorage.getItem('userinfo'));
      localStorage.setItem(
        'userinfo',
        JSON.stringify({ ...stored, savedPosts: res.data.savedPosts })
      );
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save post');
    }
  };
}

export function sharePost(postId) {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      const res = await request.put(
        `/api/users/share-post/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      dispatch(userActions.setSharedPosts(res.data.sharedPosts));
      dispatch(authActions.setAuthSharedPosts(res.data.sharedPosts));

      const stored = JSON.parse(localStorage.getItem('userinfo'));
      localStorage.setItem(
        'userinfo',
        JSON.stringify({ ...stored, sharedPosts: res.data.sharedPosts })
      );
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           'Failed to share post';
      toast.error(errorMessage);
    }
  };
}

export function removeFollower(userId) {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      const res   = await request.delete(
        `/api/users/remove-follower/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);

      dispatch(authActions.setFollowers(res.data.followers));

      const updatedUser = getState().auth.user;

      localStorage.setItem("userinfo", JSON.stringify(updatedUser));

    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to remove follower");
    }
  };
}

export function updateProfilePhotoBackend({ url, publicId }) {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      const res = await request.put(
        "/api/users/profile-photo",
        { url, publicId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = { ...getState().auth.user, profilePhoto: res.data.profilePhoto };
      dispatch(authActions.login(updated));
      localStorage.setItem("userinfo", JSON.stringify(updated));
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile picture");
      throw err;
    }
  };
}

export function updateProfile({ username, isAccountPrivate }) {
  return async (dispatch, getState) => {
    try {
      const { token } = getState().auth.user;
      const res = await request.put(
        "/api/users/update-profile",
        { username, isAccountPrivate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedUser = { ...res.data, token };
      dispatch(authActions.login(updatedUser));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };
}

export function updatePassword({ currentPassword, newPassword }) {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      await request.put(
        "/api/users/update-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Password changed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  };
}

export function deleteAccount() {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      await request.delete("/api/users/delete-account", {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.info("Account deleted");
      dispatch(authActions.logout());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete account");
    }
  };
}

export function logoutUser() {
  return dispatch => {
    dispatch(authActions.logout());
  };
}