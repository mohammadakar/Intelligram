import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

const CreatePost = () => {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleNext = () => {
    if (file) {
      navigate('/post-details', { 
        state: { 
          preview,
          file
        } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-screen-sm mx-auto bg-white min-h-screen">
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600">
          <h2 className="text-xl font-bold text-center">Create New Post</h2>
        </div>

        <div className="flex flex-col items-center justify-center h-96">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
            id="media-upload"
          />
          <label
            htmlFor="media-upload"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg cursor-pointer"
          >
            Choose from Gallery
          </label>

          {preview && (
            <div className="mt-8 text-center">
              <div className="relative">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-64 mx-auto rounded-lg"
                />
                <button
                  onClick={handleNext}
                  className="absolute -right-4 -bottom-4 bg-blue-500 text-white p-3 rounded-full shadow-lg"
                >
                  <FaArrowRight className="text-xl" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
