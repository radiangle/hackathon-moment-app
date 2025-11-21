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

## Troubleshooting

If you see errors about missing environment variables:

- Check that `.env` file exists in the project root
- Verify all required variables are set
- Restart the dev server after changes
- Check that variable names start with `VITE_` (required for Vite)
