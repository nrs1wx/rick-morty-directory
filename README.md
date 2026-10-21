# Rick and Morty Characters — React SPA (Midterm Project)

A character directory built with React + Vite. Data comes from the public
[Rick and Morty API](https://rickandmortyapi.com/documentation) (826 characters).

**Live demo:** https://rick-morty-directory.vercel.app/

## Features
- List view (cards) and detail view (modal)
- Search by name (debounced), filters by status, species and gender
- Sorting (name A–Z / Z–A, most episodes) and pagination (12 per page)
- Controlled form to add a new character (saved in `localStorage`)
- Loading, error (with retry), empty and success states
- Request cancellation with `AbortController` (no stale updates / race conditions)

## Why all pages are loaded at start
The API returns 20 characters per page and has no sorting. To make search,
filters and sorting work on **all** characters (not only on the current page),
the app loads every page once (in parallel) and then processes the full list on the client.

## Components
`App`, `Header`, `CharacterList`, `Controls`, `CharacterCard`, `Pagination`,
`CharacterForm`, `CharacterDetail`, `StatusMessage`

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
React 18, Vite, plain CSS, `fetch`, hooks (`useState`, `useEffect`, `useMemo`).
