import {BrowserRouter,Routes,Route} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import LoginPage from "./components/Login";
import RegisterPage from "./components/Register";
import VerifyEmail from "./components/verifyEmail";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

function App() {
  
  return (
    <BrowserRouter>
      <ToastContainer theme="colored" position="top-center" /> 
      <Routes>
        <Route path="/" element={<LoginPage/>}/>
        <Route path="/register" element={<RegisterPage/>}/>
        <Route path="/users/:userId/verify/:token" element={<VerifyEmail/>}/>
        <Route path="/forget-password" element={<ForgotPassword/>}/>
        <Route path="/reset-password/:userId/:token" element={<ResetPassword />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
