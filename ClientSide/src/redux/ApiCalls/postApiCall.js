import { toast } from "react-toastify";
import request from "../../utils/request";
import { postActions } from "../Slices/postSlice";

export function createPost(postData) {
  return async (dispatch, getState) => {
    try {
      dispatch(postActions.createPostStart());
      
      const res = await request.post("/api/posts/create-post", postData, {
        headers: {
          Authorization: "Bearer " + getState().auth.user.token,
          'Content-Type': 'application/json'
        }
      });
      
      dispatch(postActions.setNewPost(res.data));
      dispatch(postActions.createPostSuccess(res.data));
      
      toast.success("Post created successfully");
    } catch (error) {
      dispatch(postActions.createPostFailure(error.message));
      toast.error(error.response?.data?.error || "Failed to create post");
    }
  };
}

export function getAllPosts() {
  return async (dispatch) => {
    try {
      const res = await request.get("/api/posts/getAllPosts");
      dispatch(postActions.setPosts(res.data));
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch posts");
    }
  };
}
