# Agent Development Guidelines

This document provides specific guidance for AI coding agents working with this repository.

## Working with Nix Development Environment

This repository uses Nix for environment management. **Do not assume Nix is available** - it will be provided by the hosting environment.

### Starting a Development Session

1. **Start a persistent nix develop session:**
   ```bash
   # Use bash tool with async=true
   nix develop
   ```

2. **Wait for the environment to load:**
   - Nix develop takes 30-90 seconds to initialize on first run
   - Wait for the shell prompt to show `(nix:nix-shell-env)` prefix
   - This indicates the environment is ready with Node.js, pnpm, and all tools available

3. **Verify environment is ready:**
   ```bash
   # Send this command to verify tools are available
   echo "Environment ready" && node --version && pnpm --version
   ```

### Development Workflow

**Use persistent session for all commands:**
- Start one `nix develop` session using `bash` tool with `async=true`
- Use `write_bash` to send all subsequent commands to the same session
- This ensures pnpm, Node.js, and git hooks work correctly
- Avoids the need to prefix every command with `nix develop --command`

**Example workflow:**
```bash
# Step 1: Start persistent session
bash(async=true): nix develop

# Step 2: Wait for environment (look for (nix:nix-shell-env) prompt)
# Step 3: Install dependencies
write_bash: pnpm install

# Step 4: Run development commands
write_bash: pnpm run lint
write_bash: pnpm -r run compile
write_bash: git status
```

### Key Benefits of Persistent Sessions

- **Git hooks work correctly:** pnpm is available when git commits trigger husky hooks
- **No command prefixing:** Avoid tedious `nix develop --command` prefixes
- **Better performance:** Environment loads once, not per command
- **Interactive tools:** Supports interactive commands and debugging

### Environment Detection

The nix develop environment is ready when you see:
- Shell prompt contains `(nix:nix-shell-env)`
- Commands like `node --version` and `pnpm --version` work
- Tools like git, typescript compiler are available

### Important Notes

- **Never install Nix yourself** - The hosting environment provides it
- **Use one persistent session** - Don't start multiple nix develop sessions
- **Wait for initialization** - Give nix develop adequate time to load
- **Test environment readiness** - Verify tools are available before proceeding

This approach resolves issues with git hooks and provides a much smoother development experience.