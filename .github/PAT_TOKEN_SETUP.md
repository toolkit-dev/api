# PAT_TOKEN Setup for Daily Documentation Review

The `run_documentation_review.yml` workflow requires a Personal Access Token (PAT) to use the `gh agent-task create` command, as this command currently requires OAuth authentication and cannot use the standard `GITHUB_TOKEN`.

## Setup Instructions

1. Create a Personal Access Token with the following permissions:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
   - `write:discussion` (Write access to discussions)

2. Add the token as a repository secret:
   - Go to repository Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Name: `PAT_TOKEN`
   - Value: Your generated PAT

## Background

The GitHub CLI `gh agent-task create` command currently requires OAuth authentication due to security restrictions. This is a known limitation tracked in [GitHub CLI issue #11845](https://github.com/cli/cli/issues/11845).

The workflow is configured to:
1. First try to use `PAT_TOKEN` if available
2. Fallback to `GITHUB_TOKEN` (which will likely fail with auth error)

## Alternative Solutions

If setting up a PAT is not feasible, consider:
- Using a GitHub App with appropriate permissions
- Manually triggering the documentation review process
- Converting the workflow to use alternative GitHub API calls that work with `GITHUB_TOKEN`