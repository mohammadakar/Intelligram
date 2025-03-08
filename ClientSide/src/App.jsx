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

function App() {

  const {user}=useSelector(state => state.auth)
  console.log(user);
  
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
        <Route path="/post-details" element={user ? <PostDetails /> : <LoginPage/>} />
        <Route path="/users/:userId/verify/:token" element={<VerifyEmail/>}/>
        <Route path="/forget-password" element={<ForgotPassword/>}/>
        <Route path="/reset-password/:userId/:token" element={<ResetPassword />}/>
        
      </Routes>
      </div>
      {user && <Nav/>}
    </BrowserRouter>
  )
}

export default App
