# Gemini Frontend Clone

A fully functional, responsive, and visually appealing frontend for a Gemini-style conversational AI chat application built with React and Redux.

## Features

### Authentication

- **OTP-based Login/Signup** with country code selection
- **Country Data Integration** from restcountries.com API
- **Form Validation** using React Hook Form + Zod
- **Simulated OTP** send and validation (use `123456` for demo)

### Dashboard

- **Chatroom Management** - Create, delete, and search chatrooms
- **Responsive Design** with grid layout
- **Real-time Search** with debounced filtering
- **Toast Notifications** for all actions

### Chat Interface

- **Real-time Messaging** with simulated AI responses
- **Image Upload Support** with base64 preview
- **Typing Indicators** - "Gemini is typing..." animation
- **Message Features**:
  - Copy to clipboard on hover
  - Timestamps for all messages
  - User and AI message differentiation
- **Infinite Scroll** with reverse pagination for message history
- **Auto-scroll** to latest messages with manual scroll detection

### Global UX Features

- **Dark Mode Toggle** with persistent storage
- **Mobile Responsive** design for all screen sizes
- **Keyboard Accessibility** for all interactions
- **Loading Skeletons** for better UX
- **Toast Notifications** system
- **LocalStorage Persistence** for auth and chat data

## Tech Stack

- **Framework**: React 18
- **State Management**: Redux Toolkit
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Create React App

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd gemini-clone
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Open in browser**
   - The app will automatically open at `http://localhost:3000`
   - If port 3000 is occupied, it will prompt to use another port

## Project Structure

```
src/
├── components/
│   ├── auth/                 # Authentication components
│   │   ├── PhoneForm.js     # Phone number input with country selection
│   │   └── OTPForm.js       # OTP verification form
│   ├── dashboard/           # Dashboard components
│   │   ├── Dashboard.js     # Main dashboard with chatroom grid
│   │   └── CreateChatroomModal.js # Modal for creating new chatrooms
│   ├── chat/               # Chat interface components
│   │   ├── ChatRoom.js     # Main chat interface
│   │   ├── MessageItem.js  # Individual message component
│   │   └── TypingIndicator.js # AI typing animation
│   └── ui/                 # Reusable UI components
│       ├── Button.js       # Styled button component
│       ├── Input.js        # Form input component
│       ├── Loading.js      # Loading spinners and skeletons
│       └── Toast.js        # Toast notification system
├── store/                  # Redux store configuration
│   ├── index.js           # Store setup
│   └── slices/            # Redux slices
│       ├── authSlice.js   # Authentication state
│       ├── chatSlice.js   # Chat and chatroom state
│       └── uiSlice.js     # UI state (theme, toasts)
├── hooks/                 # Custom hooks
│   └── redux.js          # Typed Redux hooks
├── lib/                   # Configuration and schemas
│   └── validations.js    # Zod validation schemas
├── utils/                 # Utility functions
│   └── index.js          # Common utilities
└── App.js                # Main application component
```

## Key Features Implementation

### Redux Store Architecture

- **authSlice**: Manages user authentication, country data, and OTP flow
- **chatSlice**: Handles chatrooms, messages, and AI responses
- **uiSlice**: Controls dark mode, toast notifications, and global UI state

### Form Validation

All forms use React Hook Form with Zod schemas for robust validation:

- Phone number validation with country code
- OTP format validation (6-digit numeric)
- Chatroom name validation

### Responsive Design

- Mobile-first approach with Tailwind CSS
- Adaptive layouts for different screen sizes
- Touch-friendly interactions on mobile devices

### Performance Optimizations

- Debounced search for chatroom filtering
- Throttled AI responses to simulate realistic delays
- Efficient re-renders with proper Redux state structure
- Lazy loading of message history with pagination

## Usage Guide

### Authentication Flow

1. **Phone Number Entry**: Select your country and enter phone number
2. **OTP Verification**: Enter the OTP (use `123456` for demo)
3. **Automatic Login**: Successfully verified users are logged in

### Dashboard Operations

1. **Create Chatroom**: Click "New Chat" and enter a name
2. **Search Chatrooms**: Use the search bar to filter by title
3. **Delete Chatroom**: Hover over a chatroom card and click the delete icon
4. **Enter Chat**: Click on any chatroom card to start chatting

### Chat Features

1. **Send Messages**: Type and press Enter or click Send button
2. **Upload Images**: Click the image icon to select and send images
3. **Copy Messages**: Hover over any message to show copy button
4. **Load History**: Scroll to the top to load more messages
5. **Auto-scroll**: New messages automatically scroll into view

### Global Features

1. **Dark Mode**: Toggle using the moon/sun icon in the header
2. **Logout**: Click the logout icon to sign out
3. **Notifications**: Toast messages appear for all important actions

## Customization

### Styling

The app uses Tailwind CSS with custom color schemes defined in `tailwind.config.js`. You can easily customize:

- Primary colors
- Dark mode colors
- Animation timings
- Component spacing

### AI Responses

AI responses are simulated with random delays and predefined messages. You can customize:

- Response delay timing (2-4 seconds)
- Available response messages
- Typing indicator duration

### Validation Rules

Form validation rules are defined in `src/lib/validations.js` using Zod schemas. Easily modify:

- Phone number format requirements
- OTP length and format
- Chatroom name constraints

## Deployment

The app is ready for deployment on platforms like Vercel or Netlify:


