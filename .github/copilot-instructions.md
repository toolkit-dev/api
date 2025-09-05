# Copilot Instructions for toolkit-dev/api

## Repository Overview

This repository is **Toolkit** - a TypeScript library that provides everything needed to build end-to-end typesafe APIs. The slogan is "define once, and ship with confidence." It's a monorepo containing multiple packages for JSON:API and OpenAPI support, along with React Query integrations and examples.

**Key Details:**

- **Language:** TypeScript/JavaScript (ESM modules)
- **Package Manager:** pnpm with workspaces
- **Build System:** TypeScript compiler, Nix flake for environment
- **Framework:** Hono (for HTTP server), Zod (for schema validation), React Query
- **Repository Size:** ~15 packages across JSON:API, OpenAPI, React Query, and examples
- **Target Runtime:** Node.js 22

## Environment Setup and Build Instructions

### Prerequisites

This repository requires Nix for development environment management. Nix will be provided by the hosting environment - do not attempt to install it yourself.

### Bootstrap Process

1. **Start development environment:**
   ```bash
   nix develop
   ```
   - Wait for shell prompt to show `(nix:nix-shell-env)` prefix
   - Takes 30-90 seconds on first run to download and configure environment
   - Provides Node.js 22, pnpm 10, and all development tools

2. **Install dependencies** (run within nix develop session):
   ```bash
   pnpm install
   ```
   - Takes ~30-60 seconds on first run
   - Creates node_modules and sets up husky git hooks
   - Must be run within the nix develop environment

### Build Commands

**Compile TypeScript** (required before running most commands):

```bash
pnpm -r run compile
```

- Compiles all packages in dependency order
- Some packages may fail (known issue with react-query-fetch module resolution)
- Most packages compile successfully and this is expected

**Lint code:**

```bash
pnpm run lint
```

- Uses ESLint with neostandard config
- Must pass before commits (enforced by husky pre-commit hooks)

**Format code:**

```bash
pnpm run format
```

- Uses Prettier for code formatting
- Applied automatically on git commit via lint-staged

**Run tests:**

```bash
pnpm run test
```

- Currently returns "No tests specified" (tests are at package level)
- Individual packages may have vitest tests

**Clean build artifacts:**

```bash
pnpm run clean        # Clean all
pnpm run clean:cache  # Clean dist folders only
pnpm run clean:deps   # Clean node_modules only
```

### Development Workflow

**Start development server:**

```bash
pnpm run dev
```

- Runs turbowatch for file watching and TypeScript compilation
- Automatically starts example backend server on http://localhost:3000
- Rebuilds on TypeScript config changes

**Run specific package commands:**

```bash
pnpm --filter @toolkit-dev/examples-backend run start
```

### Time Requirements

- `pnpm install`: 30-60 seconds
- `pnpm -r run compile`: 60-120 seconds
- `pnpm run lint`: 10-20 seconds
- Development server startup: 10-15 seconds

## Project Architecture and Layout

### Package Structure

```
packages/
├── examples/
│   ├── backend/          # Hono-based API server example
│   └── frontend/         # Frontend example (if exists)
├── jsonapi/
│   ├── jsonapi-parser/   # JSON:API parsing utilities
│   ├── jsonapi-serializer/ # JSON:API serialization
│   ├── jsonapi-types/    # TypeScript types for JSON:API
│   └── jsonapi-zod/      # Zod schemas for JSON:API
├── openapi/
│   ├── openapi-client-fetch/   # OpenAPI client using fetch
│   ├── openapi-core/           # Core OpenAPI utilities
│   ├── openapi-document-zod/   # Zod schemas for OpenAPI docs
│   ├── openapi-server-hono/    # Hono integration for OpenAPI
│   └── openapi-standard-schema/ # Standard schema support
├── react-query/
│   ├── react-query-fetch/   # React Query + fetch integration
│   └── react-query-jsonapi/ # React Query + JSON:API
└── runtime/
    └── errors/             # Runtime error utilities
```

### Key Configuration Files

- `flake.nix`: Nix development environment (Node.js 22, pnpm 10)
- `pnpm-workspace.yaml`: pnpm workspace configuration
- `tsconfig.json`: TypeScript project references and build config
- `tsconfig.options.json`: Shared TypeScript compiler options
- `eslint.config.js`: ESLint configuration using neostandard
- `lint-staged.config.js`: Pre-commit formatting and linting
- `turbowatch.ts`: File watching and development server configuration

### CI/CD Pipeline

- **GitHub Actions:** `.github/workflows/run_test.yml` (uses shared workflow)
- **Copilot Setup:** `.github/workflows/copilot-setup-steps.yml` installs Nix and dependencies
- **Pre-commit Hooks:** Husky runs lint-staged (prettier + eslint) on commits
- **Renovate:** Automated dependency updates via `.github/renovate.json5`

### Development Environment

- **DevContainer:** Available at `.devcontainer/devcontainer.json` using Nix container
- **VSCode:** Settings in `.vscode/` configure Nix formatter and format-on-save
- **Environment:** Uses `.envrc` for direnv integration (loads Nix automatically)

## Working with This Repository

### Making Changes

1. **Start development environment:** `nix develop`
2. **Install dependencies:** `pnpm install`
3. **Compile before testing:** `pnpm -r run compile`
4. **Lint frequently:** Code must pass `pnpm run lint`
5. **Test specific packages:** Use `--filter` flag with pnpm commands
6. **Pre-commit hooks will run:** Prettier and ESLint automatically on commit

### Common Issues and Workarounds

- **Build failures in react-query-fetch:** Known module resolution issue, ignore if other packages compile
- **Husky pre-commit failures:** Ensure `pnpm install` was run in nix develop environment
- **Missing dependencies:** Always run commands within nix develop session
- **Git tree dirty warnings:** Expected during development, ignore unless blocking

### Validation Steps

- **Lint check:** `pnpm run lint` must pass
- **Type check:** `pnpm -r run compile` should mostly succeed
- **Example server:** `pnpm --filter @toolkit-dev/examples-backend run start` should start on port 3000

### Key Dependencies

- **Runtime:** Node.js 22, Hono 4.7, Zod 3.24, OpenAPI 3.x
- **Development:** TypeScript 5.7, ESLint 8.57, Prettier 3.3, Vitest 3.0
- **Build:** pnpm 10.x, Nix flakes, turbowatch 2.29

## Important Notes

- **Trust these instructions:** Only search for additional information if instructions are incomplete or incorrect
- **Use Nix always:** Do not bypass the Nix development environment
- **Workspace dependencies:** Packages use `workspace:*` for internal dependencies
- **ESM only:** All packages are ESM modules (`"type": "module"`)
- **Monorepo structure:** Changes may affect multiple packages, test accordingly

## For AI Coding Agents

**See `AGENTS.md` for detailed guidance on working with this repository as an AI agent.** Key points:

- Use persistent `nix develop` sessions instead of prefixing commands
- Wait for environment to load (look for `(nix:nix-shell-env)` prompt)
- Never attempt to install Nix yourself - it's provided by the hosting environment
- Use `write_bash` to send commands to the persistent session

<tool_calling>
You have the capability to call multiple tools in a single response. For maximum efficiency, whenever you need to perform multiple independent operations, ALWAYS invoke all relevant tools simultaneously rather than sequentially. Especially when exploring repository, reading files, viewing directories, validating changes or replying to comments.
</tool_calling>
