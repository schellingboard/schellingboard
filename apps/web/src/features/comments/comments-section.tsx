import { useEffect, useId, useMemo, useRef, useState } from "react";
import { COMMENT_MAX_LENGTH } from "@schellingboard/domain/comment";
import { formatInLocalZone } from "@schellingboard/domain/time";
import type { CommentView } from "../../commands/comment";
import type { CommentsState } from "../../queries/comments";
import type {
  CommentResult,
  CommentsController,
} from "../../queries/comments-controller";
import { ConfirmDialog } from "../../ui/confirm-dialog";
import { Dialog } from "../../ui/dialog";
import { Markdown } from "../../ui/markdown";
import { Tooltip } from "../../ui/tooltip";
import type { CommentsQuery } from "../../queries/comments";

export type CommentsHandle = {
  query: CommentsQuery;
  controller: CommentsController;
};

/** What a comment section needs from the screen it sits in. */
export type CommentsEnv = {
  /** Must be stable (memoized): a new function reopens the thread. The caller destroys nothing. */
  open: () => CommentsHandle;
  viewerId: string | null;
  timezone: string;
  guestHref: (guestId: string) => string;
} & (
  | { readOnly: true }
  | {
      readOnly?: false;
      commentHref: (commentId: string) => string;
      /** Called with `#comment-<id>` when a comment's time is followed. */
      setHash: (hash: string) => void;
    }
);

type Node = CommentView & { replies: Node[] };

function buildTree(comments: CommentView[]): Node[] {
  const nodes = new Map<string, Node>(
    comments.map((c) => [c.id, { ...c, replies: [] }])
  );
  const roots: Node[] = [];
  for (const comment of comments) {
    const node = nodes.get(comment.id)!;
    const parent = comment.parentId ? nodes.get(comment.parentId) : undefined;
    (parent ? parent.replies : roots).push(node);
  }
  return roots;
}

function useComments(open: CommentsEnv["open"]) {
  const [state, setState] = useState<CommentsState | null>(null);
  const [handle, setHandle] = useState<CommentsHandle | null>(null);
  useEffect(() => {
    const created = open();
    const sync = () => {
      setHandle(created);
      setState(created.query.get());
    };
    const unsubscribe = created.query.subscribe(sync);
    sync();
    void created.query.loadMore();
    return () => {
      unsubscribe();
      created.query.destroy();
    };
  }, [open]);
  return { state, handle };
}

/** The reader can scroll to a comment named by the address, `#comment-<id>`. */
function useHighlighted(items: CommentView[] | undefined) {
  const [id, setId] = useState<string | null>(() => {
    const { hash } = window.location;
    return hash.startsWith("#comment-") ? hash.slice("#comment-".length) : null;
  });
  const scrolled = useRef<string | null>(null);
  useEffect(() => {
    if (!id || scrolled.current === id) return;
    const target = document.querySelector<HTMLElement>(
      `[data-comment="${CSS.escape(id)}"]`
    );
    if (!target) return;
    target.scrollIntoView({ block: "center" });
    scrolled.current = id;
  }, [id, items]);
  return [id, setId] as const;
}

export function Comments(props: CommentsEnv) {
  const env: CommentsEnv = props.readOnly
    ? { ...props, viewerId: null }
    : props;
  const { state, handle } = useComments(env.open);
  const [highlighted, highlight] = useHighlighted(state?.items);
  const roots = useMemo(() => buildTree(state?.items ?? []), [state?.items]);

  const section = "mt-8 border-t border-line-subtle pt-6";
  if (
    !state ||
    !handle ||
    (state.items.length === 0 &&
      state.status !== "ready" &&
      state.status !== "error")
  )
    return (
      <section className={section}>
        <h2 className="mb-4 text-lg font-semibold">Loading comments...</h2>
      </section>
    );
  if (state.status === "error" && state.items.length === 0)
    return (
      <section className={section}>
        <h2 className="mb-4 text-lg font-semibold">
          Comments could not be loaded
        </h2>
        <button
          type="button"
          onClick={() => void handle.query.loadMore()}
          className="text-sm underline"
        >
          Try again
        </button>
      </section>
    );

  const total = state.items.filter((c) => !c.deleted).length;
  return (
    <section className={section}>
      <h2 className="mb-4 text-lg font-semibold">
        {state.hasMore
          ? `${total}+ comments`
          : total === 1
            ? "1 comment"
            : `${total} comments`}
      </h2>
      {roots.length > 0 && (
        <div className="mb-6">
          {roots.map((node) => (
            <Thread
              key={node.id}
              env={env}
              node={node}
              depth={0}
              controller={handle.controller}
              highlighted={highlighted}
              highlight={highlight}
            />
          ))}
        </div>
      )}
      {state.hasMore && (
        <button
          type="button"
          onClick={() => void handle.query.loadMore()}
          disabled={state.status === "loading"}
          className="mb-4 text-sm underline disabled:opacity-50"
        >
          Load more comments
        </button>
      )}
      {props.readOnly ? null : env.viewerId ? (
        <CommentForm
          onSubmit={(body) => handle.controller.create(body)}
          clearOnSuccess
          placeholder="Add a comment"
          submitLabel="Comment"
        />
      ) : (
        <p className="text-sm text-fg-subtle">
          Select your name to leave a comment.
        </p>
      )}
    </section>
  );
}

