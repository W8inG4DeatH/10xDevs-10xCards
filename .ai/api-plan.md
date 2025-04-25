# REST API Plan

## 1. Resources

- **Users**

  - Corresponds to the `users` table (managed largely by Supabase Auth).
  - Main attributes: `id`, `email`, `password`, `created_at`, `updated_at`.

- **Flashcards**

  - Corresponds to the `flashcards` table.
  - Main attributes: `id`, `user_id`, `front`, `back`, `source`, `status`, `created_at`, `updated_at`.
  - Business rules (from PRD): Flashcards can be either AI‐generated or manually created; users must be able to approve, edit, or reject flashcards.

- **Generation Sessions**
  - Corresponds to the `generation_sessions` table.
  - Main attributes: `id`, `user_id`, `session_input`, `session_output`, `created_at`, `updated_at`.
  - Business rules (from PRD): Tracks AI generation processes for flashcards. The session input is the text provided by the user and the output is the generated flashcards in JSON.

## 2. Endpoints

### Users Endpoints

_Note: User registration and login are handled by Supabase Auth. Custom user endpoints (e.g., for profile updates) can be added if needed._

- **GET /users/me**

  - **Description:** Retrieve the profile of the current authenticated user.
  - **Response:**
    ```json
    { "id": "uuid", "email": "string", "created_at": "ISO8601 timestamp", "updated_at": "ISO8601 timestamp" }
    ```
  - **Errors:** 401 Unauthorized if not authenticated.

- **PUT /users/me**
  - **Description:** Update properties of the current user (e.g., profile details).
  - **Request Payload:**
    ```json
    { "email": "string (optional)", "password": "string (optional)" }
    ```
  - **Response:** Updated user object.
  - **Errors:** 400 Bad Request, 401 Unauthorized.

### Flashcards Endpoints

- **GET /flashcards**

  - **Description:** Retrieve a paginated list of flashcards for the authenticated user. Supports filtering and sorting by creation date.
  - **Query Parameters:**
    - `page` (optional, default 1)
    - `limit` (optional, default 20)
    - `sort` (optional, e.g. `created_at`)
    - `direction` (optional, e.g. `asc` or `desc`)
  - **Response:**
    ```json
    {
      "data": [
        {
          "id": 1,
          "front": "string",
          "back": "string",
          "source": "AI | MANUAL",
          "status": "draft | approved | rejected",
          "created_at": "ISO8601 timestamp",
          "updated_at": "ISO8601 timestamp"
        }
      ],
      "page": 1,
      "limit": 20,
      "total": 100
    }
    ```
  - **Errors:** 401 Unauthorized.

- **GET /flashcards/{flashcardId}**

  - **Description:** Get details of a specific flashcard belonging to the authenticated user.
  - **Response:**
    ```json
    {
      "id": 1,
      "front": "string",
      "back": "string",
      "source": "AI | MANUAL",
      "status": "draft | approved | rejected",
      "created_at": "ISO8601 timestamp",
      "updated_at": "ISO8601 timestamp"
    }
    ```
  - **Errors:** 401 Unauthorized, 404 Not Found.

- **POST /flashcards**

  - **Description:** Create a new flashcard manually.
  - **Request Payload:**
    ```json
    {
      "front": "string",
      "back": "string",
      "source": "MANUAL", // optional; default is MANUAL
      "status": "draft" // optional; default is draft
    }
    ```
  - **Response:** Newly created flashcard object.
  - **Errors:** 400 Bad Request, 401 Unauthorized.

- **PUT /flashcards/{flashcardId}**

  - **Description:** Update an existing flashcard (e.g., editing content or approving/rejecting a suggestion).
  - **Request Payload:**
    ```json
    {
      "front": "string (optional)",
      "back": "string (optional)",
      "status": "draft | approved | rejected (optional)"
    }
    ```
  - **Response:** Updated flashcard object.
  - **Errors:** 400 Bad Request, 401 Unauthorized, 404 Not Found.

