/**
 * Mock Profile Data for Skyflow
 * Creates sample data that matches Skyflow schema requirements
 */

export interface MockProfile {
    date_of_birth: string;
    nationality: string;
    identifiers_skyflow_id?: string;
    contacts_skyflow_id?: string[];
}

/**
 * Creates a mock profile with valid Skyflow data
 */
export function createMockProfile(overrides?: Partial<MockProfile>): MockProfile {
    const today = new Date().toISOString().split('T')[0];
    
    return {
        date_of_birth: today,
        nationality: 'vietnam', // Must be a valid predefined value
        identifiers_skyflow_id: 'mock-identifier-12345',
        contacts_skyflow_id: ['contact-1', 'contact-2'],
        ...overrides
    };
}

/**
 * Valid nationality values for Skyflow (based on common values)
 */
export const VALID_NATIONALITIES = [
    'vietnam',
    'CANADIAN',
    'BRITISH',
    'AUSTRALIAN',
    'GERMAN',
    'FRENCH',
    'SPANISH',
    'ITALIAN',
    'JAPANESE',
    'CHINESE',
    'INDIAN',
    'BRAZILIAN',
    'MEXICAN',
] as const;

export type ValidNationality = typeof VALID_NATIONALITIES[number];

/**
 * Creates multiple mock profiles for testing
 */
export function createMockProfiles(count: number = 3): MockProfile[] {
    const profiles: MockProfile[] = [];
    const nationalities: ValidNationality[] = ['vietnam', 'CANADIAN', 'BRITISH'];
    
    for (let i = 0; i < count; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        profiles.push({
            date_of_birth: date.toISOString().split('T')[0],
            nationality: nationalities[i % nationalities.length],
            identifiers_skyflow_id: `mock-id-${i + 1}`,
            contacts_skyflow_id: [`contact-${i + 1}-a`, `contact-${i + 1}-b`],
        });
    }
    
    return profiles;
}

