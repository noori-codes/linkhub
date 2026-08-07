"use client";

import Image from "next/image";
import {
  useState,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import type { PublicLink } from "@/lib/types";
import { uiBtnPrimary, uiBtnSecondary, uiBtnIcon, uiInput } from "@/lib/ui";

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
            className={`rounded-xl border border-border bg-surface/90 px-4 py-3 transition-opacity ${
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
                  className={uiInput}
                />
                <input
                  type="url"
                  required
                  value={editUrl}
                  onChange={(e) => onEditUrlChange(e.target.value)}
                  className={uiInput}
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className={uiBtnPrimary}
                  >
                    {savingEdit ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    disabled={savingEdit}
                    onClick={onCancelEdit}
                    className={uiBtnSecondary}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                {/* Only the handle is draggable — buttons stay clickable */}
                <button
                  type="button"
                  draggable={!disabled && !reordering}
                  onDragStart={(e) => onDragStart(e, link._id)}
                  onDragEnd={onDragEnd}
                  aria-label={`Drag to reorder ${link.title}`}
                  className="shrink-0 cursor-grab select-none px-1 text-text-muted active:cursor-grabbing"
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
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p
                      className={
                        link.isVisible
                          ? "text-[10px] uppercase tracking-wide text-brand"
                          : "text-[10px] uppercase tracking-wide text-text-muted"
                      }
                    >
                      {link.isVisible ? "visible" : "hidden"}
                    </p>
                    <span className="text-[10px] uppercase tracking-wide text-text-muted">
                      {link.clickCount} click{link.clickCount === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
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
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        disabled={busy}
        title="Edit"
        aria-label={`Edit ${link.title}`}
        onClick={(e) => {
          e.stopPropagation();
          onStartEdit(link);
        }}
        className={uiBtnIcon}
      >
        <Image src="/edit.svg" alt="" width={16} height={16} />
      </button>

      <button
        type="button"
        disabled={busy}
        title="Delete"
        aria-label={deleting ? "Deleting…" : `Delete ${link.title}`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(link);
        }}
        className={uiBtnIcon}
      >
        <Image src="/delete.svg" alt="" width={16} height={16} />
      </button>

      <button
        type="button"
        role="switch"
        aria-checked={link.isVisible}
        disabled={busy}
        title={
          link.isVisible ? "Visible on public page" : "Hidden from public page"
        }
        aria-label={
          toggling
            ? "Updating visibility…"
            : link.isVisible
              ? `Hide ${link.title}`
              : `Show ${link.title}`
        }
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility(link);
        }}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-40 ${
          link.isVisible ? "bg-brand" : "bg-border"
        }`}
      >
        <span
          aria-hidden
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-surface shadow-sm transition-transform ${
            link.isVisible ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
