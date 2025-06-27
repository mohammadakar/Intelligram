import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { uploadStories } from '../redux/ApiCalls/storyApiCall';
import NominatimAutocomplete from './NominatimAutocomplete';
import Select from 'react-select';

const StoryUploader = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('userinfo'));
    const following = stored?.following || [];
    setTagOptions(
      following.map(f => ({ value: f.user, label: f.username }))
    );
  }, []);

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file) return;
    await dispatch(uploadStories([{
      file,
      caption,
      location,
      tags: tags.map(t => t.value)
    }])); 
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto space-y-4">
        <h2 className="text-xl font-semibold">Add to Your Story</h2>

        {/* Custom File Upload Button */}
        <div>
          <input
            type="file"
            id="story-file"
            accept="image/*,video/*"
            onChange={handleFile}
            className="hidden"
          />
          <label
            htmlFor="story-file"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
          >
            Choose File
          </label>
        </div>

        {/* Media Preview */}
        {preview && (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center overflow-hidden rounded">
            {file?.type?.startsWith('video') ? (
              <video
                src={preview}
                controls
                muted
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={preview}
                alt=""
                className="w-full h-full object-contain"
              />
            )}
          </div>
        )}

        <textarea
          placeholder="Add a caption..."
          className="w-full border rounded p-2"
          value={caption}
          onChange={e => setCaption(e.target.value)}
        />

        <NominatimAutocomplete onSelect={s => setLocation(s.display_name)} />
        {location && (
          <p className="text-sm text-gray-500">📍 {location}</p>
        )}

        <Select
          options={tagOptions}
          isMulti
          value={tags}
          onChange={setTags}
          placeholder="Tag friends…"
        />

        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:underline"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!file}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryUploader;