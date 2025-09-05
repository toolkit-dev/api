# Agent Development Guidelines

This document provides specific guidance for AI coding agents working with this repository.

## Working with Nix Development Environment

This repository uses Nix for environment management. **Do not assume Nix is available** - it will be provided by the hosting environment.

## Required Approach: Nix Develop Command Prefix

**EVERY bash command you run from within this repository MUST use the `nix develop --command` prefix.** This is a requirement that you must remember and apply consistently.

### Command Pattern

```bash
# Pattern: nix develop --command <your-command>
nix develop --command pnpm install
nix develop --command pnpm run lint
nix develop --command pnpm -r run compile
nix develop --command git commit -m "changes"
nix develop --command git status
```

### Why This Approach

After testing various automation approaches, this prefix method was determined to be:
- **Most reliable:** Works consistently across all environments
- **Least hacky:** No complex workarounds or environment sourcing
- **Git hook compatible:** Ensures pnpm is available when husky runs pre-commit hooks
- **Simple to remember:** Just prefix every command with `nix develop --command`

### Example Workflow

```bash
# Install dependencies
nix develop --command pnpm install

# Compile TypeScript
nix develop --command pnpm -r run compile

# Lint code
nix develop --command pnpm run lint

# Run tests
nix develop --command pnpm run test

# Commit changes (git hooks will work correctly)
nix develop --command git add .
nix develop --command git commit -m "implement feature"
```

### Verification and Testing

Always verify the environment is working by testing commands with the required prefix:

```bash
# Test that required tools are available
nix develop --command node --version    # Should show v22.18.0
nix develop --command pnpm --version    # Should show 10.15.0
nix develop --command git --version     # Should work

# Test git hooks work
nix develop --command bash -c "echo 'test' > test.txt"
nix develop --command git add test.txt
nix develop --command git commit -m "test commit"  # Should trigger husky hooks successfully
nix develop --command git reset --soft HEAD~1     # Undo test commit
nix develop --command git reset HEAD test.txt      # Unstage test file
nix develop --command rm test.txt                  # Clean up
```

## Important Notes

- **Never install Nix yourself** - The hosting environment provides it
- **ALWAYS use the prefix** - Every single command must use `nix develop --command`
- **No exceptions** - This applies to all commands: pnpm, git, node, etc.
- **Remember this requirement** - You must consistently apply this pattern
- **Git hooks requirement** - The prefix ensures pnpm is available for husky

This approach provides reliable command execution while ensuring all tools are available in the Nix environment.