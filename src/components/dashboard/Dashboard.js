import React, { useState, useMemo } from "react";
import { Plus, Search, MessageSquare, Trash2, LogOut } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  createChatroom,
  deleteChatroom,
  setCurrentChatroom,
  setSearchQuery,
} from "../../store/slices/chatSlice";
import { logout } from "../../store/slices/authSlice";
import { addToast } from "../../store/slices/uiSlice";
import { formatTimestamp, debounce } from "../../utils";
import CreateChatroomModal from "./CreateChatroomModal";

const Dashboard = ({ onChatroomSelect }) => {
  const dispatch = useAppDispatch();
  const { chatrooms, searchQuery } = useAppSelector((state) => state.chat);
  const { user } = useAppSelector((state) => state.auth);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
        dispatch(setSearchQuery(query));
      }, 300),
    [dispatch]
  );

  const filteredChatrooms = useMemo(() => {
    if (!searchQuery.trim()) return chatrooms;
    return chatrooms.filter((room) =>
      room.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chatrooms, searchQuery]);

  const handleCreateChatroom = (title) => {
    dispatch(createChatroom({ title }));
    dispatch(
      addToast({
        message: "Chatroom created successfully!",
        type: "success",
      })
    );
    setShowCreateModal(false);
  };

  const handleDeleteChatroom = (chatroomId, e) => {
    e.stopPropagation();

    if (window.confirm("Are you sure you want to delete this chatroom?")) {
      dispatch(deleteChatroom(chatroomId));
      dispatch(
        addToast({
          message: "Chatroom deleted successfully!",
          type: "success",
        })
      );
    }
  };

  const handleChatroomClick = (chatroom) => {
    dispatch(setCurrentChatroom(chatroom.id));
    onChatroomSelect(chatroom);
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
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your AI conversations
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search chatrooms..."
            className="pl-10"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>

        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chatrooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChatrooms.length === 0 ? (
          searchQuery ? (
            <div className="col-span-full text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No chatrooms found for "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="col-span-full text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No chatrooms yet. Create your first conversation!
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Chatroom
              </Button>
            </div>
          )
        ) : (
          filteredChatrooms.map((chatroom) => (
            <div
              key={chatroom.id}
              onClick={() => handleChatroomClick(chatroom)}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate flex-1 mr-2">
                  {chatroom.title}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDeleteChatroom(chatroom.id, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {chatroom.lastMessage && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {chatroom.lastMessage}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                  <span>{chatroom.messageCount || 0} messages</span>
                  <span>{formatTimestamp(chatroom.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Chatroom Modal */}
      <CreateChatroomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateChatroom}
      />
    </div>
  );
};

export default Dashboard;
