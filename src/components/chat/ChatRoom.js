import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Image, Copy, ChevronUp } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { LoadingSpinner, MessageSkeleton } from "../ui/Loading";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  sendMessageAndGetResponse,
  loadMoreMessages,
} from "../../store/slices/chatSlice";
import { addToast } from "../../store/slices/uiSlice";
import { formatTime, copyToClipboard, fileToBase64 } from "../../utils";
import MessageItem from "./MessageItem";
import TypingIndicator from "./TypingIndicator";

const ChatRoom = ({ chatroom, onBack }) => {
  const dispatch = useAppDispatch();
  const { messages, typingIndicators, hasMoreMessages, isLoading } =
    useAppSelector((state) => state.chat);
  const [messageText, setMessageText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [userScrolled, setUserScrolled] = useState(false);

  const chatroomMessages = messages[chatroom.id] || [];
  const isTyping = typingIndicators[chatroom.id] || false;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!userScrolled) {
      scrollToBottom();
    }
  }, [chatroomMessages, isTyping, userScrolled]);

  // Load initial messages if empty
  useEffect(() => {
    if (chatroomMessages.length === 0 && hasMoreMessages[chatroom.id]) {
      handleLoadMore();
    }
  }, [chatroom.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop === clientHeight;

    setUserScrolled(!isAtBottom);

    // Load more messages when scrolled to top
    if (scrollTop === 0 && hasMoreMessages[chatroom.id] && !loadingMore) {
      handleLoadMore();
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMoreMessages[chatroom.id]) return;

    setLoadingMore(true);
    const prevScrollHeight = messagesContainerRef.current?.scrollHeight || 0;

    try {
      await dispatch(loadMoreMessages({ chatroomId: chatroom.id })).unwrap();

      // Maintain scroll position after loading more messages
      setTimeout(() => {
        if (messagesContainerRef.current) {
          const newScrollHeight = messagesContainerRef.current.scrollHeight;
          messagesContainerRef.current.scrollTop =
            newScrollHeight - prevScrollHeight;
        }
      }, 0);
    } catch (error) {
      dispatch(
        addToast({
          message: "Failed to load more messages",
          type: "error",
        })
      );
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && !selectedImage) return;

    const messageData = {
      content: messageText.trim() || "Image",
      type: selectedImage ? "image" : "text",
      image: selectedImage,
    };

    try {
      await dispatch(
        sendMessageAndGetResponse({
          chatroomId: chatroom.id,
          message: messageData,
        })
      ).unwrap();

      setMessageText("");
      setSelectedImage(null);
      setUserScrolled(false);

      dispatch(
        addToast({
          message: "Message sent!",
          type: "success",
        })
      );
    } catch (error) {
      dispatch(
        addToast({
          message: "Failed to send message",
          type: "error",
        })
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      dispatch(
        addToast({
          message: "Please select an image file",
          type: "error",
        })
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      dispatch(
        addToast({
          message: "Image size must be less than 5MB",
          type: "error",
        })
      );
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setSelectedImage(base64);
    } catch (error) {
      dispatch(
        addToast({
          message: "Failed to process image",
          type: "error",
        })
      );
    }
  };

  const handleCopyMessage = async (content) => {
    try {
      await copyToClipboard(content);
      dispatch(
        addToast({
          message: "Message copied to clipboard!",
          type: "success",
        })
      );
    } catch (error) {
      dispatch(
        addToast({
          message: "Failed to copy message",
          type: "error",
        })
      );
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="md:hidden"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {chatroom.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {chatroomMessages.length} messages
          </p>
        </div>

        {userScrolled && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setUserScrolled(false);
              scrollToBottom();
            }}
            className="text-primary-500"
          >
            <ChevronUp className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
      >
        {/* Load more indicator */}
        {loadingMore && (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        )}

        {/* Messages */}
        {chatroomMessages.length === 0 && !loadingMore ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          chatroomMessages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              onCopy={handleCopyMessage}
            />
          ))
        )}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator />}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        {/* Image preview */}
        {selectedImage && (
          <div className="mb-4 relative inline-block">
            <img
              src={selectedImage}
              alt="Selected"
              className="max-w-32 max-h-32 rounded-lg object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              ×
            </Button>
          </div>
        )}

        <div className="flex items-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Image className="w-5 h-5" />
          </Button>

          <div className="flex-1">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full min-h-[40px] max-h-32 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={1}
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={(!messageText.trim() && !selectedImage) || isLoading}
            size="icon"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ChatRoom;
