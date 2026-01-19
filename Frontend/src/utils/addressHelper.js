/**
 * Centralized utility to format address data into a consistent string format.
 * Handles both plain strings and address objects.
 */
export const formatAddress = (address) => {
    if (!address) return 'No address provided';

    // If it's already a string, return it
    if (typeof address === 'string') return address;

    // If it's an object, format it
    if (typeof address === 'object') {
        const {
            fullname,
            fullName,
            phone,
            addressLine,
            landmark,
            city,
            state,
            pincode
        } = address;

        const parts = [];

        const name = fullname || fullName;
        if (name) parts.push(name);
        if (addressLine) parts.push(addressLine);
        if (landmark) parts.push(landmark);
        if (city || state || pincode) {
            const locationParts = [];
            if (city) locationParts.push(city);
            if (state) locationParts.push(state);
            if (pincode) locationParts.push(pincode);
            parts.push(locationParts.join(', '));
        }
        if (phone) parts.push(`Phone: ${phone}`);

        return parts.length > 0 ? parts.join(', ') : 'Invalid address object';
    }

    return 'Invalid address format';
};
