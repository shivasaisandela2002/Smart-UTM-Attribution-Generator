export interface UTMParameters {
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
}

/**
 * Sanitizes a string for use in a URL parameter.
 * Replaces spaces with hyphens, converts to lowercase, and removes special characters.
 */
export function sanitizeUTMParam(param: string): string {
  if (!param) return "";
  return param
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

/**
 * Builds a valid URL with UTM parameters.
 */
export function buildUTMUrl(params: UTMParameters): string {
  if (!params.baseUrl) return "";

  try {
    // Ensure the baseUrl has a protocol, otherwise URL() will throw an error
    let urlString = params.baseUrl.trim();
    if (!/^https?:\/\//i.test(urlString)) {
      urlString = `https://${urlString}`;
    }

    const url = new URL(urlString);

    if (params.source) url.searchParams.set("utm_source", sanitizeUTMParam(params.source));
    if (params.medium) url.searchParams.set("utm_medium", sanitizeUTMParam(params.medium));
    if (params.campaign) url.searchParams.set("utm_campaign", sanitizeUTMParam(params.campaign));
    if (params.term) url.searchParams.set("utm_term", sanitizeUTMParam(params.term));
    if (params.content) url.searchParams.set("utm_content", sanitizeUTMParam(params.content));

    return url.toString();
  } catch (error) {
    // Return empty string or handle error if base URL is invalid
    return "";
  }
}
