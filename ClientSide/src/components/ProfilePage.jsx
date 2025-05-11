// src/components/ProfilePage.jsx
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FaCamera, FaBookmark, FaVideo } from "react-icons/fa";
import { FiSettings, FiEdit } from "react-icons/fi";
import { BsGrid3X3 } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "../firebase";
import { getAllPosts } from "../redux/ApiCalls/postApiCall";
import { updateProfilePhotoBackend, updateBio } from "../redux/ApiCalls/UserApiCall";
import videoPoster from "../vidimage/vd2.avif";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { posts } = useSelector(s => s.post);

  const [activeTab, setActiveTab] = useState("posts");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(user?.bio || "");

  const fileInputRef = useRef();

  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);

  useEffect(() => {
    setBioText(user?.bio || "");
  }, [user?.bio]);

  const isVideo = url => /\.(mp4|mov|avi|webm)$/i.test(new URL(url).pathname);

  const userPosts  = posts.filter(p => p.user._id === user._id);
  const savedPosts = posts.filter(p => user.savedPosts.includes(p._id));

  const handlePhotoClick = () => fileInputRef.current.click();
  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const storage = getStorage(app);
    const path = `profiles/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);
    await new Promise((res, rej) => task.on("state_changed", null, rej, res));
    const url = await getDownloadURL(storageRef);
    dispatch(updateProfilePhotoBackend({ url, publicId: path }));
  };

  const handleUpdateBio = () => {
    dispatch(updateBio(bioText));
    setIsEditingBio(false);
  };

  const renderGrid = items => (
    items.length ? (
      <div className="grid grid-cols-3 gap-1 md:gap-6">
        {items.map(post => (
          <Link key={post._id} to={`/post/${post._id}`} className="aspect-square relative group overflow-hidden rounded-lg bg-gray-100">
            {isVideo(post.media[0]) ? (
              <video src={post.media[0]} poster={videoPoster} muted preload="metadata" className="w-full h-full object-cover"/>
            ) : (
              <img src={post.media[0]} className="w-full h-full object-cover" alt=""/>
            )}
            {isVideo(post.media[0]) && (
              <FaVideo className="absolute top-2 right-2 text-white text-2xl drop-shadow-lg"/>
            )}
            <div className="hidden group-hover:flex absolute inset-0 bg-black/50 items-center justify-center gap-6 text-white">
              <span>❤️ {post.likes.length}</span>
              <span>💬 {post.comments.length}</span>
            </div>
          </Link>
        ))}
      </div>
    ) : (
      <div className="flex items-center justify-center h-48">
        <p className="text-gray-500">{activeTab === "posts" ? "No posts yet." : "No saved posts yet."}</p>
      </div>
    )
  );

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto px-4 py-4 bg-white">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
        <div className="relative w-fit mb-4">
  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
    <img 
      src={user.profilePhoto.url} 
      alt="Profile" 
      className="w-full h-full object-cover"
    />
  </div>
  <button
    onClick={handlePhotoClick}
    className="absolute -right-2 -bottom-2 bg-gradient-to-r from-blue-600 to-purple-600 cursor-pointer p-2 rounded-full shadow-md hover:shadow-lg transition-shadow border border-gray-200"
    title="Change Photo"
  >
    <FaCamera className="text-lg text-gray-700 " />
  </button>
  <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange}/>
</div>

        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-2xl font-light">{user.username}</h2>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <FiSettings className="text-xl"/>
            </button>
          </div>

          <div className="flex gap-8 mb-4">
            <div><span className="font-semibold">{userPosts.length}</span> posts</div>
            <Link to="/followers"><div><span className="font-semibold">{user.followers.length}</span> followers</div></Link>
            <Link to="/following"><div><span className="font-semibold">{user.following.length}</span> following</div></Link>
            <div><span className="font-semibold">{user.savedPosts.length}</span> saved</div>
          </div>

          {/* Bio */}
          <div className="relative">
            {isEditingBio ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={bioText}
                  onChange={e => setBioText(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  rows="3"
                />
                <div className="flex gap-2">
                  <button onClick={handleUpdateBio} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Save</button>
                  <button onClick={() => setIsEditingBio(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="whitespace-pre-line">{user.bio}</p>
                <button onClick={() => setIsEditingBio(true)} className="text-gray-600">
                  <FiEdit className="text-sm"/>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-t mb-4">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 px-4 py-3 font-semibold ${activeTab === "posts" ? "border-t border-black" : ""}`}
        >
          <BsGrid3X3 /> POSTS
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`flex items-center gap-2 px-4 py-3 font-semibold ${activeTab === "saved" ? "border-t border-black" : ""}`}
        >
          <FaBookmark /> SAVED
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow">
        {activeTab === "posts" ? renderGrid(userPosts) : renderGrid(savedPosts)}
      </div>
    </div>
  );
};

export default ProfilePage;
