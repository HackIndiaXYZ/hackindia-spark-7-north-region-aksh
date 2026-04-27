import axios from "axios"

export const verifyIPLocation = async (ip,claimedLocation) => {
    try {
        const response = await axios.get(`https://ipinfo.io/${ip}/json`);
        console.log("Verification started");
        if(response) {
            const claimedLocationLower = claimedLocation.toLowerCase();
            const actualCity = response.data.city.toLowerCase();
            const actualCountryCode = response.data.country.toLowerCase();
            
            // Map common country codes to names
            const countryMap = {
                'in': ['india', 'in'],
                'us': ['usa', 'united states', 'us'],
                'gb': ['uk', 'united kingdom', 'gb', 'london'],
                'sg': ['singapore', 'sg'],
                'de': ['germany', 'de', 'deutschland'],
                'fr': ['france', 'fr'],
                'au': ['australia', 'au'],
                'jp': ['japan', 'jp']
            };

            const countrySynonyms = countryMap[actualCountryCode] || [actualCountryCode];

            console.log(`Actual city : ${actualCity}`);
            console.log(`Actual country code : ${actualCountryCode}`);

            // Split claimed location into words for precise matching
            const claimedWords = claimedLocationLower.split(/[,\s]+/).map(w => w.trim());

            // 1. Check City Match (Neighborhood or City)
            const cityMatch = claimedWords.some(word => word === actualCity || actualCity.includes(word) || word.includes(actualCity));
            
            // 2. Check Country Match (Code or Name)
            const countryMatch = claimedWords.some(word => countrySynonyms.includes(word));

            const finalResult = cityMatch || countryMatch;
            
            if (finalResult) {
                console.log(`[VERIFY] Location check PASSED (City: ${cityMatch}, Country: ${countryMatch})`);
            } else {
                console.log(`[VERIFY] Location check FAILED (City: ${cityMatch}, Country: ${countryMatch})`);
            }

            console.log("Verification completed");
            return finalResult;
        }
        return false;
    } catch(err) {
        console.error("IP verification error : " , err);
        return false;
    }
}