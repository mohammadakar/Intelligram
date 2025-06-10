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

      // 1) re-fetch the searched user to update their followers/following
      await dispatch(SearchedUser(userId));

      // 2) update currentUser.following or if request pending, remain the same
      const { user: current } = getState().auth;
      let newFollowing;

      // If message was “Requested to follow (private)”, we do NOT yet add to following.
      if (res.data.message.startsWith("Followed user")) {
        // newly added to following
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
        // do nothing to current.following
        newFollowing = current.following;
      } else {
        // res.data.message === "Requested to follow (private)"
        // do nothing to following yet
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
      // 1) grab the existing token from Redux
      const token = getState().auth.user.token;

      // 2) call the backend to accept/reject
      const res = await request.put(
        `/api/users/respond-follow/${requesterId}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);

      // 3) immediately re‐fetch notifications so the pending "follow_request" disappears
      await dispatch(fetchNotifications());

      // 4) re‐fetch the current user's details (so followers/following update in UI)
      const meRes = await request.get(
        `/api/users/getUserbyId/${getState().auth.user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 5) Merge the returned user object into Redux, preserving the original token
      const updatedUser = {
        ...meRes.data,
        token: getState().auth.user.token, // re‐attach the token we still had
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

      // Update both slices:
      dispatch(userActions.setSavedPosts(res.data.savedPosts));
      dispatch(authActions.setAuthSavedPosts(res.data.savedPosts));

      // Persist to localStorage:
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

export function removeFollower(userId) {
  return async (dispatch, getState) => {
    try {
      const token = getState().auth.user.token;
      const res   = await request.delete(
        `/api/users/remove-follower/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);

      // 1) update Redux state
      dispatch(authActions.setFollowers(res.data.followers));

      // 2) grab the _entire_ updated user from Redux 
      const updatedUser = getState().auth.user;

      // 3) overwrite localStorage in one go
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

// change password
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

// delete account
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

// logout (frontend only)
export function logoutUser() {
  return dispatch => {
    dispatch(authActions.logout());
  };
}