class BookSearchApiClient {
  constructor(apiConfig) {
    this.apiConfig = apiConfig;
    this.parsers = {
      json: this._parseJsonResponse,
      xml: this._parseXmlResponse,
    };
  }

  async getBooksByAuthor(authorName, limit) {
    return this._fetchBooks("by-author", { author: authorName, limit });
  }

  async getBooksByPublisher(publisherName, limit) {
    return this._fetchBooks("by-publisher", {
      publisher: publisherName,
      limit,
    });
  }

  async getBooksByYear(year, limit) {
    return this._fetchBooks("by-year", { year, limit });
  }

  async _fetchBooks(path, queryParams) {
    const results = [];

    for (const seller of this.apiConfig.sellers) {
      const url = new URL(`${seller.baseUrl}/${path}`);
      Object.keys(queryParams).forEach((key) =>
        url.searchParams.append(key, queryParams[key])
      );
      url.searchParams.append("format", seller.format);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `Request to ${seller.name} failed with status ${response.status}`
          );
        }

        const data =
          seller.format === "json"
            ? await response.json()
            : await response.text();
        const parsedData = this.parsers[seller.format](data);
        results.push(...parsedData);
      } catch (error) {
        console.error(`Error fetching books from ${seller.name}:`, error);
      }
    }

    return results;
  }

  _parseJsonResponse(data) {
    return data.map((item) => ({
      title: item.book.title,
      author: item.book.author,
      isbn: item.book.isbn,
      quantity: item.stock.quantity,
      price: item.stock.price,
    }));
  }

  _parseXmlResponse(data) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "application/xml");
    const items = Array.from(xmlDoc.getElementsByTagName("book"));
    return items.map((item) => ({
      title: item.getElementsByTagName("title")[0].textContent,
      author: item.getElementsByTagName("author")[0].textContent,
      isbn: item.getElementsByTagName("isbn")[0].textContent,
      quantity: item.getElementsByTagName("quantity")[0].textContent,
      price: item.getElementsByTagName("price")[0].textContent,
    }));
  }
}

module.exports = BookSearchApiClient;
