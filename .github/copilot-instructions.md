# Copilot Instructions for toolkit-dev/api

## Repository Overview

**Toolkit** is a TypeScript library that provides everything needed to build end-to-end typesafe APIs. The slogan is "define once, and ship with confidence." It's a monorepo containing multiple packages for JSON:API and OpenAPI support, along with React Query integrations and examples.

**Key Details:**

- **Language:** TypeScript/JavaScript (ESM modules only)
- **Package Manager:** pnpm with workspaces
- **Build System:** TypeScript compiler, Nix flake for environment
- **Primary Tools:** Hono (HTTP server), Zod (validation), React Query
- **Repository Size:** Multiple packages across JSON:API, OpenAPI, React Query, and examples
- **Target Runtime:** Node.js (see flake.nix for exact version)

## Environment Setup

### Prerequisites

This repository requires Nix for development environment management. **If you are an AI coding agent, see [AGENTS.md](AGENTS.md) for critical requirements about command execution.**

**All commands must be prefixed with `nix develop --command`** to access the development environment. This prefix provides Node.js, pnpm, and all development tools (exact versions defined in flake.nix).

**Pattern:** `nix develop --command <your-command>`

In command examples below, this prefix is shown explicitly.

**CRITICAL:** The Nix environment provides Node.js 24.x and pnpm 10.x. Without the prefix, commands will fail with "command not found" errors.

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
   nix develop --command pnpm compile
   ```
   - Compiles all packages in dependency order (~9 seconds total)
   - Must be run after clean operations

## Build & Development

### Common Commands

**Development server:**

```bash
nix develop --command pnpm run dev
```

- Runs turbowatch for file watching and auto-compilation
- Starts example backend server (port configured in example package)
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

- Uses Prettier for code formatting (~3 seconds total)
- Applied automatically on git commit via lint-staged
- Formats all file types in repository

**Clean build artifacts:**

```bash
nix develop --command pnpm run clean        # Clean all
nix develop --command pnpm run clean:cache  # Clean dist folders only (~2 seconds)
nix develop --command pnpm run clean:deps   # Clean node_modules only
```

**Run specific package commands:**

```bash
nix develop --command pnpm --filter @toolkit-dev/examples-backend run start
```

**Test all packages:**

```bash
nix develop --command pnpm test
```

- Runs vitest for all packages with tests (~4-5 seconds total)
- Currently tests 8 test cases across 5 test files

**Test specific packages:**

```bash
nix develop --command pnpm --filter @toolkit-dev/examples-backend run test
```

### Development Workflow

1. Make changes to code
2. Compile if needed: `nix develop --command pnpm compile`
3. Lint frequently: `nix develop --command pnpm run lint`
4. Test individual packages: `nix develop --command pnpm --filter <package-name> run test`
5. Run example server: `nix develop --command pnpm --filter @toolkit-dev/examples-backend run start`
6. Commit (pre-commit hooks will run Prettier and ESLint automatically)

### Common Development Patterns

**Working with specific packages:**

```bash
# Commands work from root directory using package filters
# Compile single package
nix develop --command pnpm --filter @jsonapi/types run compile

# Lint single package
nix develop --command pnpm --filter @jsonapi/types run lint
```

**Multi-package workflows:**

```bash
# Compile all packages in dependency order
nix develop --command pnpm compile

# Clean and rebuild everything
nix develop --command pnpm run clean && nix develop --command pnpm install && nix develop --command pnpm compile

# Build order is important - packages have dependencies:
# 1. configs/*, runtime/* (no dependencies)  
# 2. jsonapi/jsonapi-types, openapi/openapi-core
# 3. jsonapi/jsonapi-parser, jsonapi/jsonapi-zod, openapi/openapi-*
# 4. jsonapi/jsonapi-serializer, react-query/*
# 5. examples/* (depend on most other packages)
```

## Project Architecture

### Package Structure

View current packages:

```bash
nix develop --command find packages -name "package.json" -exec dirname {} \;
```

**Package Categories:**

- **jsonapi/**: JSON:API implementation packages (types, parser, serializer, zod integration)
- **openapi/**: OpenAPI implementation packages (core, client, server, document validation, standard schema)
- **react-query/**: React Query integrations for both JSON:API and fetch-based APIs
- **runtime/**: Core runtime utilities (error handling, etc.)
- **examples/**: Example applications (backend server, frontend client)
- **configs/**: Shared configuration packages (ESLint, TypeScript, Vite)

**Workspace dependencies:** Packages use `workspace:*` for internal dependencies

### Specific Package Details

**Core packages by type:**
- **@jsonapi/types** - Base JSON:API TypeScript types
- **@jsonapi/parser** - JSON:API document parsing
- **@jsonapi/serializer** - JSON:API document serialization  
- **@jsonapi/zod** - Zod integration for JSON:API validation
- **@toolkit-dev/openapi-core** - Core OpenAPI utilities
- **@toolkit-dev/openapi-server-hono** - Hono server integration
- **@toolkit-dev/openapi-client-fetch** - Fetch-based client
- **@toolkit-dev/openapi-document-zod** - OpenAPI document validation
- **@toolkit-dev/react-query-jsonapi** - React Query + JSON:API
- **@toolkit-dev/react-query-fetch** - React Query + fetch client

**Examples:**
- **@toolkit-dev/examples-backend** - Demo Hono server (port 3000)
- **@toolkit-dev/examples-frontend** - Demo React frontend

### Key Configuration Files

- `flake.nix`: Nix development environment (Node.js, pnpm, and tools)
- `pnpm-workspace.yaml`: pnpm workspace configuration
- `tsconfig.json`: TypeScript project references and build config
- `eslint.config.js`: ESLint configuration using neostandard
- `lint-staged.config.js`: Pre-commit formatting and linting
- `turbowatch.ts`: File watching and development server configuration (auto-compiles on changes)
- `.envrc`: direnv integration (loads Nix automatically)
- `commitlint.config.js`: Enforces conventional commit message format
- `.editorconfig`: Code style configuration (2 spaces, LF, UTF-8)

### Development Tools

- **VSCode:** Settings in `.vscode/` configure Nix formatter and format-on-save
- **Pre-commit Hooks:** Husky runs lint-staged (prettier + eslint) on commits
- **Commit linting:** Enforces conventional commit messages via commitlint
- **DevContainer:** Available at `.devcontainer/devcontainer.json` for containerized development

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
nix develop --command pnpm compile
```

