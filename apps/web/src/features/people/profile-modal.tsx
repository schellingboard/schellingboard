import {
  type TouchEvent as ReactTouchEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  catchSwipe,
  type Slide,
  startSwipe,
  swipeCommit,
  type SwipeEnds,
  swipeOffset,
  trackSwipe,
} from "@schellingboard/domain/swipe";
import type {
  ProfileActivityQuery,
  ProfileActivityState,
  ProfileMeetingOption,
} from "../../queries/profile-activity";
import { Comments, type CommentsHandle } from "../comments/comments-section";
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "../../ui/icons";
import type { DirectoryCard } from "./directory-model";
import type { ProfileLinks } from "./links";
import { ProfileBody } from "./profile-body";

/** How long the profile takes to finish a swipe the finger has let go of. */
const SETTLE_MS = 200;

type Drag = { guestId: string } & Slide;

export type ProfileModalProps = {
  guestId: string;
  /** What the list behind is showing; Prev and Next walk it. */
  matches: DirectoryCard[];
  /** Everyone, alphabetically: the walk for a profile the filters exclude. */
  everyone: DirectoryCard[];
  viewerId: string | null;
  links: ProfileLinks;
  /** Stable between renders; the modal calls it once per profile read. */
  activity: (guestId: string) => ProfileActivityQuery;
  /** Must change `guestId` in the same update, or a slide aims at the old profile. */
  onOpen: (guestId: string) => void;
  onClose: () => void;
  onSchedule: (guestId: string, option: ProfileMeetingOption) => void;
  /** Must be stable; called once per profile read, with the name notices use. */
  comments: (guestId: string, name: string) => CommentsHandle;
  setHash: (hash: string) => void;
};

/**
 * A guest's profile, read over the list it was opened from. Always a modal:
 * the list never unmounts, so closing lands exactly where reading started.
 *
 * Prev/Next walk the collection the list is showing, or everyone in
 * alphabetical order for a profile the filters exclude or one opened from a
 * session or a comment. The position label names which, so it is never
 * invisible state.
 */
