import React, { useState } from "react";
import { Copy, User, Bot } from "lucide-react";
import { Button } from "../ui/Button";
import { formatTime } from "../../utils";

const MessageItem = ({ message, onCopy }) => {
  const [showCopyButton, setShowCopyButton] = useState(false);
  const isUser = message.sender === "user";
  const isImageMessage = message.type === "image" && message.image;

  return (
    <div
      className={`group w-full ${isUser ? "flex justify-end" : ""}`}
      onMouseEnter={() => setShowCopyButton(true)}
      onMouseLeave={() => setShowCopyButton(false)}
    >
      <div
        className={`flex items-start space-x-4 max-w-4xl ${
          isUser ? "flex-row-reverse space-x-reverse" : ""
        }`}
      >
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? "text-right" : "text-left"}`}>
          {/* Sender Name */}
          <div
            className={`text-sm font-medium mb-2 ${
              isUser ? "text-blue-400" : "text-gray-300"
            }`}
          >
            {isUser ? "You" : "Gemini"}
          </div>

          {/* Message Bubble */}
          <div className={`relative ${isUser ? "ml-16" : "mr-16"}`}>
            <div className="text-gray-100">
              {isImageMessage ? (
                <div className="space-y-3">
                  <img
                    src={message.image}
                    alt="Shared content"
                    className="max-w-md max-h-64 rounded-lg object-cover"
                  />
                  {message.content && message.content !== "Image" && (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}
            </div>

            {/* Timestamp and Copy Button */}
            <div
              className={`flex items-center mt-2 space-x-2 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              <span className="text-xs text-gray-500">
                {formatTime(message.timestamp)}
              </span>

              {/* Only show copy button for text messages */}
              {showCopyButton && !isImageMessage && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onCopy(message.content)}
                  className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                  title="Copy message"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
