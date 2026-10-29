// Elements never rendered from user-provided markdown (see
// app/legacy/(site)/markdown.tsx). Images stay disabled so viewers' IPs never hit
// arbitrary URLs; the table elements don't degrade gracefully in the places
// descriptions appear.
export const MARKDOWN_DISALLOWED_ELEMENTS = [
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "input",
];
