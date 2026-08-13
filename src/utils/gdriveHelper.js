/**
 * Google Drive Digital Storage Helper Utility
 * Parses Google Drive links, extracts file IDs, and generates embeddable,
 * direct stream, thumbnail, and download URLs.
 */

export function parseGoogleDriveUrl(urlOrId) {
  if (!urlOrId || typeof urlOrId !== 'string') {
    return { isGDrive: false, fileId: null };
  }

  const str = urlOrId.trim();

  // Regex patterns for Google Drive file and folder IDs
  const fileIdPatterns = [
    /\/file\/d\/([a border-zA-Z0-9_-]{25,})/,
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

  // Fallback: If raw ID string is passed (25+ alphanumeric chars without slashes or spaces)
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
      rawUrl: str
    };
  }

  const cleanFileId = fileId || folderId;

  return {
    isGDrive: true,
    isFolder,
    fileId: cleanFileId,
    // Google Drive Preview / Embed URL suitable for iframe embeds
    embedUrl: isFolder 
      ? `https://drive.google.com/embeddedfolderview?id=${cleanFileId}#grid`
      : `https://drive.google.com/file/d/${cleanFileId}/preview`,
    // Direct stream / view URL
    viewUrl: isFolder
      ? `https://drive.google.com/drive/folders/${cleanFileId}`
      : `https://drive.google.com/file/d/${cleanFileId}/view`,
    // Direct download URL
    downloadUrl: `https://drive.google.com/uc?export=download&id=${cleanFileId}`,
    // High-res thumbnail preview URL
    thumbnailUrl: `https://drive.google.com/thumbnail?id=${cleanFileId}&sz=w1000`,
    // Image direct stream URL
    imageUrl: `https://lh3.googleusercontent.com/d/${cleanFileId}`,
  };
}

/**
 * Format any input URL into a playable/viewable iframe source.
 * Handles YouTube, Google Drive, Vimeo, MP4, and PDF links.
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
    if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  }

  // Vimeo handle
  if (url.includes('vimeo.com/')) {
    const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0];
    if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
  }

  return url;
}
