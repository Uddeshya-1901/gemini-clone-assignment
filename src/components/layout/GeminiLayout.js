import React, { useState } from "react";
import {
  Menu,
  Plus,
  MessageSquare,
  Settings,
  User,
  LogOut,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/Button";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  createChatroom,
  setCurrentChatroom,
  deleteChatroom,
} from "../../store/slices/chatSlice";
import { logout } from "../../store/slices/authSlice";
import { addToast } from "../../store/slices/uiSlice";
import { formatTimestamp } from "../../utils";
import ChatArea from "../chat/ChatArea";

const GeminiLayout = () => {
  const dispatch = useAppDispatch();
  const { chatrooms, currentChatroomId } = useAppSelector(
    (state) => state.chat
  );
  const { user } = useAppSelector((state) => state.auth);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const currentChatroom = chatrooms.find(
    (room) => room.id === currentChatroomId
  );

  const handleCreateChatroom = () => {
    // Auto-generate chat name based on existing chats count
    const chatNumber = chatrooms.length + 1;
    const title = `Chat ${chatNumber}`;

    dispatch(createChatroom({ title }));
    dispatch(
      addToast({
        message: "New chat created!",
        type: "success",
      })
    );
  };

  const handleDeleteChatroom = (chatroomId, e) => {
    e.stopPropagation(); // Prevent selecting the chat when clicking delete

    if (window.confirm("Are you sure you want to delete this chat?")) {
      dispatch(deleteChatroom(chatroomId));
      dispatch(
        addToast({
          message: "Chat deleted successfully!",
          type: "success",
        })
      );
    }
  };

  const handleChatroomSelect = (chatroomId) => {
    dispatch(setCurrentChatroom(chatroomId));
  };

  const handleNewChat = () => {
    handleCreateChatroom();
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      dispatch(logout());
      dispatch(
        addToast({
          message: "Logged out successfully!",
          type: "info",
        })
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar - Changed to greyish color and removed border */}
      <div
        className={`${
          isSidebarCollapsed ? "w-16" : "w-80"
        } bg-gray-800 flex flex-col transition-all duration-300 flex-shrink-0`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-600 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {!isSidebarCollapsed && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {!isSidebarCollapsed && (
            <Button
              onClick={handleNewChat}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white border border-gray-500"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              New chat
            </Button>
          )}
        </div>

        {/* Navigation - Removed search section */}
        {!isSidebarCollapsed && (
          <div className="p-4 space-y-4 flex-shrink-0">
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <MessageSquare className="w-4 h-4 mr-3" />
                Explore Gems
              </Button>
            </div>
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {!isSidebarCollapsed && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Recent</h3>
              <div className="space-y-1">
                {chatrooms.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No chats yet</p>
                  </div>
                ) : (
                  chatrooms.map((chatroom) => (
                    <div
                      key={chatroom.id}
                      onClick={() => handleChatroomSelect(chatroom.id)}
                      className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                        currentChatroomId === chatroom.id
                          ? "bg-gray-700 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">
                            {chatroom.title}
                          </h4>
                          {chatroom.lastMessage && (
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {chatroom.lastMessage}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(chatroom.createdAt)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) =>
                              handleDeleteChatroom(chatroom.id, e)
                            }
                            className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 text-gray-400 hover:text-red-400 hover:bg-gray-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        {!isSidebarCollapsed && (
          <div className="p-4 border-t border-gray-600 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.phone}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area - Keep black background */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ChatArea chatroom={currentChatroom} />
      </div>
    </div>
  );
};

export default GeminiLayout;
