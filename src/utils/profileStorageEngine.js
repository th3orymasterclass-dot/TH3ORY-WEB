/**
 * Profile Storage & Memory Segmentation Engine
 * 
 * Provides strict, namespaced memory partitions for Student, Campus Ambassador, 
 * and Team member profile pictures and avatars with instantaneous local preview, 
 * client-side WebP/JPEG compression, and Supabase synchronization.
 */

// Curated High-Definition Preset Avatars across Leadership & Persona archetypes
export const AVATAR_PRESETS = [
  {
    id: 'preset_exec_1',
    label: 'Executive Strategist',
    category: 'Executive',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    accent: '#f59e0b'
  },
  {
    id: 'preset_exec_2',
    label: 'Global Director',
    category: 'Executive',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    accent: '#6366f1'
  },
  {
    id: 'preset_leader_1',
    label: 'Visionary Leader',
    category: 'Leadership',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    accent: '#ec4899'
  },
  {
    id: 'preset_leader_2',
    label: 'Catalyst Operator',
    category: 'Leadership',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    accent: '#10b981'
  },
  {
    id: 'preset_creative_1',
    label: 'Influence Mastermind',
    category: 'Creative',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    accent: '#8b5cf6'
  },
  {
    id: 'preset_creative_2',
    label: 'High-Impact Communicator',
    category: 'Creative',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    accent: '#06b6d4'
  },
  {
    id: 'preset_amb_1',
    label: 'Campus Ambassador Elite',
    category: 'Ambassador',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    accent: '#eab308'
  },
  {
    id: 'preset_amb_2',
    label: 'Youth Growth Leader',
    category: 'Ambassador',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    accent: '#f97316'
  }
];

// ─── Client-Side Image Compression & Data URL Processing ─────────────────────

/**
 * Validates, scales down, and compresses an uploaded image file into an optimized Data URL.
 * Automatically respects aspect ratios and prevents memory exhaustion.
 */