export function ProfileModal(props: ProfileModalProps) {
  const { guestId, matches, everyone, viewerId, links, onOpen, onClose } =
    props;
  const [dragged, setDrag] = useState<Drag | null>(null);
  const collection = matches.some((a) => a.id === guestId) ? matches : everyone;
  const index = collection.findIndex((a) => a.id === guestId);
  const guest = index >= 0 ? collection[index] : null;

  const [zoomedFor, setZoomedFor] = useState<string | null>(null);
  const zoomed = zoomedFor === guestId;
  const activity = useProfileActivity(props.activity, guestId);
  const { comments, setHash } = props;
  const name = guest?.name ?? "";
  const openComments = useCallback(
    () => comments(guestId, name),
    [comments, guestId, name]
  );

  const ends: SwipeEnds = {
    canPrev: index > 0,
    canNext: index >= 0 && index < collection.length - 1,
  };

  // One scroll container serves every profile, so without this the next one
  // opens at the offset the last one was left at.
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [guestId]);

  const viewport = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const drag = dragged?.guestId === guestId ? dragged : null;

  const onTouchStart = (e: ReactTouchEvent) => {
    if (zoomed || index < 0 || e.touches.length !== 1) return;
    const point = e.touches[0];
    const settling =
      dragged?.guestId === guestId && dragged.phase === "settling"
        ? dragged
        : null;
    const swipe = settling ? catchSwipe(point, rowOffset()) : startSwipe(point);
    if (!swipe) return;
    setDrag({ guestId, phase: "tracking", swipe });
  };

  const rowOffset = () => {
    const el = row.current;
    if (!el) return 0;
    const matrix = getComputedStyle(el).transform;
    const tx = matrix === "none" ? 0 : new DOMMatrixReadOnly(matrix).e;
    return tx + index * width;
  };

  const onTouchMove = (e: ReactTouchEvent) => {
    const point =
      e.touches.length === 1
        ? { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }
        : null;
    setDrag((prev) => {
      if (prev?.guestId !== guestId || prev.phase !== "tracking") return prev;
      if (!point) return null;
      return { ...prev, swipe: trackSwipe(prev.swipe, point) };
    });
  };

  const endTouch = () => {
    if (dragged?.guestId !== guestId || dragged.phase !== "tracking") return;
    const commit = swipeCommit(dragged.swipe, width, ends);
    const target = collection[index + commit]?.id ?? guestId;
    if (target === guestId && swipeOffset(dragged.swipe, ends) === 0) {
      setDrag(null);
      return;
    }
    // Advancing before the slide settles means a drag that starts again at
    // once already has both neighbours on screen.
    if (target !== guestId) onOpen(target);
    setDrag({ guestId: target, phase: "settling" });
  };

  useEffect(() => {
    if (drag?.phase !== "settling") return;
    const timer = setTimeout(() => setDrag(null), SETTLE_MS);
    return () => clearTimeout(timer);
  }, [drag]);

  const goToAnimated = useCallback(
    (offset: 1 | -1) => {
      const target = collection[index + offset]?.id;
      if (!target) return;
      onOpen(target);

      if (drag) {
        setDrag({ guestId: target, phase: "settling" });
        return;
      }

      // From rest the neighbour mounts held a width away in one frame and
      // slides home in the next: a settle in the same breath has no travel to
      // transition. Two rAFs, as one can still beat the mounting frame's style
      // pass; the guard keeps a stale callback from clobbering a caught card.
      setDrag({
        guestId: target,
        phase: "tracking",
        arming: true,
        swipe: { startX: 0, startY: 0, axis: "x", dx: offset * width },
      });
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setDrag((prev) =>
            prev?.guestId === target && prev.phase === "tracking" && prev.arming
              ? { guestId: target, phase: "settling" }
              : prev
          );
        })
      );
    },
    [collection, index, drag, width, onOpen]
  );

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // One layer at a time: the enlarged photo first, so Escape never
        // closes the profile out from under someone looking closely.
        if (zoomed) setZoomedFor(null);
        else onClose();
        return;
      }
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (zoomed || isTextEntry(e.target)) return;
      e.preventDefault();
      goToAnimated(e.key === "ArrowRight" ? 1 : -1);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, goToAnimated, zoomed]);

  const sliding =
    drag !== null && (drag.phase === "settling" || drag.swipe.axis === "x");
  const offset = drag?.phase === "tracking" ? swipeOffset(drag.swipe, ends) : 0;
  const first = sliding && ends.canPrev ? index - 1 : index;

  const position =
    index >= 0
      ? `${index + 1} of ${collection.length} attendee${
          collection.length === 1 ? "" : "s"
        }`
      : "";

  const pages = sliding
    ? collection.slice(first, index + 2)
    : guest
      ? [guest]
      : [];

  return (
    // items-start: a centred panel puts Prev/Next at a different height for
    // every profile, so they would jump under the pointer while reading on.
    <div
      className="fixed inset-0 z-50 flex justify-center sm:items-start sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-label={guest ? guest.name : "Profile"}
    >
      <div className="fixed inset-0 bg-overlay" onClick={onClose} />
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-surface-raised shadow-xl sm:mx-4 sm:h-auto sm:max-h-full sm:max-w-4xl sm:rounded-lg">
        <div className="flex shrink-0 items-center gap-2 border-b border-line-subtle px-2 py-2 sm:px-4">
          <NavButton
            label="Previous attendee"
            disabled={index <= 0}
            onClick={() => goToAnimated(-1)}
          >
            <ChevronLeftIcon className="h-5 w-5 stroke-2" />
            <span className="hidden sm:inline">Prev</span>
          </NavButton>
          <span
            aria-live="polite"
            className="flex-1 text-center text-sm text-fg-muted"
          >
            <span className="sr-only">{guest ? `${guest.name}, ` : ""}</span>
            {position}
          </span>
          <NavButton
            label="Next attendee"
            disabled={index < 0 || index >= collection.length - 1}
            onClick={() => goToAnimated(1)}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRightIcon className="h-5 w-5 stroke-2" />
          </NavButton>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-md bg-surface-raised p-1.5 text-fg-subtle hover:bg-surface-sunken hover:text-fg-muted focus:outline-none focus:ring-2 focus:ring-brand-accent"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* touch-pan-y hands vertical scrolling to the browser and keeps
            horizontal panning, the back gesture included, for this handler;
            React's touchmove is passive, so it has to be CSS.

            overflow-clip, not -hidden: Firefox credits a hidden box with the
            profile's whole height and can park it partway down where nothing
            brings it back (#930). */}
        <div
          ref={viewport}
          className="flex min-h-0 flex-1 flex-col overflow-clip touch-pan-y"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={endTouch}
          onTouchCancel={endTouch}
        >
          {guest ? (
            <div
              ref={row}
              className="flex min-h-0 flex-1"
              style={{
                paddingInlineStart: `${first * width}px`,
                transform: `translateX(${offset - index * width}px)`,
                transition:
                  drag?.phase === "settling"
                    ? `transform ${SETTLE_MS}ms ease-out`
                    : undefined,
              }}
            >
              {pages.map((attendee) => {
                const current = attendee.id === guestId;
                return (
                  <div
                    key={attendee.id}
                    ref={current ? body : undefined}
                    aria-hidden={!current}
                    inert={!current}
                    className="w-full shrink-0 overflow-y-auto px-4 py-6 sm:px-6"
                    style={{ width: width || undefined }}
                  >
                    <ProfileBody
                      guest={attendee}
                      isOwnProfile={viewerId === attendee.id}
                      activity={current ? activity : null}
                      links={links}
                      zoomed={current && zoomed}
                      onToggleZoom={() => setZoomedFor(zoomed ? null : guestId)}
                      onSchedule={props.onSchedule}
                      comments={
                        current && (
                          <Comments
                            open={openComments}
                            viewerId={viewerId}
                            timezone="UTC"
                            guestHref={links.guest}
                            commentHref={(id) =>
                              `${links.guest(guestId)}#comment-${id}`
                            }
                            setHash={setHash}
                          />
                        )
                      }
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            // Not a 404: a stale link from an old session or comment lands
            // here, and the list behind is more use than an error.
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
              <p className="text-fg-muted">This person is no longer listed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-fg-muted hover:bg-surface-sunken hover:text-fg disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-fg-muted"
    >
      {children}
    </button>
  );
}

/**
 * Stored with its guest, so moving on shows the skeleton again and a reply for
 * a profile already left can never land on the current one: reading on with
 * the arrow keys outruns the network easily.
 */
function useProfileActivity(
  make: (guestId: string) => ProfileActivityQuery,
  guestId: string
): ProfileActivityState | null {
  const [loaded, setLoaded] = useState<{
    guestId: string;
    state: ProfileActivityState;
  } | null>(null);
  useEffect(() => {
    const query = make(guestId);
    const sync = () => setLoaded({ guestId, state: query.get() });
    const unsubscribe = query.subscribe(sync);
    void query.refresh();
    return () => {
      unsubscribe();
      query.destroy();
    };
  }, [make, guestId]);
  return loaded?.guestId === guestId ? loaded.state : null;
}

function isTextEntry(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}
