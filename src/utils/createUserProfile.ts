/**
 * Create and insert a mock user profile into Skyflow
 * Uses only fields defined in the vault schema
 */

import { SKYFLOW_CONFIG } from '../config/skyflow';

export interface UserProfileData {
    date_of_birth: string;
    nationality: string;
    gender?: string;
    race?: string;
    ethnicity?: string;
    religion?: string;
    preferred_language?: string;
    marital_status?: string;
    name?: {
        prefix?: string;
        first_name?: string;
        middle_name?: string;
        last_name?: string;
        suffix?: string;
        use?: string;
    };
    addresses?: {
        full_name?: string;
        use?: string;
        line_1?: string;
        line_2?: string;
        city?: string;
        district?: string;
        state?: string;
        country?: string;
        zip_code?: string;
        latitude?: number;
        longitude?: number;
        address_type?: string;
    };
    phone_numbers?: {
        value?: string;
        type?: string;
    };
    emails?: {
        value?: string;
        type?: string;
    };
}

/**
 * Creates a sample mock user profile matching the schema
 */
export function createMockUserProfile(): UserProfileData {
    return {
        date_of_birth: '1995-01-01',
        nationality: 'vietnam',
        gender: 'FEMALE',
        race: 'ASIAN',
        ethnicity: 'NOT_HISPANIC_OR_LATINO',
        religion: 'CHRISTIAN_NON_CATHOLIC_OR_NON_SPECIFIC',
        preferred_language: 'ENGLISH_LANGUAGE',
        marital_status: 'MARRIED',
        name: {
            prefix: 'Mr.',
            first_name: 'Henry',
            last_name: 'Mai',
            suffix: '',
            use: 'USUAL'
        },
        addresses: {
            full_name: 'Jane Doe',
            use: 'HOME',
            line_1: '123 Main Street',
            line_2: 'Apt 4B',
            city: 'San Francisco',
            district: 'San Francisco County',
            state: 'CA',
            country: 'UNITED_STATES',
            zip_code: '94102',
            address_type: 'BOTH'
        },
        phone_numbers: {
            value: '+1-415-555-0123',
            type: 'MOBILE'
        },
        emails: {
            value: 'jane.doe@example.com',
            type: 'PERSONAL'
        }
    };
}

/**
 * Inserts a mock user profile into Skyflow
 */
export async function insertMockUserProfile(profile?: Partial<UserProfileData>) {
    const profileData = { ...createMockUserProfile(), ...profile };
    
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
                        fields: profileData
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
        console.log('✅ Mock user profile created successfully:', result);
        return result.records[0];
    } catch (error) {
        console.error('Failed to insert mock user profile:', error);
        throw error;
    }
}

