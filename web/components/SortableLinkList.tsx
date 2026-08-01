"use client";

import {
  useState,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import type { PublicLink } from "@/lib/types";

type Props = {
  links: PublicLink[];
  // Live reorder while dragging (local state only)
  onMove: (next: PublicLink[]) => void;
  // Finger/mouse released — parent should PATCH /links/reorder
  onDragEndCommit: () => void;
  reordering: boolean;
  disabled: boolean;
  editingId: string | null;
  editTitle: string;
  editUrl: string;
  savingEdit: boolean;
  togglingId: string | null;
  deletingId: string | null;
  onEditTitleChange: (value: string) => void;
  onEditUrlChange: (value: string) => void;
  onSaveEdit: (event: FormEvent<HTMLFormElement>) => void;
  onCancelEdit: () => void;
  onStartEdit: (link: PublicLink) => void;
  onToggleVisibility: (link: PublicLink) => void;
  onDelete: (link: PublicLink) => void;
};

function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  if (item === undefined) return list;
  next.splice(to, 0, item);
  return next;
}

export function SortableLinkList({
  links,
  onMove,
  onDragEndCommit,
  reordering,
  disabled,
  editingId,
  editTitle,
  editUrl,
  savingEdit,
  togglingId,
  deletingId,
  onEditTitleChange,
  onEditUrlChange,
  onSaveEdit,
  onCancelEdit,
  onStartEdit,
  onToggleVisibility,
  onDelete,
}: Props) {
  // Which row was picked up (HTML5 Drag and Drop API)
  const [draggingId, setDraggingId] = useState<string | null>(null);

  function onDragStart(event: DragEvent<HTMLButtonElement>, id: string) {
    // Some browsers need dataTransfer set or drop is rejected
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    setDraggingId(id);
  }

  function onDragOver(event: DragEvent<HTMLLIElement>, overId: string) {
    // REQUIRED — without this, the browser forbids dropping
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (!draggingId || draggingId === overId || disabled || reordering) return;

    const from = links.findIndex((l) => l._id === draggingId);
    const to = links.findIndex((l) => l._id === overId);
    if (from < 0 || to < 0 || from === to) return;

    // Optimistic: rearrange in React state while the pointer moves
    onMove(moveItem(links, from, to));
  }

  function onDragEnd() {
    const wasDragging = draggingId !== null;
    setDraggingId(null);
    // Persist only when a drag actually happened (not a random mouseup)
    if (wasDragging) onDragEndCommit();
  }

  return (
    <ul className="flex flex-col gap-2">
      {links.map((link) => {
        const isEditing = editingId === link._id;
        const isDragging = draggingId === link._id;

        return (
          <li
            key={link._id}
            onDragOver={(e) => onDragOver(e, link._id)}
            className={`rounded-md border border-border bg-surface px-4 py-3 transition-opacity ${
              isDragging ? "opacity-50" : ""
            } ${reordering ? "pointer-events-none opacity-70" : ""}`}
          >
            {isEditing ? (
              <form onSubmit={onSaveEdit} className="flex flex-col gap-2">
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={editTitle}
                  onChange={(e) => onEditTitleChange(e.target.value)}
                  className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand"
                />
                <input
                  type="url"
                  required
                  value={editUrl}
                  onChange={(e) => onEditUrlChange(e.target.value)}
                  className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand"
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="text-xs font-medium text-brand hover:underline disabled:opacity-50"
                  >
                    {savingEdit ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    disabled={savingEdit}
                    onClick={onCancelEdit}
                    className="text-xs text-text-muted hover:underline disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-start gap-3">
                {/* Only the handle is draggable — buttons stay clickable */}
                <button
                  type="button"
                  draggable={!disabled && !reordering}
                  onDragStart={(e) => onDragStart(e, link._id)}
                  onDragEnd={onDragEnd}
                  aria-label={`Drag to reorder ${link.title}`}
                  className="mt-0.5 cursor-grab select-none px-1 text-text-muted active:cursor-grabbing"
                >
                  ⋮⋮
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text">
                    {link.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-text-muted">
                    {link.url}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span
                    className={
                      link.isVisible
                        ? "text-xs text-brand"
                        : "text-xs text-text-muted"
                    }
                  >
                    {link.isVisible ? "visible" : "hidden"}
                  </span>
                  <RowActions
                    link={link}
                    busy={
                      togglingId === link._id ||
                      deletingId === link._id ||
                      disabled ||
                      reordering
                    }
                    toggling={togglingId === link._id}
                    deleting={deletingId === link._id}
                    onStartEdit={onStartEdit}
                    onToggleVisibility={onToggleVisibility}
                    onDelete={onDelete}
                  />
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function RowActions({
  link,
  busy,
  toggling,
  deleting,
  onStartEdit,
  onToggleVisibility,
  onDelete,
}: {
  link: PublicLink;
  busy: boolean;
  toggling: boolean;
  deleting: boolean;
  onStartEdit: (link: PublicLink) => void;
  onToggleVisibility: (link: PublicLink) => void;
  onDelete: (link: PublicLink) => void;
}): ReactNode {
  return (
    <>
      <button
        type="button"
        disabled={busy}
        // stopPropagation so a click doesn't start a weird drag
        onClick={(e) => {
          e.stopPropagation();
          onStartEdit(link);
        }}
        className="text-xs text-text-muted underline-offset-2 hover:text-brand hover:underline disabled:opacity-50"
      >
        Edit
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility(link);
        }}
        className="text-xs text-text-muted underline-offset-2 hover:text-brand hover:underline disabled:opacity-50"
      >
        {toggling ? "…" : link.isVisible ? "Hide" : "Show"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(link);
        }}
        className="text-xs text-danger underline-offset-2 hover:underline disabled:opacity-50"
      >
        {deleting ? "…" : "Delete"}
      </button>
    </>
  );
}
