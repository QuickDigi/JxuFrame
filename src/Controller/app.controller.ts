import {
    Controller, Get, Post, RequestX, ResponseX
} from "../core/decorator";

let books = [
    { id: 1, title: "Atomic Habits", author: "James Clear" },
    { id: 2, title: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson" },
    { id: 3, title: "Deep Work", author: "Cal Newport" },
    { id: 4, title: "Can't Hurt Me", author: "David Goggins" },
    { id: 5, title: "Zero to One", author: "Peter Thiel" }
];

let nextId = books.length + 1;

/**
 * 📘 BooksController
 * Base Route: /books
 */
@Controller('/books')
class AppController {
    
    /**
     * GET /books
     * --------------------------------
     * 📖 Fetch all books
     *
     * ✅ Response Example:
     * [
     *   {
     *     "id": 1,
     *     "title": "Atomic Habits",
     *     "author": "James Clear"
     *   },
     *   ...
     * ]
     */
    @Get()
    getAllBooks(req: RequestX, res: ResponseX) {
        res.json(books);
    }

    /**
     * POST /books
     * --------------------------------
     * ➕ Add a new book
     *
     * 📥 Request Body:
     * {
     *   "title": "The Pragmatic Programmer",
     *   "author": "Andy Hunt & Dave Thomas"
     * }
     *
     * ❌ If title or author missing:
     * {
     *   "error": "Both title and author are required."
     * }
     *
     * ✅ Response Example:
     * {
     *   "message": "📘 Book added successfully!",
     *   "book": {
     *     "id": 6,
     *     "title": "The Pragmatic Programmer",
     *     "author": "Andy Hunt & Dave Thomas"
     *   },
     *   "total": 6
     * }
     */
    @Post()
    addBook(req: RequestX, res: ResponseX) {
        const { title, author } = req.body;

        if (!title || !author) {
            return res.status(400).json({ error: "Both title and author are required." });
        }

        const newBook = {
            id: nextId++,
            title,
            author
        };

        books.push(newBook);

        res.json({
            message: `📘 Book added successfully!`,
            book: newBook,
            total: books.length
        });
    }
}

export { AppController };
