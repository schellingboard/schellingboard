export const problemCode = (error: unknown, status: number) => {
  const code = (error as { code?: unknown } | undefined)?.code;
  return typeof code === "string" ? code : `http.${status}`;
};