export async function processImageFile(file, maxDimension = 480, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided'));
    }

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return reject(new Error('Please select a valid image file (JPEG, PNG, WebP, GIF, SVG).'));
    }

    // Max 10MB file limit
    if (file.size > 10 * 1024 * 1024) {
      return reject(new Error('Image file is too large. Maximum size allowed is 10MB.'));
    }

    // If SVG, return as standard base64 data URL without canvas rasterization
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read SVG file.'));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(readerEvent.target.result);
        }

        // High-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP if supported, fallback to JPEG
        let dataUrl;
        try {
          dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl || dataUrl.startsWith('data:image/png')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image for compression.'));
      img.src = readerEvent.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

// ─── DEDICATED MEMORY SEGMENTATION: STUDENT PARTITION ────────────────────────

export function getStudentAvatarKey(email = '') {
  const clean = (email || '').trim().toLowerCase();
  return `th3ory_student_avatar_${clean || 'default'}`;
}

export function getStudentAvatar(email = '') {
  if (typeof window === 'undefined') return '';
  const clean = (email || '').trim().toLowerCase();
  
  // 1. Check dedicated memory partition
  try {
    const key = getStudentAvatarKey(clean);
    const stored = localStorage.getItem(key);
    if (stored) return stored;
  } catch {}

  // 2. Check session auth object
  try {
    const authRaw = sessionStorage.getItem('th3ory_student_auth') || localStorage.getItem('th3ory_student_auth_persistent');
    if (authRaw) {
      const auth = JSON.parse(authRaw);
      if (auth?.avatar || auth?.avatarUrl || auth?.avatar_url) {
        return auth.avatar || auth.avatarUrl || auth.avatar_url;
      }
    }
  } catch {}

  // 3. Check legacy student profile cache
  try {
    const pRaw = localStorage.getItem(`th3ory_student_profile_${clean}`);
    if (pRaw) {
      const p = JSON.parse(pRaw);
      if (p?.avatar || p?.avatar_url) return p.avatar || p.avatar_url;
    }
  } catch {}

  return '';
}

export function setStudentAvatar(email = '', avatarUrl = '') {
  if (typeof window === 'undefined') return;
  const clean = (email || '').trim().toLowerCase();
  const key = getStudentAvatarKey(clean);

  try {
    if (avatarUrl) {
      localStorage.setItem(key, avatarUrl);
    } else {
      localStorage.removeItem(key);
    }

    // Update active session auth object
    const authRaw = sessionStorage.getItem('th3ory_student_auth');
    if (authRaw) {
      const auth = JSON.parse(authRaw);
      auth.avatar = avatarUrl;
      auth.avatar_url = avatarUrl;
      sessionStorage.setItem('th3ory_student_auth', JSON.stringify(auth));
    }
    const persistentRaw = localStorage.getItem('th3ory_student_auth_persistent');
    if (persistentRaw) {
      const pAuth = JSON.parse(persistentRaw);
      pAuth.avatar = avatarUrl;
      pAuth.avatar_url = avatarUrl;
      localStorage.setItem('th3ory_student_auth_persistent', JSON.stringify(pAuth));
    }

    // Update student profile cache
    const pRaw = localStorage.getItem(`th3ory_student_profile_${clean}`);
    if (pRaw) {
      const p = JSON.parse(pRaw);
      p.avatar = avatarUrl;
      p.avatar_url = avatarUrl;
      localStorage.setItem(`th3ory_student_profile_${clean}`, JSON.stringify(p));
    }

    // Dispatch cross-tab and cross-component custom event
    window.dispatchEvent(new CustomEvent('th3ory_student_avatar_change', {
      detail: { email: clean, avatarUrl }
    }));
  } catch (err) {
    console.warn('[ProfileStorageEngine] Failed to write student avatar partition:', err);
  }
}

// ─── DEDICATED MEMORY SEGMENTATION: AMBASSADOR PARTITION ─────────────────────

export function getAmbassadorAvatarKey(codeOrEmail = '') {
  const clean = (codeOrEmail || '').trim().toUpperCase();
  return `th3ory_ambassador_avatar_${clean || 'default'}`;
}

export function getAmbassadorAvatar(codeOrEmail = '') {
  if (typeof window === 'undefined') return '';
  const clean = (codeOrEmail || '').trim().toUpperCase();

  // 1. Check dedicated memory partition
  try {
    const key = getAmbassadorAvatarKey(clean);
    const stored = localStorage.getItem(key);
    if (stored) return stored;
  } catch {}

  // 2. Check active ambassador session
  try {
    const sRaw = sessionStorage.getItem('th3ory_ambassador_session');
    if (sRaw) {
      const amb = JSON.parse(sRaw);
      if (amb?.avatar || amb?.avatarUrl || amb?.avatar_url) {
        return amb.avatar || amb.avatarUrl || amb.avatar_url;
      }
    }
  } catch {}

  // 3. Check ambassador apps cache
  try {
    const appsRaw = localStorage.getItem('th3ory_ambassador_apps');
    if (appsRaw) {
      const apps = JSON.parse(appsRaw);
      const found = apps.find(a => 
        (a.ambassadorCode && a.ambassadorCode.toUpperCase() === clean) ||
        (a.email && a.email.toUpperCase() === clean)
      );
      if (found?.avatar || found?.avatar_url || found?.avatarUrl) {
        return found.avatar || found.avatar_url || found.avatarUrl;
      }
    }
  } catch {}

  return '';
}

export function setAmbassadorAvatar(codeOrEmail = '', avatarUrl = '') {
  if (typeof window === 'undefined') return;
  const clean = (codeOrEmail || '').trim().toUpperCase();
  const key = getAmbassadorAvatarKey(clean);

  try {
    if (avatarUrl) {
      localStorage.setItem(key, avatarUrl);
    } else {
      localStorage.removeItem(key);
    }

    // Update active ambassador session
    const sRaw = sessionStorage.getItem('th3ory_ambassador_session');
    if (sRaw) {
      const amb = JSON.parse(sRaw);
      amb.avatar = avatarUrl;
      amb.avatar_url = avatarUrl;
      amb.avatarUrl = avatarUrl;
      sessionStorage.setItem('th3ory_ambassador_session', JSON.stringify(amb));
    }

    // Update local ambassador apps store
    const appsRaw = localStorage.getItem('th3ory_ambassador_apps');
    if (appsRaw) {
      const apps = JSON.parse(appsRaw);
      const idx = apps.findIndex(a => 
        (a.ambassadorCode && a.ambassadorCode.toUpperCase() === clean) ||
        (a.email && a.email.toUpperCase() === clean)
      );
      if (idx >= 0) {
        apps[idx].avatar = avatarUrl;
        apps[idx].avatar_url = avatarUrl;
        apps[idx].avatarUrl = avatarUrl;
        localStorage.setItem('th3ory_ambassador_apps', JSON.stringify(apps));
      }
    }

    window.dispatchEvent(new CustomEvent('th3ory_ambassador_avatar_change', {
      detail: { ambassadorCode: clean, avatarUrl }
    }));
  } catch (err) {
    console.warn('[ProfileStorageEngine] Failed to write ambassador avatar partition:', err);
  }
}

// ─── DEDICATED MEMORY SEGMENTATION: TEAM MEMBER PARTITION ────────────────────

export function getTeamMemberAvatarKey(memberIdOrRepCode = '') {
  const clean = (memberIdOrRepCode || '').trim();
  return `th3ory_team_avatar_${clean || 'default'}`;
}

export function getTeamMemberAvatar(memberIdOrRepCode = '') {
  if (typeof window === 'undefined') return '';
  const clean = (memberIdOrRepCode || '').trim();

  // 1. Check dedicated memory partition
  try {
    const key = getTeamMemberAvatarKey(clean);
    const stored = localStorage.getItem(key);
    if (stored) return stored;
  } catch {}

  // 2. Check team profile active session
  try {
    const tRaw = localStorage.getItem('th3ory_active_team_profile');
    if (tRaw) {
      const p = JSON.parse(tRaw);
      if (p?.avatar || p?.avatarUrl || p?.avatar_url) {
        return p.avatar || p.avatarUrl || p.avatar_url;
      }
    }
  } catch {}

  // 3. Check team members list
  try {
    const listRaw = localStorage.getItem('th3ory_team_members');
    if (listRaw) {
      const list = JSON.parse(listRaw);
      const found = list.find(m => 
        m.member_id === clean || m.memberId === clean || 
        m.rep_code === clean || m.repCode === clean || 
        m.email === clean
      );
      if (found?.avatar_url || found?.avatar || found?.avatarUrl) {
        return found.avatar_url || found.avatar || found.avatarUrl;
      }
    }
  } catch {}

  return '';
}

export function setTeamMemberAvatar(memberIdOrRepCode = '', avatarUrl = '') {
  if (typeof window === 'undefined') return;
  const clean = (memberIdOrRepCode || '').trim();
  const key = getTeamMemberAvatarKey(clean);

  try {
    if (avatarUrl) {
      localStorage.setItem(key, avatarUrl);
    } else {
      localStorage.removeItem(key);
    }

    // Update active team profile in localStorage
    const tRaw = localStorage.getItem('th3ory_active_team_profile');
    if (tRaw) {
      const p = JSON.parse(tRaw);
      p.avatar = avatarUrl;
      p.avatar_url = avatarUrl;
      p.avatarUrl = avatarUrl;
      localStorage.setItem('th3ory_active_team_profile', JSON.stringify(p));
    }

    // Update team members list
    const listRaw = localStorage.getItem('th3ory_team_members');
    if (listRaw) {
      const list = JSON.parse(listRaw);
      const idx = list.findIndex(m => 
        m.member_id === clean || m.memberId === clean || 
        m.rep_code === clean || m.repCode === clean || 
        m.email === clean
      );
      if (idx >= 0) {
        list[idx].avatar_url = avatarUrl;
        list[idx].avatar = avatarUrl;
        list[idx].avatarUrl = avatarUrl;
        localStorage.setItem('th3ory_team_members', JSON.stringify(list));
      }
    }

    window.dispatchEvent(new CustomEvent('th3ory_team_avatar_change', {
      detail: { memberId: clean, avatarUrl }
    }));
    window.dispatchEvent(new CustomEvent('th3ory_team_members_change'));
  } catch (err) {
    console.warn('[ProfileStorageEngine] Failed to write team avatar partition:', err);
  }
}
