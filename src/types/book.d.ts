/**
 * Interface representing a book seller's configuration.
 */
interface Seller {
  name: string;
  baseUrl: string;
  format: ApiResponseType;
}

/**
 * Interface representing the API configuration.
 */
interface ApiConfig {
  sellers: Seller[];
}

/**
 * Interface representing book information.
 */
interface Book {
  title: string;
  author: string;
  isbn: string;
  quantity: number;
  price: number;
}

/**
 * Utility type for query parameters.
 */
interface QueryParams {
  [key: string]: string | number;
}
