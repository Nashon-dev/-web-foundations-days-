# Library Books REST API Design

## Resource

The resource is books.

Base URL: `https://api.example.com/books`

Each book contains an ID, title, author, publication year and ISBN.

## Endpoints

### 1. List All Books
- **Method:** GET
- **Path:** `/books`
- **Description:** Returns all books in the library.
- **Success status:** `200 OK`

### 2. Get One Book
- **Method:** GET
- **Path:** `/books/{id}`
- **Description:** Returns details of a book with the specified ID.
- **Success status:** `200 OK`

### 3. Create a Book
- **Method:** POST
- **Path:** `/books`
- **Description:** Creates a new book.
- **Example request body:**
  ```json
  {
    "title": "Things Fall Apart",
    "author": "Chinua Achebe",
    "year": 1958,
    "isbn": "9780385474542"
  }
  ```
- **Success status:** `201 Created`

### 4. Update a Book
- **Method:** PUT
- **Path:** `/books/{id}`
- **Description:** Updates an existing book.
- **Example request body:**
  ```json
  {
    "title": "Things Fall Apart",
    "author": "Chinua Achebe",
    "year": 1958,
    "isbn": "9780385474542"
  }
  ```
- **Success status:** `200 OK`

### 5. Delete a Book
- **Method:** DELETE
- **Path:** `/books/{id}`
- **Description:** Deletes a book with the specified ID.
- **Success status:** `204 No Content`

### 6. List Books by Author
- **Method:** GET
- **Path:** `/books?author=Chinua%20Achebe`
- **Description:** Returns books written by the author specified in the query parameter.
- **Success status:** `200 OK`

## Error Responses

### 400 Bad Request
- **Description:** The request contains invalid or missing information.
- **Example:** A request to create a book has no title.

Example response:
```json
{
  "error": "Title is required."
}
```

### 404 Not Found
- **Description:** The requested resource does not exist.
- **Example:** A request asks for book ID `999` when that book does not exist.

Example response:
```json
{
  "error": "Book not found."
}
