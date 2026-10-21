const BASE_URL = "https://rickandmortyapi.com/api";

const MAX_PARALLEL_REQUESTS = 6; // do not flood the server with 40+ requests at once
const MAX_ATTEMPTS = 3; // one request + 2 retries
const CACHE_KEY = "rm-api-characters-v1";

// ---------- helpers ----------

function abortError() {
  const err = new Error("Request was cancelled");
  err.name = "AbortError";
  return err;
}

// Wait `ms`, but stop immediately if the request is cancelled
function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    const timerId = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timerId);
      reject(abortError());
    }
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

// Fetch one page. Network errors, 429 and 5xx are retried, other errors are not.
async function fetchPage(page, signal) {
  let lastError;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let retryable = true;

    try {
      const res = await fetch(`${BASE_URL}/character?page=${page}`, { signal });
      if (res.ok) return await res.json();

      lastError = new Error(`Server error: ${res.status}`);
      retryable = res.status === 429 || res.status >= 500;
    } catch (err) {
      if (err.name === "AbortError") throw err;
      lastError = new Error("Network problem. Check your connection and try again.");
    }

    if (!retryable) throw lastError; // e.g. 404 will not fix itself
    if (attempt < MAX_ATTEMPTS - 1) {
      await delay(500 * 2 ** attempt, signal); // wait 500ms, then 1000ms
    }
  }

  throw lastError;
}

// Run async tasks with at most `limit` of them in flight at the same time.
// If one task fails for good, the others stop taking new work.
async function runWithLimit(tasks, limit) {
  const results = new Array(tasks.length);
  let nextIndex = 0;
  let failed = false;

  async function worker() {
    while (!failed && nextIndex < tasks.length) {
      const index = nextIndex++;
      try {
        results[index] = await tasks[index]();
      } catch (err) {
        failed = true;
        throw err;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

// Keep only the fields the app uses (smaller memory and cache)
function normalize(c) {
  return {
    id: c.id,
    name: c.name,
    status: c.status,
    species: c.species,
    type: c.type,
    gender: c.gender,
    origin: { name: c.origin?.name ?? "unknown" },
    location: { name: c.location?.name ?? "unknown" },
    image: c.image,
    episodeCount: c.episode?.length ?? 0,
    created: c.created,
  };
}

// ---------- cache (per browser tab) ----------

export function readCachedCharacters() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    const data = raw ? JSON.parse(raw) : null;
    return Array.isArray(data) && data.length > 0 ? data : null;
  } catch {
    return null;
  }
}

function writeCachedCharacters(characters) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(characters));
  } catch {
    // cache is optional: if the storage is full or blocked, just skip it
  }
}

// ---------- public API ----------

// The API gives 20 characters per page, and sorting is not supported by the server.
// To sort and filter ALL characters, we load every page once and work with the full list.
export async function fetchAllCharacters(signal) {
  const first = await fetchPage(1, signal);
  const totalPages = first.info.pages;

  const tasks = Array.from(
    { length: totalPages - 1 },
    (_, i) => () => fetchPage(i + 2, signal)
  );
  const otherPages = await runWithLimit(tasks, MAX_PARALLEL_REQUESTS);

  const characters = [first, ...otherPages].flatMap((page) => page.results).map(normalize);
  writeCachedCharacters(characters);
  return characters;
}
