# MindMate AI - Mental Health Companion

A comprehensive mental health companion application that provides support through mood tracking, journaling, AI chat, and more.

## Features

### Authentication
- User registration and login with email/password
- Password reset flow with email verification
- Protected routes based on authentication status
- Persistent sessions with JWT tokens
- Role-based access control (user/admin)

### User Interface
- Responsive design that works on all devices
- Dark/light theme support with system preference detection
- Animated transitions and micro-interactions
- Accessible components following WCAG guidelines
- Loading states and error handling

### Core Functionality
- Mood tracking with visualizations
- Private journal with rich text formatting
- AI-powered chat companion
- Activity and mood analytics
- User profile management

## Tech Stack

### Frontend
- **React** with TypeScript
- **React Router** for navigation
- **React Hook Form** with Yup validation
- **Framer Motion** for animations
- **Tailwind CSS** for styling
- **Axios** for API requests
- **React Hot Toast** for notifications
- **React Query** for server state management

### Backend
- **Node.js** with **Express**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **Nodemailer** for email functionality
- **Winston** for logging

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- MongoDB instance

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mindmate-ai.git
   cd mindmate-ai/client
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the client directory:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm start` or `yarn start` - Start the development server
- `npm test` or `yarn test` - Run tests
- `npm run build` or `yarn build` - Build for production
- `npm run eject` - Eject from Create React App

## Project Structure

```
client/
├── public/               # Static files
├── src/
│   ├── assets/           # Images, fonts, etc.
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Common components (buttons, inputs, etc.)
│   │   ├── layout/        # Layout components (header, footer, etc.)
│   │   └── ui/            # UI components
│   ├── config/            # Configuration files
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   │   ├── auth/          # Authentication pages
│   │   ├── dashboard/     # Dashboard pages
│   │   └── ...
│   ├── services/         # API services
│   ├── styles/            # Global styles
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main App component
│   └── index.tsx          # Entry point
├── .env                   # Environment variables
├── package.json           # Project dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Authentication Flow

### User Registration
1. User fills out registration form with email and password
2. Client validates input and sends request to `/api/auth/register`
3. Server creates user, sends verification email, and returns JWT token
4. Client stores token in localStorage and redirects to dashboard

### User Login
1. User enters email and password
2. Client validates input and sends request to `/api/auth/login`
3. Server validates credentials and returns JWT token
4. Client stores token and redirects to dashboard

### Password Reset
1. User clicks "Forgot Password" and enters email
2. Server generates reset token and sends email with reset link
3. User clicks link and is taken to reset password page
4. User enters new password and submits
5. Server validates token and updates password
6. User is redirected to login page

## Environment Variables

Create a `.env` file in the client directory with the following variables:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [React Hook Form](https://react-hook-form.com/)
- [React Hot Toast](https://react-hot-toast.com/)
#   m i n d m a t e - a i  
 