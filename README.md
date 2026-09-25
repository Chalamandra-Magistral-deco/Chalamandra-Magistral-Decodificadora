# Chalamandra QuantumMind™ — Mandala Vivo

> **Engineering Level:** Senior Master Artifact  
> **Architecture:** React 18 (Hybrid Module) + TailwindCSS + Chart.js  
> **Status:** Production Ready

This repository hosts the personal portfolio of **Danna Brasdefer**, featuring the **Mandala Vivo** interactive engine and the **SRAP** gamified methodology.

## 🏗 Architecture

- **Core:** React 18.3.1 (Functional Components + Hooks)
- **Styling:** TailwindCSS (CDN for rapid prototyping, easily convertible to CLI)
- **Visualization:** Chart.js (Radar Charts for SRAP metrics)
- **State Management:** React `useState` / `useEffect` (Local atomic state)
- **Routing:** Conditional View Rendering (SPA pattern)

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/chalamandra-portfolio.git

# Enter directory
cd chalamandra-portfolio

# Install dependencies
npm install
```

### Development

```bash
npm run start
# Runs Vite development server at http://localhost:5173
```

### Production Build

```bash
npm run build
# Outputs optimized static files to /dist
```

## 🛠 Deployment (Vercel)

This project is configured for immediate deployment on Vercel.

1. Install Vercel CLI: `npm i -g vercel`
2. Run deploy:
   ```bash
   vercel
   ```
3. For production:
   ```bash
   vercel --prod
   ```

*Note: The `vercel.json` ensures SPA routing works correctly by rewriting all routes to `index.html`.*

## 🛡 Stability & Quality

- **Error Boundaries:** Implemented to catch render failures (preventing WSOD).
- **Type Safety:** TypeScript interfaces for all data structures (`Pedagogy`, `PortfolioItem`).
- **Performance:** Components are memoized where necessary; animations use CSS hardware acceleration.
- **Sanitization:** Strict rendering checks to avoid `React Error #31` (Objects as children).

## 📂 Project Structure

```
/
├── index.html                  # Entry point (HTML, Tailwind config, Font & Chart.js CDN)
├── index.tsx                   # React root mount
├── App.tsx                     # Main Application Controller & Portals (Mandala, Flow Malandro, DecoX, SRAP)
├── AuthContext.tsx             # React Auth context & Google sign-in state management
├── firebase.ts                 # Firebase SDK initialization & Firestore helpers
├── firestore.rules             # Production security rules for Firestore
├── firebase-blueprint.json     # Firestore database schema blueprint
├── firebase-applet-config.json # Firebase project configuration
├── constants.ts                # Strongly typed datasets (About, Pedagogies, Portfolio)
├── components/
│   └── FlowMalandro.tsx        # Interactive tactical workbook (7 modules + synthesis + Firestore sync)
├── vite.config.ts              # Vite configuration (React plugin & build setup)
├── tsconfig.json               # TypeScript compiler configuration
├── package.json                # Dependency manifest & scripts
├── vercel.json                 # Vercel deployment & SPA routing configuration
├── .gitignore                  # Git and deployment ignore rules
├── .env.example                # Environment variable documentation template
└── README.md                   # Project documentation
```

## 🎮 Interactive Portals

1. **CHALAMANDRA (Mandala Vivo):** 9 interactive petals mapping free hooks to paid strategic methodologies.
2. **FLOW MALANDRO:** Tactical workbook with 7 hands-on interactive modules:
   - ⚽ *El Messi del Malandro* (Tactical soccer board role mapping)
   - 🛠️ *El Kit del Malandro* (Backpack gear inventory & intensity calibration)
   - 🎩 *Los 6 Sombreros de Jorge* (De Bono lateral thinking street console)
   - 🗺️ *Cartografía del Caos* (Interactive danger/safety/exit pinpoint radar)
   - 🎂 *El Pastelote Emocional* (Gestalt emotional balance slices)
   - 🕯️ *El Ritual de la Herramienta Rota* (Symbolic closure altar & tribute)
   - 🎲 *El Mapa de la Trampa* (Street adventure snakes & ladders game board)
   - 📝 *Preguntas de Reflexión Final* (Integrated synthesis form with cloud sync & export)
3. **DECOX™ (About):** Strategic identity, origins, core philosophy, and specialized decoding skills.
4. **SRAP (Alquimia del Saber):** 10 interactive pedagogies mapped with dynamic Chart.js radar charts.

## 🚀 Available Scripts

```bash
# Start development server
npm run dev
# or
npm run start

# Run TypeScript typecheck
npm run typecheck

# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---
*Engineered by Chalamandra QuantumMind XYZ*