/**
 * Process company logo URL to ensure it uses https and includes a cache-busting query parameter
 * @param {string} logo - The logo URL or relative path from the API
 * @returns {string} The processed https URL for the logo with cache-buster parameter
 */
export const processLogoUrl = (logo) => {
  if (!logo) return logo;
  
  let logoUrl;
  if (logo.startsWith('http')) {
    // Force http:// to https:// to fix mixed content errors
    logoUrl = logo.replace(/^http:\/\//i, 'https://');
  } else {
    // If it's a relative path, construct full URL
    const schemaName = localStorage.getItem("schema_name");
    if (schemaName && schemaName !== "public") {
      logoUrl = `https://${schemaName}.inventory.pootechnologies.tech/${logo}`;
    } else {
      logoUrl = logo;
    }
  }
  
  try {
    // Parse the URL string into a URL object
    const urlObj = new URL(logoUrl);
    
    // Add the cache-busting parameter, matching your axios-style key "_"
    urlObj.searchParams.set('_', new Date().getTime().toString());
    
    return urlObj.toString();
  } catch (error) {
    // Fallback if logoUrl is not a valid absolute URL structure
    const separator = logoUrl.includes('?') ? '&' : '?';
    return `${logoUrl}${separator}_=${new Date().getTime()}`;
  }
};

/**
 * Process company data object to ensure logo URL uses https and bypasses cache
 * @param {object} companyData - The company data object from the API
 * @returns {object} The processed company data with https logo URL
 */
export const processCompanyDataLogo = (companyData) => {
  if (!companyData) return companyData;
  
  const processedData = { ...companyData };
  if (processedData.logo) {
    processedData.logo = processLogoUrl(processedData.logo);
  }
  
  return processedData;
};
