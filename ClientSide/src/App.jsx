import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { io } from "socket.io-client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { notificationActions } from "./redux/Slices/notificationSlice";
import { fetchNotifications } from "./redux/ApiCalls/NotificationApiCall";
import LoginPage       from "./components/Login";
import RegisterPage    from "./components/Register";
import VerifyEmail     from "./components/verifyEmail";
import ForgotPassword  from "./components/ForgotPassword";
import ResetPassword   from "./components/ResetPassword";
import HomePage        from "./components/Home";
import CreatePost      from "./components/CreatePost";
import PostDetails     from "./components/PostDetails";
import ProfilePage     from "./components/ProfilePage";
import Post            from "./components/Post";
import Search          from "./components/Search";
import UserProfile     from "./components/SearchedUserProfile";
import Reels           from "./components/Reels";
import StoryUploader   from "./components/StoryUploader";
import FollowersList   from "./components/FollowersList";
import FollowingList   from "./components/FollowingList";
import Settings        from "./components/Settings";
import Chat            from "./components/Chat";
import NotificationsPage from "./components/NotificationsPage";
import Nav             from "./components/Nav";
import AdminLayout     from "./components/Admin/AdminLayout";
import UsersTable      from "./components/Admin/UsersTable";
import PostsTable      from "./components/Admin/PostsTable";
import ReportsTable    from "./components/Admin/ReportsTable";
import StoriesTable from "./components/Admin/StoriesTables";

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);

  useEffect(() => {
    if (!user) return;
    dispatch(fetchNotifications());
    const socket = io("http://localhost:4500", { query:{ userId: user._id } });
    socket.on("notification", notif => {
      dispatch(notificationActions.pushNotification(notif));
    });
    return () => socket.disconnect();
  }, [user, dispatch]);

  return (
    <BrowserRouter>
      <ToastContainer theme="colored" position="top-center" />
      <div className="pb-10">
        <Routes>

          {/* Public */}
          <Route path="/" element={
            !user
              ? <LoginPage/>
              : user.isAdmin
                ? <Navigate to="/admin/users" replace/>
                : <HomePage/>
          }/>
          <Route path="/register" element={!user ? <RegisterPage/> : <Navigate to="/" replace/>}/>
          <Route path="/users/:userId/verify/:token" element={<VerifyEmail/>}/>
          <Route path="/forget-password" element={<ForgotPassword/>}/>
          <Route path="/reset-password/:userId/:token" element={<ResetPassword/>}/>

          {/* Admin-only */}
          {user?.isAdmin && (
            <Route path="/admin" element={<AdminLayout/>}>
              <Route path="users"   element={<UsersTable/>} />
              <Route path="posts"   element={<PostsTable/>} />
              <Route path="reports" element={<ReportsTable/>} />
              <Route path="stories" element={<StoriesTable/>} />
              <Route index element={<Navigate to="users" replace />} />
            </Route>
          )}

          {/* Member-only */}
          {!user?.isAdmin && user && <>
            <Route path="/home" element={<HomePage />}/>
            <Route path="/create" element={<CreatePost />}/>
            <Route path="/profile" element={<ProfilePage />}/>
            <Route path="/search" element={<Search/>}/>
            <Route path="/post-details" element={<PostDetails />}/>
            
            <Route path="/profile/:userid" element={<UserProfile/>}/>
            <Route path="/reels" element={<Reels/>}/>
            <Route path="/story/upload" element={<StoryUploader />}/>
            <Route path="/followers" element={<FollowersList/>}/>
            <Route path="/following" element={<FollowingList/>}/>
            <Route path="/settings" element={<Settings/>}/>
            <Route path="/chat" element={<Chat/>}/>
            <Route path="/notifications" element={<NotificationsPage/>}/>
          </>}
          <Route path="/post/:postId" element={<Post/>}/>
          {/* Fallback */}
          <Route path="*" element={<Navigate to={user ? (user.isAdmin ? "/admin/users" : "/home") : "/"} replace />} />

        </Routes>
      </div>
      {user && !user.isAdmin && <Nav/>}
    </BrowserRouter>
  );
}

export default App;
