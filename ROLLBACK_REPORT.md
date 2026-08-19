# 🔄 TH3ORY MASTERCLASS — ROLLBACK & DEPLOYMENT DISASTER RECOVERY REPORT

**Generated Date**: August 16, 2026  
**Target Domain**: [https://th3ory.online](https://th3ory.online) | [https://www.th3ory.online](https://www.th3ory.online)  
**Current Active Production Deployment ID**: `dpl_7PSjLvRM9mSgg2TDQZxdxaH5qQsB`  
**Previous Stable Production Deployment ID**: `dpl_FMvhdahmspxtU3MsswTfgjq53nV6`  
**Vercel Project ID**: `th3ory` (`th3orymasterclass-2557s-projects`)

---

## 1. Quick Emergency Rollback Commands

If an immediate production rollback is required, execute any of the following emergency commands from the project directory (`c:\Users\menta\OneDrive\Documents\Th3ory`):

### Option A: Instant Vercel CLI Rollback (Zero Rebuild Required)
To instantly point `th3ory.online` back to the previous stable Vercel production deployment:

```bash
cmd /c npx vercel alias set https://th3ory-8dgx1h6gu-th3orymasterclass-2557s-projects.vercel.app th3ory.online
cmd /c npx vercel alias set https://th3ory-8dgx1h6gu-th3orymasterclass-2557s-projects.vercel.app www.th3ory.online
```

### Option B: Rollback via Vercel Dashboard
1. Open [https://vercel.com/th3orymasterclass-2557s-projects/th3ory](https://vercel.com/th3orymasterclass-2557s-projects/th3ory)
2. Go to **Deployments** tab.
3. Locate deployment ID `dpl_FMvhdahmspxtU3MsswTfgjq53nV6` (or any earlier deployment).
4. Click the three dots `...` next to the deployment and select **Promote to Production**.

---

## 2. Summary of Recent File Modifications

### A. `src/student/panels/CoursePanel.jsx`
- **Current Active State**:
  - Un-sandboxed iframe with stream permissions: `allow="autoplay; fullscreen; picture-in-picture"`.
  - Desktop-only security shield: `<div className="hidden sm:block absolute top-0 right-0 w-28 h-16 z-30..." />`.
  - Responsive mobile height boost container:
    `className="w-full relative min-h-[260px] sm:min-h-0 sm:aspect-video h-[45vh] max-h-[420px] sm:h-auto bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-950/20 selection:bg-none select-none group"`
  - Default video stream URL fallback: `https://drive.google.com/file/d/1JeRMqXExi9T8DjF1t7PpPhNrhGhfTh5g/preview`.
- **To Revert `CoursePanel.jsx` VideoModal to Legacy Aspect-Video**:
  ```jsx
  <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-950/20 relative selection:bg-none select-none group">
    <div className="absolute top-0 right-0 w-28 h-16 z-30 bg-transparent cursor-default pointer-events-auto" />
    <iframe
      src={embedUrl}
      title={title}
      className="w-full h-full border-0 pointer-events-auto"
      allowFullScreen
      allow="autoplay; fullscreen"
    />
  </div>
  ```

### B. `src/data/courseData.js`
- **Current Active State**:
  - `videoPreviewData.videoUrl` and `defaultContent` video items use live Google Drive URL:
    `https://drive.google.com/file/d/1JeRMqXExi9T8DjF1t7PpPhNrhGhfTh5g/preview`.
- **To Revert `courseData.js` to Legacy URLs**:
  Replace `https://drive.google.com/file/d/1JeRMqXExi9T8DjF1t7PpPhNrhGhfTh5g/preview` with your previous desired stream URL.

### C. `src/services/supabaseService.js`
- **Current Active State**:
  - Contains `seedDefaultCourseContentsToSupabase()` which auto-populates missing masterclass rows in Supabase table `course_contents`.
  - Called inside `fetchCourseContentsFromSupabase()` when `data` array is empty.
- **To Revert `supabaseService.js`**:
  Remove `seedDefaultCourseContentsToSupabase()` and return `data` directly from `fetchCourseContentsFromSupabase()`.

---

## 3. Production Build & Deployment Re-Verification Protocol

If you modify or revert any code locally and want to redeploy a fresh production build:

```bash
# 1. Run full test suite & mobile layout simulation
node scripts/test-mobile-video-controls.js
node scripts/test-all-systems.js

# 2. Build Vite production bundle
node node_modules/vite/bin/vite.js build

# 3. Deploy to Vercel Production
cmd /c npx vercel deploy --yes --prod

# 4. Set domain aliases
cmd /c npx vercel alias set [NEW_DEPLOYMENT_URL] th3ory.online
cmd /c npx vercel alias set [NEW_DEPLOYMENT_URL] www.th3ory.online
```

---

## 4. Deployment History & Reference Hash Log

| Deployment Date | Deployment ID | Production URL | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Aug 16, 2026** | `dpl_7PSjLvRM9mSgg2TDQZxdxaH5qQsB` | `https://th3ory-px7mjtwj1...` | **ACTIVE LIVE** | Mobile video height boost (`min-h-[260px]`), unsandboxed iframe, live GDrive ID `1JeRMqXExi9T8DjF1t7PpPhNrhGhfTh5g` |
| **Aug 16, 2026** | `dpl_FMvhdahmspxtU3MsswTfgjq53nV6` | `https://th3ory-8dgx1h6gu...` | Stable Backup | Official GDrive ID `1JeRMqXExi9T8DjF1t7PpPhNrhGhfTh5g` & Supabase `course_contents` seeding |
| **Aug 16, 2026** | `dpl_BVMTGJCzenR7eGWEgqaQvgdHw5Zx` | `https://th3ory-2oqe3nsej...` | Backup | Unsandboxed Google Drive mobile iframe player |
| **Aug 16, 2026** | `dpl_9zKqQsEZ52GgHfE9Fzy4wCTu6rXD` | `https://th3ory-7ehqgi5jt...` | Backup | Google Drive stream uniformity update |
| **Aug 16, 2026** | `dpl_5Lt3EA81A8dp7ns2hzDMUGvTAQxd` | `https://th3ory-ox55xnzow...` | Backup | Mobile security shield overlay scaling |
| **Aug 16, 2026** | `dpl_295ehESqeXZ7rcJJvQJockHwS3Sx` | `https://th3ory-97syg4ftn...` | Backup | Supabase `student_progress` HAR 400 fix & live sync |

---

## 5. Contact & Incident Escalation
- **Master Domain**: `th3ory.online`
- **Primary Database**: Supabase PostgreSQL (`student_progress`, `student_accounts`, `course_contents`)
- **Hosting Platform**: Vercel Production
