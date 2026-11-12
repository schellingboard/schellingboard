import { i18n, type MessageDescriptor } from "@lingui/core";
import { msg, plural, select, t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { formatRelativeTime } from "@schellingboard/domain/relative-time";
import { useSyncExternalStore } from "react";

import { useFormatLocale } from "../../i18n/format-locale";
import type { MyComment, MyCommentsQuery } from "../../queries/my-comments";
import { DataTable } from "../../ui/data-table";
import { type OnParams, pageOf, tableHandlers } from "../../ui/list-paging";
import { profileLinks } from "../people/links";
import { COMMENT_HASH_PREFIX } from "./comments-section";

const KIND_FILTERS: { kind: MyComment["kind"]; label: MessageDescriptor }[] = [
  { kind: "session", label: msg`Sessions` },
  { kind: "proposal", label: msg`Proposals` },
  { kind: "profile", label: msg`Profiles` },
];

const SELECT =
  "rounded-md border border-line bg-surface-raised py-1 pl-2 pr-7 text-base text-fg sm:text-sm";

/** Everything the signed-in guest has written, each row leading to the comment itself. */
export function MyCommentsScreen({
  query,
  now,
  params,
  onParams,
  onOpen,
}: {
  query: MyCommentsQuery;
  now: Date;
  /** Where a row leads; a plain click goes there without a page load. */
  onOpen: (url: string) => void;
  params: URLSearchParams;
  onParams: OnParams;
}) {
  const state = useSyncExternalStore(query.subscribe, query.get);
  if (state.status === "loading")
    return (
      <p role="status" className="px-4 text-fg-muted">
        <Trans>Loading…</Trans>
      </p>
    );
  if (state.status === "error")
    return (
      <p role="alert" className="px-4 text-danger-fg">
        <Trans>
          Could not load your comments. Reload the page to try again.
        </Trans>
      </p>
    );

  const events = [
    ...new Map(
      state.items.flatMap((c) =>
        c.event ? [[c.event.slug, c.event.name]] : []
      )
    ),
  ].sort((a, b) => a[1].localeCompare(b[1]));
  const kind = params.get("kind") ?? "";
  const event = params.get("event") ?? "";
  const text = params.get("q")?.trim().toLowerCase() ?? "";
  const matching = state.items.filter(
    (c) =>
      (!kind || c.kind === kind) &&
      (!event || c.event?.slug === event) &&
      (!text || `${c.body} ${c.subjectTitle}`.toLowerCase().includes(text))
  );
  const { page, pageSize, visible } = pageOf(matching, params);
  const filter = (key: string, value: string) =>
    onParams({ [key]: value || null, page: null }, { push: true });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 sm:px-0">
      <h1 className="text-2xl font-bold">
        <Trans>My comments</Trans>
      </h1>
      <DataTable
        rows={visible}
        rowKey={(c) => c.id}
        total={matching.length}
        page={page}
        pageSize={pageSize}
        searchQuery={params.get("q") ?? ""}
        searchPlaceholder={t`Search your comments`}
        emptyMessage={
          state.items.length === 0
            ? t`You have not written any comments yet.`
            : t`No comments match.`
        }
        {...tableHandlers(onParams)}
        toolbar={
          <>
            <label className="flex items-center gap-2 text-sm">
              <Trans context="Comment filter: label of the kind selector">
                Show
              </Trans>
              <select
                value={kind}
                onChange={(e) => filter("kind", e.target.value)}
                className={SELECT}
              >
                <option value="">
                  {t({
                    message: "All",
                    context: "Comment filter: every kind",
                  })}
                </option>
                {KIND_FILTERS.map(({ kind: value, label }) => (
                  <option key={value} value={value}>
                    {i18n._(label)}
                  </option>
                ))}
              </select>
            </label>
            {events.length > 1 && (
              <label className="flex items-center gap-2 text-sm">
                <Trans context="Comment filter: label of the event selector">
                  Event
                </Trans>
                <select
                  value={event}
                  onChange={(e) => filter("event", e.target.value)}
                  className={SELECT}
                >
                  <option value="">{t`All events`}</option>
                  {events.map(([slug, name]) => (
                    <option key={slug} value={slug}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </>
        }
        listItem={(c) => (
          <CommentRow
            comment={c}
            now={now}
            showEvent={events.length > 1}
            onOpen={onOpen}
          />
        )}
      />
    </div>
  );
}

function commentPath({ kind, subjectId, event }: MyComment) {
  if (kind === "profile" || !event) return profileLinks.guest(subjectId);
  return profileLinks[kind](event.slug, subjectId);
}

function CommentRow({
  comment,
  now,
  showEvent,
  onOpen,
}: {
  comment: MyComment;
  now: Date;
  showEvent: boolean;
  onOpen: (url: string) => void;
}) {
  const url = `${commentPath(comment)}${COMMENT_HASH_PREFIX}${comment.id}`;
  const locale = useFormatLocale();
  const { replyCount, likeCount, kind, subjectTitle } = comment;
  const counts = [
    replyCount > 0 &&
      plural(replyCount, { one: "# reply", other: "# replies" }),
    likeCount > 0 && plural(likeCount, { one: "# like", other: "# likes" }),
  ].filter(Boolean);
  const heading = t`${select(kind, { session: "Session", proposal: "Proposal", profile: "Profile", other: "" })}: ${subjectTitle}`;
  return (
    <a
      href={url}
      onClick={(e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
          return;
        e.preventDefault();
        onOpen(url);
      }}
      className="flex flex-col gap-1 hover:bg-surface-hover"
    >
      <span className="text-sm font-medium">{heading}</span>
      <span className="text-xs text-fg-muted">
        {[
          showEvent ? comment.event?.name : null,
          formatRelativeTime(new Date(comment.createdTime), now, locale),
          ...counts,
        ]
          .filter(Boolean)
          .join(" · ")}
      </span>
      <span className="line-clamp-2 whitespace-pre-line text-sm text-fg-muted">
        {comment.body}
      </span>
    </a>
  );
}
