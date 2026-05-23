# 🎨 ARTVISION - Virtual Try-On Application

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Transform your space with AI-powered virtual interior design. Visualize art, furniture, and decor in your room before you buy.

## 🌟 Features

- **🎯 Real-time Visualization** - Upload photos or use live camera
- **🤖 AI Background Removal** - One-click product isolation
- **🎨 Drag & Drop Interface** - Intuitive product placement
- **📐 Precision Controls** - Size, rotation, opacity adjustments
- **💾 Design Gallery** - Save and compare multiple layouts
- **🔄 Live Collaboration** - Real-time multi-user editing
- **📱 Mobile Responsive** - Works on any device
- **🎭 Style Matching** - AI-powered recommendations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL (optional for full features)
- Redis (optional for full features)

### Installation

```bash
# Clone the repository
git clone https://github.com/pranathi05-sulake/artvision.git
cd artvision

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run frontend (in frontend directory)
npm run dev

# Run backend (in backend directory)
npm run dev
```

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000

## 📁 Project Structure

```
artvision/
├── frontend/          # Next.js 14 application
│   ├── app/          # App router pages
│   ├── components/   # React components
│   ├── lib/          # Utilities and helpers
│   └── public/       # Static assets
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # Business logic
│   │   ├── middleware/ # Auth, error handling
│   │   └── socket/   # WebSocket handlers
│   └── prisma/       # Database schema
├── ml-service/       # Python ML service
│   └── app/
│       ├── routers/  # FastAPI endpoints
│       └── utils/    # ML utilities
├── docker/           # Docker configurations
└── k8s/             # Kubernetes manifests
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (React 18)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Canvas:** Fabric.js
- **3D:** Three.js, React Three Fiber
- **Auth:** NextAuth.js

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Cache:** Redis
- **WebSocket:** Socket.IO
- **Queue:** Bull

### ML Service
- **Framework:** FastAPI
- **Language:** Python
- **ML:** PyTorch, OpenCV
- **Models:** Transformers, Stable Diffusion

## 🎨 Key Features Explained

### 1. Virtual Try-On Canvas
- Upload room photos or use live camera
- Drag and drop products onto your space
- Real-time shadow rendering
- Perspective-aware placement

### 2. AI Background Removal
- Advanced ML models for clean product isolation
- Edge detection and refinement
- One-click processing
- Preserves image quality

### 3. Design Tools
- Resize with mouse wheel or sliders
- 360° rotation with fine control
- Opacity adjustment for layering
- Mirror/flip functionality
- Multi-select operations

### 4. Smart Recommendations
- AI analyzes room style and colors
- Suggests complementary products
- Style matching algorithms
- Personalized suggestions

### 5. Collaboration
- Real-time multi-user editing
- Live cursor tracking
- Instant synchronization
- Built-in chat

## 🐳 Docker Deployment

```bash
# Start all services
cd docker
docker-compose up -d

# Access services
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
# ML Service: http://localhost:8000
```

## ☁️ Cloud Deployment

### Vercel (Frontend)
```bash
cd frontend
vercel
```

### Railway (Full Stack)
```bash
railway login
railway init
railway up
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📊 Database Schema

```prisma
model User {
  id        String   @id
  email     String   @unique
  projects  Project[]
  savedArt  SavedArt[]
}

model Project {
  id           String
  userId       String
  roomImageUrl String
  placements   Placement[]
  snapshots    Snapshot[]
}

model Artwork {
  id           String
  title        String
  imageUrl     String
  style        String[]
  colors       String[]
  placements   Placement[]
}
```

## 🔐 Environment Variables

### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_ML_URL=http://localhost:8000
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/artvision
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
PORT=4000
NODE_ENV=development
```

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
npm run test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📈 Performance

- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.5s
- **Lighthouse Score:** 95+
- **Bundle Size:** Optimized with code splitting

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer:** Pranathi Sulake
- **GitHub:** [@pranathi05-sulake](https://github.com/pranathi05-sulake)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting solutions
- Open source community for incredible tools

## 📞 Contact

- **Email:** pranathi05.sulake@example.com
- **GitHub:** https://github.com/pranathi05-sulake
- **Project Link:** https://github.com/pranathi05-sulake/artvision

## 🎯 Roadmap

- [ ] Mobile native apps (iOS/Android)
- [ ] Advanced AR capabilities
- [ ] Social sharing features
- [ ] Designer marketplace
- [ ] VR headset support
- [ ] Multi-room planning
- [ ] Voice control interface

## 📸 Screenshots

### Main Interface
![Main Interface](docs/screenshots/main-interface.png)

### Product Placement
![Product Placement](docs/screenshots/product-placement.png)

### Design Gallery
![Design Gallery](docs/screenshots/gallery.png)

---

**Made with ❤️ by Pranathi Sulake**

⭐ Star this repo if you find it helpful!
