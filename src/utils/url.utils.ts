/**
 * Formats a URL path with the given parameters.
 *
 * @param {string} baseUrl - The base URL.
 * @param {ApiResponseType} format - The response format (e.g., "json" or "xml").
 * @param {string} path - The API path.
 * @param {Record<string, any>} queryParams - The query parameters.
 * @returns {URL} - The formatted URL with appended query parameters.
 */
export const formatUrlPath = (
  baseUrl: string,
  format: ApiResponseType,
  path: string,
  queryParams: Record<string, any>
): URL => {
  const url = new URL(`${baseUrl}/${path}`);
  Object.keys(queryParams).forEach((key) =>
    url.searchParams.append(key, queryParams[key])
  );
  url.searchParams.append("format", format);
  return url;
};

/**
 * Formats the response based on the specified response format.
 *
 * @param {Response} response - The fetch API response object.
 * @param {ApiResponseType} format - The response format (e.g., "json" or "xml").
 * @returns {Promise<string | any>} - A promise that resolves to the formatted response data.
 */
export const formatResponseType = async (
  response: Response,
  format: ApiResponseType
): Promise<string | any> => {
  if (format === "xml") {
    return response.text();
  }
  return response.json();
};
