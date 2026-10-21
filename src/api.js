const BASE_URL = "https://rickandmortyapi.com/api";

// The API gives 20 characters per page, and sorting is not supported by the server.
// To sort and filter ALL characters, we load every page once and work with the full list.
export async function fetchAllCharacters(signal) {
  const firstRes = await fetch(`${BASE_URL}/character?page=1`, { signal });
  if (!firstRes.ok) {
    throw new Error(`Server error: ${firstRes.status}`);
  }
  const first = await firstRes.json();
  const totalPages = first.info.pages;

  // Load pages 2..totalPages in parallel
  const requests = Array.from({ length: totalPages - 1 }, async (_, i) => {
    const res = await fetch(`${BASE_URL}/character?page=${i + 2}`, { signal });
    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }
    return res.json();
  });

  const otherPages = await Promise.all(requests);
  return [first, ...otherPages].flatMap((page) => page.results);
}
