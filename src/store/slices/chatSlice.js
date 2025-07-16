import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

// Simulate AI response with throttling
export const sendMessageAndGetResponse = createAsyncThunk(
  "chat/sendMessageAndGetResponse",
  async ({ chatroomId, message }, { getState, dispatch }) => {
    const userMessage = {
      id: uuidv4(),
      content: message.content,
      sender: "user",
      timestamp: new Date().toISOString(),
      type: message.type || "text",
      image: message.image || null,
    };

    // Add user message immediately
    dispatch(addMessage({ chatroomId, message: userMessage }));

    // Show typing indicator
    dispatch(setTypingIndicator({ chatroomId, isTyping: true }));

    try {
      // Simulate AI thinking time (2-4 seconds)
      const thinkingTime = 2000 + Math.random() * 2000;
      await new Promise((resolve) => setTimeout(resolve, thinkingTime));

      // Generate AI response
      const aiResponses = [
        "That's an interesting question! Let me help you with that.",
        "I understand what you're asking. Here's what I think...",
        "Great point! Based on what you've shared, I'd suggest...",
        "Thanks for sharing that with me. Here's my perspective...",
        "I can help you with that. Let me break it down for you...",
        "That's a thoughtful question. Here's what I recommend...",
      ];

      const aiMessage = {
        id: uuidv4(),
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: "ai",
        timestamp: new Date().toISOString(),
        type: "text",
      };

      return { chatroomId, message: aiMessage };
    } catch (error) {
      throw new Error("Failed to get AI response");
    }
  }
);

// Load more messages (pagination)
export const loadMoreMessages = createAsyncThunk(
  "chat/loadMoreMessages",
  async ({ chatroomId }, { getState }) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return empty array instead of mock messages for a clean chat experience
    const newMessages = [];
    return { chatroomId, messages: newMessages };
  }
);

const initialState = {
  chatrooms: [],
  currentChatroomId: null,
  messages: {}, // { chatroomId: messages[] }
  typingIndicators: {}, // { chatroomId: boolean }
  isLoading: false,
  error: null,
  hasMoreMessages: {}, // { chatroomId: boolean }
  searchQuery: "",
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    createChatroom: (state, action) => {
      const newChatroom = {
        id: uuidv4(),
        title: action.payload.title || `Chat ${state.chatrooms.length + 1}`,
        createdAt: new Date().toISOString(),
        lastMessage: null,
        messageCount: 0,
      };

      state.chatrooms.unshift(newChatroom);
      state.messages[newChatroom.id] = [];
      // For new chatrooms, set hasMoreMessages to false since there are no messages to load
      state.hasMoreMessages[newChatroom.id] = false;

      // Save to localStorage
      localStorage.setItem("gemini-chatrooms", JSON.stringify(state.chatrooms));
      localStorage.setItem("gemini-messages", JSON.stringify(state.messages));

      // Set the current chatroom to the newly created one
      state.currentChatroomId = newChatroom.id;
    },

    deleteChatroom: (state, action) => {
      const chatroomId = action.payload;
      state.chatrooms = state.chatrooms.filter(
        (room) => room.id !== chatroomId
      );
      delete state.messages[chatroomId];
      delete state.typingIndicators[chatroomId];
      delete state.hasMoreMessages[chatroomId];

      if (state.currentChatroomId === chatroomId) {
        state.currentChatroomId = null;
      }

      // Save to localStorage
      localStorage.setItem("gemini-chatrooms", JSON.stringify(state.chatrooms));
      localStorage.setItem("gemini-messages", JSON.stringify(state.messages));
    },

    setCurrentChatroom: (state, action) => {
      state.currentChatroomId = action.payload;
    },

    addMessage: (state, action) => {
      const { chatroomId, message } = action.payload;

      if (!state.messages[chatroomId]) {
        state.messages[chatroomId] = [];
      }

      state.messages[chatroomId].push(message);

      // Update chatroom's last message
      const chatroom = state.chatrooms.find((room) => room.id === chatroomId);
      if (chatroom) {
        chatroom.lastMessage =
          message.content.slice(0, 50) +
          (message.content.length > 50 ? "..." : "");
        chatroom.messageCount = state.messages[chatroomId].length;
      }

      // Save to localStorage
      localStorage.setItem("gemini-messages", JSON.stringify(state.messages));
      localStorage.setItem("gemini-chatrooms", JSON.stringify(state.chatrooms));
    },

    setTypingIndicator: (state, action) => {
      const { chatroomId, isTyping } = action.payload;
      state.typingIndicators[chatroomId] = isTyping;
    },

    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },

    loadChatroomsFromStorage: (state) => {
      const savedChatrooms = localStorage.getItem("gemini-chatrooms");
      const savedMessages = localStorage.getItem("gemini-messages");

      if (savedChatrooms) {
        state.chatrooms = JSON.parse(savedChatrooms);
      }

      if (savedMessages) {
        state.messages = JSON.parse(savedMessages);
        // Initialize hasMoreMessages for existing chatrooms
        Object.keys(state.messages).forEach((chatroomId) => {
          state.hasMoreMessages[chatroomId] = true;
        });
      }
    },

    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Send message and get response
      .addCase(sendMessageAndGetResponse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessageAndGetResponse.fulfilled, (state, action) => {
        state.isLoading = false;
        const { chatroomId, message } = action.payload;

        // Hide typing indicator
        state.typingIndicators[chatroomId] = false;

        // Add AI message
        if (!state.messages[chatroomId]) {
          state.messages[chatroomId] = [];
        }

        state.messages[chatroomId].push(message);

        // Update chatroom's last message
        const chatroom = state.chatrooms.find((room) => room.id === chatroomId);
        if (chatroom) {
          chatroom.lastMessage =
            message.content.slice(0, 50) +
            (message.content.length > 50 ? "..." : "");
          chatroom.messageCount = state.messages[chatroomId].length;
        }

        // Save to localStorage
        localStorage.setItem("gemini-messages", JSON.stringify(state.messages));
        localStorage.setItem(
          "gemini-chatrooms",
          JSON.stringify(state.chatrooms)
        );
      })
      .addCase(sendMessageAndGetResponse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;

        // Hide typing indicator on error
        Object.keys(state.typingIndicators).forEach((chatroomId) => {
          state.typingIndicators[chatroomId] = false;
        });
      })

      // Load more messages
      .addCase(loadMoreMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadMoreMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        const { chatroomId, messages } = action.payload;

        if (state.messages[chatroomId]) {
          state.messages[chatroomId] = [
            ...messages,
            ...state.messages[chatroomId],
          ];
        } else {
          state.messages[chatroomId] = messages;
        }

        // Simulate end of messages after loading a few times
        const currentCount = state.messages[chatroomId].length;
        if (currentCount > 100) {
          state.hasMoreMessages[chatroomId] = false;
        }

        localStorage.setItem("gemini-messages", JSON.stringify(state.messages));
      })
      .addCase(loadMoreMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  createChatroom,
  deleteChatroom,
  setCurrentChatroom,
  addMessage,
  setTypingIndicator,
  setSearchQuery,
  loadChatroomsFromStorage,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;
