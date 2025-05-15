# GitHub Actions Setup for Vercel Deployment

This guide explains how to set up GitHub Actions to automatically deploy your LifeNavigator app to Vercel.

## Required Secrets for GitHub Actions

To enable automatic deployments to Vercel, you need to add the following secrets to your GitHub repository:

### Step 1: Get Vercel Credentials

1. Install the Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Link your project: `vercel link` (if already deployed once to Vercel)
4. Get your tokens by running:
   ```bash
   vercel project ls
   # Note the project ID
   
   vercel whoami
   # Note the team ID (or user ID if not in a team)
   ```
5. Generate a Vercel token:
   - Go to https://vercel.com/account/tokens
   - Create a new token with a description like "GitHub Actions"
   - Copy the token

### Step 2: Add Secrets to GitHub Repository

1. Go to your GitHub repository
2. Click on "Settings" tab
3. In the left sidebar, click on "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add the following secrets:

   | Name | Value |
   |------|-------|
   | `VERCEL_TOKEN` | The token you created in Vercel |
   | `VERCEL_ORG_ID` | Your team ID (or user ID) from `vercel whoami` |
   | `VERCEL_PROJECT_ID` | Your project ID from `vercel project ls` |

### Step 3: Configure Additional Environment Variables (Optional)

If you need specific environment variables for your production deployment, add them in:

1. The Vercel dashboard under your project settings
2. Or as GitHub repository secrets with a prefix like `VERCEL_ENV_` if you want to pass them through the workflow

## The GitHub Actions Workflow

The workflow in `.github/workflows/vercel-deploy.yml` performs these steps:

1. **For all PRs and pushes to main:**
   - Runs linting and type checking
   - Executes tests to ensure quality

2. **For Pull Requests:**
   - Deploys a preview environment to Vercel
   - Adds a comment to the PR with the deployment URL

3. **For Pushes to main:**
   - Deploys to the production environment on Vercel

## Manual Deployments

You can also trigger a manual deployment:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Deploy to Vercel" workflow
3. Click "Run workflow"
4. Choose the branch to deploy
5. Click "Run workflow" button

## Verifying the Setup

To verify your GitHub Actions setup is working correctly:

1. Make a small change to your codebase
2. Create a pull request
3. Check that the workflow runs and deploys a preview
4. Merge the PR to main and verify the production deployment

## Troubleshooting

If deployments fail, check:

1. **GitHub Actions Log:** Look for specific error messages
2. **Vercel Settings:** Ensure your project is correctly configured in Vercel
3. **Secrets:** Verify all required secrets are set correctly
4. **Vercel Dashboard:** Check for deployment issues on the Vercel side

## Security Notes

- Store sensitive environment variables in Vercel's environment variables section
- GitHub repository secrets are encrypted and only exposed during workflow runs
- Regularly rotate your Vercel tokens