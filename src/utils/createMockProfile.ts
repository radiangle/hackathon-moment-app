/**
 * Utility to create and insert mock profiles into Skyflow
 * This can be used for testing and development
 */

import { SKYFLOW_CONFIG } from '../config/skyflow';
import { createMockProfile, VALID_NATIONALITIES } from './mockProfile';

/**
 * Creates and inserts a mock profile into Skyflow
 */
export async function insertMockProfile(profile?: Partial<{
    date_of_birth: string;
    nationality: string;
    identifiers_skyflow_id: string;
    contacts_skyflow_id: string[];
}>) {
    const mockProfile = createMockProfile(profile);
    
    try {
        const response = await fetch(
            `${SKYFLOW_CONFIG.vaultURL}/v1/vaults/${SKYFLOW_CONFIG.vaultID}/${SKYFLOW_CONFIG.tableName}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SKYFLOW_CONFIG.bearerToken}`,
                    'Content-Type': 'application/json',
                    'X-SKYFLOW-ACCOUNT-ID': SKYFLOW_CONFIG.accountId
                },
                mode: 'cors',
                body: JSON.stringify({
                    records: [{
                        fields: mockProfile
                    }],
                    tokenization: true
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Skyflow API error (${response.status}): ${errorText}`;
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.error?.message) {
                    errorMessage = `Skyflow API error: ${errorJson.error.message}`;
                }
            } catch {
                // Use the text error if JSON parsing fails
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        return result.records[0];
    } catch (error) {
        console.error('Failed to insert mock profile:', error);
        throw error;
    }
}

/**
 * Example usage function - can be called from browser console
 */
export async function createSampleMockProfile() {
    const sampleProfile = {
        date_of_birth: '1990-01-15',
        nationality: 'AMERICAN',
        identifiers_skyflow_id: 'sample-profile-123',
        contacts_skyflow_id: ['contact-abc-123', 'contact-xyz-789']
    };
    
    console.log('Creating mock profile:', sampleProfile);
    const result = await insertMockProfile(sampleProfile);
    console.log('✅ Mock profile created successfully:', result);
    return result;
}

// Export valid nationalities for reference
export { VALID_NATIONALITIES };

