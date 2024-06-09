import BookSearchApiClient from "./controllers/BookSearchApiClient";
import { ApiConfig } from "./types/book";

const apiConfig: ApiConfig = {
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

const client = new BookSearchApiClient(apiConfig);

(async () => {
  try {
    console.log(`Fetching books from all configured sellers`);

    const booksByShakespeare = await client.getBooksByAuthor("Shakespeare", 10);
    console.log("Books by Shakespeare:", booksByShakespeare);

    const booksByPublisher = await client.getBooksByPublisher("Penguin", 10);
    console.log("Books by Publisher:", booksByPublisher);

    const booksByYear = await client.getBooksByYear(2023, 10);
    console.log("Books by Year:", booksByYear);
  } catch (error) {
    console.error("Error:", (error as Error).message);
  }
})();
