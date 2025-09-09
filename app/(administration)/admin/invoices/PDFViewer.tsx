"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc =
  typeof window !== "undefined"
    ? `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
    : "";

interface PDFViewerProps {
  invoiceId: number;
}

export default function PDFViewer({ invoiceId }: PDFViewerProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceId) return;
    setLoading(true);
    setError(null);
    // Fetch the PDF as a blob and create an object URL (with admin header)
    fetch(`/api/invoices/${invoiceId}/pdf`, {
      headers: {
        "x-admin-access": "bebrave-admin-2024",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Nepodařilo se načíst PDF fakturu");

        return res.blob();
      })
      .then((blob) => {
        setFileUrl(URL.createObjectURL(blob));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // Cleanup
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [invoiceId]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  return (
    <div className="flex flex-col items-center w-full h-full">
      {loading && <div>Načítání PDF…</div>}
      {error && <div className="text-red-500">{error}</div>}
      {fileUrl && !loading && !error && (
        <>
          <div
            className="flex flex-row items-center justify-between mb-2 gap-2"
            style={{ minHeight: 44 }}
          >
            <button
              className="px-4 py-2 border rounded disabled:opacity-50"
              disabled={pageNumber <= 1}
              style={{ minWidth: 110 }}
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            >
              Předchozí
            </button>
            <span className="flex-1 text-center text-lg font-medium select-none">
              Strana {pageNumber} / {numPages}
            </span>
            <button
              className="px-4 py-2 border rounded disabled:opacity-50"
              disabled={pageNumber >= numPages}
              style={{ minWidth: 110 }}
              onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            >
              Další
            </button>
          </div>
          <div
            className="w-full flex justify-center overflow-auto"
            style={{ height: "60vh" }}
          >
            <Document
              className="w-full flex justify-center"
              error={
                <div className="text-red-500">Nepodařilo se načíst PDF.</div>
              }
              file={fileUrl}
              loading={<div>Načítání PDF…</div>}
              onLoadSuccess={onDocumentLoadSuccess}
            >
              <Page pageNumber={pageNumber} width={700} />
            </Document>
          </div>
        </>
      )}
    </div>
  );
}
