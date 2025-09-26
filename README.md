# LaunchPad Monorepo

![LaunchPad](./LaunchPad.jpg)

This repository now contains a full-stack LaunchPad setup that combines the marketing storefront built with Next.js and a MedusaJS commerce backend. Both applications live side-by-side in a Yarn workspaces monorepo for a streamlined developer experience.

## 🚀 Getting started

1. **Clone the repository**

   ```bash
   git clone https://github.com/Imsxm15/LaunchPad.git
   cd LaunchPad
   ```

2. **Install dependencies**

   ```bash
   yarn install
   yarn setup
   ```

   The `setup` script installs every workspace, prepares the Next.js environment variables, and downloads the Medusa dependencies.

3. **Configure environment variables**
   Update `apps/next/.env` with the URL of the API you want the storefront to consume:

   ```bash
   NEXT_PUBLIC_API_URL="https://your-api.example.com/"
   ```

   Update `apps/medusa/.env` with the credentials of your PostgreSQL database and any additional secrets:

   ```bash
   DATABASE_URL="postgres://USER:PASSWORD@localhost:5432/medusa"
   ```

4. **Start the development servers**

   Start the storefront:

   ```bash
   yarn dev:next
   ```

   Start the Medusa backend:

   ```bash
   yarn dev:medusa
   ```

5. **Build for production**

   ```bash
   yarn build:next
   yarn build:medusa
   ```

   Refer to the Medusa documentation for deployment instructions and running migrations against your PostgreSQL instance.

## 📁 Project structure

```
.
├── apps/
│   ├── medusa/     # MedusaJS backend (PostgreSQL by default)
│   └── next/       # Next.js storefront
├── scripts/        # Utility scripts (env bootstrapper)
├── README.md       # You are here
└── package.json    # Workspace utilities and shared tooling
```

## 🧪 Recommended checks

- `yarn lint` inside `apps/next/` ensures the application meets the linting rules.
- `yarn build` inside `apps/next/` validates the production build.
- `yarn dev:medusa` inside the repository root runs the Medusa backend in development mode.

Feel free to connect the storefront to your own API layer or integrate it with the commerce platform of your choice.
