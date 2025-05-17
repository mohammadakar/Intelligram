import {BrowserRouter,Routes,Route} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import LoginPage from "./components/Login";
import RegisterPage from "./components/Register";
import VerifyEmail from "./components/verifyEmail";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import HomePage from "./components/Home";
import { useSelector } from "react-redux";
import Nav from "./components/Nav";
import CreatePost from "./components/CreatePost";
import PostDetails from "./components/PostDetails";
import ProfilePage from "./components/ProfilePage";
import Post from "./components/Post";
import Search from "./components/Search";
import UserProfile from "./components/SearchedUserProfile";
import Reels from "./components/Reels";
import StoryUploader from "./components/StoryUploader";
import FollowersList from "./components/FollowersList";
import FollowingList from "./components/FollowingList";
import Settings from "./components/Settings";
import Chat from "./components/Chat";

function App() {

  const {user}=useSelector(state => state.auth)
  
  return (
    <BrowserRouter>
      <ToastContainer theme="colored" position="top-center" /> 
      <div className="pb-10">
      <Routes>
        <Route path="/" element={!user ? <LoginPage/> : <HomePage/>}/>
        <Route path="/register" element={!user ? <RegisterPage/> : <HomePage/>}/>
        <Route path="/home" element={user ? <HomePage /> : <LoginPage/>}/>
        <Route path="/create" element={user ? <CreatePost /> :<LoginPage/>} />
        <Route path="/profile" element={user ? <ProfilePage /> : <LoginPage/>} />
        <Route path="/search" element={user ? <Search/> : <LoginPage/> }/>
        <Route path="/post-details" element={user ? <PostDetails /> : <LoginPage/>} />
        <Route path="/users/:userId/verify/:token" element={<VerifyEmail/>}/>
        <Route path="/forget-password" element={<ForgotPassword/>}/>
        <Route path="/reset-password/:userId/:token" element={<ResetPassword />}/>
        <Route path="/post/:postId" element={user ? <Post/> : <LoginPage/>} />
        <Route path="/profile/:userid" element={user ? <UserProfile/> : <LoginPage/>} />
        <Route path="/reels" element={user ? <Reels/> : <LoginPage/>} />
        <Route path="/story/upload" element={<StoryUploader />} />
        <Route path="/followers" element={user ? <FollowersList/> : <LoginPage/>} />
        <Route path="/following" element={user ? <FollowingList/> : <LoginPage/>} />
        <Route path="/settings" element={user ? <Settings/> : <LoginPage/>} />
        <Route path="/chat" element={user ? <Chat/> : <LoginPage/>} />
      </Routes>
      </div>
      {user && <Nav/>}
    </BrowserRouter>
  )
}

export default App