**Verify example server:**

```bash
nix develop --command pnpm dev
```

Server should start on port 3000.

### Common Issues

- **Command not found errors:** Ensure you're using the `nix develop --command` prefix
- **Husky pre-commit failures:** Git hooks require the Nix environment; ensure the prefix is used
- **Missing dependencies:** Run `nix develop --command pnpm install`
- **Commit message format errors:** Use conventional commit format (feat:, fix:, chore:, etc.)
- **Git hooks taking time:** Pre-commit hooks run prettier + eslint and can take 30-60 seconds

### Command Timing Reference

**Critical timing information for CI/CD and development:**

- **Initial Nix environment setup:** 30-90 seconds (first time only)
- **Dependency installation:** 30-60 seconds (`pnpm install`)
- **TypeScript compilation:** ~9 seconds (`pnpm compile`)
- **Linting:** ~1-2 seconds (`pnpm run lint`)
- **Formatting:** ~3 seconds (`pnpm run format`)
- **Testing:** ~4-5 seconds (`pnpm test`)
- **Cleaning build cache:** ~2 seconds (`pnpm run clean:cache`)
- **Git commit with hooks:** 30-60 seconds (includes lint-staged)

### Environment Validation

**To verify environment is working correctly:**

```bash
# Check tool versions (Node.js 24.x, pnpm 10.x expected)
nix develop --command node --version
nix develop --command pnpm --version

# Test complete build cycle
nix develop --command pnpm run clean:cache
nix develop --command pnpm compile
nix develop --command pnpm run lint
nix develop --command pnpm test

# Test git hooks work correctly
nix develop --command git status
nix develop --command git add . 
nix develop --command git commit -m "test: verify hooks" --dry-run
```

## For AI Coding Agents

**See [AGENTS.md](../AGENTS.md) for critical requirements about working with the Nix environment.**

Key points:

- Every command must use `nix develop --command` prefix
- This applies to all operations: pnpm, git, node, npm, etc.
- No exceptions to this requirement

## Recommended Development Workflows

### Making Code Changes

1. **Start development server (optional):**
   ```bash
   nix develop --command pnpm dev
   ```
   - Auto-compiles on file changes
   - Starts backend server on port 3000

2. **Make changes to source files**

3. **Validate changes:**
   ```bash
   nix develop --command pnpm compile
   nix develop --command pnpm run lint
   nix develop --command pnpm test
   ```

4. **Commit changes:**
   ```bash
   nix develop --command git add .
   nix develop --command git commit -m "feat: describe your change"
   ```

### Adding New Dependencies

1. **Add to appropriate package.json:**
   ```bash
   nix develop --command pnpm --filter <package-name> add <dependency>
   ```

2. **Install and rebuild:**
   ```bash
   nix develop --command pnpm install
   nix develop --command pnpm compile
   ```

### Debugging Build Issues

1. **Check for TypeScript errors:**
   ```bash
   nix develop --command pnpm compile --verbose
   ```

2. **Check individual package:**
   ```bash
   nix develop --command pnpm --filter <package-name> run compile
   ```

3. **Clean and restart:**
   ```bash
   nix develop --command pnpm run clean:cache
   nix develop --command pnpm compile
   ```

**Remember:** Always use the `nix develop --command` prefix. This is the most common source of errors for new contributors.

<tool_calling>
You have the capability to call multiple tools in a single response. For maximum efficiency, whenever you need to perform multiple independent operations, ALWAYS invoke all relevant tools simultaneously rather than sequentially. Especially when exploring repository, reading files, viewing directories, validating changes or replying to comments.
</tool_calling>
