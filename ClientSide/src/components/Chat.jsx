// src/components/ChatPage.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  listMyChats,
  getOrCreateChat,
  sendMessage
} from '../redux/ApiCalls/chatApiCall';

const Chat = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { list, activeChat } = useSelector(s => s.chat);
  const [otherId, setOtherId] = useState('');
  const [text, setText]       = useState('');

  useEffect(() => {
    dispatch(listMyChats());
  }, []);

  // when you pick someone new
  useEffect(() => {
    if (otherId) dispatch(getOrCreateChat(otherId));
  }, [otherId]);

  const handleSend = () => {
    if (activeChat) {
      dispatch(sendMessage(activeChat._id, text));
      setText('');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 border-r p-4 space-y-4 overflow-y-auto">
        {/* Select from follows */}
        <select
          className="w-full p-2 border rounded"
          value={otherId}
          onChange={e => setOtherId(e.target.value)}
        >
          <option value="">Start a new chat…</option>
          {user.following.map(f => (
            <option key={f.user} value={f.user}>
              {f.username}
            </option>
          ))}
        </select>

        {/* Previous chats */}
        <div>
          {list.length === 0 && <p className="text-gray-500">No previous chats</p>}
          {list.map(chat => {
            const other = chat.participants.find(p => p._id !== user._id);
            return (
              <div
                key={chat._id}
                className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => setOtherId(other._id)}
              >
                <img
                  src={other.profilePhoto.url}
                  alt=""
                  className="w-8 h-8 rounded-full inline-block mr-2"
                />
                <span>{other.username}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col bg-white">
        {activeChat ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {activeChat.messages.map(m => (
                <div
                  key={m._id}
                  className={`max-w-md p-2 rounded ${
                    m.sender._id === user._id
                      ? 'bg-blue-100 self-end'
                      : 'bg-gray-200 self-start'
                  }`}
                >
                  <span className="text-sm">{m.content}</span>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex">
              <input
                className="flex-1 border rounded px-3 py-2"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type a message…"
              />
              <button
                onClick={handleSend}
                className="ml-2 bg-blue-600 text-white px-4 py-2 rounded"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select or start a chat
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;