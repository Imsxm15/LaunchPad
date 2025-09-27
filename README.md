# LaunchPad Frontend

![LaunchPad](./LaunchPad.jpg)

LaunchPad is now a lightweight React storefront powered by Vite. The application consumes the hosted Medusa backend at
[`https://medusa-backend-c7b2.onrender.com`](https://medusa-backend-c7b2.onrender.com), allowing you to explore the product
catalog without maintaining local infrastructure.

## 🚀 Getting started

### Prerequisites

- **Node.js 18+**
- **npm 9+**

### Installation

```bash
npm install
```

### Development server

1. Create a `.env` file in the project root (already provided) and ensure the Medusa backend URL is correct:

   ```env
   VITE_MEDUSA_BACKEND_URL=https://medusa-backend-c7b2.onrender.com
   ```

2. Start the Vite development server:

   ```bash
   npm run dev
   ```

   The site is available at [http://localhost:5173](http://localhost:5173).

### Production build

```bash
npm run build
npm run preview
```

## 📁 Project structure

```
.
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── services/
│   │   └── medusa.js
│   └── styles/
│       └── global.css
├── index.html
├── package.json
├── vite.config.js
└── .env
```

## 🧠 Key concepts

- `src/services/medusa.js` centralizes API calls to the remote Medusa backend.
- `VITE_MEDUSA_BACKEND_URL` controls which backend instance the storefront consumes.

Feel free to customize the UI, expand the product views, or connect to your own Medusa deployment.
