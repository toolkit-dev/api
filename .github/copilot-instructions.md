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
   nix develop --command bash
   ```
   - Enters Nix shell with all tools available
   - Takes 30-90 seconds on first run to download and configure environment
   - Provides Node.js 22, pnpm 10, and all development tools

2. **Install dependencies:**
   ```bash
   nix develop --command pnpm install
   ```
   - Takes ~30-60 seconds on first run
   - Creates node_modules and sets up husky git hooks
   - Must be run with nix develop prefix

### Build Commands

**Compile TypeScript** (required before running most commands):

```bash
nix develop --command pnpm -r run compile
```

- Compiles all packages in dependency order
- Most packages compile successfully and this is expected

**Lint code:**

```bash
nix develop --command pnpm run lint
```

- Uses ESLint with neostandard config
- Must pass before commits (enforced by husky pre-commit hooks)

**Format code:**

```bash
nix develop --command pnpm run format
```

- Uses Prettier for code formatting
- Applied automatically on git commit via lint-staged

**Run tests:**

```bash
nix develop --command pnpm run test
```

- Currently returns "No tests specified" (tests are at package level)
- Individual packages may have vitest tests

**Clean build artifacts:**

```bash
nix develop --command pnpm run clean        # Clean all
nix develop --command pnpm run clean:cache  # Clean dist folders only
nix develop --command pnpm run clean:deps   # Clean node_modules only
```

### Development Workflow

**Start development server:**

```bash
nix develop --command pnpm run dev
```

- Runs turbowatch for file watching and TypeScript compilation
- Automatically starts example backend server on http://localhost:3000
- Rebuilds on TypeScript config changes

**Run specific package commands:**

```bash
nix develop --command pnpm --filter @toolkit-dev/examples-backend run start
```



## Project Architecture and Layout

### Package Structure

To see the current package structure:

```bash
nix develop --command find packages -name "package.json" -exec dirname {} \;
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

1. **Install dependencies:** `nix develop --command pnpm install`
2. **Compile before testing:** `nix develop --command pnpm -r run compile`
3. **Lint frequently:** Code must pass `nix develop --command pnpm run lint`
4. **Test specific packages:** Use `--filter` flag with pnpm commands
5. **Pre-commit hooks will run:** Prettier and ESLint automatically on commit

### Common Issues and Workarounds

- **Husky pre-commit failures:** Ensure commands use `nix develop --command` prefix
- **Missing dependencies:** Always use `nix develop --command` prefix for all commands
- **Git tree dirty warnings:** Expected during development, ignore unless blocking

### Validation Steps

- **Lint check:** `nix develop --command pnpm run lint` must pass
- **Type check:** `nix develop --command pnpm -r run compile` must pass
- **Example server:** `nix develop --command pnpm --filter @toolkit-dev/examples-backend run start` should start on port 3000



## Important Notes

- **Trust these instructions:** Only search for additional information if instructions are incomplete or incorrect
- **Use Nix always:** Do not bypass the Nix development environment
- **Workspace dependencies:** Packages use `workspace:*` for internal dependencies
- **ESM only:** All packages are ESM modules (`"type": "module"`)
- **Monorepo structure:** Changes may affect multiple packages, test accordingly

## For AI Coding Agents

**See `AGENTS.md` for detailed guidance on working with this repository as an AI agent.** Key points:

- **Required:** EVERY bash command must use `nix develop --command` prefix when working in this repository
- **No exceptions:** This applies to all commands - pnpm, git, node, npm, etc.
- **Pattern:** `nix develop --command <your-command>`
- **Git hooks compatibility:** The prefix ensures pnpm is available when husky runs pre-commit hooks
- **Remember this requirement:** You must consistently apply this pattern for reliable operation
- Never attempt to install Nix yourself - it's provided by the hosting environment

<tool_calling>
You have the capability to call multiple tools in a single response. For maximum efficiency, whenever you need to perform multiple independent operations, ALWAYS invoke all relevant tools simultaneously rather than sequentially. Especially when exploring repository, reading files, viewing directories, validating changes or replying to comments.
</tool_calling>
