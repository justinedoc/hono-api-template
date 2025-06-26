# Hono API Template

A **production-ready** Hono API boilerplate in TypeScript—designed to help you ship your API faster, with minimal setup and best-practice defaults.

This template comes fully loaded with:

- **⚡️ Hono framework**  
  Ultra-lightweight, high-performance routing & middleware built on the Web API standard.

- **TypeScript support**  
  Strongly-typed request/response objects, compile-time safety, and autocomplete.

- **OpenAPI (Swagger) docs**  
  Auto-generated API spec—keep your docs in sync and ship a beautiful interactive API reference.

- **Postman collection**  
  Ready-to-import Postman collection for easy endpoint testing and sharing:  
  https://documenter.getpostman.com/view/38909501/2sB2x6nsKY

- **Validation & Error Handling**  
  Built-in JSON schema (Zod) request validation, plus a unified error-handler middleware.

- **Docker & Local Dev**  
  One-click `docker-compose up` for local testing, plus `npm run dev` for hot-reload.

- **Testing**  
  Jest + SuperTest integration tests, with example coverage for all core routes.

- **Linting & Formatting**  
  ESLint, Prettier, and Husky pre-commit hooks to enforce code quality.

- **CI/CD**  
  GitHub Actions workflows out-of-the-box for lint/test on every PR and automated Docker builds.

---

## 🚀 Quickstart

# 1. Clone the template

git clone https://github.com/justinedoc/hono-api-template.git
cd hono-api-template

# 2. Install dependencies

npm install

# 3. Copy & configure your env

cp .env.example .env

# └─ Update any vars (PORT, DATABASE_URL, JWT_SECRET, etc.)

# 4. Start in development mode

npm run dev

# 5. View API docs

# • Local OpenAPI UI: http://localhost:4000/docs

# • Postman: import the JSON from

# https://documenter.getpostman.com/view/38909501/2sB2x6nsKY

## 🗂️ Project Structure

.
├── src
│ ├── configs/ # Project configurations
│ ├── constants/ # App constants
│ ├── errors/ # Custom app errors
│ ├── libs/ # Helpers (e.g. mailer, compound validators, e.t.c)
│ ├── middleware/ # Error handler, auth, logging
│ ├── middleware/ # Database models
│ ├── routes/ # Hono route definitions
│ ├── schemas/ # Zod request/response schemas
│ ├── services/ # User sevices
│ ├── types/ # App types
│ ├── workers/ # Job workers
│ ├── app.ts # Hono app & middleware setup
│ └── index.ts # Server entrypoint
├── tests/ # Jest + SuperTest integration tests
├── .env.example
├── package.json

---

## 📖 Documentation

- **OpenAPI UI**: `GET /docs` (Swagger UI)
- **Postman Collection**:
  Import directly from our published docs:
  `https://documenter.getpostman.com/view/38909501/2sB2x6nsKY`

---

## 🤝 Contributing

We welcome all contributions! Please:

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to your branch (`git push origin feature/your-feature`)
5. Open a Pull Request—our CI will run lint & tests automatically.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.

---

## 📜 License

This project is **open source** under the [MIT License](./LICENSE).
Feel free to use, modify, and distribute—happy coding!

---
