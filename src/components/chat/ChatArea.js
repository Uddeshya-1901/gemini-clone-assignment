import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Send, Image, Mic, ChevronUp, User } from "lucide-react";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/Loading";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { store } from "../../store";
import {
  sendMessageAndGetResponse,
  loadMoreMessages,
  createChatroom,
} from "../../store/slices/chatSlice";
import { addToast } from "../../store/slices/uiSlice";
import { copyToClipboard, fileToBase64 } from "../../utils";
import MessageItem from "./MessageItem";
import TypingIndicator from "./TypingIndicator";

const ChatArea = ({ chatroom }) => {
  const dispatch = useAppDispatch();
  const { messages, typingIndicators, hasMoreMessages, isLoading } =
    useAppSelector((state) => state.chat);
  const { user } = useAppSelector((state) => state.auth);
  const [messageText, setMessageText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [userScrolled, setUserScrolled] = useState(false);

  const chatroomMessages = useMemo(() => {
    return chatroom ? messages[chatroom.id] || [] : [];
  }, [chatroom, messages]);

  const isTyping = chatroom ? typingIndicators[chatroom.id] || false : false;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!userScrolled) {
      scrollToBottom();
    }
  }, [chatroomMessages, isTyping, userScrolled]);

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
    if (scrollTop === 0 && hasMoreMessages[chatroom?.id] && !loadingMore) {
      handleLoadMore();
    }
  };

  const handleLoadMore = useCallback(async () => {
    if (!chatroom || loadingMore || !hasMoreMessages[chatroom.id]) return;

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
  }, [chatroom, loadingMore, hasMoreMessages, dispatch]);

  // Load initial messages if empty
  useEffect(() => {
    if (
      chatroom &&
      chatroomMessages.length === 0 &&
      hasMoreMessages[chatroom.id] &&
      // Only try to load messages for chatrooms that might actually have messages
      // Skip for newly created chatrooms
      !isNewlyCreatedChatroom(chatroom)
    ) {
      handleLoadMore();
    }
  }, [chatroom, chatroomMessages.length, hasMoreMessages, handleLoadMore]);

  // Helper function to check if this is a newly created empty chatroom
  const isNewlyCreatedChatroom = (chatroom) => {
    if (!chatroom) return false;
    const chatroomAge = Date.now() - new Date(chatroom.createdAt).getTime();
    // Consider chatroom new if it's less than 10 seconds old and has no messages
    return chatroomAge < 10000 && chatroomMessages.length === 0;
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [messageText]);

  const handleSendMessage = async () => {
    if (!chatroom || (!messageText.trim() && !selectedImage) || isLoading)
      return;

    const messageData = {
      content: messageText.trim() || "Image",
      type: selectedImage ? "image" : "text",
      image: selectedImage,
    };

    // Clear input immediately when sending
    setMessageText("");
    setSelectedImage(null);
    setUserScrolled(false);

    try {
      await dispatch(
        sendMessageAndGetResponse({
          chatroomId: chatroom.id,
          message: messageData,
        })
      ).unwrap();
    } catch (error) {
      dispatch(
        addToast({
          message: "Failed to send message",
          type: "error",
        })
      );
    }
  };

  const handleFirstMessage = async () => {
    if (!messageText.trim() && !selectedImage) return;

    const messageData = {
      content: messageText.trim() || "Image",
      type: selectedImage ? "image" : "text",
      image: selectedImage,
    };

    const newChatTitle =
      messageText.length > 30
        ? messageText.substring(0, 30) + "..."
        : selectedImage
        ? "Image"
        : messageText;

    // Clear input immediately
    setMessageText("");
    setSelectedImage(null);

    try {
      // Create chatroom first
      await dispatch(createChatroom({ title: newChatTitle }));

      // Wait a bit for state to update, then send the message
      setTimeout(async () => {
        // Get the latest state
        const state = store.getState();
        const newChatroomId = state.chat.currentChatroomId;

        if (newChatroomId) {
          try {
            await dispatch(
              sendMessageAndGetResponse({
                chatroomId: newChatroomId,
                message: messageData,
              })
            ).unwrap();
          } catch (error) {
            dispatch(
              addToast({
                message: "Failed to send message",
                type: "error",
              })
            );
          }
        }
      }, 50);
    } catch (error) {
      dispatch(
        addToast({
          message: "Failed to create chat",
          type: "error",
        })
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!chatroom) {
        // Handle first message when no chatroom exists
        handleFirstMessage();
      } else {
        // Normal message sending
        handleSendMessage();
      }
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

  // Welcome screen when no chatroom is selected
  if (!chatroom) {
    return (
      <div className="flex-1 flex flex-col bg-gray-900 text-white">
        {/* Header with Gemini title and user icon */}
        <div className="flex items-center justify-between p-6">
          <h1 className="text-2xl font-semibold text-white">Gemini</h1>
          <div className="flex items-center space-x-4">
            <Button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">
              Upgrade
            </Button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-medium text-blue-400 mb-16">
              Hello, {user?.name}
            </h2>
          </div>
        </div>

        {/* Message Input Area - No border */}
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gray-800 rounded-2xl border border-gray-600 p-4">
              <div className="flex items-end space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <Image className="w-5 h-5" />
                </Button>

                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask Gemini"
                    className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none min-h-[24px] max-h-32"
                    rows={1}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <Mic className="w-5 h-5" />
                  </Button>

                  <Button
                    onClick={handleFirstMessage}
                    disabled={!messageText.trim()}
                    size="icon"
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-700 disabled:text-gray-500"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center mt-2">
              Gemini may display inaccurate info, including about people, so
              double-check its responses.
            </p>
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
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-white">
      {/* Header with Gemini title and user icon - for active chat */}
      <div className="flex items-center justify-between p-6">
        <h1 className="text-2xl font-semibold text-white">Gemini</h1>
        <div className="flex items-center space-x-4">
          <Button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">
            Upgrade
          </Button>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
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
              <p className="text-gray-400 mb-4">
                Start the conversation with Gemini
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

      {/* Scroll to bottom button */}
      {userScrolled && (
        <div className="absolute bottom-32 right-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setUserScrolled(false);
              scrollToBottom();
            }}
            className="bg-gray-800 text-white border border-gray-600 hover:bg-gray-700"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Message Input Area - No border */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gray-800 rounded-2xl border border-gray-600 p-4">
            {/* Image preview inside text area */}
            {selectedImage && (
              <div className="mb-3 relative inline-block">
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

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="text-gray-400 hover:text-white hover:bg-gray-700 flex-shrink-0"
              >
                <Image className="w-5 h-5" />
              </Button>

              <div className="flex-1 min-h-[48px] flex items-center">
                <textarea
                  ref={textareaRef}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Gemini"
                  className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none min-h-[48px] max-h-32 py-3 leading-6"
                  rows={1}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <Mic className="w-5 h-5" />
                </Button>

                <Button
                  onClick={handleSendMessage}
                  disabled={
                    (!messageText.trim() && !selectedImage) || isLoading
                  }
                  size="icon"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center mt-2">
            Gemini may display inaccurate info, including about people, so
            double-check its responses.
          </p>
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

export default ChatArea;
