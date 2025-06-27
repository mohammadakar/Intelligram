import { toast } from "react-toastify";
import request from "../../utils/request";
import { postActions } from "../Slices/postSlice";

// Create a new post
export function createPost(postData) {
  return async (dispatch, getState) => {
    try {
      dispatch(postActions.createPostStart());
      const res = await request.post(
        "/api/posts/create-post",
        postData,
        {
          headers: {
            Authorization: "Bearer " + getState().auth.user.token,
            "Content-Type": "application/json"
          }
        }
      );
      dispatch(postActions.setNewPost(res.data));
      dispatch(postActions.createPostSuccess(res.data));
      toast.success("Post created successfully");
    } catch (error) {
      dispatch(postActions.createPostFailure(error.message));
      toast.error(error.response?.data?.error || "Failed to create post");
    }
  };
}

// Fetch all posts
export function getAllPosts() {
  return async dispatch => {
    try {
      const res = await request.get("/api/posts/getAllPosts");
      dispatch(postActions.setPosts(res.data));
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch posts");
    }
  };
}

// Fetch single post by ID
export function getPostById(postId) {
  return async (dispatch, getState) => {
    try {
      const res = await request.get(
        `/api/posts/getPost/${postId}`,
        {
          headers: { Authorization: "Bearer " + getState().auth.user.token }
        }
      );
      dispatch(postActions.setPost(res.data));
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch post");
    }
  };
}

// Toggle like/unlike
export function toggleLike(postId) {
  return async (dispatch, getState) => {
    try {
      const res = await request.post(
        `/api/posts/${postId}/like`,
        {},
        {
          headers: { Authorization: "Bearer " + getState().auth.user.token }
        }
      );
      dispatch(
        postActions.updateLikes({ postId, likes: res.data.likes })
      );
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to toggle like");
    }
  };
}

// Fetch comments for a post
export function getPostComments(postId) {
  return async dispatch => {
    try {
      const res = await request.get(`/api/posts/${postId}/comments`);
      dispatch(postActions.setPostComments(res.data));
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch comments");
    }
  };
}

// Add a comment
export function addComment(postId, text) {
  return async (dispatch, getState) => {
    try {
      const res = await request.post(
        `/api/posts/${postId}/comment`,
        { text },
        { headers: { Authorization: "Bearer " + getState().auth.user.token } }
      );
      dispatch(postActions.addComment(res.data));
      dispatch(
        postActions.addCommentToPost({ postId, comment: res.data })
      );
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add comment");
    }
  };
}

export function editComment(postId, commentId, text) {
  return async (dispatch, getState) => {
    try {
      const res = await request.put(
        `/api/posts/${postId}/comment/${commentId}`,
        { text },
        { headers: { Authorization: "Bearer " + getState().auth.user.token } }
      );
      dispatch(postActions.updateComment({ commentId, text: res.data.text }));
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to edit comment");
    }
  };
}

export function deleteComment(postId, commentId) {
  return async (dispatch, getState) => {
    try {
      await request.delete(
        `/api/posts/${postId}/comment/${commentId}`,
        { headers: { Authorization: "Bearer " + getState().auth.user.token } }
      );
      dispatch(postActions.deleteComment(commentId));
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete comment");
    }
  };
}

export function deletePost(postId) {
  return async (dispatch, getState) => {
    try {
      await request.delete(`/api/posts/${postId}`, {
        headers: { Authorization: "Bearer " + getState().auth.user.token }
      });
      dispatch(postActions.deletePost(postId));
      toast.success("Post deleted");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete post");
    }
  };
}

export function editPost(postId, updatedData) {
  return async (dispatch, getState) => {
  try {
    const { data } = await request.put(`/api/posts/${postId}`, updatedData, {
      headers: {
        Authorization: "Bearer " + getState().auth.user.token
      },
    });
    dispatch({ type: "EDIT_POST_SUCCESS", payload: data });
  } catch (error) {
    console.error(error.response?.data || error.message);
  }
};
}

export function getFeed() {
  return async (dispatch, getState) => {
    const { data } = await request.get('/api/posts/feed', {
      headers: { Authorization: `Bearer ${getState().auth.user.token}` }
    });
    dispatch(postActions.setPosts(data));
  };
}