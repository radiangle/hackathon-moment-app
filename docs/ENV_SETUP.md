# Environment Variables Setup

This project uses environment variables to securely store API keys and secrets. Never commit sensitive credentials to version control.

## Setup Instructions

1. **Copy the example file:**

  ```bash
  cp .env.example .env
  ```

2. **Fill in your actual values in `.env`:**

  ```env
  VITE_SKYFLOW_VAULT_ID=your_vault_id_here
  VITE_SKYFLOW_VAULT_URL=https://your-vault-url.vault.skyflowapis-preview.com
  VITE_SKYFLOW_TABLE_NAME=persons
  VITE_SKYFLOW_ACCOUNT_ID=your_account_id_here
  VITE_SKYFLOW_BEARER_TOKEN=your_bearer_token_here
  VITE_CLAUDE_API_KEY=your_claude_api_key_here
  ```

3. **Restart your dev server** after creating/updating `.env`:

  ```bash
  npm run dev
  ```

## Important Notes

- ⚠️ **Never commit `.env` file** - It's already in `.gitignore`
- ✅ **Do commit `.env.example`** - It serves as a template for other developers
- 🔄 **Bearer tokens expire** - In production, fetch tokens from your backend API
- 🔒 **Keep secrets secure** - Use different credentials for development and production

## For Production Deployment

When deploying to Vercel or other platforms:

1. Add environment variables in your platform's dashboard
2. Use the same variable names (starting with `VITE_`)
3. Never hardcode secrets in your code

## Getting API Keys

### Claude API Key
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file as `VITE_CLAUDE_API_KEY`

**Note:** If Claude API key is not set, the app will fall back to mock summaries.

## Troubleshooting

If you see errors about missing environment variables:

- Check that `.env` file exists in the project root
- Verify all required variables are set
- Restart the dev server after changes
- Check that variable names start with `VITE_` (required for Vite)
- **Claude API**: If summaries aren't generating, check the browser console for API errors. The app will fall back to mock summaries if Claude API is unavailable.
