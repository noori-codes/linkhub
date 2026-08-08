"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { SettingsCard } from "@/components/dashboard/SettingsCard";
import { EmptyState } from "@/components/EmptyState";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { getToken } from "@/lib/auth";
import { Loader } from "@/components/Loader";
import {
  fetchMyCollections,
  HttpError,
  queryKeys,
} from "@/lib/dashboard-queries";
import type { ApiSuccess, ShopCollection, ShopProduct } from "@/lib/types";
import { uiBtnPrimary, uiBtnSecondary, uiInput } from "@/lib/ui";

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

const inputClass = uiInput;

function ProductPicker({
  products,
  selected,
  onToggle,
}: {
  products: ShopProduct[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  if (products.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-bg/60 px-3 py-3 text-xs text-text-muted">
        Add products first, then assign them here.
      </p>
    );
  }

  return (
    <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-xl border border-border bg-bg p-1.5">
      {products.map((product) => {
        const checked = selected.includes(product._id);
        return (
          <li key={product._id}>
            <label
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                checked
                  ? "bg-brand-muted text-text"
                  : "text-text hover:bg-surface"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(product._id)}
                className="accent-brand"
              />
              <span className="min-w-0 truncate">{product.title}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

type Props = {
  products: ShopProduct[];
};

export function CollectionsSection({ products }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [visible, setVisible] = useState(true);
  const [formError, setFormError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSelectedIds, setEditSelectedIds] = useState<string[]>([]);
  const [editVisible, setEditVisible] = useState(true);

  const collectionsQuery = useQuery({
    queryKey: queryKeys.collectionsMe,
    queryFn: fetchMyCollections,
    retry: false,
  });

  function requireToken() {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return null;
    }
    return token;
  }

  function resetAdd() {
    setTitle("");
    setDescription("");
    setSelectedIds([]);
    setVisible(true);
    setFormError("");
    setShowAdd(false);
  }

  function toggleId(
    id: string,
    list: string[],
    setList: (next: string[]) => void,
  ) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  const createCollection = useMutation({
    mutationFn: async () => {
      const token = requireToken();
      if (!token) throw new HttpError("Please log in again.", 401);

      const res = await fetch(`${CLIENT_API_BASE}/api/v1/collections`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          products: selectedIds,
          isVisible: visible,
        }),
      });

      const json = (await res.json()) as ApiSuccess<{
        collection: ShopCollection;
      }> & { message?: string };

      if (!res.ok) {
        throw new HttpError(
          json.message || "Could not create collection",
          res.status,
        );
      }

      return json.data.collection;
    },
    onSuccess: async () => {
      toast.success("Collection created");
      resetAdd();
      await queryClient.invalidateQueries({ queryKey: queryKeys.collectionsMe });
    },
    onError: (err) => {
      const message =
        err instanceof HttpError
          ? err.message
          : "Cannot reach API. Is the backend running?";
      setFormError(message);
    },
  });

  const updateCollection = useMutation({
    mutationFn: async (id: string) => {
      const token = requireToken();
      if (!token) throw new HttpError("Please log in again.", 401);

      const res = await fetch(
        `${CLIENT_API_BASE}/api/v1/collections/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: authHeaders(token),
          body: JSON.stringify({
            title: editTitle.trim(),
            description: editDescription.trim(),
            products: editSelectedIds,
            isVisible: editVisible,
          }),
        },
      );

      const json = (await res.json()) as ApiSuccess<{
        collection: ShopCollection;
      }> & { message?: string };

      if (!res.ok) {
        throw new HttpError(
          json.message || "Could not update collection",
          res.status,
        );
      }

      return json.data.collection;
    },
    onSuccess: async () => {
      toast.success("Collection saved");
      setEditingId(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.collectionsMe });
    },
    onError: (err) => {
      const message =
        err instanceof HttpError
          ? err.message
          : "Cannot reach API. Is the backend running?";
      toast.error(message);
    },
  });

  const deleteCollection = useMutation({
    mutationFn: async (id: string) => {
      const token = requireToken();
      if (!token) throw new HttpError("Please log in again.", 401);

      const res = await fetch(
        `${CLIENT_API_BASE}/api/v1/collections/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok && res.status !== 204) {
        const json = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new HttpError(
          json.message || "Could not delete collection",
          res.status,
        );
      }
    },
    onSuccess: async () => {
      toast.success("Collection deleted");
      if (editingId) setEditingId(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.collectionsMe });
    },
    onError: (err) => {
      toast.error(
        err instanceof HttpError
          ? err.message
          : "Cannot reach API. Is the backend running?",
      );
    },
  });

  function startEdit(collection: ShopCollection) {
    setEditingId(collection._id);
    setEditTitle(collection.title);
    setEditDescription(collection.description ?? "");
    setEditSelectedIds(collection.products.map((p) => p._id));
    setEditVisible(collection.isVisible);
    setShowAdd(false);
  }

  function onCreate(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    if (!title.trim()) {
      setFormError("Please add a title.");
      return;
    }
    createCollection.mutate();
  }

  function onSaveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editingId) return;
    if (!editTitle.trim()) {
      toast.error("Please add a title.");
      return;
    }
    updateCollection.mutate(editingId);
  }

  if (collectionsQuery.isLoading) {
    return (
      <SettingsCard
        title="Collections"
        description="Group products into sections on your public shop."
      >
        <Loader label="Loading collections…" size="sm" className="py-6" />
      </SettingsCard>
    );
  }

  if (collectionsQuery.isError) {
    const message =
      collectionsQuery.error instanceof HttpError
        ? collectionsQuery.error.message
        : "Cannot reach API. Is the backend running?";
    return (
      <SettingsCard
        title="Collections"
        description="Group products into sections on your public shop."
      >
        <p className="text-sm text-danger" role="alert">
          {message}
        </p>
      </SettingsCard>
    );
  }

  const collections = collectionsQuery.data ?? [];

  return (
    <SettingsCard
      title="Collections"
      description="Group products into sections on your public shop."
      badge={
        !showAdd && !editingId ? (
          <button
            type="button"
            onClick={() => {
              setShowAdd(true);
              setFormError("");
            }}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:border-brand"
          >
            Add collection
          </button>
        ) : null
      }
    >
      <div className="flex flex-col gap-3">
        {collections.length === 0 && !showAdd ? (
          <EmptyState
            title="No collections yet"
            hint="Create a collection to group products into sections on your public shop."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {collections.map((collection) => {
              const isEditing = editingId === collection._id;

              if (isEditing) {
                return (
                  <li
                    key={collection._id}
                    className="rounded-xl border border-border bg-bg/50 px-4 py-3.5"
                  >
                    <form onSubmit={onSaveEdit} className="flex flex-col gap-3">
                      <input
                        type="text"
                        required
                        maxLength={120}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Collection title"
                        className={inputClass}
                      />
                      <textarea
                        maxLength={500}
                        rows={2}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Short description (optional)"
                        className={inputClass}
                      />
                      <div>
                        <p className="mb-1.5 text-xs font-medium text-text">
                          Products
                        </p>
                        <ProductPicker
                          products={products}
                          selected={editSelectedIds}
                          onToggle={(id) =>
                            toggleId(id, editSelectedIds, setEditSelectedIds)
                          }
                        />
                      </div>
                      <label className="flex items-center gap-2 text-xs text-text-muted">
                        <input
                          type="checkbox"
                          checked={editVisible}
                          onChange={(e) => setEditVisible(e.target.checked)}
                          className="accent-brand"
                        />
                        Visible on public page
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          disabled={updateCollection.isPending}
                          className={uiBtnPrimary}
                        >
                          {updateCollection.isPending ? "Saving…" : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className={uiBtnSecondary}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </li>
                );
              }

              return (
                <li
                  key={collection._id}
                  className="rounded-xl border border-border bg-bg/40 px-4 py-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-text">
                          {collection.title}
                        </p>
                        {!collection.isVisible ? (
                          <span className="rounded-full bg-border/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                            Hidden
                          </span>
                        ) : null}
                      </div>
                      {collection.description ? (
                        <p className="mt-0.5 line-clamp-2 text-xs text-text-muted">
                          {collection.description}
                        </p>
                      ) : null}
                      <p className="mt-1.5 text-[11px] text-text-muted">
                        {collection.products.length} product
                        {collection.products.length === 1 ? "" : "s"}
                        {collection.products.length > 0
                          ? ` · ${collection.products.map((p) => p.title).join(", ")}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEdit(collection)}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text transition-colors hover:border-brand"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={deleteCollection.isPending}
                        onClick={() => {
                          if (
                            !window.confirm(
                              `Delete “${collection.title}”? Products stay in your shop.`,
                            )
                          ) {
                            return;
                          }
                          deleteCollection.mutate(collection._id);
                        }}
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-danger transition-colors hover:border-danger disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {showAdd ? (
          <form
            onSubmit={onCreate}
            className="flex flex-col gap-3 rounded-xl border border-border bg-bg/50 px-4 py-4"
          >
            <p className="text-sm font-semibold text-text">New collection</p>
            <input
              type="text"
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Favorites, Merch, Gear"
              autoFocus
              className={inputClass}
            />
            <textarea
              maxLength={500}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description (optional)"
              className={inputClass}
            />
            <div>
              <p className="mb-1.5 text-xs font-medium text-text">Products</p>
              <ProductPicker
                products={products}
                selected={selectedIds}
                onToggle={(id) => toggleId(id, selectedIds, setSelectedIds)}
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-text-muted">
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
                className="accent-brand"
              />
              Visible on public page
            </label>
            {formError ? (
              <p className="text-sm text-danger" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={createCollection.isPending}
                className={uiBtnPrimary}
              >
                {createCollection.isPending ? "Creating…" : "Create"}
              </button>
              <button
                type="button"
                onClick={resetAdd}
                className={uiBtnSecondary}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </SettingsCard>
  );
}
