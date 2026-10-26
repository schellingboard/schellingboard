/**
 * Whether the proposal modal was opened by a click on this page, which pushed
 * its own history entry: Back closes it then. A modal reached by an address has
 * no entry of ours to pop, so it is closed by removing the parameter.
 * Module state because it must outlive the route component the click leaves.
 */
let openedByClick = false;

export const proposalOpenedByClick = (value: boolean) => {
  openedByClick = value;
};

export const takeProposalOpenedByClick = () => {
  const value = openedByClick;
  openedByClick = false;
  return value;
};
