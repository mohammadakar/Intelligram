import {configureStore} from "@reduxjs/toolkit";
import { authReducer } from "./Slices/AuthSlice";
import { passwordReducer } from "./Slices/PasswordSlice";

const store = configureStore({
    reducer:{
        auth:authReducer,
        password:passwordReducer
    }
});

export default store;