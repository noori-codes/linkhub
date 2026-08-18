"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CLIENT_API_BASE, NETWORK_ERROR } from "@/lib/client-api";
import { clearToken, getToken } from "@/lib/auth";
import { CollectionsSection } from "@/components/dashboard/CollectionsSection";
import { EmptyState } from "@/components/EmptyState";
import { SafeRemoteImage } from "@/components/profile/SafeRemoteImage";
import { ShopSkeleton, ListSkeleton } from "@/components/Skeleton";
import {
  fetchMyProducts,
  fetchProductLinks,
  HttpError,
  queryKeys,
} from "@/lib/dashboard-queries";
import type { ApiSuccess, ShopProduct, ShopProductLink } from "@/lib/types";
import {
  uiBtnIcon,
  uiBtnPrimary,
  uiBtnSecondary,
  uiInput,
} from "@/lib/ui";

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function productImageSrc(url: string | undefined) {
  return url?.startsWith("http") ? url : null;
}

export function ShopPanel() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productTitle, setProductTitle] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(
    null,
  );
  const [productImageRemoteUrl, setProductImageRemoteUrl] = useState<
    string | null
  >(null);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkAffiliate, setNewLinkAffiliate] = useState(true);
  const [newProductVisible, setNewProductVisible] = useState(true);
  const [productError, setProductError] = useState("");
  const [importedFromLink, setImportedFromLink] = useState(false);
  const addImageInputRef = useRef<HTMLInputElement>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkAffiliate, setLinkAffiliate] = useState(true);
  const [linkError, setLinkError] = useState("");
  const [panelError, setPanelError] = useState("");
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const imageTargetIdRef = useRef<string | null>(null);

  const productsQuery = useQuery({
    queryKey: queryKeys.productsMe,
    queryFn: fetchMyProducts,
    retry: false,
  });

  useEffect(() => {
    if (
      productsQuery.error instanceof HttpError &&
      productsQuery.error.status === 401
    ) {
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

  function clearAddImage() {
    if (productImageFile && productImagePreview) {
      URL.revokeObjectURL(productImagePreview);
    }
    setProductImageFile(null);
    setProductImagePreview(null);
    setProductImageRemoteUrl(null);
    if (addImageInputRef.current) addImageInputRef.current.value = "";
  }

  function resetAddForm() {
    setProductTitle("");
    setProductDescription("");
    clearAddImage();
    setNewLinkTitle("Shop");
    setNewLinkUrl("");
    setNewLinkAffiliate(true);
    setNewProductVisible(true);
    setProductError("");
    setFetchingPreview(false);
    setImportedFromLink(false);
  }

  async function importFromBuyLink() {
    const token = requireToken();
    if (!token) return;

    const url = newLinkUrl.trim();
    if (!url) {
      setProductError("Paste a product URL to import.");
      return;
    }

    setFetchingPreview(true);
    setProductError("");

    try {
      const res = await fetch(
        `${CLIENT_API_BASE}/api/v1/products/link-preview`,
        {
          method: "POST",
          headers: authHeaders(token),
          body: JSON.stringify({ url }),
        },
      );

      const json = (await res.json()) as ApiSuccess<{
        preview: {
          title: string;
          description: string;
          imageUrl: string | null;
        };
      }> & { message?: string };

      if (!res.ok) {
        throw new HttpError(
          json.message || "Could not import from that link",
          res.status,
        );
      }

      const { preview } = json.data;

      if (preview.title) {
        setProductTitle(preview.title);
      }
      if (preview.description) {
        setProductDescription(preview.description);
      }
      setNewLinkTitle("Shop");

      if (preview.imageUrl) {
        clearAddImage();
        setProductImageRemoteUrl(preview.imageUrl);
        setProductImagePreview(preview.imageUrl);
      }

      setImportedFromLink(true);
      toast.success(
        preview.imageUrl
          ? "Imported title and photo from link"
          : "Imported title from link — add a photo if you want",
      );
    } catch (err) {
      const message =
        err instanceof TypeError
          ? NETWORK_ERROR
          : err instanceof Error
            ? err.message
            : "Could not import from that link";
      setProductError(message);
    } finally {
      setFetchingPreview(false);
    }
  }

  const createProduct = useMutation({
    mutationFn: async () => {
      const token = requireToken();
      if (!token) throw new HttpError("Please log in again.", 401);

      const title = productTitle.trim();
      const buyTitle = newLinkTitle.trim();
      const buyUrl = newLinkUrl.trim();

      if (!buyTitle || !buyUrl) {
        throw new HttpError(
          "Add a buy link title and URL so the product can appear on your page.",
          400,
        );
      }

      const res = await fetch(`${CLIENT_API_BASE}/api/v1/products`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          title,
          description: productDescription.trim(),
          isVisible: newProductVisible,
        }),
      });

      const json = (await res.json()) as ApiSuccess<{
        product: ShopProduct;
      }> & {
        message?: string;
      };

      if (!res.ok) {
        throw new HttpError(
          json.message || "Could not create product",
          res.status,
        );
      }

      const product = json.data.product;

      if (productImageFile) {
        const body = new FormData();
        body.append("image", productImageFile);
        const imageRes = await fetch(
          `${CLIENT_API_BASE}/api/v1/products/${product._id}/image`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body,
          },
        );
        if (!imageRes.ok) {
          let message = "Product saved, but photo upload failed";
          try {
            const imageJson = (await imageRes.json()) as { message?: string };
            message = imageJson.message || message;
          } catch {
          }
          throw new HttpError(message, imageRes.status);
        }
      } else if (productImageRemoteUrl) {
        const imageRes = await fetch(
          `${CLIENT_API_BASE}/api/v1/products/${product._id}/image-from-url`,
          {
            method: "POST",
            headers: authHeaders(token),
            body: JSON.stringify({ imageUrl: productImageRemoteUrl }),
          },
        );
        if (!imageRes.ok) {
          let message = "Product saved, but photo from link failed";
          try {
            const imageJson = (await imageRes.json()) as { message?: string };
            message = imageJson.message || message;
          } catch {
          }
          throw new HttpError(message, imageRes.status);
        }
      }

      const linkRes = await fetch(
        `${CLIENT_API_BASE}/api/v1/products/${product._id}/links`,
        {
          method: "POST",
          headers: authHeaders(token),
          body: JSON.stringify({
            title: buyTitle,
            url: buyUrl,
            isAffiliate: newLinkAffiliate,
          }),
        },
      );

      if (!linkRes.ok) {
        let message = "Product saved, but buy link failed";
        try {
          const linkJson = (await linkRes.json()) as { message?: string };
          message = linkJson.message || message;
        } catch {
        }
        throw new HttpError(message, linkRes.status);
      }

      return product;
    },
    onSuccess: async () => {
      resetAddForm();
      setShowAddProduct(false);
      toast.success("Product added");
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

      const res = await fetch(
        `${CLIENT_API_BASE}/api/v1/products/${input.id}`,
        {
          method: "PATCH",
          headers: authHeaders(token),
          body: JSON.stringify(body),
        },
      );

      const json = (await res.json()) as ApiSuccess<{
        product: ShopProduct;
      }> & {
        message?: string;
      };

      if (!res.ok) {
        throw new HttpError(
          json.message || "Could not update product",
          res.status,
        );
      }

      return json.data.product;
    },
    onSuccess: async () => {
      setEditingId(null);
      setPanelError("");
      await queryClient.invalidateQueries({ queryKey: queryKeys.productsMe });
    },
    onError: (err) => {
      setPanelError(
        err instanceof Error ? err.message : "Could not update product",
      );
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
      setPanelError(
        err instanceof Error ? err.message : "Could not delete product",
      );
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
        throw new HttpError(
          json.message || "Could not create link",
          res.status,
        );
      }

      return json.data.productLink;
    },
    onSuccess: async (_data, productId) => {
      setLinkTitle("");
      setLinkUrl("");
      setLinkAffiliate(true);
      setLinkError("");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.productLinks(productId),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.productsMe }),
      ]);
    },
    onError: (err) => {
      setLinkError(
        err instanceof Error ? err.message : "Could not create link",
      );
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
        }
        throw new HttpError(message, res.status);
      }
    },
    onSuccess: async (_data, input) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.productLinks(input.productId),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.productsMe }),
      ]);
    },
    onError: (err) => {
      setPanelError(
        err instanceof Error ? err.message : "Could not delete link",
      );
    },
  });

  function onAddProduct(event: FormEvent) {
    event.preventDefault();
    setProductError("");
    createProduct.mutate();
  }

  function openProductImagePicker(productId: string) {
    imageTargetIdRef.current = productId;
    imageInputRef.current?.click();
  }

  async function onProductImageSelected(file: File | undefined) {
    const productId = imageTargetIdRef.current;
    imageTargetIdRef.current = null;
    if (!file || !productId) return;

    const token = requireToken();
    if (!token) return;

    setUploadingImageId(productId);

    try {
      const body = new FormData();
      body.append("image", file);

      const res = await fetch(
        `${CLIENT_API_BASE}/api/v1/products/${productId}/image`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body,
        },
      );

      const json = (await res.json()) as ApiSuccess<{
        product: ShopProduct;
      }> & {
        message?: string;
      };

      if (!res.ok) {
        toast.error(json.message || "Could not upload product photo");
        return;
      }

      toast.success("Product photo uploaded");
      await queryClient.invalidateQueries({ queryKey: queryKeys.productsMe });
    } catch {
      toast.error(NETWORK_ERROR);
    } finally {
      setUploadingImageId(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
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
    return <ShopSkeleton />;
  }

  if (productsQuery.isError) {
    const message =
      productsQuery.error instanceof HttpError
        ? productsQuery.error.message
        : NETWORK_ERROR;
    return (
      <p className="text-sm text-danger" role="alert">
        {message}
      </p>
    );
  }

  const products = productsQuery.data ?? [];

  return (
    <section className="flex flex-col gap-4">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => {
          void onProductImageSelected(e.target.files?.[0]);
        }}
      />

      <CollectionsSection products={products} />

      <div className="mt-2 flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold text-text">Products</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            {products.length} product{products.length === 1 ? "" : "s"}
            {products.length === 0
              ? " — add one with a buy link to show on your page."
              : " in your shop."}
          </p>
        </div>

      {panelError ? (
        <p className="text-sm text-danger" role="alert">
          {panelError}
        </p>
      ) : null}

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          hint="Add a product with a buy link to show it on your public page."
        />
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
                      className={uiInput}
                    />
                    <textarea
                      maxLength={1000}
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className={uiInput}
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={updateProduct.isPending}
                        className={uiBtnPrimary}
                      >
                        {updateProduct.isPending ? "Saving…" : "Save"}
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
                ) : (
                  <>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          title="Upload product photo"
                          aria-label={`Upload photo for ${product.title}`}
                          disabled={uploadingImageId === product._id}
                          onClick={() => openProductImagePicker(product._id)}
                          className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-bg transition-colors hover:border-brand/40 disabled:opacity-50"
                        >
                          {productImageSrc(product.imageUrl) ? (
                            <SafeRemoteImage
                              src={product.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-[10px] font-medium leading-tight text-text-muted">
                              {uploadingImageId === product._id
                                ? "…"
                                : "Add\nphoto"}
                            </span>
                          )}
                        </button>
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
                        <div className="min-w-0">
                          {!product.isVisible ? (
                            <p className="text-[10px] uppercase tracking-wide text-text-muted">
                              hidden
                            </p>
                          ) : product.linkCount > 0 ? (
                            <p className="text-[10px] uppercase tracking-wide text-brand">
                              on your page
                            </p>
                          ) : (
                            <p className="text-[11px] leading-snug text-danger">
                              Buy link required to show on your public page
                            </p>
                          )}
                        </div>
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
                            className={uiBtnIcon}
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
                            className={
                              isExpanded
                                ? uiBtnIcon
                                : `rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                    product.isVisible && product.linkCount === 0
                                      ? "bg-danger/10 text-danger hover:bg-danger/15"
                                      : "text-text-muted hover:bg-bg hover:text-text"
                                  }`
                            }
                            aria-label={
                              isExpanded
                                ? "Close buy links"
                                : product.linkCount === 0
                                  ? "Add buy link"
                                  : "Buy links"
                            }
                            title={
                              isExpanded
                                ? "Close"
                                : product.linkCount === 0
                                  ? "Add buy link"
                                  : "Buy links"
                            }
                          >
                            {isExpanded ? (
                              <Image
                                src="/close.svg"
                                alt=""
                                width={16}
                                height={16}
                              />
                            ) : product.linkCount === 0 ? (
                              "Add buy link"
                            ) : (
                              "Buy links"
                            )}
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
                            className={uiBtnIcon}
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
            setNewLinkTitle("Shop");
          }}
          className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-text-inverse hover:bg-brand-hover"
        >
          Add product
        </button>
      ) : (
        <form
          onSubmit={onAddProduct}
          className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(18,20,26,0.04)]"
        >
          <div className="border-b border-border bg-bg/60 px-5 py-4">
            <p className="text-base font-semibold text-text">Add from a link</p>
            <p className="mt-1 text-sm text-text-muted">
              Paste an Amazon or store URL — we pull the title and photo, then
              you can edit before saving.
            </p>
          </div>

          <div className="flex flex-col gap-5 px-5 py-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text" htmlFor="product-url">
                Product URL
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="product-url"
                  type="url"
                  required
                  value={newLinkUrl}
                  onChange={(e) => {
                    setNewLinkUrl(e.target.value);
                    setImportedFromLink(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void importFromBuyLink();
                    }
                  }}
                  placeholder="https://www.amazon.com/…"
                  autoFocus
                  className="min-w-0 flex-1 rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text outline-none focus:border-brand"
                />
                <button
                  type="button"
                  disabled={fetchingPreview || !newLinkUrl.trim()}
                  onClick={() => {
                    void importFromBuyLink();
                  }}
                  className="shrink-0 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-text/90 disabled:opacity-40"
                >
                  {fetchingPreview ? "Importing…" : "Import"}
                </button>
              </div>
              <p className="text-xs text-text-muted">
                Imports title + photo. Button label defaults to “Shop”.
              </p>
            </div>

            {(importedFromLink ||
              productTitle ||
              productDescription ||
              productImagePreview) && (
              <div className="rounded-xl border border-border bg-bg/50 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Preview — edit anything
                  </p>
                  {importedFromLink ? (
                    <span className="rounded-full bg-brand-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                      From link
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addImageInputRef.current?.click()}
                      className="relative h-28 w-28 overflow-hidden rounded-xl border border-dashed border-border bg-surface transition-colors hover:border-brand/40"
                    >
                      {productImagePreview ? (
                        <SafeRemoteImage
                          src={productImagePreview}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="eager"
                        />
                      ) : (
                        <span className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center text-[11px] text-text-muted">
                          <span className="font-medium text-text">Photo</span>
                          Click to upload
                        </span>
                      )}
                    </button>
                    {productImagePreview ? (
                      <button
                        type="button"
                        onClick={clearAddImage}
                        className="text-[11px] text-text-muted hover:text-danger"
                      >
                        Remove
                      </button>
                    ) : null}
                    <input
                      ref={addImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        if (productImageFile && productImagePreview) {
                          URL.revokeObjectURL(productImagePreview);
                        }
                        setProductImageRemoteUrl(null);
                        setProductImageFile(file);
                        setProductImagePreview(
                          file ? URL.createObjectURL(file) : null,
                        );
                      }}
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-text">Title</span>
                      <input
                        type="text"
                        required
                        maxLength={120}
                        value={productTitle}
                        onChange={(e) => setProductTitle(e.target.value)}
                        placeholder="Product name"
                        className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-brand"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-text">Description</span>
                      <textarea
                        maxLength={1000}
                        rows={2}
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        placeholder="Optional short note"
                        className="resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-brand"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-medium text-text">
                        Button label
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={80}
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                        placeholder="Shop"
                        className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-brand"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {!importedFromLink &&
            !productTitle &&
            !productDescription &&
            !productImagePreview ? (
              <button
                type="button"
                onClick={() => {
                  setImportedFromLink(true);
                  if (!newLinkTitle) setNewLinkTitle("Shop");
                }}
                className="text-left text-sm text-brand hover:text-brand-hover"
              >
                Or enter details manually →
              </button>
            ) : null}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <label className="flex items-center gap-2 text-sm text-text">
                <input
                  type="checkbox"
                  checked={newLinkAffiliate}
                  onChange={(e) => setNewLinkAffiliate(e.target.checked)}
                  className="rounded border-border"
                />
                Affiliate link
              </label>
              <label className="flex items-center gap-2.5 text-sm text-text">
                <span className="text-text-muted">Show on page</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={newProductVisible}
                  onClick={() => setNewProductVisible((v) => !v)}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                    newProductVisible ? "bg-brand" : "bg-border"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-surface shadow-sm transition-transform ${
                      newProductVisible ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>
            </div>

            {productError ? (
              <p className="text-sm text-danger" role="alert">
                {productError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-border bg-bg/40 px-5 py-4">
            <button
              type="submit"
              disabled={
                createProduct.isPending ||
                !newLinkUrl.trim() ||
                !productTitle.trim() ||
                !newLinkTitle.trim()
              }
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-text-inverse hover:bg-brand-hover disabled:opacity-50"
            >
              {createProduct.isPending ? "Saving…" : "Save product"}
            </button>
            <button
              type="button"
              disabled={createProduct.isPending}
              onClick={() => {
                setShowAddProduct(false);
                resetAddForm();
              }}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-text-muted hover:bg-bg hover:text-text disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      </div>
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
      <p className="mb-2 text-xs font-medium text-text">
        Buy / affiliate links
      </p>
      <p className="mb-3 text-xs leading-relaxed text-text-muted">
        At least one visible buy link is required for this product to appear on
        your public page.
      </p>

      {linksQuery.isLoading ? (
        <ListSkeleton rows={2} rowClassName="h-10 w-full rounded-xl" />
      ) : null}

      {linksQuery.isError ? (
        <p className="text-xs text-danger">Could not load links.</p>
      ) : null}

      {(linksQuery.data ?? []).length > 0 ? (
        <ul className="mb-3 flex flex-col gap-1.5">
          {(linksQuery.data ?? []).map((link) => (
            <li
              key={link._id}
              className="flex items-center justify-between gap-2 rounded-xl border border-border px-2.5 py-2"
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
                <p className="truncate text-[11px] text-text-muted">
                  {link.url}
                </p>
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
          className={uiInput}
        />
        <input
          type="url"
          required
          value={linkUrl}
          onChange={(e) => onLinkUrlChange(e.target.value)}
          placeholder="https://…"
          className={uiInput}
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
          className={`self-start ${uiBtnSecondary} px-3 py-1.5 text-xs`}
        >
          {adding ? "Adding…" : "Add link"}
        </button>
      </form>
    </div>
  );
}