function Thread({
  env,
  node,
  depth,
  controller,
  highlighted,
  highlight,
}: {
  env: CommentsEnv;
  node: Node;
  depth: number;
  controller: CommentsController;
  highlighted: string | null;
  highlight: (id: string) => void;
}) {
  const { viewerId, timezone } = env;
  const [collapsed, setCollapsed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [replying, setReplying] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isAuthor = viewerId !== null && node.author?.id === viewerId;
  const background = depth % 2 === 1 ? "bg-surface-muted" : "bg-surface-raised";
  const stamp = (
    <time dateTime={node.createdTime}>
      {formatInLocalZone(new Date(node.createdTime), timezone, localZone)}
    </time>
  );
  const action = "cursor-pointer hover:text-fg hover:underline";

  return (
    <div
      className={`relative rounded ${background} ${
        depth === 0
          ? "mb-[17px] border border-line-subtle"
          : "border-l-2 border-line"
      }`}
    >
      <div
        // data-comment, not id: a hash target is scrolled to by the browser,
        // which also moves the modal's clipped panels (#930).
        data-comment={node.id}
        className={`rounded ${depth > 0 ? "py-2 pl-3 pr-2" : "px-3 py-2"} ${
          node.id === highlighted
            ? "relative z-10 ring-2 ring-brand-accent"
            : ""
        }`}
      >
        <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand comment" : "Collapse comment"}
            className="cursor-pointer font-mono text-xs text-fg-muted hover:text-fg"
          >
            [{collapsed ? "+" : "-"}]
          </button>
          {node.deleted ? (
            <span className="text-sm italic text-fg-muted">
              Comment deleted
            </span>
          ) : (
            <>
              {node.author ? (
                <a
                  href={env.guestHref(node.author.id)}
                  className="font-medium text-brand-fg hover:text-brand-fg-hover hover:underline"
                >
                  {node.author.name}
                </a>
              ) : (
                <span className="font-medium text-fg-muted">Unknown</span>
              )}
              {env.readOnly ? (
                <span className="text-xs text-fg-muted">{stamp}</span>
              ) : (
                <a
                  href={env.commentHref(node.id)}
                  onClick={(e) => {
                    e.preventDefault();
                    highlight(node.id);
                    env.setHash(`#comment-${node.id}`);
                  }}
                  className="text-xs text-fg-muted hover:text-fg hover:underline"
                >
                  {stamp}
                </a>
              )}
              {node.editedTime && (
                <span
                  className="text-xs text-fg-muted"
                  title={`Edited ${formatInLocalZone(new Date(node.editedTime), timezone, localZone)}`}
                >
                  (edited)
                </span>
              )}
            </>
          )}
        </div>

        {!collapsed && !node.deleted && (
          <>
            {editing ? (
              <CommentForm
                onSubmit={(body) => controller.edit(node.id, body)}
                placeholder="Edit your comment"
                submitLabel="Save"
                initialBody={node.body}
                onCancel={() => setEditing(false)}
                onDone={() => setEditing(false)}
              />
            ) : (
              <div className="mt-1 break-words text-sm text-fg">
                <Markdown>{node.body}</Markdown>
              </div>
            )}
            {!editing && (
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-fg-muted">
                <Likes
                  node={node}
                  viewerId={viewerId}
                  guestHref={env.guestHref}
                  onToggle={(liked) => void controller.setLiked(node.id, liked)}
                />
                {viewerId && (
                  <button
                    type="button"
                    onClick={() => setReplying(!replying)}
                    className={action}
                  >
                    Reply
                  </button>
                )}
                {isAuthor && (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className={action}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(true)}
                      className="cursor-pointer hover:text-danger-fg hover:underline"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
            {replying && (
              <CommentForm
                onSubmit={(body) => controller.create(body, node.id)}
                clearOnSuccess
                placeholder="Write a reply"
                submitLabel="Reply"
                onCancel={() => setReplying(false)}
                onDone={() => setReplying(false)}
              />
            )}
          </>
        )}
      </div>

      {!collapsed && node.replies.length > 0 && (
        <div className="flex">
          <span className="w-3 shrink-0 hover:bg-surface-hover" />
          <div className="min-w-0 flex-1">
            {node.replies.map((reply) => (
              <Thread
                key={reply.id}
                env={env}
                node={reply}
                depth={depth + 1}
                controller={controller}
                highlighted={highlighted}
                highlight={highlight}
              />
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete comment"
        message="Delete this comment? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          setConfirmingDelete(false);
          void controller.remove(node.id);
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}

const PREVIEW_LIKERS = 3;

function LikerAvatar({ name, src }: { name: string; src: string | null }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      aria-hidden="true"
      className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-tint-hover text-sm font-semibold text-brand-fg"
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        initials || "?"
      )}
    </span>
  );
}

function Likes({
  node,
  viewerId,
  guestHref,
  onToggle,
}: {
  node: Node;
  viewerId: string | null;
  guestHref: (guestId: string) => string;
  onToggle: (liked: boolean) => void;
}) {
  const [showing, setShowing] = useState(false);
  const liked = viewerId !== null && node.likes.some((l) => l.id === viewerId);
  return (
    <>
      {viewerId && (
        <button
          type="button"
          onClick={() => onToggle(!liked)}
          aria-pressed={liked}
          className={`cursor-pointer ${
            liked
              ? "font-semibold text-brand-fg hover:text-brand-fg-hover"
              : "hover:text-fg hover:underline"
          }`}
        >
          {liked ? "Liked" : "Like"}
        </button>
      )}
      {node.likes.length > 0 && (
        <Tooltip
          className="inline-block"
          content={
            <div className="px-2 py-1 text-sm whitespace-nowrap">
              {node.likes
                .slice(-PREVIEW_LIKERS)
                .reverse()
                .map((liker) => (
                  <span key={liker.id} className="block">
                    {liker.name}
                  </span>
                ))}
              {node.likes.length > PREVIEW_LIKERS && (
                <span className="block text-fg-muted">
                  and {node.likes.length - PREVIEW_LIKERS} more
                </span>
              )}
            </div>
          }
        >
          <button
            type="button"
            onClick={() => setShowing(true)}
            className="cursor-pointer hover:text-fg hover:underline"
          >
            {node.likes.length} like{node.likes.length === 1 ? "" : "s"}
          </button>
        </Tooltip>
      )}
      <Dialog open={showing} onClose={() => setShowing(false)} title="Liked by">
        <ul className="max-h-72 overflow-y-auto text-sm">
          {node.likes.map((liker) => (
            <li key={liker.id}>
              <a
                href={guestHref(liker.id)}
                className="flex items-center gap-3 rounded-md px-2 py-1.5 font-medium text-fg hover:bg-surface-sunken"
              >
                <LikerAvatar name={liker.name} src={liker.avatarUrl} />
                {liker.name}
              </a>
            </li>
          ))}
        </ul>
      </Dialog>
    </>
  );
}

function CommentForm({
  onSubmit,
  clearOnSuccess,
  initialBody = "",
  placeholder,
  submitLabel,
  onCancel,
  onDone,
}: {
  onSubmit: (body: string) => Promise<CommentResult>;
  clearOnSuccess?: boolean;
  initialBody?: string;
  placeholder: string;
  submitLabel: string;
  onCancel?: () => void;
  onDone?: () => void;
}) {
  const [body, setBody] = useState(initialBody);
  const [submitting, setSubmitting] = useState(false);
  const id = useId();
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await onSubmit(body);
    if (!mounted.current) return;
    setSubmitting(false);
    if (!result.ok) return;
    if (clearOnSuccess) setBody("");
    onDone?.();
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="mt-2">
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <textarea
        id={id}
        rows={3}
        value={body}
        maxLength={COMMENT_MAX_LENGTH}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-line p-2 text-sm focus:border-brand-accent focus:ring-brand-accent"
      />
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="text-xs text-fg-subtle">Markdown supported</p>
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-line px-3 py-1 text-sm font-medium text-fg-muted hover:bg-surface-muted"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting || body.trim().length === 0}
            className="rounded-md bg-brand px-3 py-1 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-50"
          >
            {submitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
