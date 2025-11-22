# Moments App - Life Journaling with Skyflow Integration

A beautiful, mobile-first React application for capturing daily moments, tracking mood, and generating AI-powered daily summaries. Built with React, TypeScript, Vite, and Tailwind CSS, with secure data storage using Skyflow.

## ✨ Features

### Core Functionality
- **📝 Moment Capture** - Quickly capture thoughts, activities, and experiences throughout your day
- **📅 Calendar View** - Visualize your month/week with mood indicators and activity tracking
- **🤖 AI-Powered Summaries** - Generate daily stories and insights from your moments
- **🏃 Strava Integration** - Automatically sync fitness activities (Run, Walk, Hike, Ride)
- **📊 Mood Tracking** - Track emotions and see patterns over time
- **🎯 Action Items** - Get personalized recommendations based on your day

### Security & Privacy
- **🔒 Skyflow Integration** - Secure user profile data storage with tokenization
- **💾 Local Storage** - Moments stored locally for privacy (not sent to Skyflow)
- **🛡️ Environment Variables** - All secrets stored securely, never committed

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Skyflow account and vault credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/radiangle/hackathon-moment-app.git
   cd hackathon-moment-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your Skyflow credentials. See [docs/ENV_SETUP.md](./docs/ENV_SETUP.md) for details.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
hackathon-moment-app/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   ├── index.css            # Global styles
│   ├── vite-env.d.ts       # Vite type definitions
│   ├── config/
│   │   └── skyflow.ts       # Skyflow configuration
│   └── utils/
│       ├── mockProfile.ts   # Mock profile helpers
│       ├── createMockProfile.ts
│       └── createUserProfile.ts
├── docs/
│   ├── ENV_SETUP.md         # Environment setup guide
│   └── SCHEMA_REVIEW.md     # Schema documentation
├── schemas/
│   └── vaultSchema.json     # Skyflow vault schema
├── dist/                    # Build output (gitignored)
├── node_modules/            # Dependencies (gitignored)
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🔐 Skyflow Integration

This app uses Skyflow for secure user profile data storage. Only user profile information (name, address, contact info) is stored in Skyflow - moments and conversations are stored locally.

### Key Points:
- **User Profiles Only** - Only schema-compliant profile data is stored in Skyflow
- **Local Moments** - Daily moments are stored locally, not in Skyflow
- **Tokenization** - Sensitive profile fields are tokenized for security
- **Single Profile** - The app displays one user profile at a time

See [docs/ENV_SETUP.md](./docs/ENV_SETUP.md) for configuration details and [schemas/vaultSchema.json](./schemas/vaultSchema.json) for the schema structure.

## 🎨 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Skyflow** - Secure data storage
- **Claude AI** - AI-powered daily summaries

## 📱 Features in Detail

### Calendar View
- **Month View** - See your entire month at a glance with mood indicators
- **Week View** - Focused weekly view with detailed summaries
- **Mood Visualization** - Color-coded days based on mood scores
- **Theme Detection** - AI-detected themes and patterns

### Moment Capture
- **Quick Input** - Fast, distraction-free moment entry
- **Auto-Tagging** - Automatic emotion and tag detection
- **Strava Sync** - Fitness activities automatically synced
- **Rich Metadata** - Location, weather, and timestamp tracking

### Daily Summaries
- **AI-Generated Stories** - Personalized narratives from your moments powered by Claude AI
- **Highlights** - Key moments with traceability to source
- **Action Items** - Personalized recommendations
- **Mood Tracking** - Visual mood representation

## 🔒 Security

- All secrets stored in environment variables
- `.env` file is gitignored
- Skyflow tokenization for sensitive data
- No hardcoded credentials
- CORS protection via Vite proxy in development

## 📦 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The `vercel.json` configuration is already included.

### Other Platforms

1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in your platform's dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)
- Secure storage powered by [Skyflow](https://www.skyflow.com/)

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Note:** This app stores moments locally and only syncs user profile data to Skyflow. Your daily moments remain private and are not sent to any external service.

