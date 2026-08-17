"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { toast } from "sonner";

import { DialogCloseButton } from "@/components/DialogCloseButton";
import {
  clampImageOffset,
  centeredOffset,
  coverScale,
  cropImageToJpeg,
} from "@/lib/crop-image";
import { uiBtnPrimary, uiBtnSecondary } from "@/lib/ui";

export type CropKind = "avatar" | "cover";

const CONFIG: Record<
  CropKind,
  { aspect: number; title: string; hint: string; round: boolean }
> = {
  avatar: {
    aspect: 1,
    title: "Crop profile photo",
    hint: "Drag to reposition · zoom to adjust",
    round: true,
  },
  cover: {
    aspect: 3,
    title: "Crop cover image",
    hint: "Drag to reposition · zoom to adjust",
    round: false,
  },
};

type Props = {
  kind: CropKind;
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (file: File) => void | Promise<void>;
  busy?: boolean;
};

export function ImageCropDialog({
  kind,
  imageSrc,
  onCancel,
  onConfirm,
  busy = false,
}: Props) {
  const config = CONFIG[kind];
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [viewportWidth, setViewportWidth] = useState(360);
  const [zoom, setZoom] = useState(1);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [exporting, setExporting] = useState(false);

  const viewportHeight = Math.round(viewportWidth / config.aspect);

  const baseScale = useMemo(
    () => coverScale(naturalSize.w, naturalSize.h, viewportWidth, viewportHeight),
    [naturalSize.w, naturalSize.h, viewportWidth, viewportHeight],
  );

  const displayWidth = naturalSize.w * baseScale * zoom;
  const displayHeight = naturalSize.h * baseScale * zoom;

  const defaultOffset = useMemo(
    () =>
      centeredOffset(
        displayWidth,
        displayHeight,
        viewportWidth,
        viewportHeight,
      ),
    [displayWidth, displayHeight, viewportWidth, viewportHeight],
  );

  const offset = dragOffset ?? defaultOffset;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setDragOffset(null);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    function measure() {
      const max = Math.min(440, window.innerWidth - 48);
      setViewportWidth(max);
      setDragOffset(null);
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy && !exporting) onCancel();
    }

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [busy, exporting, onCancel]);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (busy || exporting) return;
    dragging.current = true;
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      ox: offset.x,
      oy: offset.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;
    setDragOffset(
      clampImageOffset(
        dragStart.current.ox + dx,
        dragStart.current.oy + dy,
        displayWidth,
        displayHeight,
        viewportWidth,
        viewportHeight,
      ),
    );
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    dragging.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  async function handleConfirm() {
    if (busy || exporting || !naturalSize.w) return;

    setExporting(true);
    try {
      const blob = await cropImageToJpeg(imageSrc, {
        width: viewportWidth,
        height: viewportHeight,
        offsetX: offset.x,
        offsetY: offset.y,
        displayWidth,
        displayHeight,
      });
      const file = new File([blob], `${kind}.jpg`, { type: "image/jpeg" });
      await onConfirm(file);
    } catch {
      toast.error("Could not prepare cropped image");
    } finally {
      setExporting(false);
    }
  }

  const disabled = busy || exporting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-text/40"
        aria-label="Close crop editor"
        onClick={() => {
          if (!disabled) onCancel();
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-dialog-title"
        className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_16px_40px_-20px_rgba(18,20,26,0.35)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2
              id="crop-dialog-title"
              className="font-display text-lg font-semibold tracking-tight text-text"
            >
              {config.title}
            </h2>
            <p className="mt-1 text-sm text-text-muted">{config.hint}</p>
          </div>
          <DialogCloseButton
            label="Close crop editor"
            onClick={() => {
              if (!disabled) onCancel();
            }}
          />
        </div>

        <div className="px-5 py-5">
          <div
            ref={viewportRef}
            className={`relative mx-auto overflow-hidden bg-bg touch-none select-none ${
              config.round ? "rounded-full" : "rounded-xl"
            }`}
            style={{ width: viewportWidth, height: viewportHeight, cursor: "grab" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt=""
              draggable={false}
              className="absolute max-w-none"
              style={{
                width: displayWidth,
                height: displayHeight,
                left: offset.x,
                top: offset.y,
              }}
            />
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20 ${
                config.round ? "rounded-full" : "rounded-xl"
              }`}
            />
          </div>

          <label className="mt-5 flex items-center gap-3">
            <span className="shrink-0 text-xs font-medium text-text-muted">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              disabled={disabled}
              onChange={(e) => {
                setZoom(Number(e.target.value));
                setDragOffset(null);
              }}
              className="min-w-0 flex-1 accent-brand"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            disabled={disabled}
            onClick={onCancel}
            className={uiBtnSecondary}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={disabled || !naturalSize.w}
            onClick={() => void handleConfirm()}
            className={uiBtnPrimary}
          >
            {exporting ? "Saving…" : "Save photo"}
          </button>
        </div>
      </div>
    </div>
  );
}
