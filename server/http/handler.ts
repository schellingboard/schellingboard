import { withForwardedProto } from "./forwarded";
import { web } from "./web";

/** The server's request handler; `env` carries the socket the node server accepted. */
export const handleRequest = (req: Request, env?: unknown) =>
  web.fetch(withForwardedProto(req), env);
