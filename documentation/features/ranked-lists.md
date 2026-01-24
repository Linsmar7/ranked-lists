# Ranked Lists Feature

## Overview
This feature allows authenticated users to create, manage, and view ranked lists (e.g., "Top 10 Movies", "Best Burgers").

## technical Implementation

### Database Schema
The feature uses two main tables defined in `packages/db/src/schema/ranked-lists.ts`:

1.  **lists**: Stores the metadata of the list (title, description, owner).
    -   `id`: UUID
    -   `userId`: Foreign key to `user` table.
    -   `title`: String
    -   `description`: String
    -   `category`: String (optional taxonomy)

2.  **list_items**: Stores the individual ranked items.
    -   `id`: UUID
    -   `listId`: Foreign key to `lists` table.
    -   `name`: Item name.
    -   `rank`: Integer position (1-based or 0-based).
    -   `description`: Optional comment.
    -   `imageUrl`: Optional image.

### API (tRPC)
The `lists` router (`packages/api/src/routers/lists.ts`) exposes the following procedures:
-   `create`: Protected mutation. Accepts list details and an array of items.
-   `getAll`: Public/Protected query. Fetches lists.
-   `getById`: Public query. Fetches list and items by ID.
-   `delete`: Protected mutation. Deletes a list (and cascading items).

### Frontend (TanStack Router)
Routes:
-   `/lists`: List of all lists.
-   `/lists/create`: Form to create a new list.
-   `/lists/$listId`: View a specific list.

## Usage
1.  Log in.
2.  Go to "Create List".
3.  Enter a title and add items.
4.  Save.
