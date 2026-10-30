// Prints a new single-use link that makes its visitor a site admin, ending any
// earlier one. Dev only; a deployed site sets SB_BOOTSTRAP_LINK=1 and restarts.

import { newBootstrapLink } from "../server/bootstrap-link";

console.log(await newBootstrapLink());
