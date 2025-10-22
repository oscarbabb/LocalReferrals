// Country codes and countries for phone number and location selection

export interface CountryCode {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: "MX", name: "México", dialCode: "+52", flag: "🇲🇽" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷" },
  { code: "BR", name: "Brasil", dialCode: "+55", flag: "🇧🇷" },
  { code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴" },
  { code: "CR", name: "Costa Rica", dialCode: "+506", flag: "🇨🇷" },
  { code: "CU", name: "Cuba", dialCode: "+53", flag: "🇨🇺" },
  { code: "EC", name: "Ecuador", dialCode: "+593", flag: "🇪🇨" },
  { code: "SV", name: "El Salvador", dialCode: "+503", flag: "🇸🇻" },
  { code: "ES", name: "España", dialCode: "+34", flag: "🇪🇸" },
  { code: "GT", name: "Guatemala", dialCode: "+502", flag: "🇬🇹" },
  { code: "HN", name: "Honduras", dialCode: "+504", flag: "🇭🇳" },
  { code: "NI", name: "Nicaragua", dialCode: "+505", flag: "🇳🇮" },
  { code: "PA", name: "Panamá", dialCode: "+507", flag: "🇵🇦" },
  { code: "PY", name: "Paraguay", dialCode: "+595", flag: "🇵🇾" },
  { code: "PE", name: "Perú", dialCode: "+51", flag: "🇵🇪" },
  { code: "PR", name: "Puerto Rico", dialCode: "+1", flag: "🇵🇷" },
  { code: "DO", name: "República Dominicana", dialCode: "+1", flag: "🇩🇴" },
  { code: "UY", name: "Uruguay", dialCode: "+598", flag: "🇺🇾" },
  { code: "VE", name: "Venezuela", dialCode: "+58", flag: "🇻🇪" },
];

export interface Country {
  code: string;
  name: string;
  nameEs: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: "MX", name: "Mexico", nameEs: "México", flag: "🇲🇽" },
  { code: "US", name: "United States", nameEs: "Estados Unidos", flag: "🇺🇸" },
  { code: "CA", name: "Canada", nameEs: "Canadá", flag: "🇨🇦" },
  { code: "AR", name: "Argentina", nameEs: "Argentina", flag: "🇦🇷" },
  { code: "BR", name: "Brazil", nameEs: "Brasil", flag: "🇧🇷" },
  { code: "CL", name: "Chile", nameEs: "Chile", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", nameEs: "Colombia", flag: "🇨🇴" },
  { code: "CR", name: "Costa Rica", nameEs: "Costa Rica", flag: "🇨🇷" },
  { code: "CU", name: "Cuba", nameEs: "Cuba", flag: "🇨🇺" },
  { code: "EC", name: "Ecuador", nameEs: "Ecuador", flag: "🇪🇨" },
  { code: "SV", name: "El Salvador", nameEs: "El Salvador", flag: "🇸🇻" },
  { code: "ES", name: "Spain", nameEs: "España", flag: "🇪🇸" },
  { code: "GT", name: "Guatemala", nameEs: "Guatemala", flag: "🇬🇹" },
  { code: "HN", name: "Honduras", nameEs: "Honduras", flag: "🇭🇳" },
  { code: "NI", name: "Nicaragua", nameEs: "Nicaragua", flag: "🇳🇮" },
  { code: "PA", name: "Panama", nameEs: "Panamá", flag: "🇵🇦" },
  { code: "PY", name: "Paraguay", nameEs: "Paraguay", flag: "🇵🇾" },
  { code: "PE", name: "Peru", nameEs: "Perú", flag: "🇵🇪" },
  { code: "PR", name: "Puerto Rico", nameEs: "Puerto Rico", flag: "🇵🇷" },
  { code: "DO", name: "Dominican Republic", nameEs: "República Dominicana", flag: "🇩🇴" },
  { code: "UY", name: "Uruguay", nameEs: "Uruguay", flag: "🇺🇾" },
  { code: "VE", name: "Venezuela", nameEs: "Venezuela", flag: "🇻🇪" },
];

// Helper function to get country code by dial code
export function getCountryByDialCode(dialCode: string): CountryCode | undefined {
  return COUNTRY_CODES.find(c => c.dialCode === dialCode);
}

// Helper function to get country by code
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}
