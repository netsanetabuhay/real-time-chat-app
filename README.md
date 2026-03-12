💬 Real-Time Chat Application
A full-stack real-time chat application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Socket.IO for real-time communication.

🚀 Features
Core Features
Real-time messaging - Instant message delivery using Socket.IO

Message status - ✓ for sent, ✓✓ for seen

Image sharing - Send and receive images with Cloudinary integration

Online/Offline status - Green dot indicator for online users

Unread message count - Badge showing number of unread messages

Media history - Gallery of all shared images in chat

User Features
User authentication - Sign up, login, logout

Profile management - Update profile picture, name, and bio

Search users - Find users by name in sidebar

Click outside to close - Profile page closes when clicking outside

Chat Features
Sent/Received styling - Purple bubbles for sent, gray for received

Message timestamps - Formatted time display

Auto-scroll - Automatically scrolls to latest message

Image preview - Preview images before sending

Seen status - Double checkmark when message is read

🛠️ Tech Stack
Frontend
React.js - UI library

Vite - Build tool

Tailwind CSS - Styling

Socket.IO-client - Real-time communication

React Router DOM - Navigation

React Hot Toast - Notifications

Axios - HTTP requests

Backend
Node.js - Runtime environment

Express.js - Web framework

MongoDB - Database

Mongoose - ODM

Socket.IO - Real-time engine

Cloudinary - Image storage

JWT - Authentication

Bcrypt - Password hashing

📋 Prerequisites
Node.js (v14 or higher)

MongoDB

Cloudinary account

npm or yarn

🔧 Installation
1. Clone the repository
bash
git clone <your-repo-url>
cd chat-app
2. Install dependencies
Backend:

bash
cd server
npm install
Frontend:

bash
cd client
npm install
3. Environment Variables
Backend (.env):

env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
Frontend (.env):

env
VITE_BACKEND_URL=http://localhost:5000
4. Run the application
Backend:

bash
cd server
npm start
Frontend:

bash
cd client
npm run dev
📁 Project Structure
text
chat-app/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Context providers
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities
│   │   └── assets/         # Images and icons
│   └── index.html
│
└── server/                  # Backend Node.js application
    ├── controllers/         # Route controllers
    ├── models/             # Database models
    ├── routes/             # API routes
    ├── middleware/         # Custom middleware
    ├── lib/                # Utilities
    └── server.js           # Entry point
🚀 Deployment
Backend Deployment (Render/Railway)
Push code to GitHub

Create account on Render or Railway

Connect your repository

Set environment variables

Deploy

Frontend Deployment (Netlify/Vercel)
Build the frontend:

bash
cd client
npm run build
Deploy to Netlify or Vercel

Set environment variable VITE_BACKEND_URL to your deployed backend URL

📱 Screenshots
[Add screenshots of your application here]

🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

📄 License
This project is licensed under the MIT License.

👨‍💻 Author
Your Name

GitHub: @yourusername

Email: your.email@example.com

🙏 Acknowledgments
Socket.IO for real-time communication

Cloudinary for image storage

Tailwind CSS for styling

All contributors and supporters

Happy Coding! 🚀

