"use strict";
/**
 * Realistic Data Generator for URS Forms
 *
 * Generates valid, realistic data that will pass URS validation
 * and allow the crawler to complete the entire application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealisticDataGenerator = void 0;
class RealisticDataGenerator {
    constructor() {
        this.companyNumber = 0;
    }
    /**
     * Generate a complete set of realistic data for one application
     */
    generateCompanyData() {
        this.companyNumber++;
        const companyNames = [
            'Midwest Freight Solutions',
            'American Transport Group',
            'Pacific Logistics Corp',
            'Interstate Carriers LLC',
            'United Trucking Services',
            'National Freight Systems',
            'Continental Transport Co',
            'Alliance Logistics Group',
            'Premier Hauling Services',
            'Reliable Transport LLC'
        ];
        const streets = [
            '1234 Industrial Parkway',
            '5678 Commerce Drive',
            '9012 Highway 50',
            '3456 Logistics Lane',
            '7890 Freight Boulevard',
            '2345 Transport Avenue',
            '6789 Carrier Court',
            '1357 Trucking Way',
            '2468 Hauler Street',
            '1111 Fleet Drive'
        ];
        const cities = [
            { name: 'Chicago', state: 'IL', zip: '60601' },
            { name: 'Dallas', state: 'TX', zip: '75201' },
            { name: 'Atlanta', state: 'GA', zip: '30301' },
            { name: 'Phoenix', state: 'AZ', zip: '85001' },
            { name: 'Columbus', state: 'OH', zip: '43201' },
            { name: 'Denver', state: 'CO', zip: '80201' },
            { name: 'Memphis', state: 'TN', zip: '38101' },
            { name: 'Indianapolis', state: 'IN', zip: '46201' },
            { name: 'Kansas City', state: 'MO', zip: '64101' },
            { name: 'Nashville', state: 'TN', zip: '37201' }
        ];
        const insuranceCompanies = [
            'Progressive Commercial',
            'National Interstate Insurance',
            'Canal Insurance Company',
            'Great West Casualty',
            'Atlantic Specialty Insurance',
            'Berkley Insurance Company',
            'Continental Insurance'
        ];
        const firstNames = ['John', 'Michael', 'David', 'James', 'Robert', 'William', 'Richard', 'Thomas'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson'];
        const companyIndex = this.companyNumber % companyNames.length;
        const cityIndex = this.companyNumber % cities.length;
        const city = cities[cityIndex];
        const insuranceIndex = this.companyNumber % insuranceCompanies.length;
        const nameIndex = this.companyNumber % firstNames.length;
        // Generate realistic but fake data
        const ein = this.generateEIN();
        const ssn = this.generateSSN();
        const phone = this.generatePhoneNumber(city.state);
        return {
            legalBusinessName: `${companyNames[companyIndex]} ${this.companyNumber}`,
            dbaName: `${companyNames[companyIndex]} DBA ${this.companyNumber}`,
            einTaxId: ein,
            mailingStreet: streets[companyIndex],
            mailingCity: city.name,
            mailingState: city.state,
            mailingZip: city.zip,
            physicalStreet: streets[companyIndex],
            physicalCity: city.name,
            physicalState: city.state,
            physicalZip: city.zip,
            phone: phone,
            fax: phone.replace(/(\d{3})$/, (match) => String(parseInt(match) + 1).padStart(3, '0')),
            email: `contact@${companyNames[companyIndex].toLowerCase().replace(/\s+/g, '')}${this.companyNumber}.com`,
            principalFirstName: firstNames[nameIndex],
            principalLastName: lastNames[nameIndex],
            principalTitle: 'President',
            principalSSN: ssn,
            principalDOB: this.generateDOB(),
            yearBusinessStarted: String(2020 - (this.companyNumber % 10)),
            numberOfVehicles: String(5 + (this.companyNumber % 20)),
            numberOfDrivers: String(3 + (this.companyNumber % 15)),
            insuranceCompany: insuranceCompanies[insuranceIndex],
            policyNumber: `POL-${this.generateRandomNumber(6)}`,
            effectiveDate: this.generateDate(-30), // 30 days ago
            expirationDate: this.generateDate(335), // ~1 year from now
            grossAnnualRevenue: String(500000 + (this.companyNumber * 100000)),
            websiteUrl: `www.${companyNames[companyIndex].toLowerCase().replace(/\s+/g, '')}${this.companyNumber}.com`,
            naicsCode: '484110' // General Freight Trucking, Local
        };
    }
    /**
     * Generate realistic EIN (Employer Identification Number)
     * Format: XX-XXXXXXX
     */
    generateEIN() {
        const prefix = 10 + (this.companyNumber % 80); // EIN prefixes range from 10-99
        const suffix = this.generateRandomNumber(7);
        return `${prefix}-${suffix}`;
    }
    /**
     * Generate realistic SSN (for testing only)
     * Format: XXX-XX-XXXX
     */
    generateSSN() {
        // Use area numbers that are valid but not real
        const area = 900 + (this.companyNumber % 99); // 900-999 are not valid SSN area numbers
        const group = this.generateRandomNumber(2);
        const serial = this.generateRandomNumber(4);
        return `${area}-${group}-${serial}`;
    }
    /**
     * Generate realistic phone number
     * Format: (XXX) XXX-XXXX
     */
    generatePhoneNumber(state) {
        // Use real area codes for each state
        const areaCodes = {
            'IL': ['312', '773', '630', '847'],
            'TX': ['214', '469', '972', '817'],
            'GA': ['404', '770', '678', '470'],
            'AZ': ['602', '480', '623', '520'],
            'OH': ['614', '740', '513', '419'],
            'CO': ['303', '720', '970', '719'],
            'TN': ['615', '629', '901', '423'],
            'IN': ['317', '463', '260', '574'],
            'MO': ['816', '660', '417', '314']
        };
        const areaCode = areaCodes[state]?.[this.companyNumber % 4] || '555';
        const exchange = 200 + (this.companyNumber % 799); // Valid exchange codes
        const lineNumber = this.generateRandomNumber(4);
        return `(${areaCode}) ${exchange}-${lineNumber}`;
    }
    /**
     * Generate realistic date of birth (for adult business owner)
     */
    generateDOB() {
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - 35 - (this.companyNumber % 30); // Age 35-65
        const month = String(1 + (this.companyNumber % 12)).padStart(2, '0');
        const day = String(1 + (this.companyNumber % 28)).padStart(2, '0');
        return `${month}/${day}/${birthYear}`;
    }
    /**
     * Generate date (for insurance dates, etc.)
     */
    generateDate(daysFromNow) {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }
    /**
     * Generate random number string
     */
    generateRandomNumber(length) {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        const base = min + (this.companyNumber * 1234567) % (max - min + 1);
        return String(base).padStart(length, '0');
    }
    /**
     * Get value for a specific field based on its name/id/label
     */
    getFieldValue(fieldIdentifier, data) {
        const lower = fieldIdentifier.toLowerCase();
        // Company name fields
        if (lower.includes('legal') && lower.includes('name'))
            return data.legalBusinessName;
        if (lower.includes('dba') || lower.includes('doing business as'))
            return data.dbaName;
        if (lower.includes('business name') || lower.includes('company name'))
            return data.legalBusinessName;
        // Tax ID / EIN
        if (lower.includes('ein') || lower.includes('tax id') || lower.includes('fein'))
            return data.einTaxId;
        // Mailing Address
        if (lower.includes('mailing') && lower.includes('street'))
            return data.mailingStreet;
        if (lower.includes('mailing') && lower.includes('address'))
            return data.mailingStreet;
        if (lower.includes('mailing') && lower.includes('city'))
            return data.mailingCity;
        if (lower.includes('mailing') && lower.includes('state'))
            return data.mailingState;
        if (lower.includes('mailing') && lower.includes('zip'))
            return data.mailingZip;
        // Physical Address
        if (lower.includes('physical') && lower.includes('street'))
            return data.physicalStreet;
        if (lower.includes('physical') && lower.includes('address'))
            return data.physicalStreet;
        if (lower.includes('physical') && lower.includes('city'))
            return data.physicalCity;
        if (lower.includes('physical') && lower.includes('state'))
            return data.physicalState;
        if (lower.includes('physical') && lower.includes('zip'))
            return data.physicalZip;
        // Generic address (could be either)
        if (lower.includes('street') && !lower.includes('mailing') && !lower.includes('physical'))
            return data.physicalStreet;
        if (lower.includes('address') && !lower.includes('mailing') && !lower.includes('physical'))
            return data.physicalStreet;
        if (lower.includes('city') && !lower.includes('mailing') && !lower.includes('physical'))
            return data.physicalCity;
        if (lower.includes('state') && !lower.includes('mailing') && !lower.includes('physical'))
            return data.physicalState;
        if (lower.includes('zip') && !lower.includes('mailing') && !lower.includes('physical'))
            return data.physicalZip;
        // Contact
        if (lower.includes('phone'))
            return data.phone;
        if (lower.includes('fax'))
            return data.fax;
        if (lower.includes('email'))
            return data.email;
        if (lower.includes('website') || lower.includes('url'))
            return data.websiteUrl;
        // Principal/Owner
        if (lower.includes('first') && lower.includes('name'))
            return data.principalFirstName;
        if (lower.includes('last') && lower.includes('name'))
            return data.principalLastName;
        if (lower.includes('title') || lower.includes('position'))
            return data.principalTitle;
        if (lower.includes('ssn') || lower.includes('social security'))
            return data.principalSSN;
        if (lower.includes('date of birth') || lower.includes('dob') || lower.includes('birth date'))
            return data.principalDOB;
        // Business Details
        if (lower.includes('year') && (lower.includes('started') || lower.includes('established')))
            return data.yearBusinessStarted;
        if (lower.includes('vehicle') && lower.includes('number'))
            return data.numberOfVehicles;
        if (lower.includes('driver') && lower.includes('number'))
            return data.numberOfDrivers;
        if (lower.includes('naics'))
            return data.naicsCode;
        if (lower.includes('revenue') || lower.includes('gross annual'))
            return data.grossAnnualRevenue;
        // Insurance
        if (lower.includes('insurance') && lower.includes('company'))
            return data.insuranceCompany;
        if (lower.includes('policy') && lower.includes('number'))
            return data.policyNumber;
        if (lower.includes('effective') && lower.includes('date'))
            return data.effectiveDate;
        if (lower.includes('expiration') && lower.includes('date'))
            return data.expirationDate;
        // Generic fallbacks
        if (lower.includes('name'))
            return data.legalBusinessName;
        if (lower.includes('date'))
            return data.effectiveDate;
        if (lower.includes('number'))
            return data.policyNumber;
        // Default
        return 'Test Value';
    }
}
exports.RealisticDataGenerator = RealisticDataGenerator;
