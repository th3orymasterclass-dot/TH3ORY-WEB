import React, { useEffect } from 'react';
import { X, FileText, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import PdfViewer from './PdfViewer';

/**
 * Universal PDF Viewer Modal for TH3ORY Masterclass
 * 
 * Can be opened anywhere across the application:
 * - Student Portal (Resources sub-portal, Course panel, Certificate panel)
 * - Admin Portal (Content management preview)
 * - Future masterclass additions & quotes
 */
export default function PdfViewerModal({
  isOpen,
  onClose,
  pdfUrl,
  title = 'Masterclass Document',
  description = '',
  levelId = null,
  fileSize = null,
  duration = null,
  tags = [],
  allowDownload = true,
  themeMode = 'dark'
}) {
  const isDark = themeMode === 'dark';

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !pdfUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#070A11]/90 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
    >
      <div
        className="w-full max-w-6xl h-[92vh] max-h-[1000px] flex flex-col rounded-2xl overflow-hidden shadow-2xl relative border border-[#E9E4FF]/16 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <PdfViewer
          url={pdfUrl}
          title={title}
          description={description}
          levelId={levelId}
          fileSize={fileSize}
          duration={duration}
          tags={tags}
          allowDownload={allowDownload}
          themeMode={themeMode}
          onClose={onClose}
          showCloseButton={true}
          className="h-full rounded-2xl"
        />
      </div>
    </div>
  );
}
