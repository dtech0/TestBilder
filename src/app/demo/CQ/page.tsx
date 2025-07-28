"use client";

import { useRef } from "react";

export default function PdfViewer() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePrint = () => {
    iframeRef.current?.contentWindow?.print();
  };

  return (
    <div className="w-full flex flex-col items-center" style={{ height: 'calc(100vh - 50px)' }}>
      <iframe
        ref={iframeRef}
        src="/PDF/CQ.pdf"
        style={{ width: '70%', height: '100%' }}
        title="CQ PDF Viewer"
      />
    </div>
  );
}