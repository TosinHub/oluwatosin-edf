import BookSearchApiClient from "../src/controllers/BookSearchApiClient";
import { ApiConfig } from "../src/types/book";
import { formatUrlPath, formatResponseType } from "../src/utils/url.utils";

jest.mock("../src/utils/url.utils");
global.fetch = jest.fn();

describe("BookSearchApiClient", () => {
  let apiConfig: ApiConfig;
  let client: BookSearchApiClient;

  beforeEach(() => {
    apiConfig = {
      sellers: [
        { name: "Seller1", baseUrl: "https://api.seller1.com", format: "json" },
        { name: "Seller2", baseUrl: "https://api.seller2.com", format: "xml" },
      ],
    };
    client = new BookSearchApiClient(apiConfig);

    (formatUrlPath as jest.Mock).mockImplementation(
      (baseUrl, format, path, queryParams) => `${baseUrl}/${path}`
    );
    (formatResponseType as jest.Mock).mockImplementation((response, format) => {
      if (format === "json") {
        return response.json();
      } else if (format === "xml") {
        return response.text();
      }
      return response;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockJsonResponse = [
    {
      book: { title: "Book1", author: "Author1", isbn: "123" },
      stock: { quantity: 10, price: 20.0 },
    },
    {
      book: { title: "Book2", author: "Author2", isbn: "456" },
      stock: { quantity: 5, price: 15.0 },
    },
  ];

  const mockXmlResponse = `
    <books>
      <book>
        <title>Book3</title>
        <author>Author3</author>
        <isbn>789</isbn>
        <quantity>8</quantity>
        <price>25.0</price>
      </book>
      <book>
        <title>Book4</title>
        <author>Author4</author>
        <isbn>101</isbn>
        <quantity>2</quantity>
        <price>30.0</price>
      </book>
    </books>
  `;

  it("should fetch books by author", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockJsonResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockXmlResponse),
      });

    const books = await client.getBooksByAuthor("Author1", 10);
    expect(books).toHaveLength(4); // 2 from each seller
  });

  it("should fetch books by publisher", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockJsonResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockXmlResponse),
      });

    const books = await client.getBooksByPublisher("Publisher1", 10);
    expect(books).toHaveLength(4); // 2 from each seller
  });

  it("should fetch books by year", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockJsonResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockXmlResponse),
      });

    const books = await client.getBooksByYear(2021, 10);
    expect(books).toHaveLength(4); // 2 from each seller
  });

  it("should handle fetch error", async () => {
    (fetch as jest.Mock)
      .mockRejectedValueOnce(new Error("Fetch error"))
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockXmlResponse),
      });

    const books = await client.getBooksByAuthor("Author1", 10);
    expect(books).toHaveLength(2); // Only from the second seller
  });
});
