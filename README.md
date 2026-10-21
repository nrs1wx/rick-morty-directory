# Rick and Morty Characters — React SPA (Midterm Project)

A character directory built with React + Vite. Data comes from the public
[Rick and Morty API](https://rickandmortyapi.com/documentation) (826 characters).

**Live demo:** https://rick-morty-directory.vercel.app/

## Features
- List view (cards) and a separate detail page (`/character/:id`) with React Router
- Search by name (debounced), filters by status, species and gender
- Sorting (name A–Z / Z–A, most episodes) and pagination (12 per page)
- Search, filters, sorting and the page number are stored in the URL, so they survive a
  reload and the "Back" button
- Controlled form (`/add`) to add a new character with an optional photo
  (saved in `localStorage`)
- Loading, error (with retry), empty, not-found and success states
- Request cancellation with `AbortController` (no stale updates / race conditions)

## Reliable loading
The API returns 20 characters per page and has no sorting. To make search,
filters and sorting work on **all** characters (not only on the current page),
the app loads every page and then processes the full list on the client.

- at most 6 requests at the same time (the server is not flooded)
- failed requests (network error, 429, 5xx) are retried up to 2 times
- the loaded list is cached in `sessionStorage`, so a reload in the same tab is instant
- only the fields the app uses are kept in memory

## Components
`App`, `Header`, `CharacterList`, `Controls`, `CharacterCard`, `CharacterImage`,
`Pagination`, `CharacterForm`, `CharacterDetail`, `StatusMessage`, `NotFound`

## Routes
| Path | Page |
|---|---|
| `/` | list with search, filters, sorting, pagination |
| `/character/:id` | character detail page |
| `/add` | form to add a character |

`vercel.json` rewrites all paths to `index.html`, so a page reload on any route works.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Tech
React 18, React Router 6, Vite, plain CSS, `fetch`, hooks (`useState`, `useEffect`, `useMemo`, `useCallback`).
