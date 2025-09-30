# Agent Development Guidelines

This document provides critical environment requirements for AI coding agents (GitHub Copilot, Cursor, Aider, Cody, etc.) working with this repository.

**For complete operational guidance** on working with this codebase (build commands, architecture, workflows), see [copilot-instructions.md](copilot-instructions.md).

## Critical Requirement: Nix Environment

This repository uses Nix for development environment management. All development tools (Node.js, pnpm, git hooks) are provided through Nix.

### Command Execution Requirement

**EVERY bash command you execute must use the `nix develop --command` prefix.**

This is not optional. It applies to:

- Package management: `pnpm install`, `pnpm run`, `npm`
- Version control: `git add`, `git commit`, `git status`
- Node.js: `node`, `npm`, `npx`
- Build tools: `tsc`, custom scripts
- File operations when they interact with the environment
- **Everything** - no exceptions

### Command Pattern

```bash
nix develop --command <your-command>
```

### Examples

```bash
# Package management
nix develop --command pnpm install
nix develop --command pnpm run dev
nix develop --command pnpm run lint

# Version control
nix develop --command git status
nix develop --command git add .
nix develop --command git commit -m "implement feature"

# TypeScript compilation
nix develop --command pnpm -r run compile

# Running specific packages
nix develop --command pnpm --filter @toolkit-dev/examples-backend run start
```

## Why This Approach Is Required

1. **Environment Isolation:** Node.js 22 and pnpm 10 are only available inside the Nix environment
2. **Git Hooks:** Husky pre-commit hooks need pnpm to run lint-staged. Without the prefix, git commits will fail
3. **Consistent Tooling:** Ensures all agents use the exact same tool versions
4. **No System Dependencies:** The host system may not have Node.js or pnpm installed

### What Happens Without the Prefix

```bash
# WRONG - Will fail - pnpm not found
pnpm install

# WRONG - Will fail - git hooks can't find pnpm
git commit -m "changes"

# CORRECT - Will succeed
nix develop --command pnpm install
nix develop --command git commit -m "changes"
```

## Environment Verification

If you encounter issues, verify the environment is working correctly:

```bash
# Check tool versions
nix develop --command node --version    # Should show v22.x.x
nix develop --command pnpm --version    # Should show 10.x.x
nix develop --command git --version     # Should work

# Test git hooks work correctly
nix develop --command bash -c "echo 'test' > test.txt"
nix develop --command git add test.txt
nix develop --command git commit -m "test commit"  # Should trigger husky hooks
nix develop --command git reset --soft HEAD~1      # Undo test commit
nix develop --command git reset HEAD test.txt      # Unstage
nix develop --command rm test.txt                  # Clean up
```

## Important Notes for AI Agents

### Do Not Install Nix

The hosting environment (GitHub Codespaces, local devcontainer, etc.) provides Nix. Never attempt to install Nix yourself.

### Remember This Pattern

Your agent must consistently remember and apply the `nix develop --command` prefix. This is the single most important requirement for working with this repository.

### Error Recovery

If you see errors like:

- "command not found: pnpm"
- "command not found: node"
- Git commit hooks failing

The solution is always: ensure you're using the `nix develop --command` prefix.

### Shell Context

You may need to enter a persistent Nix shell for interactive work:

```bash
nix develop --command bash
# Now inside Nix shell, commands work without prefix
pnpm install
git status
exit  # Leave Nix shell
```

However, for individual commands in automated workflows, always use the prefix pattern.

## Integration with Repository Workflows

The [copilot-instructions.md](./.github/copilot-instructions.md) file contains all workflow details:

- Complete build and development commands
- Package structure and architecture
- Linting and formatting requirements
- CI/CD pipeline information
- Troubleshooting guidance

This file focuses solely on the Nix environment constraint. Refer to copilot-instructions.md for everything else.

## Quick Reference

**Every command pattern:**

```bash
nix develop --command <any-command-here>
```

**No exceptions. Always use the prefix.**
