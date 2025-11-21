/**
 * Skyflow Configuration
 * Reads from environment variables for security
 */

interface SkyflowConfig {
    vaultID: string;
    vaultURL: string;
    tableName: string;
    accountId: string;
    bearerToken: string;
}

function getEnvVar(name: string, defaultValue?: string): string {
    const value = import.meta.env[name];
    if (!value && !defaultValue) {
        console.warn(`⚠️ Missing environment variable: ${name}. Using empty string.`);
        return '';
    }
    return value || defaultValue || '';
}

export const SKYFLOW_CONFIG: SkyflowConfig = {
    vaultID: getEnvVar('VITE_SKYFLOW_VAULT_ID', 'ae78a3f75b6a4d72828c3badfa3f227c'),
    // Use proxy in development to avoid CORS issues
    vaultURL: import.meta.env.DEV 
        ? '/api/skyflow'  // Vite proxy (see vite.config.ts)
        : getEnvVar('VITE_SKYFLOW_VAULT_URL', 'https://a370a9658141.vault.skyflowapis-preview.com'),
    tableName: getEnvVar('VITE_SKYFLOW_TABLE_NAME', 'persons'),
    accountId: getEnvVar('VITE_SKYFLOW_ACCOUNT_ID', 'u81740d3215e4583b26581dd83583fa6'),
    bearerToken: getEnvVar('VITE_SKYFLOW_BEARER_TOKEN', ''),
};

// Validate configuration on load
if (!SKYFLOW_CONFIG.vaultID || !SKYFLOW_CONFIG.accountId || !SKYFLOW_CONFIG.bearerToken) {
    console.warn('⚠️ Skyflow configuration is incomplete. Please check your .env file.');
    console.warn('⚠️ The app will run but Skyflow features may not work.');
}

