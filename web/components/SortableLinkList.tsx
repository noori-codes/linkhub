"use client";

import Image from "next/image";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { type FormEvent, type ReactNode } from "react";

import type { PublicLink } from "@/lib/types";
import { uiBtnPrimary, uiBtnSecondary, uiBtnIcon, uiInput } from "@/lib/ui";

type Props = {
  links: PublicLink[];
  onMove: (next: PublicLink[]) => void;
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
  const sortingLocked = disabled || reordering;

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled || sortingLocked) return;

        const { source } = event.operation;
        if (!isSortable(source)) return;

        const { initialIndex, index } = source;
        if (initialIndex === index) return;

        onMove(moveItem(links, initialIndex, index));
        onDragEndCommit();
      }}
    >
      <ul className="flex flex-col gap-2">
        {links.map((link, index) => (
          <SortableLinkRow
            key={link._id}
            link={link}
            index={index}
            sortingLocked={sortingLocked}
            isEditing={editingId === link._id}
            editTitle={editTitle}
            editUrl={editUrl}
            savingEdit={savingEdit}
            togglingId={togglingId}
            deletingId={deletingId}
            onEditTitleChange={onEditTitleChange}
            onEditUrlChange={onEditUrlChange}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
            onStartEdit={onStartEdit}
            onToggleVisibility={onToggleVisibility}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </DragDropProvider>
  );
}

function SortableLinkRow({
  link,
  index,
  sortingLocked,
  isEditing,
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
}: {
  link: PublicLink;
  index: number;
  sortingLocked: boolean;
  isEditing: boolean;
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
}) {
  const { ref, handleRef, isDragging } = useSortable({
    id: link._id,
    index,
    disabled: sortingLocked || isEditing,
  });

  return (
    <li
      ref={ref}
      className={`rounded-xl border border-border bg-surface/90 px-4 py-3 transition-[opacity,box-shadow,transform] ${
        isDragging
          ? "z-10 scale-[1.01] opacity-95 shadow-[0_12px_28px_-16px_rgba(18,20,26,0.45)]"
          : ""
      } ${sortingLocked ? "opacity-70" : ""}`}
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
          <button
            ref={handleRef}
            type="button"
            aria-label={`Drag to reorder ${link.title}`}
            className="shrink-0 cursor-grab select-none px-1 text-text-muted touch-none active:cursor-grabbing disabled:cursor-default disabled:opacity-40"
            disabled={sortingLocked}
          >
            ⋮⋮
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text">{link.title}</p>
            <p className="mt-0.5 truncate text-xs text-text-muted">{link.url}</p>
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
              sortingLocked
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
