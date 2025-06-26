# 🧱 Hono API Template

[![CI](https://github.com/justinedoc/hono-api-template/actions/workflows/ci.yml/badge.svg)](https://github.com/justinedoc/hono-api-template/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![OpenAPI Docs](https://img.shields.io/badge/docs-Swagger_UI-85EA2D?logo=swagger&logoColor=white)](http://localhost:4000/docs)
[![Postman](https://img.shields.io/badge/Postman-Collection-orange?logo=postman)](https://documenter.getpostman.com/view/38909501/2sB2x6nsKY)

A **production-ready**, scalable API starter powered by [Hono](https://hono.dev/) and **TypeScript**—built for developers who want speed **and** structure.

Perfect for RESTful APIs, microservices, or server-side logic where performance and developer experience are both a priority.

---

## ⚙️ What’s Included

This template ships with everything you need to build, test, and deploy confidently:

### Core

- **⚡️ Hono Framework**  
  Fast, minimalist, Web Standards-based framework for handling routing and middleware.

- **📘 OpenAPI Support**  
  Auto-generated Swagger UI docs powered by your schema definitions.

- **🧪 Full Testing Suite**  
  Jest + SuperTest integration tests with built-in examples.

- **🛡 Zod Validation**  
  Schema validation for requests and responses.

- **🌍 TypeScript + tsconfig**  
  Zero-guesswork DX with full type safety and helpful IDE hints.

- **📦 Dockerized**  
  One-command startup for local dev or containerized deployment.

- **🧹 Pre-configured Linting**  
  ESLint + Prettier + Husky = consistent code without the nagging.

- **🔁 CI/CD with GitHub Actions**  
  Auto-runs lint and tests on pull requests + production-ready Docker builds.

- **📬 Postman Collection**  
  Import and test API endpoints instantly.  
  ➡️ [Open in Postman](https://documenter.getpostman.com/view/38909501/2sB2x6nsKY)

---

## 🚀 Quickstart

```bash
# 1. Clone the repo
git clone https://github.com/justinedoc/hono-api-template.git
cd hono-api-template

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# ⤷ Then fill in your values (PORT, DATABASE_URL, JWT_SECRET, etc.)

# 4. Start development server
npm run dev

# 5. View API docs
# Swagger UI: http://localhost:4000/docs
```
````

---

## 🗂️ Project Structure

```
.
├── src/
│   ├── app.ts           # Hono instance and global middleware
│   ├── index.ts         # App entry point
│   ├── configs/         # App-level configurations
│   ├── constants/       # App constants
│   ├── errors/          # Custom error definitions
│   ├── libs/            # Reusable helpers (e.g. mailers, validators)
│   ├── middleware/      # Auth, logger, error handler
│   ├── models/          # Database models (if using ORM/DB)
│   ├── routes/          # Route definitions
│   ├── schemas/         # Zod schemas (validation layer)
│   ├── services/        # Business logic
│   ├── types/           # Global TypeScript types
│   └── workers/         # Background workers / jobs
├── tests/               # Jest + SuperTest integration tests
├── .env.example         # Environment variable example file
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run with watch mode
npm run test:watch

# Run coverage
npm run test:coverage
```

- Test files live under the `/tests` directory.
- Uses **Jest** for test runner and **SuperTest** for HTTP assertions.

---

## 📚 Documentation

- **OpenAPI / Swagger UI**
  Accessible at: `GET /docs` → [http://localhost:4000/docs](http://localhost:4000/docs)

- **Postman Collection**
  Import this URL into Postman:
  [https://documenter.getpostman.com/view/38909501/2sB2x6nsKY](https://documenter.getpostman.com/view/38909501/2sB2x6nsKY)

---

## 🧩 Tech Stack

| Layer          | Tool/Lib                 |
| -------------- | ------------------------ |
| Routing        | [Hono](https://hono.dev) |
| Language       | TypeScript               |
| Validation     | [Zod](https://zod.dev)   |
| Testing        | Jest + SuperTest         |
| Docs           | OpenAPI / Swagger        |
| Dev Experience | ESLint, Prettier, Husky  |
| Deployment     | Docker, GitHub Actions   |

---

## 🧑‍💻 Contributing

Found a bug? Got an idea? Want to add a feature? Awesome!

### Here's how to contribute:

```bash
# 1. Fork the repo

# 2. Create a new branch
git checkout -b feature/your-feature-name

# 3. Make your changes

# 4. Commit and push
git commit -m "feat: added awesome feature"
git push origin feature/your-feature-name

# 5. Open a Pull Request 🎉
```

All PRs are checked with lint and test pipelines automatically.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more info.

---

## 🛠 Future Plans

- [ ] Prisma integration example
- [ ] Redis + Job queues
- [ ] Role-based Auth scaffold
- [ ] Rate-limiting middleware
- [ ] Vite-based Playground UI

---

## 📄 License

This project is open source under the [MIT License](./LICENSE).
Use it freely. Modify it. Build something great.

---

## 🌐 About the Author

Built and maintained by [**@justinedoc**](https://github.com/justinedoc)
I love clean code, fast APIs, and developer-first DX.
Feel free to star 🌟 the repo and reach out if you're using it in your project!

---

Made with ❤️ + ☕ + `pnpm install`
