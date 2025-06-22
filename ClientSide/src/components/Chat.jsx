// src/components/Chat.jsx
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  listMyChats,
  getOrCreateChat,
  sendMessage,
  editMessage,
  deleteMessage,
  deleteChat,
  uploadFile
} from "../redux/ApiCalls/chatApiCall";
import { FiMoreVertical, FiMic, FiPaperclip, FiX } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { FaImage, FaVideo, FaVolumeUp, FaPlay } from "react-icons/fa";
import AudioMessage from "./AudioMessage";



const Chat = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { list, activeChat } = useSelector((s) => s.chat);
  const [otherId, setOtherId] = useState("");
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [msgMenuOpen, setMsgMenuOpen] = useState(null);
  const [chatMenuOpen, setChatMenuOpen] = useState(null);
  const [editMsgId, setEditMsgId] = useState(null);
  const [editText, setEditText] = useState("");

  const msgContainerRef = useRef();
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef();

  // Read ?user=<id> from URL and auto-open that chat
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const u = params.get("user");
    if (u) {
      setOtherId(u);
      dispatch(getOrCreateChat(u));
    }
  }, [location.search, dispatch]);

  useEffect(() => {
    dispatch(listMyChats());
  }, [dispatch]);

  useEffect(() => {
    if (otherId) dispatch(getOrCreateChat(otherId));
  }, [otherId, dispatch]);

  useEffect(() => {
    if (msgContainerRef.current && activeChat?.messages) {
      msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight;
    }
  }, [activeChat]);

  const handleSend = () => {
    if (!text.trim() || !activeChat) return;
    dispatch(sendMessage({
      chatId: activeChat._id,
      content: text,
      type: 'text'
    }));
    setText("");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      audioChunksRef.current = [];
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      setAudioURL("");
      setAudioBlob(null);
    }
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob || !activeChat) return;
    
    try {
      setIsUploading(true);
      const file = new File([audioBlob], `voice-${Date.now()}.mp3`, {
        type: 'audio/mp3'
      });
      
      const url = await dispatch(uploadFile(file));
      if (url) {
        await dispatch(sendMessage({
          chatId: activeChat._id,
          media: [url],
          type: 'audio'
        }));
        setAudioURL("");
        setAudioBlob(null);
      }
    } catch (err) {
      console.error("Error sending voice message:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !activeChat) return;
    
    try {
      setIsUploading(true);
      for (const file of files) {
        const url = await dispatch(uploadFile(file));
        if (url) {
          const type = file.type.startsWith('image/') ? 'image' : 
                       file.type.startsWith('video/') ? 'video' : 'file';
          
          await dispatch(sendMessage({
            chatId: activeChat._id,
            media: [url],
            type
          }));
        }
      }
    } catch (err) {
      console.error("Error sending file:", err);
    } finally {
      setIsUploading(false);
      e.target.value = ""; // Reset file input
    }
  };

  const startEdit = (m) => {
    setEditMsgId(m._id);
    setEditText(m.content);
    setMsgMenuOpen(null);
  };
  
  const saveEdit = () => {
    dispatch(editMessage(activeChat._id, editMsgId, editText));
    setEditMsgId(null);
    setEditText("");
  };
  
  const cancelEdit = () => {
    setEditMsgId(null);
    setEditText("");
  };

  const renderMedia = (media, type) => {
    if (!media || media.length === 0) return null;
    
    return media.map((url, index) => {
      if (type === 'image') {
        return <img key={index} src={url} alt="Media" className="max-w-xs max-h-40 rounded-md mt-2" />;
      } else if (type === 'video') {
        return (
          <video key={index} controls className="max-w-xs max-h-40 rounded-md mt-2">
            <source src={url} type="video/mp4" />
          </video>
        );
      } else if (type === 'audio') {
        return (
          <div key={index} className="mt-2">
            <AudioMessage url={url} />
          </div>
        );
      }
      return (
        <a 
          key={index} 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 underline mt-2 block"
        >
          Download file
        </a>
      );
    });
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case 'image': return <FaImage className="inline mr-1" />;
      case 'video': return <FaVideo className="inline mr-1" />;
      case 'audio': return <FaVolumeUp className="inline mr-1" />;
      default: return "📄";
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar */}
      <div className="w-full md:w-1/3 lg:w-1/4 border-r bg-white overflow-y-auto">
        <div className="p-4 border-b">
          <select
            className="w-full p-2 border rounded"
            value={otherId}
            onChange={(e) => setOtherId(e.target.value)}
          >
            <option value="">New chat…</option>
            {user.following.map((f) => (
              <option key={f.user} value={f.user}>
                {f.username}
              </option>
            ))}
          </select>
        </div>
        {list.map((chat) => {
          const other = chat.participants.find((p) => p._id !== user._id);
          const last = chat.messages[chat.messages.length - 1];
          return (
            <div
              key={chat._id}
              className={`relative flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                activeChat?._id === chat._id ? "bg-gray-100" : ""
              }`}
              onClick={() => {
                setOtherId(other._id);
              }}
            >
              <img
                src={other.profilePhoto.url}
                alt=""
                className="w-10 h-10 rounded-full mr-3"
              />
              <div className="flex-1">
                <div className="font-medium truncate">{other.username}</div>
                {last && (
                  <div className="text-sm text-gray-500 truncate">
                    {last.sender._id === user._id ? "You: " : ""}
                    {last.content || (last.media?.length > 0 ? (
                      <>{getMediaIcon(last.type)}{last.type}</>
                    ) : "Media")}
                  </div>
                )}
              </div>
              <button
                className="p-1 text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setChatMenuOpen(
                    chatMenuOpen === chat._id ? null : chat._id
                  );
                }}
              >
                <FiMoreVertical />
              </button>
              {chatMenuOpen === chat._id && (
                <div className="absolute top-12 right-4 bg-white border rounded shadow">
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => {
                      dispatch(deleteChat(chat._id));
                      if (activeChat?._id === chat._id) setOtherId("");
                      setChatMenuOpen(null);
                    }}
                  >
                    Delete Chat
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Conversation */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {activeChat ? (
          <>
            <div className="flex items-center p-4 bg-white border-b">
              {(() => {
                const o = activeChat.participants.find(
                  (p) => p._id !== user._id
                );
                return (
                  <>
                    <img
                      src={o.profilePhoto.url}
                      alt=""
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <h3 className="font-semibold">{o.username}</h3>
                  </>
                );
              })()}
            </div>
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              ref={msgContainerRef}
            >
              {activeChat.messages.map((m) => {
                const mine = m.sender._id === user._id;
                return (
                  <div
                    key={m._id}
                    className={`relative flex items-end ${
                      mine ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!mine && (
                      <img
                        src={m.sender.profilePhoto.url}
                        alt=""
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    )}
                    <div className="flex items-center">
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          mine
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        {editMsgId === m._id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              className="flex-1 border rounded px-2 py-1"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                            />
                            <button
                              onClick={saveEdit}
                              className="text-green-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-red-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            {m.content && <div>{m.content}</div>}
                            {renderMedia(m.media, m.type)}
                          </>
                        )}
                      </div>
                      {mine && (
                        <>
                          <button
                            className="p-1 ml-1 text-gray-400 hover:text-gray-600"
                            onClick={() =>
                              setMsgMenuOpen(
                                msgMenuOpen === m._id ? null : m._id
                              )
                            }
                          >
                            <FiMoreVertical />
                          </button>
                          {msgMenuOpen === m._id && (
                            <div className="absolute top-8 right-0 bg-white border rounded shadow">
                              <button
                                className="block px-4 py-2 text-left hover:bg-gray-100"
                                onClick={() => startEdit(m)}
                              >
                                Edit
                              </button>
                              <button
                                className="block px-4 py-2 text-left hover:bg-gray-100"
                                onClick={() => {
                                  dispatch(
                                    deleteMessage(activeChat._id, m._id)
                                  );
                                  setMsgMenuOpen(null);
                                }}
                              >
                                Unsend
                              </button>
                            </div>
                          )}
                          <img
                            src={user.profilePhoto.url}
                            alt=""
                            className="w-6 h-6 rounded-full ml-2"
                          />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Voice recording preview */}
            {audioURL && (
              <div className="p-4 border-t bg-white flex items-center justify-between">
                <div className="flex-1 flex items-center">
                  <button
                    onClick={sendVoiceMessage}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white mr-3"
                  >
                    <FaPlay size={12} />
                  </button>
                  
                  <div className="flex items-end h-6 flex-1">
                    {/* Waveform visualization */}
                    {[...Array(20)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1 bg-blue-400 mx-px"
                        style={{ 
                          height: `${Math.floor(Math.random() * 12) + 4}px`,
                          opacity: `${0.2 + (i / 20)}`
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={sendVoiceMessage}
                    className="bg-blue-600 text-white px-3 py-1 rounded flex items-center"
                    disabled={isUploading}
                  >
                    {isUploading ? "Sending..." : "Send"}
                  </button>
                  <button
                    onClick={cancelRecording}
                    className="bg-gray-500 text-white px-3 py-1 rounded flex items-center"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Message input */}
            <div className="p-4 border-t bg-white flex items-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-600 hover:text-gray-800 mr-2 flex items-center"
                disabled={isUploading}
                title="Attach file"
              >
                <FiPaperclip size={20} />
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,video/*,audio/*"
                />
              </button>
              
              {recording ? (
                <button
                  onClick={stopRecording}
                  className="p-2 text-red-600 hover:text-red-800 mr-2 flex items-center"
                  title="Stop recording"
                >
                  <FiMic size={20} />
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="p-2 text-gray-600 hover:text-gray-800 mr-2 flex items-center"
                  title="Record voice message"
                  disabled={isUploading}
                >
                  <FiMic size={20} />
                </button>
              )}
              
              <input
                className="flex-1 border rounded-full px-4 py-2"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message…"
                disabled={isUploading}
              />
              
              <button
                onClick={handleSend}
                className="ml-3 bg-blue-600 text-white px-4 py-2 rounded-full flex items-center"
                disabled={isUploading || !text.trim()}
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