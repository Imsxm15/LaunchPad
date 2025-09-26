# LaunchPad Front-end

![LaunchPad](./LaunchPad.jpg)

This repository now contains only the LaunchPad marketing storefront built with Next.js. The Strapi backend previously bundled with this project has been removed so the application can be connected to any headless commerce or CMS API you prefer.

## 🚀 Getting started

1. **Clone the repository**

   ```bash
   git clone https://github.com/Imsxm15/LaunchPad.git
   cd LaunchPad
   ```

2. **Install dependencies**

   ```bash
   yarn install
   yarn setup:next
   ```

   The `setup:next` script installs the `next` workspace dependencies and copies the example environment variables to `.env` if the file does not already exist.

3. **Configure environment variables**
   Update `next/.env` with the URL of the API you want the storefront to consume:

   ```bash
   NEXT_PUBLIC_API_URL="https://your-api.example.com/"
   ```

4. **Start the development server**

   ```bash
   yarn dev
   ```

   or run the commands directly inside the Next.js folder:

   ```bash
   cd next
   yarn dev
   ```

5. **Build for production**
   ```bash
   cd next
   yarn build
   yarn start
   ```

## 📁 Project structure

```
.
├── next/           # Next.js application
├── scripts/        # Utility scripts (env bootstrapper)
├── README.md       # You are here
└── package.json    # Workspace utilities and shared tooling
```

## 🧪 Recommended checks

- `yarn lint` inside `next/` ensures the application meets the linting rules.
- `yarn build` inside `next/` validates the production build.

Feel free to connect the storefront to your own API layer or integrate it with the commerce platform of your choice.
