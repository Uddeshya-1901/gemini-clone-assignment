import React from "react";
import { Bot } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="group w-full">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 text-gray-300">
          <Bot className="w-4 h-4" />
        </div>

        {/* Message Content */}
        <div className="flex-1 text-left">
          {/* Sender Name */}
          <div className="text-sm font-medium mb-2 text-gray-300">Gemini</div>

          {/* Typing bubble */}
          <div className="relative mr-16">
            <div className="text-gray-100">
              <div className="flex items-center space-x-2">
                <div className="typing-indicator flex space-x-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></span>
                </div>
                <span className="text-sm text-gray-400">
                  Gemini is thinking...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
