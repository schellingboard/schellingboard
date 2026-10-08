import { api } from "./app";
import { openApiDocumentOf } from "./docs";

export function openApiDocument() {
  return openApiDocumentOf(api);
}
