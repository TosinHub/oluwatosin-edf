import { formatUrlPath, formatResponseType } from "../utils/url.utils";

/**
 * Class representing a client for searching books.
 *
 * @class BookSearchApiClient
 */
class BookSearchApiClient {
  private apiConfig: ApiConfig;
  private parsers: { [key in ApiResponseType]: (data: any) => Book[] };

  /**
   * Creates an instance of BookSearchApiClient.
   *
   * @param {ApiConfig} apiConfig - The API configuration.
   */
  constructor(apiConfig: ApiConfig) {
    this.apiConfig = apiConfig;
    this.parsers = {
      json: this.parseJsonResponse.bind(this),
      xml: this.parseXmlResponse.bind(this),
    };
  }

  /**
   * Fetches books by author.
   *
   * @param {string} authorName - The name of the author.
   * @param {number} limit - The maximum number of books to fetch.
   * @returns {Promise<Book[]>} - A promise that resolves to an array of books.
   */
  async getBooksByAuthor(authorName: string, limit: number): Promise<Book[]> {
    return this.fetchBooks("by-author", { author: authorName, limit });
  }

  /**
   * Fetches books by publisher.
   *
   * @param {string} publisherName - The name of the publisher.
   * @param {number} limit - The maximum number of books to fetch.
   * @returns {Promise<Book[]>} - A promise that resolves to an array of books.
   */
  async getBooksByPublisher(
    publisherName: string,
    limit: number
  ): Promise<Book[]> {
    return this.fetchBooks("by-publisher", {
      publisher: publisherName,
      limit,
    });
  }

  /**
   * Fetches books by year.
   *
   * @param {number} year - The year of publication.
   * @param {number} limit - The maximum number of books to fetch.
   * @returns {Promise<Book[]>} - A promise that resolves to an array of books.
   */
  async getBooksByYear(year: number, limit: number): Promise<Book[]> {
    return this.fetchBooks("by-year", { year, limit });
  }

  /**
   * Fetches books from the configured sellers based on the specified path and query parameters.
   *
   * @private
   * @param {string} path - The API path.
   * @param {QueryParams} queryParams - The query parameters.
   * @returns {Promise<Book[]>} - A promise that resolves to an array of books.
   */
  private async fetchBooks(
    path: string,
    queryParams: QueryParams
  ): Promise<Book[]> {
    const results: Book[] = [];

    for (const seller of this.apiConfig.sellers) {
      const url = formatUrlPath(
        seller.baseUrl,
        seller.format,
        path,
        queryParams
      );

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `Request to ${seller.name} failed with status ${response.status}`
          );
        }

        const data = await formatResponseType(response, seller.format);
        const parsedData = this.parsers[seller.format](data);
        results.push(...parsedData);
      } catch (error) {
        console.error(`Error fetching books from ${seller.name}:`, error);
      }
    }

    return results;
  }

  /**
   * Parses a JSON response into an array of books.
   *
   * @private
   * @param {any} data - The JSON data.
   * @returns {Book[]} - An array of books.
   */
  private parseJsonResponse(data: any): Book[] {
    return data.map((item: any) => ({
      title: item.book.title,
      author: item.book.author,
      isbn: item.book.isbn,
      quantity: item.stock.quantity,
      price: item.stock.price,
    }));
  }

  /**
   * Parses an XML response into an array of books.
   *
   * @private
   * @param {string} data - The XML data as a string.
   * @returns {Book[]} - An array of books.
   */
  private parseXmlResponse(data: string): Book[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "application/xml");
    const items = Array.from(xmlDoc.getElementsByTagName("book"));
    return items.map((item) => ({
      title: item.getElementsByTagName("title")[0].textContent || "",
      author: item.getElementsByTagName("author")[0].textContent || "",
      isbn: item.getElementsByTagName("isbn")[0].textContent || "",
      quantity: parseInt(
        item.getElementsByTagName("quantity")[0].textContent || "0",
        10
      ),
      price: parseFloat(
        item.getElementsByTagName("price")[0].textContent || "0"
      ),
    }));
  }
}

export default BookSearchApiClient;
