# Agent Development Guidelines

This document provides specific guidance for AI coding agents working with this repository.

## Working with Nix Development Environment

This repository uses Nix for environment management. **Do not assume Nix is available** - it will be provided by the hosting environment.

## Recommended Approach: Environment Sourcing

The most robust approach is to source the Nix environment variables into your current shell. This provides native command execution without session management overhead.

### Method 1: Nix Print Dev Environment (Recommended)

```bash
# Load environment once at the start of your workflow
eval "$(nix print-dev-env .)"

# Now run commands natively - no prefixes needed!
pnpm install
pnpm run lint
git commit -m "changes"  # Git hooks work perfectly
```

**Benefits:**
- ✅ **Fast and reliable:** Environment loads in 2-3 seconds vs 30-90 seconds
- ✅ **Clean command output:** No session clutter or async session management
- ✅ **Native execution:** Commands run exactly as if in a normal shell
- ✅ **Git hooks work:** pnpm is available when husky triggers pre-commit hooks
- ✅ **Platform independent:** Works reliably across different agent environments
- ✅ **Robust:** Uses official Nix command designed for this purpose

### Method 2: Direnv (Alternative)

If you prefer direnv, it's now available in the environment:

```bash
# Setup direnv hook (only needed once)
eval "$(direnv hook bash)"

# Allow this directory (if not already done)
direnv allow .

# Run commands with direnv exec
direnv exec . pnpm install
direnv exec . pnpm run lint
direnv exec . git commit -m "changes"
```

### Environment Loading Function

Create a helper function for consistent environment loading:

```bash
# Helper function for loading Nix environment
load_nix_env() {
    eval "$(nix print-dev-env .)"
    echo "Nix environment loaded - Node.js $(node --version), pnpm $(pnpm --version)"
}

# Usage
load_nix_env
pnpm install
pnpm run lint
```

## Fallback: Persistent Sessions

If environment sourcing doesn't work in your specific agent environment, fall back to persistent sessions:

```bash
# Step 1: Start persistent session
bash(async=true): nix develop

# Step 2: Wait for environment (look for (nix:nix-shell-env) prompt) 
# This takes 30-90 seconds on first run

# Step 3: Send commands to session
write_bash: pnpm install
write_bash: pnpm run lint
write_bash: git commit -m "changes"
```

## Verification and Testing

Always verify the environment is working:

```bash
# Test that required tools are available
node --version    # Should show v22.18.0
pnpm --version    # Should show 10.15.0
git --version     # Should work
npx --version     # Should work

# Test git hooks work
echo "test" > test.txt
git add test.txt
git commit -m "test commit"  # Should trigger husky hooks successfully
git reset --soft HEAD~1     # Undo test commit
git reset HEAD test.txt      # Unstage test file
rm test.txt                  # Clean up
```

## Important Notes

- **Never install Nix yourself** - The hosting environment provides it
- **Environment sourcing is preferred** - It's faster, cleaner, and more reliable
- **Use persistent sessions only as fallback** - When sourcing doesn't work
- **Test environment before proceeding** - Verify tools are available
- **Git hooks requirement** - Whichever method you use must make pnpm available for husky

This approach provides the robust, native command execution the repository requires while avoiding the complexity of session management.