- **DELETE /flashcards/{flashcardId}**

  - **Description:** Delete an existing flashcard that belongs to the user.
  - **Response:** Status message confirming deletion.
  - **Errors:** 401 Unauthorized, 404 Not Found.

- **POST /flashcards/generate**
  - **Description:** Submits input text to generate flashcard suggestions using AI. Internally creates a new generation session and returns the proposed flashcards.
  - **Request Payload:**
    ```json
    {
      "session_input": "A large block of text containing study materials..."
    }
    ```
  - **Response:**
    ```json
    {
      "session_id": 1,
      "generated_flashcards": [
        { "front": "Generated Question 1", "back": "Generated Answer 1" },
        { "front": "Generated Question 2", "back": "Generated Answer 2" }
      ],
      "created_at": "ISO8601 timestamp"
    }
    ```
  - **Errors:** 400 Bad Request, 401 Unauthorized.

### Generation Sessions Endpoints

- **GET /generation-sessions**

  - **Description:** Retrieve a paginated list of AI generation sessions for the authenticated user.
  - **Query Parameters:** Similar to flashcards endpoint (e.g., `page`, `limit`)
  - **Response:**
    ```json
    {
      "data": [
        {
          "id": 1,
          "session_input": "Input text...",
          "session_output": {
            /* JSON result containing flashcard suggestions */
          },
          "created_at": "ISO8601 timestamp",
          "updated_at": "ISO8601 timestamp"
        }
      ],
      "page": 1,
      "limit": 20,
      "total": 10
    }
    ```
  - **Errors:** 401 Unauthorized.

- **GET /generation-sessions/{sessionId}**

  - **Description:** Get details for a specific generation session.
  - **Response:** Session details as shown above.
  - **Errors:** 401 Unauthorized, 404 Not Found.

- **POST /generation-sessions**

  - **Description:** (Optional alternative) Directly create a new generation session. This endpoint might be used internally by the `/flashcards/generate` endpoint.
  - **Request Payload:**
    ```json
    {
      "session_input": "string"
    }
    ```
  - **Response:** Newly created generation session object.
  - **Errors:** 400 Bad Request, 401 Unauthorized.

- **DELETE /generation-sessions/{sessionId}**
  - **Description:** Delete a specific generation session. (May be used for cleanup purposes.)
  - **Response:** Status message confirming deletion.
  - **Errors:** 401 Unauthorized, 404 Not Found.

## 3. Authentication and Authorization

- **Mechanism:**  
  This API will use JWT-based authentication integrated via Supabase Auth. Endpoints are protected so that only authenticated users can access and modify their own data.
- **Implementation:**
  - Clients must include the JWT token in the `Authorization` header (`Bearer <token>`).
  - The API middleware will validate the token and set the current user context.
  - Access control is reinforced by RLS policies on the database level.

## 4. Validation and Business Logic

- **Validation:**
  - Flashcards: Ensure that both `front` and `back` are provided and meet any length or formatting constraints as defined in the database schema.
  - Generation Sessions: Ensure `session_input` is provided.
- **Business Logic:**
  - **Flashcards Generation:**  
    When a user submits text to generate flashcards, the API creates a new generation session and then calls the AI service. The generated flashcards are returned for the user to approve, edit, or reject.
  - **CRUD Operations:**  
    Basic CRUD logic is applied to all endpoints. The business rules (e.g., users can only modify/deletetheir own flashcards) are enforced both through API-level validation and database-level RLS.
- **Error Handling:**  
  Standard HTTP status codes are used:
  - `400` for validation errors,
  - `401` for unauthorized access,
  - `404` for not found resources, and
  - `500` for server errors.
- **Pagination, Filtering, and Sorting:**  
  List endpoints include query parameters to support pagination (`page` and `limit`), filtering on key fields, and sorting (e.g., by `created_at`).

This API plan leverages the provided database schema, PRD features, and the technology stack (including Supabase) to ensure a secure, scalable, and efficient RESTful interface for the application.
