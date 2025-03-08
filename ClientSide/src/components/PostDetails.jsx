// PostDetails.jsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { createPost } from '../redux/ApiCalls/postApiCall';
import { app } from '../firebase';
import NominatimAutocomplete from './NominatimAutocomplete';
import Select from 'react-select';

const PostDetails = () => {
  const { state } = useLocation();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.post);
  
  const following = useSelector((state) => state.auth.user.following) || [];
  
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState(''); 
  const [tags, setTags] = useState([]);

  const navigate=useNavigate();

  
  const handleLocationSelect = (suggestion) => {
    // You can store additional details (lat, lon, etc.) if needed
    setLocation(suggestion.display_name);
  };

  // Handler for tags using react-select
  const handleTagChange = (selectedOptions) => {
    setTags(selectedOptions ? selectedOptions.map(option => option.value) : []);
  };

  const handleSubmit = async () => {
    if (!state?.file) {
      toast.error('No file selected');
      return;
    }

    try {
      toast.info('Uploading post...', { autoClose: false });
      const storage = getStorage(app);
      const fileRef = ref(storage, `posts/${Date.now()}-${state.file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, state.file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          toast.dismiss();
          toast.error('Upload failed: ' + error.message);
        },
        async () => {
          const fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
          console.log(fileUrl);

          const postData = {
            caption,
            location,
            tags, // array of user IDs selected for tagging
            media: [fileUrl],
          };

          await dispatch(createPost(postData));
          toast.dismiss();
          toast.success('Post created successfully!');
          navigate('/home');
        }
      );
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || 'Failed to create post');
    }
  };

  // Prepare options for tagging from the following list
  const tagOptions = following.map(user => ({
    value: user._id,
    label: user.username,
  }));

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-screen-sm mx-auto bg-white min-h-screen">
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600">
          <h2 className="text-xl font-bold text-center">Post Details</h2>
        </div>

        <div className="p-4">
          <div className="mb-4">
            {state?.preview && (
              <img 
                src={state.preview} 
                alt="Post preview" 
                className="w-full h-64 object-cover rounded-lg"
              />
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full p-2 border rounded-lg h-24"
                placeholder="Write a caption..."
                maxLength={2200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <NominatimAutocomplete onSelect={handleLocationSelect} />
              {/* Display the selected location */}
              {location && <p className="mt-2 text-gray-600">Selected: {location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tag Friends</label>
              <Select
                options={tagOptions}
                isMulti
                onChange={handleTagChange}
                placeholder="Select friends to tag..."
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full bg-blue-500 text-white py-3 rounded-lg font-medium
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600 transition-colors'}`}
            >
              {loading ? 'Sharing...' : 'Share Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
