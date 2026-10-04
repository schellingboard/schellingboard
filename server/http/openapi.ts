import { api } from "./app";

export function openApiDocument() {
  return api.getOpenAPI31Document({
    openapi: "3.1.0",
    info: { title: "SchellingBoard API", version: "1" },
  });
}
