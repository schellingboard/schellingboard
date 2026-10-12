import type { Result } from "./result";

export interface StoredFiles {
  deleteByUrl(url: string): Promise<void>;
}

// Stored under a new name before the write, and the file the row no longer
// names deleted after it, so rows and files agree without the write lock.
export async function withStoredFile<T>(
  files: StoredFiles,
  newUrl: string | null,
  write: (
    replaces: (oldUrl: string | null | undefined) => void
  ) => Promise<Result<T>>
): Promise<Result<T>> {
  let oldUrl: string | null | undefined;
  let result: Result<T>;
  try {
    result = await write((url) => {
      oldUrl = url;
    });
  } catch (error) {
    if (newUrl) await deleteLogged(files, newUrl);
    throw error;
  }
  const unused = result.ok ? oldUrl : newUrl;
  if (unused) await deleteLogged(files, unused);
  return result;
}

async function deleteLogged(files: StoredFiles, url: string) {
  try {
    await files.deleteByUrl(url);
  } catch (error) {
    console.error(`Could not delete ${url}; delete it by hand`, error);
  }
}
