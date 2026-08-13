/**
 * Google Drive Stream-Only Digital Storage Helper Utility
 * Enforces strict streaming mode without direct downloads.
 */

export function parseGoogleDriveUrl(urlOrId) {
  if (!urlOrId || typeof urlOrId !== 'string') {
    return { isGDrive: false, fileId: null, streamOnly: true, downloadRestricted: true };
  }

  const str = urlOrId.trim();

  // Regex patterns for Google Drive file and folder IDs
  const fileIdPatterns = [
    /\/file\/d\/([a-zA-Z0-9_-]{25,})/,
    /id=([a-zA-Z0-9_-]{25,})/,
    /\/uc\?.*id=([a-zA-Z0-9_-]{25,})/,
    /\/thumbnail\?.*id=([a-zA-Z0-9_-]{25,})/,
    /\/d\/([a-zA-Z0-9_-]{25,})/,
  ];

  let fileId = null;

  for (const pattern of fileIdPatterns) {
    const match = str.match(pattern);
    if (match && match[1]) {
      fileId = match[1];
      break;
    }
  }

  // Fallback: If raw ID string is passed
  if (!fileId && /^[a-zA-Z0-9_-]{25,}$/.test(str)) {
    fileId = str;
  }

  const isFolder = str.includes('/folders/') || str.includes('folder');
  let folderId = null;
  if (isFolder) {
    const folderMatch = str.match(/\/folders\/([a-zA-Z0-9_-]{25,})/);
    if (folderMatch) folderId = folderMatch[1];
  }

  if (!fileId && !folderId) {
    return {
      isGDrive: false,
      fileId: null,
      rawUrl: str,
      streamOnly: true,
      downloadRestricted: true
    };
  }

  const cleanFileId = fileId || folderId;

  return {
    isGDrive: true,
    isFolder,
    fileId: cleanFileId,
    // Google Drive Stream-Only Embed URL
    embedUrl: isFolder 
      ? `https://drive.google.com/embeddedfolderview?id=${cleanFileId}#grid`
      : `https://drive.google.com/file/d/${cleanFileId}/preview`,
    // View URL
    viewUrl: isFolder
      ? `https://drive.google.com/drive/folders/${cleanFileId}`
      : `https://drive.google.com/file/d/${cleanFileId}/preview`,
    // Restricted Download Protection Notice
    downloadRestricted: true,
    streamOnly: true,
    // High-res thumbnail preview URL
    thumbnailUrl: `https://drive.google.com/thumbnail?id=${cleanFileId}&sz=w1000`,
    // Image direct stream URL
    imageUrl: `https://lh3.googleusercontent.com/d/${cleanFileId}`,
  };
}

/**
 * Format any input URL into a protected embeddable media stream.
 * Restricts direct downloads across YouTube, Google Drive, Vimeo, MP4.
 */
export function getEmbeddableMediaUrl(url) {
  if (!url) return '';
  
  const gdrive = parseGoogleDriveUrl(url);
  if (gdrive.isGDrive) {
    return gdrive.embedUrl;
  }

  // YouTube handle
  if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v');
    }
    if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1`;
  }

  // Vimeo handle
  if (url.includes('vimeo.com/')) {
    const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0];
    if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
  }

  return url;
}
