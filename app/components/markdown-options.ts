import {
  BoldIcon,
  ChatBubbleBottomCenterTextIcon,
  CodeBracketIcon,
  CodeBracketSquareIcon,
  ItalicIcon,
  LinkIcon,
  ListBulletIcon,
  NumberedListIcon,
} from "@heroicons/react/16/solid";
import {
  applyTemplate,
  markdownOptions,
  matchesKey,
  type Template,
} from "@schellingboard/domain/markdown-edit";

export { applyTemplate, type Edit } from "@schellingboard/domain/markdown-edit";

const ICONS: Record<string, typeof BoldIcon> = {
  bold: BoldIcon,
  italic: ItalicIcon,
  quote: ChatBubbleBottomCenterTextIcon,
  "numbered-list": NumberedListIcon,
  "bullet-list": ListBulletIcon,
  code: CodeBracketIcon,
  "code-block": CodeBracketSquareIcon,
  link: LinkIcon,
};

export const isKey = matchesKey;

export const options = markdownOptions.map((option) => ({
  ...option,
  icon: ICONS[option.id],
}));

/** Apply `template` to a textarea, keeping React and the caret in sync. */
export function applyToTextarea(
  template: Template,
  textarea: HTMLTextAreaElement
) {
  const edit = applyTemplate(
    template,
    textarea.value,
    textarea.selectionStart,
    textarea.selectionEnd
  );

  // setRangeText (rather than assigning .value) keeps the browser's own undo
  // stack working; the input event is what React's onChange listens for.
  textarea.setRangeText(edit.value, 0, textarea.value.length, "preserve");
  textarea.dispatchEvent(new Event("input", { bubbles: true }));

  // Restore focus and selection after React updates
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(edit.selectionStart, edit.selectionEnd);
  });
}
