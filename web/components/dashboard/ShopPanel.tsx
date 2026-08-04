"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { CLIENT_API_BASE } from "@/lib/client-api";
import { clearToken, getToken } from "@/lib/auth";
import {
  fetchMyProducts,
  fetchProductLinks,
  HttpError,
  queryKeys,
} from "@/lib/dashboard-queries";
import type { ApiSuccess, ShopProduct, ShopProductLink } from "@/lib/types";

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/** Owner shop: products + nested buy/affiliate links. */
export function ShopPanel() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productTitle, setProductTitle] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productError, setProductError] = useState("");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkAffiliate, setLinkAffiliate] = useState(true);
  const [linkError, setLinkError] = useState("");
  const [panelError, setPanelError] = useState("");

  const productsQuery = useQuery({
    queryKey: queryKeys.productsMe,
    queryFn: fetchMyProducts,
    retry: false,
  });

  useEffect(() => {
    if (productsQuery.error instanceof HttpError && productsQuery.error.status === 401) {
      clearToken();
      router.replace("/login");
    }
  }, [productsQuery.error, router]);

  function requireToken() {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return null;
    }
    return token;
  }

  const createProduct = useMutation({
    mutationFn: async () => {
      const token = requireToken();
      if (!token) throw new HttpError("Please log in again.", 401);

      const res = await fetch(`${CLIENT_API_BASE}/api/v1/products`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          title: productTitle.trim(),
          description: productDescription.trim(),
        }),
      });

      const json = (await res.json()) as ApiSuccess<{ product: ShopProduct }> & {
        message?: string;
      };

      if (!res.ok) {
        throw new HttpError(json.message || "Could not create product", res.status);
      }

      return json.data.product;
    },
    onSuccess: async () => {
      setProductTitle("");
      setProductDescription("");
      setShowAddProduct(false);
      setProductError("");
      await queryClient.invalidateQueries({ queryKey: queryKeys.productsMe });
    },
    onError: (err) => {
      setProductError(
        err instanceof Error ? err.message : "Could not create product",
      );
    },
  });

  const updateProduct = useMutation({
    mutationFn: async (input: {
      id: string;
      title?: string;
      description?: string;
      isVisible?: boolean;
    }) => {
      const token = requireToken();
      if (!token) throw new HttpError("Please log in again.", 401);

      const body: Record<string, unknown> = {};
      if (input.title !== undefined) body.title = input.title;
      if (input.description !== undefined) body.description = input.description;
      if (input.isVisible !== undefined) body.isVisible = input.isVisible;

      const res = await fetch(`${CLIENT_API_BASE}/api/v1/products/${input.id}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify(body),
      });

      const json = (await res.json()) as ApiSuccess<{ product: ShopProduct }> & {
        message?: string;
      };

      if (!res.ok) {
        throw new HttpError(json.message || "Could not update product", res.status);
      }

      return json.data.product;
    },
    onSuccess: async () => {
      setEditingId(null);
      setPanelError("");
      await queryClient.invalidateQueries({ queryKey: queryKeys.productsMe });
    },
    onError: (err) => {
      setPanelError(err instanceof Error ? err.message : "Could not update product");
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const token = requireToken();
      if (!token) throw new HttpError("Please log in again.", 401);

      const res = await fetch(`${CLIENT_API_BASE}/api/v1/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        let message = "Could not delete product";
        try {
          const json = (await res.json()) as { message?: string };
          message = json.message || message;
        } catch {
          // empty body
        }
        throw new HttpError(message, res.status);
      }
    },
    onSuccess: async (_data, id) => {
      if (expandedId === id) setExpandedId(null);
      setPanelError("");
      await queryClient.invalidateQueries({ queryKey: queryKeys.productsMe });
    },
    onError: (err) => {
      setPanelError(err instanceof Error ? err.message : "Could not delete product");
    },
  });

  const createLink = useMutation({
    mutationFn: async (productId: string) => {
      const token = requireToken();
      if (!token) throw new HttpError("Please log in again.", 401);

      const res = await fetch(
        `${CLIENT_API_BASE}/api/v1/products/${productId}/links`,
        {
          method: "POST",
          headers: authHeaders(token),
          body: JSON.stringify({
            title: linkTitle.trim(),
            url: linkUrl.trim(),
            isAffiliate: linkAffiliate,
          }),
        },
      );

      const json = (await res.json()) as ApiSuccess<{
        productLink: ShopProductLink;
      }> & { message?: string };

      if (!res.ok) {
        throw new HttpError(json.message || "Could not create link", res.status);
      }

      return json.data.productLink;
    },
    onSuccess: async (_data, productId) => {
      setLinkTitle("");
      setLinkUrl("");
      setLinkAffiliate(true);
      setLinkError("");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.productLinks(productId),
      });
    },
    onError: (err) => {
      setLinkError(err instanceof Error ? err.message : "Could not create link");
    },
  });

  const deleteLink = useMutation({
    mutationFn: async (input: { productId: string; linkId: string }) => {
      const token = requireToken();
      if (!token) throw new HttpError("Please log in again.", 401);

      const res = await fetch(
        `${CLIENT_API_BASE}/api/v1/products/${input.productId}/links/${input.linkId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        let message = "Could not delete link";
        try {
          const json = (await res.json()) as { message?: string };
          message = json.message || message;
        } catch {
          // empty
        }
        throw new HttpError(message, res.status);
      }
    },
    onSuccess: async (_data, input) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.productLinks(input.productId),
      });
    },
    onError: (err) => {
      setPanelError(err instanceof Error ? err.message : "Could not delete link");
    },
  });

  function onAddProduct(event: FormEvent) {
    event.preventDefault();
    setProductError("");
    createProduct.mutate();
  }

  function onSaveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editingId) return;
    updateProduct.mutate({
      id: editingId,
      title: editTitle.trim(),
      description: editDescription.trim(),
    });
  }

  if (productsQuery.isLoading) {
    return <p className="text-sm text-text-muted">Loading shop…</p>;
  }

  if (productsQuery.isError) {
    const message =
      productsQuery.error instanceof HttpError
        ? productsQuery.error.message
        : "Cannot reach API. Is the backend running?";
    return (
      <p className="text-sm text-danger" role="alert">
        {message}
      </p>
    );
  }

  const products = productsQuery.data ?? [];

  return (
    <section className="flex flex-col gap-4">
      <p className="text-xs text-text-muted">
        {products.length} product{products.length === 1 ? "" : "s"}
      </p>

      {panelError ? (
        <p className="text-sm text-danger" role="alert">
          {panelError}
        </p>
      ) : null}

      {products.length === 0 ? (
        <p className="text-sm text-text-muted">No products yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {products.map((product) => {
            const isEditing = editingId === product._id;
            const isExpanded = expandedId === product._id;

            return (
              <li
                key={product._id}
                className="rounded-xl border border-border bg-surface/90 px-4 py-3"
              >
                {isEditing ? (
                  <form onSubmit={onSaveEdit} className="flex flex-col gap-2">
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand"
                    />
                    <textarea
                      maxLength={1000}
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={updateProduct.isPending}
                        className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-text-inverse hover:bg-brand-hover disabled:opacity-50"
                      >
                        {updateProduct.isPending ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-md border border-border px-3 py-2 text-sm text-text-muted hover:text-text"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-snug text-text">
                            {product.title}
                          </p>
                          {product.description ? (
                            <p className="mt-1 text-sm leading-relaxed text-text-muted">
                              {product.description}
                            </p>
                          ) : (
                            <p className="mt-1 text-sm text-text-muted">
                              No description
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={product.isVisible}
                          title={
                            product.isVisible
                              ? "Visible on public page"
                              : "Hidden from public page"
                          }
                          aria-label={
                            product.isVisible
                              ? `Hide ${product.title}`
                              : `Show ${product.title}`
                          }
                          onClick={() =>
                            updateProduct.mutate({
                              id: product._id,
                              isVisible: !product.isVisible,
                            })
                          }
                          className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${
                            product.isVisible ? "bg-brand" : "bg-border"
                          }`}
                        >
                          <span
                            aria-hidden
                            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-surface shadow-sm transition-transform ${
                              product.isVisible
                                ? "translate-x-4"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                        <p
                          className={
                            product.isVisible
                              ? "text-[10px] uppercase tracking-wide text-brand"
                              : "text-[10px] uppercase tracking-wide text-text-muted"
                          }
                        >
                          {product.isVisible ? "visible" : "hidden"}
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Edit"
                            aria-label={`Edit ${product.title}`}
                            onClick={() => {
                              setEditingId(product._id);
                              setEditTitle(product.title);
                              setEditDescription(product.description || "");
                            }}
                            className="rounded-md p-1.5 opacity-70 transition-opacity hover:bg-bg hover:opacity-100"
                          >
                            <Image
                              src="/edit.svg"
                              alt=""
                              width={16}
                              height={16}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(isExpanded ? null : product._id)
                            }
                            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                              isExpanded
                                ? "bg-brand-muted text-text"
                                : "text-text-muted hover:bg-bg hover:text-text"
                            }`}
                          >
                            {isExpanded ? "Close" : "Buy links"}
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            aria-label={`Delete ${product.title}`}
                            disabled={deleteProduct.isPending}
                            onClick={() => {
                              const ok = window.confirm(
                                `Delete “${product.title}”? Buy links under it will be removed too.`,
                              );
                              if (ok) deleteProduct.mutate(product._id);
                            }}
                            className="rounded-md p-1.5 opacity-70 transition-opacity hover:bg-bg hover:opacity-100 disabled:opacity-40"
                          >
                            <Image
                              src="/delete.svg"
                              alt=""
                              width={16}
                              height={16}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded ? (
                      <ProductLinksSection
                        productId={product._id}
                        linkTitle={linkTitle}
                        linkUrl={linkUrl}
                        linkAffiliate={linkAffiliate}
                        linkError={linkError}
                        adding={createLink.isPending}
                        onLinkTitleChange={setLinkTitle}
                        onLinkUrlChange={setLinkUrl}
                        onLinkAffiliateChange={setLinkAffiliate}
                        onAddLink={(e) => {
                          e.preventDefault();
                          setLinkError("");
                          createLink.mutate(product._id);
                        }}
                        onDeleteLink={(linkId) =>
                          deleteLink.mutate({
                            productId: product._id,
                            linkId,
                          })
                        }
                      />
                    ) : null}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {!showAddProduct ? (
        <button
          type="button"
          onClick={() => {
            setShowAddProduct(true);
            setProductError("");
          }}
          className="rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse hover:bg-brand-hover"
        >
          Add product
        </button>
      ) : (
        <form onSubmit={onAddProduct} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-text-muted">Title</span>
            <input
              type="text"
              required
              maxLength={120}
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              placeholder="Mechanical Keyboard"
              autoFocus
              className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-text-muted">Description</span>
            <textarea
              maxLength={1000}
              rows={3}
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Short note for visitors"
              className="rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand"
            />
          </label>
          {productError ? (
            <p className="text-sm text-danger">{productError}</p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createProduct.isPending}
              className="rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse hover:bg-brand-hover disabled:opacity-50"
            >
              {createProduct.isPending ? "Adding…" : "Save product"}
            </button>
            <button
              type="button"
              disabled={createProduct.isPending}
              onClick={() => {
                setShowAddProduct(false);
                setProductTitle("");
                setProductDescription("");
                setProductError("");
              }}
              className="rounded-md border border-border px-4 py-2.5 text-sm text-text-muted hover:text-text disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function ProductLinksSection({
  productId,
  linkTitle,
  linkUrl,
  linkAffiliate,
  linkError,
  adding,
  onLinkTitleChange,
  onLinkUrlChange,
  onLinkAffiliateChange,
  onAddLink,
  onDeleteLink,
}: {
  productId: string;
  linkTitle: string;
  linkUrl: string;
  linkAffiliate: boolean;
  linkError: string;
  adding: boolean;
  onLinkTitleChange: (value: string) => void;
  onLinkUrlChange: (value: string) => void;
  onLinkAffiliateChange: (value: boolean) => void;
  onAddLink: (event: FormEvent) => void;
  onDeleteLink: (linkId: string) => void;
}) {
  const linksQuery = useQuery({
    queryKey: queryKeys.productLinks(productId),
    queryFn: () => fetchProductLinks(productId),
    retry: false,
  });

  return (
    <div className="mt-3 border-t border-border pt-3">
      <p className="mb-2 text-xs font-medium text-text">Buy / affiliate links</p>

      {linksQuery.isLoading ? (
        <p className="text-xs text-text-muted">Loading links…</p>
      ) : null}

      {linksQuery.isError ? (
        <p className="text-xs text-danger">Could not load links.</p>
      ) : null}

      {(linksQuery.data ?? []).length > 0 ? (
        <ul className="mb-3 flex flex-col gap-1.5">
          {(linksQuery.data ?? []).map((link) => (
            <li
              key={link._id}
              className="flex items-center justify-between gap-2 rounded-md border border-border px-2.5 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-text">
                  {link.title}
                  {link.isAffiliate ? (
                    <span className="ml-1.5 text-[10px] uppercase tracking-wide text-text-muted">
                      affiliate
                    </span>
                  ) : null}
                </p>
                <p className="truncate text-[11px] text-text-muted">{link.url}</p>
              </div>
              <button
                type="button"
                className="shrink-0 text-xs text-danger hover:opacity-80"
                onClick={() => {
                  const ok = window.confirm(`Delete “${link.title}”?`);
                  if (ok) onDeleteLink(link._id);
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : linksQuery.isSuccess ? (
        <p className="mb-3 text-xs text-text-muted">No buy links yet.</p>
      ) : null}

      <form onSubmit={onAddLink} className="flex flex-col gap-2">
        <input
          type="text"
          required
          maxLength={100}
          value={linkTitle}
          onChange={(e) => onLinkTitleChange(e.target.value)}
          placeholder="Buy on Amazon"
          className="rounded-md border border-border bg-bg px-3 py-2 text-xs text-text outline-none focus:border-brand"
        />
        <input
          type="url"
          required
          value={linkUrl}
          onChange={(e) => onLinkUrlChange(e.target.value)}
          placeholder="https://…"
          className="rounded-md border border-border bg-bg px-3 py-2 text-xs text-text outline-none focus:border-brand"
        />
        <label className="flex items-center gap-2 text-xs text-text-muted">
          <input
            type="checkbox"
            checked={linkAffiliate}
            onChange={(e) => onLinkAffiliateChange(e.target.checked)}
          />
          Affiliate link
        </label>
        {linkError ? <p className="text-xs text-danger">{linkError}</p> : null}
        <button
          type="submit"
          disabled={adding}
          className="self-start rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text hover:border-brand disabled:opacity-50"
        >
          {adding ? "Adding…" : "Add link"}
        </button>
      </form>
    </div>
  );
}
