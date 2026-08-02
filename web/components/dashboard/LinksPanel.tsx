"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { SortableLinkList } from "@/components/SortableLinkList";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import type { ApiSuccess, PublicLink } from "@/lib/types";

type Props = {
  initialLinks: PublicLink[];
  // Parent uses this for the first-run guide (has links? yes/no)
  onLinkCountChange?: (count: number) => void;
};

// All link CRUD + reorder lives here so dashboard/page.tsx only loads data
export function LinksPanel({ initialLinks, onLinkCountChange }: Props) {
  const router = useRouter();

  const [links, setLinks] = useState(initialLinks);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  // Shown in this section (not at page bottom)
  const [panelError, setPanelError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [reordering, setReordering] = useState(false);

  const linksBeforeDrag = useRef<PublicLink[]>([]);
  const linksRef = useRef(links);
  linksRef.current = links;

  // Keep parent guide in sync whenever the list changes
  function commitLinks(next: PublicLink[]) {
    linksRef.current = next;
    setLinks(next);
    onLinkCountChange?.(next.length);
  }

  function requireToken() {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return null;
    }
    return token;
  }

  async function onAddLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (adding) return;

    const token = requireToken();
    if (!token) return;

    setAdding(true);
    setAddError("");

    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/v1/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          url: newUrl.trim(),
        }),
      });

      const data = (await res.json()) as ApiSuccess<{
        link: PublicLink;
      }> & { message?: string };

      if (!res.ok) {
        setAddError(data.message || "Could not create link");
        return;
      }

      commitLinks([...linksRef.current, data.data.link]);
      setNewTitle("");
      setNewUrl("");
    } catch {
      setAddError("Cannot reach API. Is the backend running?");
    } finally {
      setAdding(false);
    }
  }

  async function toggleVisibility(link: PublicLink) {
    if (togglingId) return;

    const token = requireToken();
    if (!token) return;

    setTogglingId(link._id);
    setPanelError("");

    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/v1/links/${link._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isVisible: !link.isVisible }),
      });

      const data = (await res.json()) as ApiSuccess<{
        link: PublicLink;
      }> & { message?: string };

      if (!res.ok) {
        setPanelError(data.message || "Could not update link");
        return;
      }

      commitLinks(
        linksRef.current.map((item) =>
          item._id === data.data.link._id ? data.data.link : item,
        ),
      );
    } catch {
      setPanelError("Cannot reach API. Is the backend running?");
    } finally {
      setTogglingId(null);
    }
  }

  async function deleteLink(link: PublicLink) {
    if (deletingId) return;

    const ok = window.confirm(`Delete “${link.title}”? This cannot be undone.`);
    if (!ok) return;

    const token = requireToken();
    if (!token) return;

    setDeletingId(link._id);
    setPanelError("");

    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/v1/links/${link._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        let message = "Could not delete link";
        try {
          const data = (await res.json()) as { message?: string };
          message = data.message || message;
        } catch {
          // empty body
        }
        setPanelError(message);
        return;
      }

      commitLinks(linksRef.current.filter((item) => item._id !== link._id));
    } catch {
      setPanelError("Cannot reach API. Is the backend running?");
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(link: PublicLink) {
    setEditingId(link._id);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setPanelError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditUrl("");
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId || savingEdit) return;

    const token = requireToken();
    if (!token) return;

    setSavingEdit(true);
    setPanelError("");

    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/v1/links/${editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          url: editUrl.trim(),
        }),
      });

      const data = (await res.json()) as ApiSuccess<{
        link: PublicLink;
      }> & { message?: string };

      if (!res.ok) {
        setPanelError(data.message || "Could not update link");
        return;
      }

      commitLinks(
        linksRef.current.map((item) =>
          item._id === data.data.link._id ? data.data.link : item,
        ),
      );
      cancelEdit();
    } catch {
      setPanelError("Cannot reach API. Is the backend running?");
    } finally {
      setSavingEdit(false);
    }
  }

  function handleMove(next: PublicLink[]) {
    if (linksBeforeDrag.current.length === 0) {
      linksBeforeDrag.current = linksRef.current;
    }
    commitLinks(next);
  }

  async function handleDragEndCommit() {
    const before = linksBeforeDrag.current;
    linksBeforeDrag.current = [];

    if (before.length === 0) return;

    const current = linksRef.current;
    const unchanged = before.every((l, i) => l._id === current[i]?._id);
    if (unchanged) return;

    const token = requireToken();
    if (!token) return;

    setReordering(true);
    setPanelError("");

    try {
      const res = await fetch(`${CLIENT_API_BASE}/api/v1/links/reorder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          links: current.map((link, index) => ({
            id: link._id,
            order: index,
          })),
        }),
      });

      const data = (await res.json()) as ApiSuccess<{
        links: PublicLink[];
      }> & { message?: string };

      if (!res.ok) {
        commitLinks(before);
        setPanelError(data.message || "Could not reorder links");
        return;
      }

      commitLinks(data.data.links);
    } catch {
      commitLinks(before);
      setPanelError("Cannot reach API. Is the backend running?");
    } finally {
      setReordering(false);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-semibold text-text">
          Your links
        </h2>
        <span className="text-xs text-text-muted">{links.length} total</span>
      </div>

      <form
        onSubmit={onAddLink}
        className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4"
      >
        <p className="text-xs text-text-muted">
          Start with one link — title + URL. You can reorder later.
        </p>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-muted">Title</span>
          <input
            type="text"
            required
            maxLength={100}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="My portfolio"
            className="rounded-md border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-muted">URL</span>
          <input
            type="url"
            required
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://example.com"
            className="rounded-md border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
          />
        </label>
        {addError ? <p className="text-sm text-danger">{addError}</p> : null}
        <button
          type="submit"
          disabled={adding}
          className="rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse hover:bg-brand-hover disabled:opacity-50"
        >
          {adding ? "Adding…" : "Add link"}
        </button>
      </form>

      {links.length === 0 ? (
          <p className="text-sm text-text-muted">
            No links yet — that&apos;s step 1 in Getting started above.
          </p>
      ) : (
        <>
          <p className="text-xs text-text-muted">
            Drag rows by the handle to reorder. Order is saved when you drop.
            {reordering ? " Saving…" : ""}
          </p>
          {panelError ? (
            <p className="text-sm text-danger" role="alert">
              {panelError}
            </p>
          ) : null}
          <SortableLinkList
            links={links}
            onMove={handleMove}
            onDragEndCommit={() => void handleDragEndCommit()}
            reordering={reordering}
            disabled={editingId !== null}
            editingId={editingId}
            editTitle={editTitle}
            editUrl={editUrl}
            savingEdit={savingEdit}
            togglingId={togglingId}
            deletingId={deletingId}
            onEditTitleChange={setEditTitle}
            onEditUrlChange={setEditUrl}
            onSaveEdit={saveEdit}
            onCancelEdit={cancelEdit}
            onStartEdit={startEdit}
            onToggleVisibility={(link) => void toggleVisibility(link)}
            onDelete={(link) => void deleteLink(link)}
          />
        </>
      )}
    </section>
  );
}
