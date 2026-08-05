/**
 * Process company logo URL to ensure it uses https
 * @param {string} logo - The logo URL or relative path from the API
 * @returns {string} The processed https URL for the logo
 */
export const processLogoUrl = (logo) => {
  if (!logo) return logo;
  
  let logoUrl;
  if (logo.startsWith('http')) {
    logoUrl = logo;
  } else {
    // If it's a relative path, construct full URL
    const schemaName = localStorage.getItem("schema_name");
    if (schemaName && schemaName !== "public") {
      logoUrl = `https://${schemaName}.inventory.pootechnologies.tech/${logo}`;
    } else {
      logoUrl = logo;
    }
  }
  
  return logoUrl;
};

/**
 * Process company data object to ensure logo URL uses https
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
