**🧠 MindMate AI – Your Mental Health Companion**
A comprehensive AI-driven mental health companion that offers mood tracking, journaling, intelligent conversations, and more — all designed to support emotional well-being.

✨ Features
🔐 Authentication
Secure user registration and login via email/password

Password reset with email verification

Role-based access control (User/Admin)

Protected routes using JWT tokens

Persistent sessions

💡 Core Functionality
Mood tracking with visual analytics

Private journal with rich-text formatting

AI-powered chat companion

Activity and mood analytics dashboard

User profile management

🖥️ User Interface
Fully responsive design (mobile, tablet, desktop)

Dark and light theme with system preference support

Smooth transitions with animations

Accessible components (WCAG-compliant)

Loading states and error handling for user clarity

🧰 Tech Stack
🔧 Frontend
React with TypeScript

React Router for routing

React Hook Form with Yup validation

Tailwind CSS for utility-first styling

Framer Motion for animations

React Query for server state management

Axios for API calls

React Hot Toast for notifications

⚙️ Backend
Node.js with Express.js

MongoDB with Mongoose

JWT for authentication

Nodemailer for email services

Winston for logging

🚀 Getting Started
✅ Prerequisites
Node.js (v14 or later)

npm or Yarn

MongoDB instance running locally or in the cloud

📦 Installation
Clone the repository:

bash
Copy
Edit
git clone https://github.com/yourusername/mindmate-ai.git
cd mindmate-ai/client
Install dependencies:

bash
Copy
Edit
npm install
# or
yarn install
Create a .env file inside client/:

env
Copy
Edit
REACT_APP_API_URL=http://localhost:5000/api
Start the development server:

bash
Copy
Edit
npm start
# or
yarn start
Visit the app in your browser:
http://localhost:3000

📁 Project Structure
bash
Copy
Edit
client/
├── public/            # Static files
├── src/
│   ├── assets/        # Images, fonts, etc.
│   ├── components/    # UI components
│   │   ├── common/    # Buttons, inputs, etc.
│   │   ├── layout/    # Header, footer, etc.
│   │   └── ui/        # Specific UI components
│   ├── config/        # App configuration
│   ├── context/       # React contexts
│   ├── hooks/         # Custom hooks
│   ├── pages/         # App pages
│   │   ├── auth/      # Login, register, reset
│   │   └── dashboard/ # User dashboard
│   ├── services/      # API service handlers
│   ├── styles/        # Global styles
│   ├── types/         # TypeScript types
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Root component
│   └── index.tsx      # Entry point
├── .env
├── package.json
└── tsconfig.json
🔑 Authentication Flow
Registration
User registers via /api/auth/register

Server sends a verification email and returns a JWT

Client stores token and redirects to dashboard

Login
User logs in via /api/auth/login

JWT returned on success

Token stored in localStorage

Password Reset
User enters email

Server sends reset link with token

User sets new password through the reset page

📜 Environment Variables
Create a .env file in the client/ directory:

env
Copy
Edit
REACT_APP_API_URL=http://localhost:5000/api
🧪 Available Scripts
Script	Description
npm start / yarn start	Start the development server
npm test / yarn test	Run unit tests
npm run build / yarn build	Create production build
npm run eject	Eject from Create React App

🤝 Contributing
Fork the repository

Create a feature branch:

bash
Copy
Edit
git checkout -b feature/amazing-feature
Commit your changes:

bash
Copy
Edit
git commit -m "Add amazing feature"
Push to GitHub:

bash
Copy
Edit
git push origin feature/amazing-feature
Create a pull request

📄 License
This project is licensed under the MIT License. See the LICENSE file for more details.

🙌 Acknowledgments
React

TypeScript

Tailwind CSS

Framer Motion

React Hook Form

React Hot Toast
