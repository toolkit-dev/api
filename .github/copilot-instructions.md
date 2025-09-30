# Copilot Instructions for toolkit-dev/api

## Repository Overview

**Toolkit** is a TypeScript library that provides everything needed to build end-to-end typesafe APIs. The slogan is "define once, and ship with confidence." It's a monorepo containing multiple packages for JSON:API and OpenAPI support, along with React Query integrations and examples.

**Key Details:**

- **Language:** TypeScript/JavaScript (ESM modules only)
- **Package Manager:** pnpm with workspaces
- **Build System:** TypeScript compiler, Nix flake for environment
- **Primary Tools:** Hono (HTTP server), Zod (validation), React Query
- **Repository Size:** ~15 packages across JSON:API, OpenAPI, React Query, and examples
- **Target Runtime:** Node.js 22

## Environment Setup

### Prerequisites

This repository requires Nix for development environment management. **If you are an AI coding agent, see [AGENTS.md](AGENTS.md) for critical requirements about command execution.**

**All commands must be prefixed with `nix develop --command`** to access the development environment. This prefix provides Node.js 22, pnpm 10, and all development tools.

**Pattern:** `nix develop --command <your-command>`

In command examples below, this prefix is shown explicitly.

### Initial Setup

1. **Start development environment:**

   ```bash
   nix develop --command bash
   ```

   - Takes 30-90 seconds on first run to download and configure environment
   - Provides all development tools

2. **Install dependencies:**

   ```bash
   nix develop --command pnpm install
   ```

   - Takes ~30-60 seconds on first run
   - Creates node_modules and sets up husky git hooks

3. **Compile TypeScript** (required before running most commands):
   ```bash
   nix develop --command pnpm -r run compile
   ```
   - Compiles all packages in dependency order

## Build & Development

### Common Commands

**Development server:**

```bash
nix develop --command pnpm run dev
```

- Runs turbowatch for file watching and auto-compilation
- Starts example backend server on http://localhost:3000
- Rebuilds on TypeScript config changes

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

**Clean build artifacts:**

```bash
nix develop --command pnpm run clean        # Clean all
nix develop --command pnpm run clean:cache  # Clean dist folders only
nix develop --command pnpm run clean:deps   # Clean node_modules only
```

**Run specific package commands:**

```bash
nix develop --command pnpm --filter @toolkit-dev/examples-backend run start
```

### Development Workflow

1. Make changes to code
2. Compile if needed: `nix develop --command pnpm -r run compile`
3. Lint frequently: `nix develop --command pnpm run lint`
4. Test specific packages using `--filter` flag with pnpm commands
5. Commit (pre-commit hooks will run Prettier and ESLint automatically)

## Project Architecture

### Package Structure

View current packages:

```bash
nix develop --command find packages -name "package.json" -exec dirname {} \;
```

**Workspace dependencies:** Packages use `workspace:*` for internal dependencies

### Key Configuration Files

- `flake.nix`: Nix development environment (Node.js 22, pnpm 10)
- `pnpm-workspace.yaml`: pnpm workspace configuration
- `tsconfig.json`: TypeScript project references and build config
- `tsconfig.options.json`: Shared TypeScript compiler options
- `eslint.config.js`: ESLint configuration using neostandard
- `lint-staged.config.js`: Pre-commit formatting and linting
- `turbowatch.ts`: File watching and development server configuration
- `.envrc`: direnv integration (loads Nix automatically)

### Development Tools

- **DevContainer:** Available at `.devcontainer/devcontainer.json` using Nix container
- **VSCode:** Settings in `.vscode/` configure Nix formatter and format-on-save
- **Pre-commit Hooks:** Husky runs lint-staged (prettier + eslint) on commits

### CI/CD Pipeline

- **GitHub Actions:** `.github/workflows/run_test.yml` (uses shared workflow)
- **Copilot Setup:** `.github/workflows/copilot-setup-steps.yml` installs Nix and dependencies
- **Renovate:** Automated dependency updates via `.github/renovate.json5`

## Troubleshooting

### Validation Commands

If you encounter issues, verify the environment with these commands:

**Check linting:**

```bash
nix develop --command pnpm run lint
```

**Check TypeScript compilation:**

```bash
nix develop --command pnpm -r run compile
```

**Verify example server:**

```bash
nix develop --command pnpm --filter @toolkit-dev/examples-backend run start
```

Server should start on port 3000.

### Common Issues

- **Command not found errors:** Ensure you're using the `nix develop --command` prefix
- **Husky pre-commit failures:** Git hooks require the Nix environment; ensure the prefix is used
- **Missing dependencies:** Run `nix develop --command pnpm install`

## For AI Coding Agents

**See [AGENTS.md](../AGENTS.md) for critical requirements about working with the Nix environment.**

Key points:

- Every command must use `nix develop --command` prefix
- This applies to all operations: pnpm, git, node, npm, etc.
- No exceptions to this requirement

<tool_calling>
You have the capability to call multiple tools in a single response. For maximum efficiency, whenever you need to perform multiple independent operations, ALWAYS invoke all relevant tools simultaneously rather than sequentially. Especially when exploring repository, reading files, viewing directories, validating changes or replying to comments.
</tool_calling>
