// src/components/SettingsPage.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateProfile,
  updatePassword,
  deleteAccount,
  logoutUser
} from "../redux/ApiCalls/UserApiCall";

const SettingsPage = () => {
  const dispatch = useDispatch();
  const user     = useSelector(s => s.auth.user);

  // profile form
  const [username, setUsername]         = useState("");
  const [isPrivate, setIsPrivate]       = useState(false);

  // password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");


  // when `user` or its `isAccountPrivate` changes, re-sync the form
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setIsPrivate(user.isAccountPrivate);
    }
  }, [user?.username, user?.isAccountPrivate]);


  const handleSubmitProfile = () => {
    dispatch(updateProfile({
      username,
      isAccountPrivate: isPrivate
    }));
    // after dispatch, the Redux `user` will update → our effect above re-syncs `isPrivate`
  };

  const handleSubmitPassword = () => {
    dispatch(updatePassword({ currentPassword, newPassword }));
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-white dark:bg-gray-800 rounded-lg space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Settings</h1>

      {/* Profile */}
      <section className="space-y-2">
        <h2 className="font-medium text-gray-700 dark:text-gray-200">Your Profile</h2>
        <input
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={e => setIsPrivate(e.target.checked)}
          />
          <span className="text-gray-600 dark:text-gray-300">Private Account</span>
        </label>
        <button
          onClick={handleSubmitProfile}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Profile
        </button>
      </section>

      {/* Change Password */}
      <section className="space-y-2">
        <h2 className="font-medium text-gray-700 dark:text-gray-200">Change Password</h2>
        <input
          type="password"
          placeholder="Current password"
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="New password"
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />
        <button
          onClick={handleSubmitPassword}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Change Password
        </button>
      </section>

      {/* Danger zone */}
      <section className="space-y-2">
        <button
          onClick={() => dispatch(logoutUser())}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Logout
        </button>
        <button
          onClick={() => {
            if (window.confirm("Delete your account? This is irreversible.")) {
              dispatch(deleteAccount());
            }
          }}
          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete Account
        </button>
      </section>
    </div>
  );
};

export default SettingsPage;
