const fetchMock = require("jest-fetch-mock");
const BookSearchApiClient = require("../src/BookSearchApiClient");

fetchMock.enableMocks();

describe("BookSearchApiClient", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  const apiConfig = {
    sellers: [
      {
        name: "BookSeller1",
        baseUrl: "http://api.book-seller1-example.com",
        format: "json",
      },
      {
        name: "BookSeller2",
        baseUrl: "http://api.book-seller2-example.com",
        format: "xml",
      },
    ],
  };

  it("fetches books by author from JSON API", async () => {
    fetch.mockResponseOnce(
      JSON.stringify([
        {
          book: { title: "Title1", author: "Author1", isbn: "ISBN1" },
          stock: { quantity: 10, price: 15.99 },
        },
      ])
    );

    const client = new BookSearchApiClient(apiConfig);
    const books = await client.getBooksByAuthor("Author1", 1);

    expect(books).toEqual([
      {
        title: "Title1",
        author: "Author1",
        isbn: "ISBN1",
        quantity: 10,
        price: 15.99,
      },
    ]);
  });

  it("fetches books by author from XML API", async () => {
    const xmlResponse = `
      <books>
        <book>
          <book>
            <title>Title1</title>
            <author>Author1</author>
            <isbn>ISBN1</isbn>
          </book>
          <stock>
            <quantity>10</quantity>
            <price>15.99</price>
          </stock>
        </book>
      </books>`;
    fetch.mockResponseOnce(xmlResponse);

    const client = new BookSearchApiClient(apiConfig);
    const books = await client.getBooksByAuthor("Author1", 1);

    expect(books).toEqual([
      {
        title: "Title1",
        author: "Author1",
        isbn: "ISBN1",
        quantity: 10,
        price: 15.99,
      },
    ]);
  });

  it("handles network errors gracefully", async () => {
    fetch.mockRejectOnce(new Error("Network Error"));

    const client = new BookSearchApiClient(apiConfig);

    await expect(client.getBooksByAuthor("Author1", 1)).rejects.toThrow(
      "Error fetching books: Network Error"
    );
  });

  it("handles non-200 HTTP status codes", async () => {
    fetch.mockResponseOnce("", { status: 404 });

    const client = new BookSearchApiClient(apiConfig);

    await expect(client.getBooksByAuthor("Author1", 1)).rejects.toThrow(
      "Request to BookSeller1 failed with status 404"
    );
  });

  it("handles malformed JSON responses", async () => {
    fetch.mockResponseOnce("Invalid JSON", { status: 200 });

    const client = new BookSearchApiClient(apiConfig);

    await expect(client.getBooksByAuthor("Author1", 1)).rejects.toThrow(
      "Error fetching books: Unexpected token I in JSON at position 0"
    );
  });

  it("handles malformed XML responses", async () => {
    const xmlResponse = `<books><book><title>Title1</title></book></books`;
    fetch.mockResponseOnce(xmlResponse, { status: 200 });

    const client = new BookSearchApiClient(apiConfig);

    await expect(client.getBooksByAuthor("Author1", 1)).rejects.toThrow();
  });

  it("handles empty responses", async () => {
    fetch.mockResponseOnce(JSON.stringify([]));

    const client = new BookSearchApiClient(apiConfig);
    const books = await client.getBooksByAuthor("Author1", 1);

    expect(books).toEqual([]);
  });
});
