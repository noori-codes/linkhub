"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = {
  url: string;
};

/** Renders a QR for the public page URL (generated in the browser). */
export function ShareQr({ url }: Props) {
  const [dataUrl, setDataUrl] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setDataUrl("");

    void QRCode.toDataURL(url, {
      width: 160,
      margin: 1,
      color: {
        dark: "#12141a",
        light: "#ffffff",
      },
    })
      .then((next) => {
        if (!cancelled) setDataUrl(next);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (failed) {
    return (
      <p className="text-xs text-danger">Could not generate QR code.</p>
    );
  }

  if (!dataUrl) {
    return <p className="text-xs text-text-muted">Preparing QR…</p>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="QR code linking to your public page"
      width={160}
      height={160}
      className="rounded-md border border-border bg-white p-2"
    />
  );
}
