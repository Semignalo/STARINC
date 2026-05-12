import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({ url }) {
    const [numPages, setNumPages] = useState(null);
    const [error, setError] = useState(false);

    const onLoadSuccess = useCallback(({ numPages }) => {
        setNumPages(numPages);
    }, []);

    if (error) return null;

    return (
        <div className="w-full flex flex-col items-center gap-2">
            <Document
                file={url}
                onLoadSuccess={onLoadSuccess}
                onLoadError={() => setError(true)}
                loading={
                    <div className="w-full flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-gray-200 border-t-[var(--color-accent)] rounded-full animate-spin" />
                    </div>
                }
            >
                {numPages && Array.from({ length: numPages }, (_, i) => (
                    <div key={i} className="w-full mb-2">
                        <Page
                            pageNumber={i + 1}
                            width={Math.min(window.innerWidth - 64, 900)}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                        />
                    </div>
                ))}
            </Document>
        </div>
    );
}
