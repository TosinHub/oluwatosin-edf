/**
 * Interface representing a book seller's configuration.
 */
export interface Seller {
  name: string;
  baseUrl: string;
  format: ApiResponseType;
}

/**
 * Interface representing the API configuration.
 */
export interface ApiConfig {
  sellers: Seller[];
}

/**
 * Interface representing book information.
 */
export interface Book {
  title: string;
  author: string;
  isbn: string;
  quantity: number;
  price: number;
}

/**
 * Utility type for query parameters.
 */
export interface QueryParams {
  [key: string]: string | number;
}
