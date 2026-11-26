const SUPABASE_URL = "https://kenilapjkhfgyyyqfcog.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vCjojbNSbAWFeXXacnxYJA_M0PxLvKI";
const LASTFM_API_KEY = "206b77af8d8f6e6edeafd71d306992ea";

const ITUNES_COUNTRY = "PT";
const COVER_CACHE_KEY = "recommentation_station_covers_v1";
const ARTIST_PHOTO_CACHE_KEY = "recommentation_station_artist_photos_v1";
const UPCOMING_CACHE_KEY = "recommentation_station_upcoming_v3";
const THEME_KEY = "recommentation_station_theme_v1";
const SHELF_COLS_KEY = "recommentation_station_shelf_cols_v3";
const SHELF_SORT_KEY = "recommentation_station_shelf_sort_v1";
const VALID_SHELF_SORTS = ["recent", "year-desc", "year-asc", "popularity", "title", "artist"];
const PREVIEW_MAX_SECONDS = 15;
const CURRENT_YEAR = new Date().getFullYear();

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const $ = (id) => document.getElementById(id);
const on = (id, evt, fn) => $(id)?.addEventListener(evt, fn);
const toArray = (val) => (Array.isArray(val) ? val : val ? [val] : []);

const TASTE_TO_LASTFM_TAGS = {
  "Pop": ["pop"],
  "Alternative Pop": ["indie pop", "dream pop", "art pop"],
  "Indie": ["indie", "indie rock"],
  "Rock": ["rock", "classic rock"],
  "Alternative Rock": ["alternative rock", "post-punk"],
  "Hip-Hop": ["hip-hop", "rap"],
  "R&B": ["rnb", "contemporary rnb"],
  "Soul": ["soul", "neo-soul"],
  "Electronic": ["electronic", "idm", "house"],
  "Ambient": ["ambient", "downtempo"],
  "Jazz": ["jazz", "spiritual jazz"],
  "Folk": ["folk", "indie folk"],
  "Classical": ["classical", "modern classical"],
  "Metal": ["metal", "post-metal"],
  "Punk": ["punk", "post-hardcore"],
  "Funk": ["funk", "groove"],
  "Blues": ["blues"],
  "Reggae & Dub": ["reggae", "dub"],
  "MPB & Bossa": ["mpb", "bossa nova"],
  "Latin": ["latin", "latin alternative"],
  "Country": ["country", "alt-country"],
  "Soundtracks": ["soundtrack", "film score"],
  "Experimental": ["experimental", "avant-garde"]
};

// SVG Icons
const VINYL_PLACEHOLDER_SVG = `
  <svg class="slot-vinyl-svg" viewBox="0 0 28 28" aria-hidden="true">
    <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" stroke-width="1.2" />
    <circle cx="14" cy="14" r="8.2" fill="none" stroke="currentColor" stroke-width="0.6" opacity="0.45" />
    <circle cx="14" cy="14" r="4" fill="none" stroke="currentColor" stroke-width="1" />
    <circle cx="14" cy="14" r="1.1" fill="currentColor" />
  </svg>
`;

const ANNUAL_ICON_SVG = `
  <svg class="annual-badge-icon" viewBox="0 0 20 20" aria-hidden="true">
    <circle cx="10" cy="10" r="8.2" fill="none" stroke="currentColor" stroke-width="1.35" />
    <circle cx="10" cy="10" r="4.8" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.5" />
    <path d="M10 6.2 11.1 8.8l2.7.2-2.1 1.7.7 2.7L10 11.9l-2.4 1.5.7-2.7-2.1-1.7 2.7-.2L10 6.2Z" fill="currentColor" />
  </svg>
`;

const ICON_BOOKMARK_SVG = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 2.25h9a.75.75 0 0 1 .75.75v10.75l-5.25-3-5.25 3V3a.75.75 0 0 1 .75-.75Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /></svg>`;
const ICON_CLOCK_SVG = `<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.4" /><path d="M8 4.75V8l2.25 1.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>`;
const ICON_CHECK_SVG = `<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.4" /><path d="m5.3 8.1 1.85 1.85 3.65-3.9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg>`;
const ICON_NOTE_SVG = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M11.6 2.4a1.4 1.4 0 0 1 2 2L6.2 11.8l-2.9.8.8-2.9 7.5-7.3Z" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round" /></svg>`;
const ICON_TRASH_SVG = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.25h10M6.25 4.25V3a.75.75 0 0 1 .75-.75h2a.75.75 0 0 1 .75.75v1.25M4.5 4.25l.6 8.5a1 1 0 0 0 1 .95h3.8a1 1 0 0 0 1-.95l.6-8.5" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" /></svg>`;
const ICON_SHARE_SVG = `<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="12" cy="3.5" r="1.75" fill="none" stroke="currentColor" stroke-width="1.35"/><circle cx="4" cy="8" r="1.75" fill="none" stroke="currentColor" stroke-width="1.35"/><circle cx="12" cy="12.5" r="1.75" fill="none" stroke="currentColor" stroke-width="1.35"/><path d="m5.55 7.1 4.9-2.7m-4.9 4.5 4.9 2.7" stroke="currentColor" stroke-width="1.35"/></svg>`;
const ICON_EDIT_SVG = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M11.6 2.4a1.4 1.4 0 0 1 2 2L6.2 11.8l-2.9.8.8-2.9 7.5-7.3Z" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round" /></svg>`;
const ICON_USER_PLUS_SVG = `<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="6.5" cy="5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.35"/><path d="M2 13.2c.6-2.3 2.3-3.45 4.5-3.45s3.9 1.15 4.5 3.45M12.5 5.5v4M10.5 7.5h4" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/></svg>`;
const ICON_USER_CHECK_SVG = `<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="6.5" cy="5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.35"/><path d="M2 13.2c.6-2.3 2.3-3.45 4.5-3.45s3.9 1.15 4.5 3.45M10.5 7.7l1.3 1.3 2.5-2.6" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ------------------------------------------------------------
// App State
// ------------------------------------------------------------
let sessionUser = null;
let userProfile = null;
let currentView = "station";
let currentRoute = { type: "station" };
let viewHistory = [];
let authMode = "signin";
let devDayOffset = 0;

let pendingListenerParam = new URLSearchParams(window.location.search).get("listener") || null;

let currentAlbum = null;
let currentAlbumCoverUrl = "";
let currentInteraction = emptyInteraction();
let stationReqId = 0;

let cachedHomeCharts = null;
let isBackfillingDates = false;

let shelfItems = [];
let activeShelfTab = "want";
let activeShelfSort = (() => {
  try {
    const saved = localStorage.getItem(SHELF_SORT_KEY);
    return VALID_SHELF_SORTS.includes(saved) ? saved : "recent";
  } catch {
    return "recent";
  }
})();

let lastSearchQuery = "";
let lastSearchAlbums = [];
let activeSearchSort = "popularity";
let searchReqId = 0;

let activeArtistLps = [];
let activeArtistEps = [];
let activeArtistSort = "popularity";

let activePublicProfile = null;
let publicProfileReqId = 0;
let publicShelfItems = [];
let activePublicShelfTab = "listened"; let activePublicShelfSort = "recent";
let viewingOwnProfile = false;
let activeListenersTab = "all";
let listenersDirectoryReqId = 0;
let followListReqId = 0;
let followingCountCache = null;

let userLists = [];
let publicLists = [];
let activeDetailList = null;

let activeDetailAlbum = null;
let activeDetailInteraction = emptyInteraction();
let detailReqId = 0;
let defaultPreviewTrack = null;

let activeDetailArtist = null;
let artistReqId = 0;

let activeGenreName = "";
let activeGenreAlbums = [];
let activeGenreSort = "popularity";
let genreReqId = 0;
const genreAlbumsCache = new Map();

let draftArtists = [];
let draftTopFive = [];
let draftAvatarUrl = "";

const previewAudio = new Audio();
let activePreviewTrack = null;

const itunesCache = new Map();
const popularityCache = new Map();
const artistPhotoInflight = new Map();
let itunesSearchBlockedUntil = 0;

let coverCache = {};
let artistPhotoCache = {};
try { coverCache = JSON.parse(localStorage.getItem(COVER_CACHE_KEY) || "{}"); } catch { coverCache = {}; }
try { artistPhotoCache = JSON.parse(localStorage.getItem(ARTIST_PHOTO_CACHE_KEY) || "{}"); } catch { artistPhotoCache = {}; }

function emptyInteraction() {
  return { saved: false, listened: false, is_tbr: false, positive_note: "", reaction: null };
}

function syncShelfCache(savedRow, removedAlbumId = null) {
  if (removedAlbumId) {
    shelfItems = shelfItems.filter((s) => s.album_id !== removedAlbumId);
    return;
  }
  if (!savedRow) return;
  const idx = shelfItems.findIndex((s) => s.album_id === savedRow.album_id);
  if (idx >= 0) shelfItems[idx] = savedRow;
  else shelfItems.unshift(savedRow);
}

// ------------------------------------------------------------
// Runtime DOM & Style Compatibility Helpers
// ------------------------------------------------------------
function injectCompatStyles() {
  if ($("rs-compat-styles")) return;
  const style = document.createElement("style");
  style.id = "rs-compat-styles";
  style.textContent = `
    .tag-pill-btn {
      background: transparent;
      font: inherit;
      font-size: 0.76rem;
      color: var(--ink-secondary);
      padding: 0.2rem 0.62rem;
      border: 1px solid var(--border-subtle);
      cursor: pointer;
      transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease;
    }
    .tag-pill-btn:hover {
      border-color: var(--accent);
      color: var(--ink-primary);
      background-color: var(--bg-surface);
    }
    .artist-pill-btn {
      flex-direction: row !important;
      align-items: center !important;
      gap: 0.65rem;
      padding: 0.45rem 0.85rem 0.45rem 0.5rem !important;
    }
    .artist-pill-avatar {
      width: 34px;
      height: 34px;
      font-size: 0.78rem;
      flex-shrink: 0;
    }
    .artist-pill-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      min-width: 0;
    }
    .artist-hero-identity {
      display: flex;
      align-items: center;
      gap: 1.15rem;
      min-width: 0;
    }
    .artist-detail-avatar {
      width: 72px;
      height: 72px;
      font-size: 1.45rem;
      flex-shrink: 0;
    }
    .public-profile-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.85rem;
      flex-wrap: wrap;
    }
    .public-profile-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-top: 0.85rem;
    }
    .public-follow-stats {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      margin-top: 0.55rem;
      font-size: 0.82rem;
      color: var(--ink-secondary);
    }
    .public-follow-stats strong {
      color: var(--ink-primary);
      font-weight: 600;
    }
    .profile-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.8rem;
      font-size: 0.82rem;
    }
    .profile-action-btn svg {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }
    .shelf-cover-wrap {
      overflow: hidden;
    }
    .cover-hover-actions {
      justify-content: flex-end;
      gap: 0.3rem;
      padding: 1.35rem 0.4rem 0.4rem;
    }
    .cover-action-btn {
      flex: 0 0 auto;
      width: 30px;
      height: 30px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .cover-action-btn svg {
      width: 14px;
      height: 14px;
      display: block;
    }
    @media (max-width: 760px) {
      .artist-detail-avatar {
        width: 54px;
        height: 54px;
        font-size: 1.1rem;
      }
      #shelf-grid.mobile-cols-2 {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 1.1rem 0.8rem !important;
      }
      #shelf-grid.mobile-cols-1 {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) !important;
      }
      .cover-action-btn {
        width: 27px;
        height: 27px;
      }
      .cover-action-btn svg {
        width: 13px;
        height: 13px;
      }
    }
  `;
  document.head.appendChild(style);
}

function ensureAlbumDetailTagsContainer() {
  let el = $("detail-album-tags");
  if (el) return el;
  const titleEl = $("detail-album-title");
  if (!titleEl) return null;
  el = document.createElement("div");
  el.id = "detail-album-tags";
  el.className = "tag-list";
  titleEl.insertAdjacentElement("afterend", el);
  return el;
}

function ensureHomeDiscoveryContainers() {
  const station = $("station-view");
  if (!station) return;

  const defs = [
    {
      secId: "popular-new-section",
      gridId: "popular-new-grid",
      subId: "popular-new-sub",
      eyebrow: "Fresh Releases",
      heading: `New &amp; <span class="editorial-accent">popular</span>`
    },
    {
      secId: "popular-community-section",
      gridId: "popular-community-grid",
      subId: "popular-community-sub",
      eyebrow: "Community Shelves",
      heading: `Popular among <span class="editorial-accent">listeners</span>`
    },
    {
      secId: "popular-upcoming-section",
      gridId: "popular-upcoming-grid",
      subId: "popular-upcoming-sub",
      eyebrow: "Anticipated",
      heading: `Coming <span class="editorial-accent">soon</span>`
    },
    {
      secId: "popular-global-section",
      gridId: "popular-global-grid",
      subId: "popular-global-sub",
      eyebrow: "Charts",
      heading: `Popular <span class="editorial-accent">right now</span>`
    }
  ];

  defs.forEach((d) => {
    let sec = $(d.secId);
    if (!sec) {
      sec = document.createElement("section");
      sec.id = d.secId;
      sec.className = "home-discovery-section hidden";
      sec.innerHTML = `
        <div class="reviews-header">
          <div>
            <p class="eyebrow">${d.eyebrow}</p>
            <h2 class="discovery-heading">${d.heading}</h2>
          </div>
          <span id="${d.subId}" class="meta-label"></span>
        </div>
        <div id="${d.gridId}" class="discovery-grid"></div>
      `;
    }
    station.appendChild(sec);
  });
}

function ensureArtistAvatarElement() {
  let avatar = $("detail-artist-avatar");
  if (avatar) return avatar;

  const hero = document.querySelector("#artist-detail-view .artist-hero");
  const titleWrapper = hero?.firstElementChild;
  if (!hero || !titleWrapper) return null;

  const wrap = document.createElement("div");
  wrap.className = "artist-hero-identity";
  avatar = document.createElement("div");
  avatar.id = "detail-artist-avatar";
  avatar.className = "avatar-circle avatar-lg artist-detail-avatar";

  hero.insertBefore(wrap, titleWrapper);
  wrap.appendChild(avatar);
  wrap.appendChild(titleWrapper);
  return avatar;
}

function ensurePublicProfileControls() {
  const info = document.querySelector("#public-profile-view .public-profile-info");
  if (!info) return {};

  let statsEl = $("public-follow-stats");
  if (!statsEl) {
    statsEl = document.createElement("div");
    statsEl.id = "public-follow-stats";
    statsEl.className = "public-follow-stats";
    info.appendChild(statsEl);
  }
  statsEl.classList.add("public-follow-stats");

  let actionsEl = $("public-profile-actions") || info.querySelector(".public-profile-actions");
  if (!actionsEl) {
    actionsEl = document.createElement("div");
    actionsEl.id = "public-profile-actions";
    actionsEl.className = "public-profile-actions";
    statsEl.insertAdjacentElement("afterend", actionsEl);
  } else {
    actionsEl.id = "public-profile-actions";
    actionsEl.classList.add("public-profile-actions");
  }

  return { statsEl, actionsEl };
}

// ------------------------------------------------------------
// Theme (Dark Default)
// ------------------------------------------------------------
function applyTheme(theme) {
  const isLight = theme === "light";
  if (isLight) {
    document.documentElement.setAttribute("data-theme", "light");
    if ($("theme-toggle-btn")) $("theme-toggle-btn").textContent = "Dark";
  } else {
    document.documentElement.removeAttribute("data-theme");
    if ($("theme-toggle-btn")) $("theme-toggle-btn").textContent = "Light";
  }
  try { localStorage.setItem(THEME_KEY, isLight ? "light" : "dark"); } catch { /* ignore */ }
}

applyTheme(localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark");
on("theme-toggle-btn", "click", () => {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  applyTheme(isLight ? "dark" : "light");
});

// ------------------------------------------------------------
// Audio Preview Controller (15s clip + vinyl spin + fade-out)
// ------------------------------------------------------------
function updatePreviewUI() {
  const isPlaying = Boolean(activePreviewTrack && !previewAudio.paused);
  const track = activePreviewTrack || defaultPreviewTrack;

  $("detail-vinyl-stage")?.classList.toggle("is-playing", isPlaying);
  $("detail-preview-wrap")?.classList.toggle("hidden", !track);
  if (!track) return;

  $("detail-preview-btn")?.classList.toggle("playing", isPlaying);
  if ($("detail-preview-icon")) $("detail-preview-icon").textContent = isPlaying ? "■" : "▶";
  if ($("detail-preview-text")) $("detail-preview-text").textContent = `${isPlaying ? "Playing" : "Preview"} · ${track.trackName}`;

  $("detail-tracklist")?.querySelectorAll(".track-row").forEach((row) => {
    const active = isPlaying && row.dataset.trackId === String(activePreviewTrack.trackId);
    row.classList.toggle("is-playing", active);
    const numEl = row.querySelector(".track-num");
    if (numEl) numEl.textContent = active ? "▶" : row.dataset.trackNum;
  });
}

function stopPreview() {
  previewAudio.pause();
  previewAudio.currentTime = 0;
  previewAudio.volume = 1;
  activePreviewTrack = null;
  updatePreviewUI();
}

function togglePreviewTrack(track) {
  if (!track?.previewUrl) return;
  const isSame = activePreviewTrack && String(activePreviewTrack.trackId) === String(track.trackId) && !previewAudio.paused;
  if (isSame) return stopPreview();

  previewAudio.pause();
  previewAudio.src = track.previewUrl;
  previewAudio.currentTime = 0;
  previewAudio.volume = 1;
  activePreviewTrack = track;
  previewAudio.play().then(updatePreviewUI).catch(stopPreview);
}

previewAudio.addEventListener("timeupdate", () => {
  if (!activePreviewTrack || previewAudio.paused) return;
  const t = previewAudio.currentTime;
  if (t >= PREVIEW_MAX_SECONDS) return stopPreview();
  if (t >= PREVIEW_MAX_SECONDS - 1.5) {
    previewAudio.volume = Math.min(1, Math.max(0, PREVIEW_MAX_SECONDS - t) / 1.5);
  }
});
previewAudio.addEventListener("ended", stopPreview);

// ------------------------------------------------------------
// Pure Helpers, Capitalization, Dates & Anti-Single Rules
// ------------------------------------------------------------
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function debounce(fn, delay = 450) {
  let timer;
  const wrapped = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
  wrapped.cancel = () => clearTimeout(timer);
  return wrapped;
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function formatDisplayNameCase(name) {
  if (!name) return "";
  const trimmed = name.trim();
  if (trimmed !== trimmed.toLowerCase()) return trimmed;
  const minor = new Set(["de", "da", "do", "das", "dos", "e", "of", "the", "and", "in", "on", "at", "for", "to", "a"]);
  return trimmed
    .split(/\s+/)
    .map((word, idx) => (idx > 0 && minor.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
}

function fixReasonCapitalization(text) {
  if (!text) return "";
  return text.replace(
    /(because you listen to )([^.]+)/i,
    (_, prefix, artist) => `${prefix}${formatDisplayNameCase(artist)}`
  );
}

function lowercaseFirst(str) {
  return str ? str.charAt(0).toLowerCase() + str.slice(1) : "";
}

function normalizeArtistForAlbumMatch(artist) {
  return String(artist || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(feat\.?|featuring|ft\.?)\b.*$/i, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Standard and remaster variants share an identity; Deluxe remains distinct.
function normalizeAlbumTitleForMatch(title) {
  let value = String(title || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  value = value
    .replace(/[\(\[]([^)\]]*)[\)\]]/g, (full, inside) => {
      // Deluxe editions are intentionally separate identities.
      if (/\bdeluxe\b/i.test(inside)) return full;
      if (/\b(remaster(?:ed)?|re-?master(?:ed)?|anniversary|expanded edition|bonus track version|standard edition)\b|\b\d{4}\s+(?:mix|remix)\b/i.test(inside)) return " ";
      return full;
    })
    .replace(/\s*[-–—:]\s*(?:\d{4}\s+)?(?:remaster(?:ed)?|re-?master(?:ed)?|anniversary edition|expanded edition|standard edition|\d{4}\s+(?:mix|remix))\b.*$/i, "")
    .replace(/\b(?:\d{4}\s+)?(?:remaster(?:ed)?|re-?master(?:ed)?)\b/gi, " ")
    .replace(/\b\d{4}\s+(?:mix|remix)\b/gi, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return value;
}

// Collapse equivalent album editions in a view without changing the database.
// If any edition is Deluxe, its key remains distinct by design.
function uniqueAlbumsByIdentity(items) {
  const unique = [];
  const positions = new Map();
  for (const item of items || []) {
    const key = item?.title && item?.artist
      ? normalizeTitleKey(item.title, item.artist)
      : `id::${item?.album_id || unique.length}`;
    if (!positions.has(key)) {
      positions.set(key, unique.length);
      unique.push(item);
      continue;
    }
    const index = positions.get(key);
    const previous = unique[index];
    // Prefer the row with useful artwork/release metadata, while retaining
    // interaction state if either duplicate has it.
    unique[index] = {
      ...previous,
      ...((!previous.cover_url && item.cover_url) ? { cover_url: item.cover_url } : {}),
      ...((!previous.release_date && item.release_date) ? { release_date: item.release_date } : {}),
      ...((!previous.release_year && item.release_year) ? { release_year: item.release_year } : {}),
      saved: Boolean(previous.saved || item.saved),
      listened: Boolean(previous.listened || item.listened),
      is_tbr: Boolean(previous.is_tbr || item.is_tbr),
      positive_note: previous.positive_note || item.positive_note || null
    };
  }
  return unique;
}

function normalizeTitleKey(title, artist) {
  return `${normalizeArtistForAlbumMatch(artist)}::${normalizeAlbumTitleForMatch(title)}`;
}

function sameAlbumIdentity(a, b) {
  if (!a || !b || !a.title || !b.title || !a.artist || !b.artist) return false;
  return normalizeTitleKey(a.title, a.artist) === normalizeTitleKey(b.title, b.artist);
}

function findEquivalentShelfItem(album) {
  if (!album) return null;
  return shelfItems.find((item) => item.album_id === album.album_id) ||
    shelfItems.find((item) => sameAlbumIdentity(item, album)) || null;
}
function formatDuration(ms) {
  if (!ms || Number.isNaN(ms)) return "";
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function getDateSeed(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getReleaseDateSortKey(item, ascending = false) {
  const rawDate = item?.release_date ? String(item.release_date).trim() : "";
  const isoMatch = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return Number(`${isoMatch[1]}${isoMatch[2]}${isoMatch[3]}`);
  if (rawDate) {
    const parsed = new Date(rawDate);
    if (!Number.isNaN(parsed.getTime())) return Number(getDateSeed(parsed).replace(/-/g, ""));
  }
  const year = parseInt(item?.release_year, 10);
  if (!Number.isNaN(year) && year > 0) return year * 10000 + (ascending ? 1231 : 0);
  return ascending ? 99999999 : 0;
}

function isFutureReleaseDate(dateStr, yearStr = "") {
  const todayIso = getDateSeed(new Date());
  if (dateStr) {
    const iso = String(dateStr).slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso > todayIso;
    const d = new Date(dateStr);
    if (!Number.isNaN(d.getTime())) return getDateSeed(d) > todayIso;
  }
  const y = parseInt(yearStr, 10);
  return !Number.isNaN(y) && y > new Date().getFullYear();
}

function isRecentReleaseDate(dateStr, daysWindow = 120) {
  if (!dateStr) return false;
  const iso = String(dateStr).slice(0, 10);
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`) : new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = (today.getTime() - d.getTime()) / 86400000;
  return diffDays >= 0 && diffDays <= daysWindow;
}

function isItemTbr(item) {
  if (!item || item.listened) return false;
  return Boolean(item.is_tbr || (item.saved && isFutureReleaseDate(item.release_date, item.release_year)));
}

function formatShortReleaseDate(dateStr) {
  if (!dateStr) return "Upcoming";
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isSingleTitle(title) {
  if (!title) return true;
  return /(\s*[-–—]\s*single|\(single\)|\[single\]|\bsingle)$/i.test(title.trim());
}

function isEpTitle(title) {
  if (!title) return false;
  return /(\s*[-–—]\s*ep|\(ep\)|\[ep\]|\bep)$/i.test(title.trim());
}

function classifyRelease(item) {
  const name = (item.collectionName || item.title || "").trim();
  const count = Number(item.trackCount || 0);

  if (isSingleTitle(name)) return "single";
  if (isEpTitle(name)) return "ep";
  if (count > 0 && count <= 3) return "single";
  if (count === 4) return "ep";
  return "lp";
}

function isNonSingleRelease(item) {
  return Boolean(item?.collectionName && item?.artistName && classifyRelease(item) !== "single");
}

function isJunkTitle(title) {
  if (!title) return true;
  const t = title.toLowerCase().trim();
  return (
    t === "(null)" ||
    t === "undefined" ||
    isSingleTitle(t) ||
    /\b(greatest hits|best of|the essentials|anthology|collection|karaoke|tribute to)\b/i.test(t)
  );
}

function passesFullAlbumCheck(tracks) {
  if (!Array.isArray(tracks) || tracks.length < 5) return false;
  const totalMinutes = tracks.reduce((sum, t) => sum + (t.trackTimeMillis || 0), 0) / 60000;
  if (totalMinutes === 0) return tracks.length >= 6;
  return totalMinutes >= 18 || (tracks.length >= 7 && totalMinutes >= 15);
}

function isStoredPickInvalid(pick) {
  if (!pick) return true;
  if (isSingleTitle(pick.title) || isEpTitle(pick.title)) return true;
  if (!pick.itunes_collection_id) return true;
  const minMatch = (pick.runtime || "").match(/^(\d+)\s*min/i);
  if (minMatch && Number(minMatch[1]) < 15) return true;
  const trackMatch = (pick.runtime || "").match(/^(\d+)\s*track/i);
  if (trackMatch && Number(trackMatch[1]) < 5) return true;
  return false;
}

function cleanCopyrightToLabel(copyright) {
  if (!copyright) return "—";
  const cleaned = copyright
    .replace(/^[℗©\s\d\-–,]+/g, "")
    .replace(/\b(under exclusive license to|all rights reserved).*/i, "")
    .trim();
  return cleaned.length > 26 ? `${cleaned.slice(0, 25).trim()}…` : cleaned || "—";
}

function cleanLastFmWiki(rawSummary) {
  if (!rawSummary) return "";
  const stripped = rawSummary.replace(/<a\s+href="https?:\/\/www\.last\.fm[^>]*>.*?<\/a>.*/is, "");
  const temp = document.createElement("div");
  temp.innerHTML = stripped;
  const text = (temp.textContent || "").replace(/\s+/g, " ").trim();
  if (text.length < 35) return "";
  return text.length > 360 ? `${text.slice(0, 355).trim()}…` : text;
}

function pickAestheticForTags(tags = []) {
  const joined = tags.join(" ").toLowerCase();
  if (/(electronic|idm|techno|house|post-punk|industrial|math|experimental|synth|dub|metal|punk)/.test(joined)) return "modular";
  if (/(jazz|folk|acoustic|dream pop|shoegaze|classical|bossa|mpb|ambient|alternative pop)/.test(joined)) return "italic";
  return "editorial";
}

function sortAlbumsList(list, mode) {
  const sorters = {
    popularity: (a, b) =>
      Number(b.popularity || 0) - Number(a.popularity || 0) ||
      getReleaseDateSortKey(b, false) - getReleaseDateSortKey(a, false),
    "year-desc": (a, b) =>
      getReleaseDateSortKey(b, false) - getReleaseDateSortKey(a, false) ||
      Number(b.popularity || 0) - Number(a.popularity || 0),
    "year-asc": (a, b) =>
      getReleaseDateSortKey(a, true) - getReleaseDateSortKey(b, true) ||
      Number(b.popularity || 0) - Number(a.popularity || 0),
    title: (a, b) => (a.title || "").localeCompare(b.title || ""),
    artist: (a, b) => (a.artist || "").localeCompare(b.artist || "") || (a.title || "").localeCompare(b.title || "")
  };
  return [...list].sort(sorters[mode] || sorters.popularity);
}

function renderAvatar(el, avatarUrl, name) {
  if (!el) return;
  if (avatarUrl) {
    el.innerHTML = `<img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(name || "Avatar")}" loading="lazy" />`;
  } else {
    el.textContent = (name || "?").trim().charAt(0).toUpperCase() || "?";
  }
}

function processAvatarFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image file"));
      img.onload = () => {
        const size = 220;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const min = Math.min(img.width, img.height);
        canvas.getContext("2d").drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// ------------------------------------------------------------
// External APIs (iTunes, Last.fm, Deezer Artist Photos & Apple Music Links)
// ------------------------------------------------------------
async function fetchLastFm(method, params = {}) {
  if (!LASTFM_API_KEY) return null;
  const qs = new URLSearchParams({ method, api_key: LASTFM_API_KEY, format: "json", ...params });
  try {
    const res = await fetch(`https://ws.audioscrobbler.com/2.0/?${qs}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.error ? null : data;
  } catch {
    return null;
  }
}

function extractLastFmCover(images = []) {
  if (!Array.isArray(images)) return "";
  const url =
    (images.find((i) => i.size === "mega") ||
      images.find((i) => i.size === "extralarge") ||
      images.find((i) => i.size === "large") ||
      images.find((i) => i.size === "medium"))?.["#text"] || "";
  return url && !url.includes("2a96cbd8b46e442fc41c2b86b821562f") ? url : "";
}

async function fetchAlbumPopularity(artist, title) {
  if (!artist || !title) return 0;
  const key = normalizeTitleKey(title, artist);
  if (popularityCache.has(key)) return popularityCache.get(key);
  const data = await fetchLastFm("album.getInfo", { artist, album: title, autocorrect: 1 });
  const score = Number(data?.album?.listeners || 0) || 0;
  popularityCache.set(key, score);
  return score;
}

function fetchJsonp(url, cbParam = "callback") {
  return new Promise((resolve, reject) => {
    const cb = `rsJsonp_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement("script");
    const timer = setTimeout(() => { cleanup(); reject(new Error("JSONP timeout")); }, 6000);
    const cleanup = () => { clearTimeout(timer); delete window[cb]; script.remove(); };
    window[cb] = (data) => { cleanup(); resolve(data); };
    script.src = `${url}${url.includes("?") ? "&" : "?"}${cbParam}=${cb}`;
    script.onerror = () => { cleanup(); reject(new Error("JSONP error")); };
    document.body.appendChild(script);
  });
}

async function fetchArtistPhoto(artistName) {
  if (!artistName) return "";
  const key = artistName.toLowerCase().trim();
  if (Object.prototype.hasOwnProperty.call(artistPhotoCache, key)) {
    return artistPhotoCache[key];
  }
  if (artistPhotoInflight.has(key)) {
    return artistPhotoInflight.get(key);
  }

  const req = (async () => {
    let url = "";
    try {
      const data = await fetchJsonp(
        `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}&limit=5&output=jsonp`,
        "callback"
      );
      const list = data?.data || [];
      const exact =
        list.find((a) => a.name?.toLowerCase() === key) ||
        list.find((a) => a.name?.toLowerCase().includes(key)) ||
        list[0];
      url = exact?.picture_medium || exact?.picture_big || exact?.picture || "";
    } catch {
      url = "";
    }

    artistPhotoCache[key] = url;
    try { localStorage.setItem(ARTIST_PHOTO_CACHE_KEY, JSON.stringify(artistPhotoCache)); } catch { /* ignore */ }
    artistPhotoInflight.delete(key);
    return url;
  })();

  artistPhotoInflight.set(key, req);
  return req;
}

async function fetchItunesRaw(url) {
  if (itunesCache.has(url)) return itunesCache.get(url);

  const isSearch = url.includes("/search?");
  if (isSearch && Date.now() < itunesSearchBlockedUntil) return [];

  try {
    const res = await fetch(url);
    if (res.status === 403 || res.status === 429) {
      if (isSearch) itunesSearchBlockedUntil = Date.now() + 45000;
      return [];
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const results = (await res.json()).results || [];
    itunesCache.set(url, results);
    return results;
  } catch {
    try {
      const results = (await fetchJsonp(url, "callback")).results || [];
      itunesCache.set(url, results);
      return results;
    } catch {
      if (isSearch) itunesSearchBlockedUntil = Date.now() + 20000;
      return [];
    }
  }
}

const queryItunes = (term, entity, limit = 12) =>
  fetchItunesRaw(
    `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&country=${ITUNES_COUNTRY}&entity=${entity}&limit=${limit}`
  );

const lookupItunes = (id, entity, limit = 60) =>
  fetchItunesRaw(
    `https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}&country=${ITUNES_COUNTRY}&entity=${entity}&limit=${limit}`
  );

const lookupItunesBatch = (ids) =>
  fetchItunesRaw(
    `https://itunes.apple.com/lookup?id=${ids.map(encodeURIComponent).join(",")}&country=${ITUNES_COUNTRY}`
  );

const toHighResCover = (url) => (url ? url.replace(/\d+x\d+bb/i, "800x800bb") : "");

function extractAppleMusicLink(input) {
  const match = input.match(/apple\.com\/(?:([a-z]{2})\/)?album\/(?:[^/?]+\/)?(?:id)?(\d+)/i);
  return match ? { country: (match[1] || ITUNES_COUNTRY).toUpperCase(), id: match[2] } : null;
}

function toAlbumPayloadFromItunes(item, existingNote = null) {
  return {
    album_id: `itunes-${item.collectionId}`,
    collectionId: item.collectionId,
    artistId: item.artistId,
    title: item.collectionName,
    artist: item.artistName,
    cover_url: toHighResCover(item.artworkUrl100),
    thumb_url: item.artworkUrl100 || "",
    release_year: item.releaseDate ? item.releaseDate.slice(0, 4) : "",
    release_date: item.releaseDate || null,
    genre: item.primaryGenreName || "",
    label: item.copyright || "",
    positive_note: existingNote
  };
}

function toAlbumPayloadFromLastFm(item) {
  const cover = extractLastFmCover(item.image);
  const slug = `${item.artist}-${item.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return {
    album_id: `lfm-${slug}`,
    collectionId: null,
    artistId: null,
    title: item.name,
    artist: item.artist,
    cover_url: cover,
    thumb_url: cover,
    release_year: "",
    release_date: null,
    genre: "",
    label: "",
    positive_note: null
  };
}

async function verifyLastFmFullAlbum(artist, title) {
  if (!artist || !title || isJunkTitle(title) || isEpTitle(title)) return null;

  const info = await fetchLastFm("album.getInfo", { artist, album: title, autocorrect: 1 });
  const alb = info?.album;
  if (!alb) return null;

  const tags = toArray(alb.tags?.tag).map((t) => (t?.name || "").toLowerCase().trim());
  if (tags.slice(0, 3).some((t) => t === "single" || t === "ep")) return null;

  const tracks = toArray(alb.tracks?.track);
  if (tracks.length < 5) return null;

  const withDur = tracks.filter((t) => Number(t.duration || 0) > 0);
  if (withDur.length >= Math.ceil(tracks.length * 0.7)) {
    const totalMin = withDur.reduce((sum, t) => sum + Number(t.duration), 0) / 60;
    if (totalMin < 18 && !(tracks.length >= 7 && totalMin >= 15)) return null;
  } else if (tracks.length < 6) {
    return null;
  }

  return alb;
}

async function searchLastFmAlbums(term, limit = 12) {
  const data = await fetchLastFm("album.search", { album: term, limit: Math.min(30, limit * 2) });
  const list = toArray(data?.results?.albummatches?.album);
  const seen = new Set();
  const out = [];

  for (const item of list) {
    if (!item?.name || !item?.artist || isJunkTitle(item.name)) continue;
    const key = normalizeTitleKey(item.name, item.artist);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(toAlbumPayloadFromLastFm(item));
    if (out.length >= limit) break;
  }
  return out;
}


function primaryArtistCredit(artist) {
  return normalizeArtistForAlbumMatch(String(artist || ""))
    .split(/\\s+(?:and|with|feat|featuring|ft)\\s+|[,;&+]/)
    .map((part) => part.trim())
    .filter(Boolean)[0] || normalizeArtistForAlbumMatch(artist);
}

function soundtrackDuplicateKey(title, artist) {
  return `${normalizeAlbumTitleForMatch(title)}::${primaryArtistCredit(artist)}`;
}

async function searchNonSingleAlbums(term, limit = 12) {
  const linkInfo = extractAppleMusicLink(term);
  if (linkInfo) {
    const res = await fetchItunesRaw(
      `https://itunes.apple.com/lookup?id=${linkInfo.id}&country=${linkInfo.country}&entity=album`
    );
    const col = res.find((r) => r.wrapperType === "collection" && r.collectionName);
    return col ? [toAlbumPayloadFromItunes(col)] : [];
  }

  const rawItunes = await queryItunes(term, "album", 35);
  const needle = term.toLowerCase().trim();
  const words = needle.split(/\s+/).filter(Boolean);
  const seen = new Set();
  const merged = [];

  for (const item of rawItunes) {
    if (!isNonSingleRelease(item)) continue;
    const key = soundtrackDuplicateKey(item.collectionName, item.artistName);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(toAlbumPayloadFromItunes(item));
  }

  if (merged.length < Math.min(4, limit)) {
    const lfmMatches = await searchLastFmAlbums(term, limit);
    for (const item of lfmMatches) {
      const key = soundtrackDuplicateKey(item.title, item.artist);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
    }
  }

  merged.sort((a, b) => {
    const score = (x) => {
      const t = x.title.toLowerCase();
      const ar = x.artist.toLowerCase();
      const full = `${t} ${ar}`;
      let s = 0;
      if (t === needle) s = 6;
      else if (t.startsWith(needle)) s = 5;
      else if (t.includes(needle)) s = 4;
      else if (words.length > 1 && words.every((w) => full.includes(w))) s = 3;
      else if (ar.includes(needle)) s = 2;
      if (x.collectionId) s += 0.5;
      return s;
    };
    return score(b) - score(a);
  });

  return merged.slice(0, limit);
}

async function searchArtistsHybrid(term, limit = 8) {
  const itunesRaw = await queryItunes(term, "musicArtist", limit);
  const seen = new Set();
  const out = [];

  for (const a of itunesRaw) {
    if (!a.artistName) continue;
    const k = a.artistName.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ artistId: a.artistId, name: a.artistName, genre: a.primaryGenreName || "Artist" });
  }

  if (!out.length) {
    const lfm = await fetchLastFm("artist.search", { artist: term, limit });
    const list = toArray(lfm?.results?.artistmatches?.artist);
    for (const a of list) {
      if (!a?.name) continue;
      const k = a.name.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({ artistId: null, name: a.name, genre: "Artist" });
    }
  }

  return out.slice(0, limit);
}

async function resolveAlbumCover(album) {
  if (album.coverUrl) return album.coverUrl;
  if (coverCache[album.id]) return coverCache[album.id];

  const results = await searchNonSingleAlbums(album.coverQuery || `${album.artist} ${album.title}`, 3);
  const match = results.find((r) => r.title.toLowerCase().includes(album.title.toLowerCase().slice(0, 8))) || results[0];
  const highRes = match?.cover_url || "";
  if (highRes) {
    coverCache[album.id] = highRes;
    try { localStorage.setItem(COVER_CACHE_KEY, JSON.stringify(coverCache)); } catch { /* ignore */ }
  }
  return highRes;
}

// ------------------------------------------------------------
// Home Page Discovery (4 Sections in Exact Order):
// 1. New & Popular -> 2. Popular among listeners -> 3. Coming soon -> 4. Popular right now
// ------------------------------------------------------------
async function fetchItunesRssTopAlbums(country, limit = 100) {
  try {
    const res = await fetch(`https://itunes.apple.com/${country.toLowerCase()}/rss/topalbums/limit=${limit}/json`);
    if (!res.ok) return [];
    const json = await res.json();
    const entries = json?.feed?.entry || [];
    const out = [];
    for (const e of entries) {
      const title = e["im:name"]?.label || "";
      const artist = e["im:artist"]?.label || "";
      const trackCount = Number(e["im:itemCount"]?.label || 0);
      const colId = e.id?.attributes?.["im:id"] || null;
      if (!title || !artist || !colId) continue;
      if (isJunkTitle(title) || isEpTitle(title) || (trackCount > 0 && trackCount < 5)) continue;

      const imgs = e["im:image"] || [];
      const rawImg = imgs[imgs.length - 1]?.label || "";
      const releaseDate = e["im:releaseDate"]?.label || null;

      out.push({
        album_id: `itunes-${colId}`,
        collectionId: colId,
        artistId: null,
        title,
        artist,
        cover_url: toHighResCover(rawImg),
        release_year: releaseDate ? releaseDate.slice(0, 4) : "",
        release_date: releaseDate,
        genre: e.category?.attributes?.label || "",
        label: e.rights?.label || ""
      });
    }
    return out;
  } catch {
    return [];
  }
}

const MONTH_INDEX = {
  january: "01", jan: "01",
  february: "02", feb: "02",
  march: "03", mar: "03",
  april: "04", apr: "04",
  may: "05",
  june: "06", jun: "06",
  july: "07", jul: "07",
  august: "08", aug: "08",
  september: "09", sept: "09", sep: "09",
  october: "10", oct: "10",
  november: "11", nov: "11",
  december: "12", dec: "12"
};

const MONTH_PATTERN = "(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec)\\.?";

async function fetchWikiParsedHtml(pageTitle) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(pageTitle)}&prop=text&redirects=1&formatversion=2&format=json&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return "";
    const data = await res.json();
    return data?.parse?.text || "";
  } catch {
    return "";
  }
}

async function fetchWikiAlbumCoversBatch(wikiTitles) {
  const unique = [...new Set(wikiTitles.filter(Boolean))];
  if (!unique.length) return new Map();

  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(unique.join("|"))}&prop=pageimages&pilicense=any&pithumbsize=600&redirects=1&formatversion=2&format=json&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return new Map();
    const data = await res.json();

    const normMap = new Map((data?.query?.normalized || []).map((n) => [n.from, n.to]));
    const redirMap = new Map((data?.query?.redirects || []).map((r) => [r.from, r.to]));
    const pageMap = new Map((data?.query?.pages || []).map((p) => [p.title, p.thumbnail?.source || ""]));

    const out = new Map();
    unique.forEach((orig) => {
      let t = normMap.get(orig) || orig;
      t = redirMap.get(t) || t;
      const src = pageMap.get(t);
      if (src) out.set(orig, src);
    });
    return out;
  } catch {
    return new Map();
  }
}

async function fetchDeezerAlbumCover(artist, title) {
  try {
    const q = `artist:"${artist}" album:"${title}"`;
    const data = await fetchJsonp(
      `https://api.deezer.com/search/album?q=${encodeURIComponent(q)}&limit=3&output=jsonp`,
      "callback"
    );
    const list = data?.data || [];
    const needle = normalizeAlbumTitleForMatch(title).slice(0, 8);
    const match =
      list.find((a) => normalizeAlbumTitleForMatch(a.title).includes(needle)) ||
      list[0];
    return match?.cover_big || match?.cover_xl || match?.cover_medium || "";
  } catch {
    return "";
  }
}

function parseWikiUpcomingTables(html, year, todayIso, maxDaysAhead = 180) {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("sup, style").forEach((el) => el.remove());
  doc.querySelectorAll("br").forEach((br) => br.replaceWith(" "));

  const todayDate = new Date(`${todayIso}T00:00:00`);
  const monthRegex = new RegExp(`\\b${MONTH_PATTERN}`, "i");
  const mFirstRegex = new RegExp(`\\b${MONTH_PATTERN}\\s*(\\d{1,2})\\b`, "i");
  const dFirstRegex = new RegExp(`\\b(\\d{1,2})\\s*${MONTH_PATTERN}`, "i");
  const items = [];

  doc.querySelectorAll("table.wikitable").forEach((table) => {
    let activeMonth = "";
    let prev = table.previousElementSibling;
    while (prev) {
      const m = prev.textContent?.match(monthRegex);
      if (m && (/^H[2-4]$/.test(prev.tagName) || prev.querySelector?.("h2, h3, h4"))) {
        activeMonth = m[1].toLowerCase();
        break;
      }
      if (prev.tagName === "TABLE") break;
      prev = prev.previousElementSibling;
    }

    const rows = Array.from(table.querySelectorAll("tr"));
    const grid = [];

    rows.forEach((tr, rIdx) => {
      if (!grid[rIdx]) grid[rIdx] = [];
      let cIdx = 0;
      Array.from(tr.children).forEach((cell) => {
        if (cell.tagName !== "TD" && cell.tagName !== "TH") return;
        while (grid[rIdx][cIdx]) cIdx++;
        const rs = Math.max(1, parseInt(cell.getAttribute("rowspan") || "1", 10));
        const cs = Math.max(1, parseInt(cell.getAttribute("colspan") || "1", 10));
        for (let r = 0; r < rs; r++) {
          if (!grid[rIdx + r]) grid[rIdx + r] = [];
          for (let c = 0; c < cs; c++) grid[rIdx + r][cIdx + c] = cell;
        }
        cIdx += cs;
      });
    });

    let headerRowIdx = -1;
    let dateCol = -1;
    let artistCol = -1;
    let albumCol = -1;
    let genreCol = -1;
    let labelCol = -1;

    for (let r = 0; r < Math.min(4, grid.length); r++) {
      const cols = grid[r].map((c) => (c?.textContent || "").replace(/\s+/g, " ").trim().toLowerCase());
      const aIdx = cols.findIndex((t) => t === "artist" || t.startsWith("artist"));
      const albIdx = cols.findIndex((t) => t === "album" || t.startsWith("album ") || t === "title");
      if (aIdx >= 0 && albIdx >= 0) {
        headerRowIdx = r;
        dateCol = cols.findIndex((t) => t.includes("date"));
        artistCol = aIdx;
        albumCol = albIdx;
        genreCol = cols.findIndex((t) => t.includes("genre"));
        labelCol = cols.findIndex((t) => t.includes("label"));
        break;
      }
    }

    if (headerRowIdx < 0 || dateCol < 0) return;

    for (let r = headerRowIdx + 1; r < grid.length; r++) {
      const row = grid[r];
      if (!row || !row[dateCol] || !row[artistCol] || !row[albumCol]) continue;

      if (row[dateCol] === row[albumCol]) {
        const bannerMonth = row[dateCol].textContent.match(monthRegex);
        if (bannerMonth) activeMonth = bannerMonth[1].toLowerCase();
        continue;
      }

      const dateCells = [];
      const endDateCol = dateCol < artistCol ? artistCol : dateCol + 1;
      for (let c = dateCol; c < endDateCol; c++) {
        if (row[c] && !dateCells.includes(row[c])) dateCells.push(row[c]);
      }
      const dateText = dateCells
        .map((c) => c.textContent.replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .join(" ");

      let monthName = "";
      let dayNum = "";

      const mFirst = dateText.match(mFirstRegex);
      const dFirst = dateText.match(dFirstRegex);
      const dOnly = dateText.match(/^(\d{1,2})$/);

      if (mFirst) {
        monthName = mFirst[1].toLowerCase();
        dayNum = mFirst[2];
        activeMonth = monthName;
      } else if (dFirst) {
        dayNum = dFirst[1];
        monthName = dFirst[2].toLowerCase();
        activeMonth = monthName;
      } else if (dOnly && activeMonth) {
        monthName = activeMonth;
        dayNum = dOnly[1];
      } else {
        const mOnly = dateText.match(monthRegex);
        if (mOnly) activeMonth = mOnly[1].toLowerCase();
        continue;
      }

      const mm = MONTH_INDEX[monthName];
      const dd = String(Number(dayNum)).padStart(2, "0");
      if (!mm || Number(dayNum) < 1 || Number(dayNum) > 31) continue;

      const isoDate = `${year}-${mm}-${dd}`;
      if (isoDate <= todayIso) continue;

      const diffDays = (new Date(`${isoDate}T00:00:00`) - todayDate) / 86400000;
      if (diffDays > maxDaysAhead) continue;

      const artist = row[artistCol].textContent.replace(/\s+/g, " ").trim();
      const title = row[albumCol].textContent.replace(/\s+/g, " ").trim();
      if (!artist || !title || /^(tba|tbd|untitled|to be announced)$/i.test(title)) continue;
      if (isJunkTitle(title) || isEpTitle(title)) continue;

      const albumLink = row[albumCol].querySelector('a[href^="/wiki/"]:not(.new)');
      const artistLink = row[artistCol].querySelector('a[href^="/wiki/"]:not(.new)');
      const albumWikiTitle = albumLink
        ? decodeURIComponent(albumLink.getAttribute("href").replace("/wiki/", "")).replace(/_/g, " ")
        : "";

      items.push({
        title,
        artist,
        release_date: isoDate,
        release_year: String(year),
        genre: genreCol >= 0 ? (row[genreCol]?.textContent || "").trim() : "",
        label: labelCol >= 0 ? (row[labelCol]?.textContent || "").trim() : "",
        albumWikiTitle,
        hasAlbumArticle: Boolean(albumLink),
        hasArtistArticle: Boolean(artistLink)
      });
    }
  });

  return items;
}

async function fetchMusicBrainzUpcomingAlbums(todayIso, maxDaysAhead = 150) {
  try {
    const start = new Date(`${todayIso}T00:00:00`);
    start.setDate(start.getDate() + 1);
    const end = new Date(`${todayIso}T00:00:00`);
    end.setDate(end.getDate() + maxDaysAhead);

    const query = `firstreleasedate:[${getDateSeed(start)} TO ${getDateSeed(end)}] AND primarytype:album`;
    const url = `https://musicbrainz.org/ws/2/release-group?query=${encodeURIComponent(query)}&fmt=json&limit=60`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    const blockedSecondary = new Set([
      "Compilation", "Live", "Remix", "DJ-mix", "Mixtape/Street",
      "Demo", "Audio drama", "Audiobook", "Spokenword", "Interview"
    ]);

    const out = [];
    for (const rg of data["release-groups"] || []) {
      const secondary = rg["secondary-types"] || [];
      if (secondary.some((t) => blockedSecondary.has(t))) continue;

      const title = (rg.title || "").trim();
      const artist = (rg["artist-credit"] || [])
        .map((c) => `${c.name || c.artist?.name || ""}${c.joinphrase || ""}`)
        .join("")
        .trim();
      const dateStr = (rg["first-release-date"] || "").trim();
      if (!title || !artist || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) continue;
      if (dateStr <= todayIso || isJunkTitle(title) || isEpTitle(title)) continue;

      out.push({
        title,
        artist,
        release_date: dateStr,
        release_year: dateStr.slice(0, 4),
        genre: "",
        label: "",
        albumWikiTitle: "",
        hasAlbumArticle: false,
        hasArtistArticle: false
      });
    }
    return out;
  } catch {
    return [];
  }
}

async function fetchPopularUpcomingAlbums(limit = 10) {
  const todayIso = getDateSeed(new Date());

  try {
    const cached = JSON.parse(localStorage.getItem(UPCOMING_CACHE_KEY) || "null");
    if (cached && Date.now() - cached.ts < 12 * 3600 * 1000 && Array.isArray(cached.items)) {
      const stillFuture = cached.items.filter((a) => isFutureReleaseDate(a.release_date, a.release_year));
      if (stillFuture.length >= 4) return stillFuture.slice(0, limit);
    }
  } catch { /* ignore */ }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const targets = [];
  if (month < 6) {
    targets.push({ year, pages: [`List of ${year} albums (January–June)`, `List of ${year} albums`] });
    if (month >= 3) targets.push({ year, pages: [`List of ${year} albums (July–December)`] });
  } else {
    targets.push({ year, pages: [`List of ${year} albums (July–December)`, `List of ${year} albums`] });
    if (month >= 8) {
      targets.push({ year: year + 1, pages: [`List of ${year + 1} albums (January–June)`, `List of ${year + 1} albums`] });
    }
  }

  const [wikiGroups, mbItems] = await Promise.all([
    Promise.all(
      targets.map(async (t) => {
        for (const page of t.pages) {
          const html = await fetchWikiParsedHtml(page);
          const rows = parseWikiUpcomingTables(html, t.year, todayIso, 180);
          if (rows.length) return rows;
        }
        return [];
      })
    ),
    fetchMusicBrainzUpcomingAlbums(todayIso, 150)
  ]);

  const seen = new Set();
  const candidates = [];
  for (const item of [...wikiGroups.flat(), ...mbItems]) {
    const key = soundtrackDuplicateKey(item.title, item.artist);
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push(item);
  }

  if (!candidates.length) return [];

  candidates.sort(
    (a, b) =>
      (b.hasAlbumArticle - a.hasAlbumArticle) ||
      (b.hasArtistArticle - a.hasArtistArticle) ||
      a.release_date.localeCompare(b.release_date)
  );
  const shortlist = candidates.slice(0, 28);

  await Promise.all(
    shortlist.map(async (item) => {
      const primaryArtist = item.artist.split(/\s+(?:and|&|feat\.|ft\.|with)\s+|,\s*/i)[0].trim();
      const info = await fetchLastFm("artist.getInfo", { artist: primaryArtist, autocorrect: 1 });
      item.artistListeners = Number(info?.artist?.stats?.listeners || 0) || 0;
    })
  );

  shortlist.sort((a, b) => b.artistListeners - a.artistListeners || a.release_date.localeCompare(b.release_date));
  const picked = shortlist.slice(0, limit);

  const wikiCovers = await fetchWikiAlbumCoversBatch(picked.map((p) => p.albumWikiTitle));
  const results = await Promise.all(
    picked.map(async (item) => {
      let cover = (item.albumWikiTitle && wikiCovers.get(item.albumWikiTitle)) || "";
      if (!cover) cover = await fetchDeezerAlbumCover(item.artist, item.title);

      const slug = `${item.artist}-${item.title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return {
        album_id: `lfm-${slug}`,
        collectionId: null,
        artistId: null,
        title: item.title,
        artist: item.artist,
        cover_url: cover,
        release_year: item.release_year,
        release_date: item.release_date,
        genre: item.genre,
        label: item.label
      };
    })
  );

  results.sort((a, b) => a.release_date.localeCompare(b.release_date));
  try {
    localStorage.setItem(UPCOMING_CACHE_KEY, JSON.stringify({ ts: Date.now(), items: results }));
  } catch { /* ignore */ }

  return results;
}

async function fetchHomeChartsData() {
  if (cachedHomeCharts) return cachedHomeCharts;

  const [ptList, usList] = await Promise.all([
    fetchItunesRssTopAlbums(ITUNES_COUNTRY, 100),
    fetchItunesRssTopAlbums("us", 100)
  ]);

  const seenAll = new Set();
  const combined = [];
  for (const item of [...ptList, ...usList]) {
    const key = soundtrackDuplicateKey(item.title, item.artist);
    if (seenAll.has(key)) continue;
    seenAll.add(key);
    combined.push(item);
  }

  // 1. Recent Popular New Releases (last 120 days, not future)
  const newPopular = combined
    .filter((a) => isRecentReleaseDate(a.release_date, 120))
    .slice(0, 10);

  if (newPopular.length < 6) {
    const used = new Set(newPopular.map((a) => a.album_id));
    for (const a of combined) {
      if (used.has(a.album_id) || isFutureReleaseDate(a.release_date)) continue;
      if (Number(a.release_year) === CURRENT_YEAR) {
        newPopular.push(a);
        used.add(a.album_id);
        if (newPopular.length >= 10) break;
      }
    }
  }

  // 3. Popular Upcoming (iTunes pre-orders + Wikipedia/MusicBrainz/Last.fm + community TBRs)
  const upcoming = [];
  const seenUp = new Set();

  const pushUpcoming = (a) => {
    const k = normalizeTitleKey(a.title, a.artist);
    if (seenUp.has(k)) return;
    seenUp.add(k);
    upcoming.push(a);
  };

  for (const a of combined) {
    if (isFutureReleaseDate(a.release_date)) pushUpcoming(a);
  }

  const [wikiUpcoming, tbrRes] = await Promise.all([
    fetchPopularUpcomingAlbums(10),
    sb
      .from("user_album_interactions")
      .select("user_id, album_id, title, artist, cover_url, release_year, release_date, is_tbr")
      .eq("is_tbr", true)
      .order("updated_at", { ascending: false })
      .limit(100)
  ]);

  wikiUpcoming.forEach(pushUpcoming);

  const tbrGroups = new Map();
  for (const row of tbrRes?.data || []) {
    if (!row.title || !row.artist || isSingleTitle(row.title)) continue;
    if (row.release_date && !isFutureReleaseDate(row.release_date, row.release_year)) continue;
    const k = normalizeTitleKey(row.title, row.artist);
    if (seenUp.has(k)) continue;
    if (!tbrGroups.has(k)) {
      tbrGroups.set(k, {
        album_id: row.album_id,
        collectionId: row.album_id?.startsWith("itunes-") ? row.album_id.replace("itunes-", "") : null,
        title: row.title,
        artist: row.artist,
        cover_url: row.cover_url || "",
        release_year: row.release_year || "",
        release_date: row.release_date || null,
        users: new Set()
      });
    }
    tbrGroups.get(k).users.add(row.user_id);
  }

  Array.from(tbrGroups.values())
    .sort((a, b) => b.users.size - a.users.size)
    .forEach((g) => pushUpcoming({ ...g, listenerCount: g.users.size }));

  upcoming.sort((a, b) => getReleaseDateSortKey(a, true) - getReleaseDateSortKey(b, true));
  const finalUpcoming = upcoming.slice(0, 10);

  // 4. Overall Popular Right Now (released albums from PT chart first, excluding upcoming)
  const globalPopular = (ptList.length ? ptList : combined)
    .filter((a) => !isFutureReleaseDate(a.release_date))
    .slice(0, 10);

  cachedHomeCharts = { newPopular, upcoming: finalUpcoming, globalPopular };
  return cachedHomeCharts;
}

async function fetchCommunityPopularAlbums(limit = 10) {
  const { data, error } = await sb
    .from("user_album_interactions")
    .select("user_id, album_id, title, artist, cover_url, release_year, release_date, saved, listened, is_tbr, positive_note")
    .order("updated_at", { ascending: false })
    .limit(500);

  if (error || !data?.length) return [];

  const groups = new Map();

  for (const row of data) {
    if (!row.saved && !row.listened && !row.is_tbr) continue;
    let title = row.title;
    let artist = row.artist;
    let cover = row.cover_url;
    let year = row.release_year;

    if (!title) {
      const cat = CATALOG_ITEMS.find((c) => c.id === row.album_id);
      if (!cat) continue;
      title = cat.title;
      artist = cat.artist;
      cover = cover || coverCache[cat.id] || "";
      year = String(cat.year);
    }

    if (isSingleTitle(title)) continue;

    const key = normalizeTitleKey(title, artist);
    if (!groups.has(key)) {
      groups.set(key, {
        album_id: row.album_id,
        title,
        artist: artist || "Unknown artist",
        cover_url: cover || "",
        release_year: year || "",
        release_date: row.release_date || null,
        users: new Set(),
        score: 0
      });
    }

    const g = groups.get(key);
    if (!g.users.has(row.user_id)) {
      g.users.add(row.user_id);
      g.score += row.listened ? 2 : 1;
      if (row.positive_note?.trim()) g.score += 0.4;
    }
    if (row.album_id?.startsWith("itunes-") && !g.album_id?.startsWith("itunes-")) g.album_id = row.album_id;
    if (!g.cover_url && cover) g.cover_url = cover;
    if (!g.release_date && row.release_date) g.release_date = row.release_date;
  }

  return Array.from(groups.values())
    .sort((a, b) => b.users.size - a.users.size || b.score - a.score)
    .slice(0, limit)
    .map((g) => ({
      album_id: g.album_id,
      collectionId: g.album_id?.startsWith("itunes-") ? g.album_id.replace("itunes-", "") : null,
      title: g.title,
      artist: g.artist,
      cover_url: g.cover_url,
      release_year: g.release_year,
      release_date: g.release_date,
      listenerCount: g.users.size
    }));
}

async function renderHomeDiscoverySections(reqId) {
  ensureHomeDiscoveryContainers();

  const [charts, communityAlbums, myShelf] = await Promise.all([
    fetchHomeChartsData(),
    fetchCommunityPopularAlbums(10),
    loadUserShelf(sessionUser.id)
  ]);
  if (reqId !== stationReqId) return;
  shelfItems = myShelf;

  const renderRow = (secId, gridId, subId, list, subText, opts = {}) => {
    const sec = $(secId);
    const grid = $(gridId);
    if (!sec || !grid) return;
    grid.innerHTML = "";
    if (!list.length) {
      sec.classList.add("hidden");
      return;
    }
    if ($(subId)) $(subId).textContent = subText;
    list.forEach((alb) => {
      const existing = findEquivalentShelfItem(alb);
      grid.appendChild(
        createAlbumCard(alb, {
          mode: "discovery",
          existing,
          listenerCount: opts.showListeners ? alb.listenerCount || 0 : 0,
          showUpcomingDate: Boolean(opts.showUpcomingDate)
        })
      );
    });
    sec.classList.remove("hidden");
  };

  renderRow("popular-new-section", "popular-new-grid", "popular-new-sub", charts.newPopular, "Recent releases");
  renderRow("popular-community-section", "popular-community-grid", "popular-community-sub", communityAlbums, "Across Station shelves", { showListeners: true });
  renderRow("popular-upcoming-section", "popular-upcoming-grid", "popular-upcoming-sub", charts.upcoming, "Upcoming releases", { showUpcomingDate: true });
  renderRow("popular-global-section", "popular-global-grid", "popular-global-sub", charts.globalPopular, "Top albums");
}

// ------------------------------------------------------------
// Daily Recommendation Engine (Strictly Verified Full-Length LPs)
// ------------------------------------------------------------
function getActiveDate() {
  const d = new Date();
  // Date simulation is available only in explicit developer mode (?dev=1).
  if (new URLSearchParams(window.location.search).get("dev") === "1") {
    d.setDate(d.getDate() + devDayOffset);
  }
  return d;
}


// Private date simulation hook for development/testing only.
// Enable by opening the app with ?dev=1; never rendered in the normal UI.
if (new URLSearchParams(window.location.search).get("dev") === "1") {
  window.__stationDev = Object.freeze({
    setDayOffset(days) {
      const value = Number(days);
      if (!Number.isInteger(value) || Math.abs(value) > 3650) {
        throw new Error("setDayOffset expects an integer between -3650 and 3650.");
      }
      devDayOffset = value;
      if (sessionUser) showStationView();
      return getDateSeed(getActiveDate());
    },
    resetDay() {
      devDayOffset = 0;
      if (sessionUser) showStationView();
      return getDateSeed(getActiveDate());
    }
  });
}

function formatDisplayDate(d) {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function buildExcludedSets(profile, pastPicks, userShelf) {
  const keys = new Set();
  const titles = new Set();
  const add = (title, artist) => {
    if (!title) return;
    titles.add(title.toLowerCase().trim());
    if (artist) keys.add(normalizeTitleKey(title, artist));
  };

  (profile?.favorite_albums || []).forEach((fav) => add(fav.split("—")[0]));
  (profile?.top_five_albums || []).forEach((a) => add(a?.title, a?.artist));
  (userShelf || []).forEach((i) => i.listened && add(i.title, i.artist));
  (pastPicks || []).forEach((p) => add(p.title, p.artist));
  return { keys, titles };
}

function isExcludedCandidate(title, artist, excluded) {
  return (
    isJunkTitle(title) ||
    isEpTitle(title) ||
    excluded.titles.has((title || "").toLowerCase().trim()) ||
    excluded.keys.has(normalizeTitleKey(title, artist))
  );
}

async function verifyAndBuildPickFromItunes(itunesAlbum, reason) {
  if (!itunesAlbum?.collectionId || classifyRelease(itunesAlbum) !== "lp") return null;
  if (Number(itunesAlbum.trackCount || 0) < 5) return null;

  const [lookupRes, infoData] = await Promise.all([
    lookupItunes(itunesAlbum.collectionId, "song", 100),
    fetchLastFm("album.getInfo", { artist: itunesAlbum.artistName, album: itunesAlbum.collectionName, autocorrect: 1 })
  ]);

  const tracks = lookupRes.filter((r) => r.wrapperType === "track");
  if (!passesFullAlbumCheck(tracks)) return null;

  const totalMs = tracks.reduce((sum, t) => sum + (t.trackTimeMillis || 0), 0);
  const runtime = totalMs > 0 ? `${Math.round(totalMs / 60000)} min` : `${tracks.length} tracks`;

  const lfmInfo = infoData?.album || {};
  const lfmTags = toArray(lfmInfo.tags?.tag)
    .map((t) => t?.name)
    .filter((n) => n && n.length < 28 && !/^\d{4}$/.test(n))
    .slice(0, 4);

  const genre = itunesAlbum.primaryGenreName || lfmTags[0] || "Album";
  const finalTags = lfmTags.length > 0 ? lfmTags : [genre];
  const synopsis = cleanLastFmWiki(lfmInfo.wiki?.summary || lfmInfo.wiki?.content || "");
  const cleanReason = fixReasonCapitalization(reason);

  return {
    album_id: `itunes-${itunesAlbum.collectionId}`,
    title: itunesAlbum.collectionName,
    artist: itunesAlbum.artistName,
    cover_url: toHighResCover(itunesAlbum.artworkUrl100),
    release_year: itunesAlbum.releaseDate ? itunesAlbum.releaseDate.slice(0, 4) : "—",
    release_date: itunesAlbum.releaseDate || null,
    runtime,
    label: cleanCopyrightToLabel(itunesAlbum.copyright),
    genre,
    tags: finalTags,
    synopsis:
      synopsis ||
      `Selected for your station ${lowercaseFirst(cleanReason)}. Open full details to preview tracks and leave your impression.`,
    aesthetic: pickAestheticForTags(finalTags),
    reason: cleanReason,
    itunes_collection_id: String(itunesAlbum.collectionId),
    itunes_artist_id: itunesAlbum.artistId ? String(itunesAlbum.artistId) : null
  };
}

async function fetchArtistItunesLps(artistName, excluded) {
  const matches = await queryItunes(artistName, "musicArtist", 4);
  const best = matches.find((a) => a.artistName?.toLowerCase() === artistName.toLowerCase()) || matches[0];
  if (!best?.artistId) return [];

  const releases = await lookupItunes(best.artistId, "album", 60);
  const seen = new Set();
  return releases.filter((r) => {
    if (r.wrapperType !== "collection" || !r.collectionName) return false;
    if (classifyRelease(r) !== "lp" || Number(r.trackCount || 0) < 5) return false;
    if (isFutureReleaseDate(r.releaseDate)) return false;
    if (isExcludedCandidate(r.collectionName, r.artistName || artistName, excluded)) return false;
    const key = r.collectionName.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function generateDynamicDailyPick(profile, dateSeed, excluded) {
  const favArtists = profile?.favorite_artists || [];
  const tastes = profile?.tastes || [];
  const dayHash = hashString(`${profile.user_id}|${dateSeed}`);

  async function tryBySimilarArtist() {
    if (!favArtists.length) return null;
    const seedRaw = favArtists[dayHash % favArtists.length];
    const simData = await fetchLastFm("artist.getSimilar", { artist: seedRaw, limit: 20, autocorrect: 1 });
    const seedDisplay = formatDisplayNameCase(simData?.similarartists?.["@attr"]?.artist || seedRaw);

    const similar = toArray(simData?.similarartists?.artist).filter(
      (a) => a?.name && !favArtists.some((f) => f.toLowerCase() === a.name.toLowerCase())
    );

    for (let i = 0; i < Math.min(5, similar.length); i++) {
      const targetArtist = similar[(dayHash + i * 3) % similar.length].name;
      const lps = await fetchArtistItunesLps(targetArtist, excluded);
      if (!lps.length) continue;

      const chosenLp = lps[(dayHash + i) % lps.length];
      const verified = await verifyAndBuildPickFromItunes(chosenLp, `Because you listen to ${seedDisplay}`);
      if (verified) return verified;
    }
    return null;
  }

  async function tryByTasteTag() {
    const taste = tastes.length ? tastes[dayHash % tastes.length] : "Indie";
    const mapped = TASTE_TO_LASTFM_TAGS[taste] || [taste.toLowerCase()];
    const tag = mapped[dayHash % mapped.length];
    const tagData = await fetchLastFm("tag.getTopAlbums", { tag, limit: 40, page: (dayHash % 3) + 1 });

    const rawCandidates = toArray(tagData?.albums?.album).filter(
      (alb) => alb?.name && alb?.artist?.name && !isExcludedCandidate(alb.name, alb.artist.name, excluded)
    );

    for (let i = 0; i < Math.min(8, rawCandidates.length); i++) {
      const cand = rawCandidates[(dayHash + i * 5) % rawCandidates.length];
      const itunesRes = await queryItunes(`${cand.artist.name} ${cand.name}`, "album", 6);
      const titleNeedle = cand.name.toLowerCase().slice(0, 10);
      const artistNeedle = cand.artist.name.toLowerCase().slice(0, 8);

      const lpMatch = itunesRes.find((r) => {
        if (classifyRelease(r) !== "lp" || Number(r.trackCount || 0) < 5) return false;
        if (isFutureReleaseDate(r.releaseDate)) return false;
        const sameTitle = r.collectionName?.toLowerCase().includes(titleNeedle);
        const sameArtist = r.artistName?.toLowerCase().includes(artistNeedle);
        return sameTitle && sameArtist;
      });

      if (!lpMatch) continue;
      const verified = await verifyAndBuildPickFromItunes(lpMatch, `From your ${taste} tastes`);
      if (verified) return verified;
    }
    return null;
  }

  if (favArtists.length > 0 && dayHash % 5 !== 0) {
    return (await tryBySimilarArtist()) || (await tryByTasteTag());
  }
  return (await tryByTasteTag()) || (await tryBySimilarArtist());
}

function getFallbackCatalogRecommendation(profile, date, excluded) {
  const all = CATALOG_ITEMS.filter((i) => i.mediaType === "album");
  const eligible = all.filter((a) => !isExcludedCandidate(a.title, a.artist, excluded));
  if (!eligible.length) return null;

  const matched = eligible.filter((a) =>
    a.tags.some((t) => (profile?.tastes || []).includes(t))
  );
  const pool = matched.length ? matched : eligible;
  const pick = pool[hashString(`${profile.user_id}|${getDateSeed(date)}`) % pool.length];
  return { ...pick, reason: `Curated for ${profile.display_name}` };
}

// ------------------------------------------------------------
// Supabase Data Layer (Profiles, Picks, Shelf, Lists & Follows)
// ------------------------------------------------------------
async function loadUserProfile(userId) {
  const { data } = await sb.from("user_profiles").select("*").eq("user_id", userId).maybeSingle();
  return data || null;
}

async function upsertUserProfile(payload) {
  const { data, error } = await sb
    .from("user_profiles")
    .upsert({ ...payload, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function saveProfilePatch(patch) {
  userProfile = await upsertUserProfile({
    user_id: sessionUser.id,
    display_name: userProfile?.display_name || "",
    bio: userProfile?.bio || "",
    avatar_url: userProfile?.avatar_url || "",
    tastes: userProfile?.tastes || [],
    favorite_artists: userProfile?.favorite_artists || [],
    favorite_albums: userProfile?.favorite_albums || [],
    top_five_albums: userProfile?.top_five_albums || [],
    ...patch
  });
  return userProfile;
}

async function loadDailyPick(userId, pickDate) {
  const { data } = await sb.from("daily_picks").select("*").eq("user_id", userId).eq("pick_date", pickDate).maybeSingle();
  return data || null;
}

async function loadPastDailyPicks(userId, excludeDate = null) {
  let query = sb.from("daily_picks").select("title, artist")
    .eq("user_id", userId)
    .order("pick_date", { ascending: false })
    .limit(90);
  if (excludeDate) query = query.neq("pick_date", excludeDate);
  const { data } = await query;
  return data || [];
}

async function saveDailyPick(userId, pickDate, pick) {
  const dbRow = {
    user_id: userId,
    pick_date: pickDate,
    album_id: pick.album_id,
    title: pick.title,
    artist: pick.artist,
    cover_url: pick.cover_url || "",
    release_year: pick.release_year || "",
    runtime: pick.runtime || "",
    label: pick.label || "",
    genre: pick.genre || "",
    tags: pick.tags || [],
    synopsis: pick.synopsis || "",
    aesthetic: pick.aesthetic || "editorial",
    reason: pick.reason || "",
    itunes_collection_id: pick.itunes_collection_id || null,
    itunes_artist_id: pick.itunes_artist_id || null
  };
  const { data } = await sb
    .from("daily_picks")
    .upsert(dbRow, { onConflict: "user_id,pick_date" })
    .select()
    .single();
  return { ...(data || dbRow), release_date: pick.release_date || null };
}

async function loadInteraction(userId, albumId) {
  const { data } = await sb.from("user_album_interactions").select("*").eq("user_id", userId).eq("album_id", albumId).maybeSingle();
  if (data) return data;
  const candidate = shelfItems.find((item) => item.album_id === albumId);
  if (!candidate) return emptyInteraction();
  return shelfItems.find((item) => item.album_id !== albumId && sameAlbumIdentity(item, candidate)) || emptyInteraction();
}

async function loadCommunityNotes(albumId) {
  const { data } = await sb.from("user_album_interactions").select("user_id, positive_note, reaction").eq("album_id", albumId);
  const nonEmpty = (data || []).filter((r) => r.positive_note?.trim() || r.reaction);
  if (!nonEmpty.length) return [];

  const { data: profiles } = await sb.from("user_profiles").select("user_id, display_name").in("user_id", [...new Set(nonEmpty.map((r) => r.user_id))]);
  const names = Object.fromEntries((profiles || []).map((p) => [p.user_id, p.display_name]));

  return nonEmpty.map((r) => ({
    author: names[r.user_id] || "Listener",
    source: r.user_id === sessionUser?.id ? "Your Note" : "Station Listener",
    text: r.positive_note?.trim() || "",
    reaction: r.reaction || null
  }));
}

async function upsertAlbumOnShelf(albumData) {
  if (!sessionUser) throw new Error("You must be signed in to update your Shelf.");

  const { data: currentRows, error: readError } = await sb
    .from("user_album_interactions").select("*").eq("user_id", sessionUser.id);
  if (readError) throw readError;

  const rows = currentRows || [];
  const exact = rows.find((row) => row.album_id === albumData.album_id);
  const relatedRows = rows.filter((row) => sameAlbumIdentity(row, albumData));
  const equivalent = exact || relatedRows[0] || null;
  const targetId = equivalent?.album_id || albumData.album_id;
  const bestMetadataRow = relatedRows.find((row) => row.release_date || row.release_year || row.cover_url) || equivalent;
  const releaseDate = albumData.release_date || bestMetadataRow?.release_date || null;
  const releaseYear = albumData.release_year || bestMetadataRow?.release_year || (releaseDate ? releaseDate.slice(0, 4) : "");
  const isFuture = isFutureReleaseDate(releaseDate, releaseYear);
  const autoTbr = !albumData.listened && (Boolean(albumData.is_tbr) || (Boolean(albumData.saved) && isFuture));
  let pop = Number(albumData.popularity || equivalent?.popularity || 0);
  if (!pop && albumData.artist && albumData.title && !autoTbr) pop = await fetchAlbumPopularity(albumData.artist, albumData.title);

  const payload = {
    user_id: sessionUser.id,
    album_id: targetId,
    title: equivalent?.title || albumData.title || null,
    artist: albumData.artist || equivalent?.artist || null,
    cover_url: albumData.cover_url || bestMetadataRow?.cover_url || equivalent?.cover_url || null,
    release_year: releaseYear ? String(releaseYear) : null,
    release_date: releaseDate,
    is_tbr: autoTbr,
    popularity: pop,
    saved: Boolean(albumData.saved) || autoTbr,
    listened: Boolean(albumData.listened),
    positive_note: albumData.positive_note ?? relatedRows.find((row) => row.positive_note?.trim())?.positive_note ?? equivalent?.positive_note ?? null,
    reaction: albumData.reaction ?? relatedRows.find((row) => row.reaction)?.reaction ?? equivalent?.reaction ?? null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await sb.from("user_album_interactions")
    .upsert(payload, { onConflict: "user_id,album_id" }).select().single();
  if (error) throw error;

  const duplicates = relatedRows.filter((row) => row.album_id !== targetId);
  if (duplicates.length) {
    const ids = duplicates.map((row) => row.album_id);
    const { error: deleteError } = await sb.from("user_album_interactions").delete()
      .eq("user_id", sessionUser.id).in("album_id", ids);
    if (deleteError) console.warn("Could not consolidate older duplicate Shelf entries:", deleteError);
    shelfItems = shelfItems.filter((row) => !ids.includes(row.album_id));
  }

  syncShelfCache(data);
  return data;
}

async function deleteAlbumFromShelf(albumId) {
  const selected = shelfItems.find((item) => item.album_id === albumId);
  const equivalent = selected ? findEquivalentShelfItem(selected) : null;
  const ids = [...new Set([albumId, equivalent?.album_id].filter(Boolean))];
  const { error } = await sb.from("user_album_interactions").delete()
    .eq("user_id", sessionUser.id).in("album_id", ids);
  if (error) throw error;
  ids.forEach((id) => syncShelfCache(null, id));
}

async function loadUserShelf(userId) {
  const { data } = await sb.from("user_album_interactions").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
  return (data || []).map((row) => {
    if (row.title) return row;
    const cat = CATALOG_ITEMS.find((c) => c.id === row.album_id);
    return cat ? { ...row, title: cat.title, artist: cat.artist, release_year: String(cat.year), cover_url: row.cover_url || coverCache[cat.id] || "" } : row;
  });
}

async function loadUserLists(userId) {
  const { data, error } = await sb
    .from("user_lists")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) return [];
  return data || [];
}

async function createUserList({ title, description = "", list_type = "custom", list_year = null, albums = [] }) {
  const { data, error } = await sb
    .from("user_lists")
    .insert({
      user_id: sessionUser.id,
      title: title.trim(),
      description: description.trim(),
      list_type,
      list_year,
      albums,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  if (error) throw error;
  userLists = [data, ...userLists.filter((l) => l.id !== data.id)];
  return data;
}

async function updateListAlbums(listId, albums) {
  const { data, error } = await sb
    .from("user_lists")
    .update({ albums, updated_at: new Date().toISOString() })
    .eq("id", listId)
    .eq("user_id", sessionUser.id)
    .select()
    .single();
  if (error) throw error;
  userLists = userLists.map((l) => (l.id === listId ? data : l));
  if (activeDetailList?.id === listId) activeDetailList = data;
  return data;
}

async function deleteUserList(listId) {
  const { error } = await sb.from("user_lists").delete().eq("id", listId).eq("user_id", sessionUser.id);
  if (error) throw error;
  userLists = userLists.filter((l) => l.id !== listId);
}

async function ensureAnnualList(year = CURRENT_YEAR) {
  const existing = userLists.find((l) => l.list_type === "annual" && Number(l.list_year) === Number(year));
  if (existing) return existing;
  return createUserList({
    title: `Top ${year}`,
    description: `My 10 favorite albums of ${year}.`,
    list_type: "annual",
    list_year: year,
    albums: []
  });
}

async function loadFollowSummary(targetUserId) {
  try {
    const [followersRes, followingRes, relationRes] = await Promise.all([
      sb.from("user_follows").select("follower_id", { count: "exact", head: true }).eq("following_id", targetUserId),
      sb.from("user_follows").select("following_id", { count: "exact", head: true }).eq("follower_id", targetUserId),
      sessionUser && sessionUser.id !== targetUserId
        ? sb.from("user_follows").select("follower_id").eq("follower_id", sessionUser.id).eq("following_id", targetUserId).maybeSingle()
        : Promise.resolve({ data: null })
    ]);
    if (followersRes.error || followingRes.error || relationRes?.error) {
      return { followers: 0, following: 0, isFollowing: false, available: false };
    }
    return {
      followers: followersRes.count || 0,
      following: followingRes.count || 0,
      isFollowing: Boolean(relationRes?.data),
      available: true
    };
  } catch {
    return { followers: 0, following: 0, isFollowing: false, available: false };
  }
}

async function loadFollowingCount(force = false) {
  if (!sessionUser) return 0;
  if (followingCountCache !== null && !force) return followingCountCache;

  const { count, error } = await sb
    .from("user_follows")
    .select("following_id", { count: "exact", head: true })
    .eq("follower_id", sessionUser.id);
  if (error) throw error;
  followingCountCache = count || 0;
  return followingCountCache;
}

async function loadFollowProfiles(targetUserId, relation = "followers") {
  const isFollowers = relation === "followers";
  const idColumn = isFollowers ? "follower_id" : "following_id";
  const filterColumn = isFollowers ? "following_id" : "follower_id";
  const { data: edges, error: edgesError } = await sb
    .from("user_follows")
    .select(idColumn)
    .eq(filterColumn, targetUserId);

  if (edgesError) throw edgesError;
  const ids = [...new Set((edges || []).map((edge) => edge[idColumn]).filter(Boolean))];
  if (!ids.length) return [];

  const { data: profiles, error: profilesError } = await sb
    .from("user_profiles")
    .select("user_id, display_name, bio, avatar_url, tastes, favorite_artists, top_five_albums")
    .in("user_id", ids);
  if (profilesError) throw profilesError;

  const byId = new Map((profiles || []).map((profile) => [profile.user_id, profile]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}

async function toggleFollowUser(targetUserId, currentlyFollowing) {
  if (!sessionUser || sessionUser.id === targetUserId) return currentlyFollowing;
  if (currentlyFollowing) {
    const { error } = await sb
      .from("user_follows")
      .delete()
      .eq("follower_id", sessionUser.id)
      .eq("following_id", targetUserId);
    if (error) throw error;
    if (followingCountCache !== null) followingCountCache = Math.max(0, followingCountCache - 1);
    updateFollowingCountBadge();
    return false;
  }
  const { error } = await sb
    .from("user_follows")
    .insert({ follower_id: sessionUser.id, following_id: targetUserId });
  if (error) throw error;
  if (followingCountCache !== null) followingCountCache += 1;
  updateFollowingCountBadge();
  return true;
}

function updateFollowingCountBadge() {
  const badge = $("listeners-count-following");
  if (badge && followingCountCache !== null) badge.textContent = String(followingCountCache);
}

async function searchListeners(query = "") {
  let req = sb
    .from("user_profiles")
    .select("user_id, display_name, bio, avatar_url, tastes, favorite_artists, top_five_albums")
    .order("updated_at", { ascending: false })
    .limit(24);
  if (query.trim()) req = req.ilike("display_name", `%${query.trim()}%`);
  const { data } = await req;
  return data || [];
}

// ------------------------------------------------------------
// Shared UI Builders (Notes, Album Cards, Artist Pills, List Cards)
// ------------------------------------------------------------
function reactionSymbol(value) {
  return ({
    disliked: `<svg viewBox="0 0 48 48" class="reaction-icon" aria-hidden="true"><circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="17" cy="19" r="2.2" fill="currentColor"/><circle cx="31" cy="19" r="2.2" fill="currentColor"/><path d="M15 33 Q24 25 33 33" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`,
    mixed: `<svg viewBox="0 0 48 48" class="reaction-icon" aria-hidden="true"><circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="17" cy="19" r="2.2" fill="currentColor"/><circle cx="31" cy="19" r="2.2" fill="currentColor"/><path d="M16 31 H32" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`,
    loved: `<svg viewBox="0 0 48 48" class="reaction-icon" aria-hidden="true"><circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="17" cy="19" r="2.2" fill="currentColor"/><circle cx="31" cy="19" r="2.2" fill="currentColor"/><path d="M15 28 Q24 37 33 28" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`
  })[value] || "";
}

function syncReactionChoices(containerId, value) {
  const container = $(containerId);
  if (!container) return;
  container.querySelectorAll("[data-reaction]").forEach((btn) => {
    const selected = btn.dataset.reaction === (value || "");
    btn.classList.toggle("selected", selected);
    btn.setAttribute("aria-pressed", selected ? "true" : "false");
  });
}

function renderNotes(listEl, countEl, curated = [], community = []) {
  const combined = [...(curated || []), ...(community || [])];
  listEl.innerHTML = "";
  countEl.textContent = `${combined.length} ${combined.length === 1 ? "note" : "notes"}`;

  if (!combined.length) {
    listEl.innerHTML = `<p class="meta-label">No listener notes yet—leave the first impression below.</p>`;
    return;
  }

  combined.forEach((rev) => {
    const card = document.createElement("blockquote");
    card.className = "review-card";
    const moodLabel = ({ loved: "Loved it", mixed: "It was okay", disliked: "Didn't connect" })[rev.reaction] || "";
    card.innerHTML = `
      ${moodLabel ? `<div class="listener-reaction-display" aria-label="${escapeHtml(moodLabel)}">${reactionSymbol(rev.reaction)}</div>` : ""}
      ${rev.text ? `<p class="review-quote">“${escapeHtml(rev.text)}”</p>` : ""}
      <footer class="review-author">— ${escapeHtml(rev.author)} (${escapeHtml(rev.source)})</footer>
    `;
    listEl.appendChild(card);
  });
}

function createArtistPill(artistObj) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "artist-pill-btn";

  const avatar = document.createElement("div");
  avatar.className = "avatar-circle artist-pill-avatar";
  renderAvatar(avatar, "", artistObj.name);

  const meta = document.createElement("span");
  meta.className = "artist-pill-meta";
  meta.innerHTML = `
    <span class="artist-pill-name">${escapeHtml(artistObj.name)}</span>
    <span class="artist-pill-genre">${escapeHtml(artistObj.genre || "Artist")}</span>
  `;

  btn.append(avatar, meta);
  btn.addEventListener("click", () => openArtistDetail(artistObj));

  fetchArtistPhoto(artistObj.name).then((photoUrl) => {
    if (photoUrl) renderAvatar(avatar, photoUrl, artistObj.name);
  });

  return btn;
}

function createAlbumCard(
  item,
  { mode = "artist", existing = null, listenerCount = 0, showUpcomingDate = false, onShelfChanged = null } = {}
) {
  const isTbr = isItemTbr(item);
  const isFuture = isFutureReleaseDate(item.release_date, item.release_year);
  const hasQuickActions = mode === "search" || mode === "artist" || mode === "discovery" || mode === "public";
  const isShelfMode = mode === "shelf";
  const noteText = item.positive_note ? escapeHtml(item.positive_note) : "";
  const payload = {
    album_id: item.album_id,
    collectionId: item.collectionId || (item.album_id?.startsWith("itunes-") ? item.album_id.replace("itunes-", "") : null),
    artistId: item.artistId || null,
    title: item.title || item.album_id,
    artist: item.artist || "Unknown artist",
    cover_url: item.cover_url || "",
    release_year: item.release_year || (item.release_date ? String(item.release_date).slice(0, 4) : ""),
    release_date: item.release_date || null,
    genre: item.genre || "",
    label: item.label || ""
  };

  const displayYear = payload.release_year;

  const subtitleHtml =
    mode === "artist"
      ? `<span class="meta-label">${escapeHtml(displayYear || "Release")}${item.trackCount ? ` · ${item.trackCount} tracks` : ""}</span>`
      : `<button class="shelf-card-artist js-open-artist" type="button">${escapeHtml(payload.artist)}${displayYear && !isTbr && !showUpcomingDate ? ` · ${escapeHtml(displayYear)}` : ""}</button>`;

  const tbrTagHtml =
    ((mode === "shelf" || mode === "public") && isTbr) || showUpcomingDate
      ? `<span class="tbr-date-tag">${showUpcomingDate ? "Out" : "TBR"} · ${escapeHtml(formatShortReleaseDate(item.release_date))}</span>`
      : "";

  const listenerTagHtml =
    listenerCount > 0
      ? `<span class="listener-count-tag">${listenerCount} ${listenerCount === 1 ? "listener" : "listeners"}</span>`
      : "";

  const noteHtml = (mode === "shelf" || mode === "public") && noteText ? `<p class="shelf-card-note">“${noteText}”</p>` : "";

  let coverOverlayHtml = "";
  if (hasQuickActions) {
    coverOverlayHtml = `
      <div class="cover-hover-actions">
        <button class="cover-action-btn js-want" type="button"></button>
        <button class="cover-action-btn js-listened" type="button"></button>
      </div>`;
  } else if (isShelfMode) {
    const switchTitle = item.listened ? "Move to Want" : "Mark as listened";
    const switchIcon = item.listened ? ICON_BOOKMARK_SVG : ICON_CHECK_SVG;
    const tbrTitle = isTbr ? "Move to Want" : "Move to TBR";
    const noteTitle = noteText ? "Edit note" : "Add note";

    coverOverlayHtml = `
      <div class="cover-hover-actions">
        <button class="cover-action-btn js-switch-shelf" type="button" title="${switchTitle}" aria-label="${switchTitle}">${switchIcon}</button>
        ${!item.listened ? `<button class="cover-action-btn js-toggle-tbr${isTbr ? " active" : ""}" type="button" title="${tbrTitle}" aria-label="${tbrTitle}">${ICON_CLOCK_SVG}</button>` : ""}
        <button class="cover-action-btn js-edit-note${noteText ? " active" : ""}" type="button" title="${noteTitle}" aria-label="${noteTitle}">${ICON_NOTE_SVG}</button>
        <button class="cover-action-btn js-remove-shelf" type="button" title="Remove from shelf" aria-label="Remove from shelf">${ICON_TRASH_SVG}</button>
      </div>`;
  }

  const noteEditorHtml = isShelfMode
    ? `<div class="shelf-note-editor hidden">
         <textarea rows="2" placeholder="Write your note (no scores)...">${noteText}</textarea>
         <div class="note-actions">
           <button class="text-btn js-save-note" type="button">Save</button>
           <button class="text-btn js-cancel-note" type="button">Cancel</button>
         </div>
       </div>`
    : "";

  const card = document.createElement("article");
  card.className = "shelf-card";
  card.innerHTML = `
    <div class="shelf-cover-wrap">
      <button class="shelf-cover js-open-album" type="button" aria-label="Open ${escapeHtml(payload.title)}">
        ${payload.cover_url ? `<img src="${escapeHtml(payload.cover_url)}" alt="${escapeHtml(payload.title)}" loading="lazy" />` : VINYL_PLACEHOLDER_SVG}
      </button>
      ${coverOverlayHtml}
    </div>
    <div class="shelf-card-meta">
      <button class="shelf-card-title js-open-album" type="button">${escapeHtml(payload.title)}</button>
      ${subtitleHtml}
      ${tbrTagHtml}
      ${listenerTagHtml}
    </div>
    ${noteHtml}
    ${noteEditorHtml}
  `;

  card.querySelectorAll(".js-open-album").forEach((el) => el.addEventListener("click", () => openAlbumDetail(payload)));
  card.querySelector(".js-open-artist")?.addEventListener("click", () => openArtistDetail({ artistId: payload.artistId, name: payload.artist }));

  if (isShelfMode) {
    card.querySelector(".js-switch-shelf").addEventListener("click", async (e) => {
      e.stopPropagation();
      const nextListened = !item.listened;
      await upsertAlbumOnShelf({ ...item, listened: nextListened, saved: !nextListened, is_tbr: false });
      onShelfChanged?.();
    });
    card.querySelector(".js-toggle-tbr")?.addEventListener("click", async (e) => {
      e.stopPropagation();
      const nextTbr = !isTbr;
      await upsertAlbumOnShelf({
        ...item,
        saved: true,
        listened: false,
        is_tbr: nextTbr,
        release_date: nextTbr ? item.release_date : null
      });
      onShelfChanged?.();
    });
    card.querySelector(".js-remove-shelf").addEventListener("click", async (e) => {
      e.stopPropagation();
      await deleteAlbumFromShelf(item.album_id);
      onShelfChanged?.(item.album_id);
    });
    const editor = card.querySelector(".shelf-note-editor");
    const ta = editor.querySelector("textarea");
    card.querySelector(".js-edit-note").addEventListener("click", (e) => {
      e.stopPropagation();
      editor.classList.toggle("hidden");
      if (!editor.classList.contains("hidden")) ta.focus();
    });
    card.querySelector(".js-cancel-note").addEventListener("click", () => editor.classList.add("hidden"));
    card.querySelector(".js-save-note").addEventListener("click", async () => {
      await upsertAlbumOnShelf({ ...item, positive_note: ta.value.trim() || null });
      onShelfChanged?.();
    });
  } else if (hasQuickActions) {
    let cardState = existing ? { ...existing } : null;
    const wantEl = card.querySelector(".js-want");
    const listenedEl = card.querySelector(".js-listened");

    const syncButtons = () => {
      const onTbr = Boolean(cardState && isItemTbr(cardState));
      const onWant = Boolean(cardState?.saved && !cardState?.listened && !onTbr);
      const onListened = Boolean(cardState?.listened);

      const wantTitle = onTbr
        ? "On TBR (click to remove)"
        : onWant
        ? "On Want to listen (click to remove)"
        : isFuture
        ? "Add to TBR"
        : "Want to listen";
      wantEl.classList.toggle("active", onWant || onTbr);
      wantEl.innerHTML = isFuture || onTbr ? ICON_CLOCK_SVG : ICON_BOOKMARK_SVG;
      wantEl.title = wantTitle;
      wantEl.setAttribute("aria-label", wantTitle);

      const listenedTitle = onListened ? "Listened (click to remove)" : "Mark as listened";
      listenedEl.classList.toggle("active", onListened);
      listenedEl.innerHTML = ICON_CHECK_SVG;
      listenedEl.title = listenedTitle;
      listenedEl.setAttribute("aria-label", listenedTitle);
    };

    syncButtons();

    wantEl.addEventListener("click", async (e) => {
      e.stopPropagation();
      const currentlyWantOrTbr = Boolean(cardState && !cardState.listened && (cardState.saved || isItemTbr(cardState)));
      if (currentlyWantOrTbr) {
        if (cardState.positive_note) {
          cardState = await upsertAlbumOnShelf({ ...payload, positive_note: cardState.positive_note, saved: false, listened: false, is_tbr: false });
        } else {
          await deleteAlbumFromShelf(payload.album_id);
          cardState = null;
        }
      } else {
        cardState = await upsertAlbumOnShelf({
          ...payload,
          positive_note: cardState?.positive_note || null,
          saved: true,
          listened: false,
          is_tbr: isFuture
        });
      }
      syncButtons();
    });

    listenedEl.addEventListener("click", async (e) => {
      e.stopPropagation();
      const currentlyListened = Boolean(cardState?.listened);
      if (currentlyListened) {
        if (cardState.positive_note) {
          cardState = await upsertAlbumOnShelf({ ...payload, positive_note: cardState.positive_note, saved: false, listened: false, is_tbr: false });
        } else {
          await deleteAlbumFromShelf(payload.album_id);
          cardState = null;
        }
      } else {
        cardState = await upsertAlbumOnShelf({
          ...payload,
          positive_note: cardState?.positive_note || null,
          saved: false,
          listened: true,
          is_tbr: false
        });
      }
      syncButtons();
    });
  }

  return card;
}

function createListCard(list, ownerProfile = null) {
  const albums = Array.isArray(list.albums) ? list.albums : [];
  const isAnnual = list.list_type === "annual";
  const countLabel = isAnnual ? `${albums.length} / 10 albums` : `${albums.length} ${albums.length === 1 ? "album" : "albums"}`;

  let cellsHtml = "";
  for (let i = 0; i < 4; i++) {
    const cov = albums[i]?.cover_url;
    cellsHtml += `<div class="list-collage-cell">${cov ? `<img src="${escapeHtml(cov)}" alt="" loading="lazy" />` : VINYL_PLACEHOLDER_SVG}</div>`;
  }

  const card = document.createElement("button");
  card.type = "button";
  card.className = `list-card${isAnnual ? " is-annual" : ""}`;
  card.innerHTML = `
    <div class="list-collage">${cellsHtml}</div>
    <div class="list-card-head">
      ${isAnnual ? ANNUAL_ICON_SVG : ""}
      <span class="list-card-title">${escapeHtml(list.title)}</span>
    </div>
    ${list.description ? `<span class="list-card-desc">${escapeHtml(list.description)}</span>` : ""}
    <span class="meta-label">${countLabel}</span>
  `;
  card.addEventListener("click", () => openListDetail(list.id, ownerProfile));
  return card;
}

function createListenerCard(profile) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "listener-card";

  const avatarEl = document.createElement("div");
  avatarEl.className = "avatar-circle avatar-md";
  renderAvatar(avatarEl, profile.avatar_url, profile.display_name);

  const tastesSummary = (profile.tastes || []).slice(0, 3).join(" · ");
  const infoEl = document.createElement("div");
  infoEl.className = "listener-card-info";
  infoEl.innerHTML = `
    <span class="listener-card-name">${escapeHtml(profile.display_name)}${profile.user_id === sessionUser?.id ? " (You)" : ""}</span>
    ${profile.bio ? `<span class="listener-card-bio">${escapeHtml(profile.bio)}</span>` : ""}
    ${tastesSummary ? `<span class="listener-card-tastes">${escapeHtml(tastesSummary)}</span>` : ""}
  `;

  card.append(avatarEl, infoEl);
  card.addEventListener("click", () => {
    if (currentView !== "listeners") {
      pushRoute();
      setActiveNav("listeners");
    }
    openPublicProfile(profile, false, false);
  });
  return card;
}

// ------------------------------------------------------------
// Genre Tags & Genre Detail Page
// ------------------------------------------------------------
const GENRE_TAG_ALIASES = {
  "hip-hop/rap": "hip-hop",
  "r&b/soul": "rnb",
  "alternative": "alternative rock",
  "singer/songwriter": "singer-songwriter",
  "k-pop": "k-pop",
  "j-pop": "j-pop",
  "worldwide": "world"
};

const IGNORED_GENRE_TAGS = new Set([
  "seen live", "favorites", "favourite", "favorite", "albums i own",
  "my top albums", "under 2000 listeners", "spotify", "vinyl", "cd",
  "female vocalists", "male vocalists", "single", "ep", "albums",
  "best of", "awesome", "love", "check out", "to listen"
]);

function normalizeGenreForLastFm(genreName) {
  const clean = (genreName || "").trim();
  if (!clean) return "";
  if (TASTE_TO_LASTFM_TAGS[clean]?.length) return TASTE_TO_LASTFM_TAGS[clean][0];
  const lower = clean.toLowerCase();
  if (GENRE_TAG_ALIASES[lower]) return GENRE_TAG_ALIASES[lower];
  return lower.split("/")[0].trim();
}

const CANONICAL_GENRE_RULES = [
  [/\b(dream pop|shoegaze|noise pop|jangle pop|twee pop)\b/i, "Dream Pop / Shoegaze"],
  [/\b(indie rock|alternative rock|alt rock|college rock|garage rock|post[- ]rock|math rock|britpop)\b/i, "Alternative Rock"],
  [/\b(indie pop|alternative pop|bedroom pop|chamber pop|art pop|synth pop|synthpop)\b/i, "Indie Pop"],
  [/\b(post[- ]punk|new wave|darkwave|coldwave)\b/i, "Post-Punk / New Wave"],
  [/\b(punk rock|hardcore punk|pop punk|emo|emocore)\b/i, "Punk / Emo"],
  [/\b(heavy metal|black metal|death metal|doom metal|thrash metal|metalcore|nu metal|alternative metal)\b/i, "Metal"],
  [/\b(electronic|electronica|idm|glitch|downtempo|trip hop|breakbeat)\b/i, "Electronic"],
  [/\b(house|deep house|tech house|progressive house|disco house)\b/i, "House"],
  [/\b(techno|minimal techno|detroit techno|acid techno)\b/i, "Techno"],
  [/\b(ambient|dark ambient|drone|new age)\b/i, "Ambient"],
  [/\b(hip hop|hip-hop|rap|trap|boom bap|cloud rap)\b/i, "Hip-Hop"],
  [/\b(r&b|soul|neo soul|contemporary r&b)\b/i, "R&B / Soul"],
  [/\b(jazz|bebop|free jazz|jazz fusion|smooth jazz)\b/i, "Jazz"],
  [/\b(folk|indie folk|freak folk|singer[- ]songwriter|americana)\b/i, "Folk"],
  [/\b(country|bluegrass|alt-country)\b/i, "Country"],
  [/\b(classical|baroque|romantic music|orchestral|opera)\b/i, "Classical"],
  [/\b(reggae|dub|ska|dancehall)\b/i, "Reggae / Dub"],
  [/\b(bossa nova|mpb|samba|tropicalia|forró)\b/i, "Brazilian"],
  [/\b(pop rock|power pop|soft rock|classic rock|rock)\b/i, "Rock"],
  [/\b(pop|dance pop|electropop)\b/i, "Pop"]
];

function canonicalizeGenre(raw) {
  const value = String(raw || "").trim().toLowerCase();
  if (!value) return "";
  for (const [pattern, label] of CANONICAL_GENRE_RULES) {
    if (pattern.test(value)) return label;
  }
  const cleaned = value.replace(/\b(music|genre|style)\b/g, "").replace(/\s+/g, " ").trim();
  if (!cleaned || cleaned.length > 20 || cleaned.split(/\s+/).length > 3) return "";
  return formatDisplayNameCase(cleaned);
}

function extractCleanGenreTags(rawTags = [], primaryGenre = "", artistName = "") {
  const artistLower = (artistName || "").toLowerCase().trim();
  const seen = new Set();
  const out = [];

  const pushTag = (raw) => {
    if (!raw) return;
    const trimmed = String(raw).trim();
    const lower = trimmed.toLowerCase();
    if (!trimmed || trimmed.length < 2 || trimmed.length > 40) return;
    if (/^\d{4}s?$/.test(lower) || IGNORED_GENRE_TAGS.has(lower)) return;
    if (artistLower && lower === artistLower) return;
    const canonical = canonicalizeGenre(trimmed);
    if (!canonical) return;
    const key = canonical.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(canonical);
  };

  if (primaryGenre && primaryGenre !== "—" && primaryGenre.toLowerCase() !== "music") {
    primaryGenre.split(/[;,/]/).forEach(pushTag);
  }
  toArray(rawTags).forEach(pushTag);
  return out.slice(0, 3);
}

function renderClickableGenrePills(container, genres = []) {
  if (!container) return;
  container.innerHTML = "";
  const clean = [...new Set(toArray(genres).map((g) => String(g || "").trim()).filter(Boolean))];
  clean.forEach((genre) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tag-pill-btn";
    btn.textContent = genre;
    btn.addEventListener("click", () => openGenreDetail(genre));
    container.appendChild(btn);
  });
}

function renderGenreAlbumsGrid() {
  const grid = $("genre-albums-grid");
  if (!grid) return;
  grid.innerHTML = "";
  const sorted = sortAlbumsList(activeGenreAlbums, activeGenreSort);
  $("genre-detail-count").textContent = sorted.length
    ? `${sorted.length} ${sorted.length === 1 ? "album" : "albums"}`
    : "";
  $("genre-detail-empty").classList.toggle("hidden", sorted.length > 0);

  sorted.forEach((alb) => {
    const existing = findEquivalentShelfItem(alb);
    grid.appendChild(createAlbumCard(alb, { mode: "discovery", existing }));
  });
}

async function openGenreDetail(genreName, push = true) {
  if (!sessionUser) return showAuthView("signin");
  const cleanName = formatDisplayNameCase((genreName || "").trim());
  if (!cleanName || cleanName === "—") return;
  if (push) pushRoute();

  const reqId = ++genreReqId;
  activeGenreName = cleanName;
  activeGenreAlbums = [];
  currentRoute = { type: "genre-detail", genre: cleanName };
  setActiveNav("genre-detail");

  $("genre-detail-title").textContent = cleanName;
  $("genre-sort-select").value = activeGenreSort;
  $("genre-detail-count").textContent = "";
  $("genre-albums-grid").innerHTML = "";
  $("genre-detail-empty").classList.add("hidden");
  $("genre-detail-status").textContent = "Loading popular albums...";

  const lfmTag = normalizeGenreForLastFm(cleanName);
  const shelfPromise = loadUserShelf(sessionUser.id);

  if (genreAlbumsCache.has(lfmTag)) {
    shelfItems = await shelfPromise;
    if (reqId !== genreReqId) return;
    activeGenreAlbums = genreAlbumsCache.get(lfmTag);
    $("genre-detail-status").textContent = "";
    renderGenreAlbumsGrid();
    return;
  }

  const tagData = await fetchLastFm("tag.getTopAlbums", { tag: lfmTag, limit: 70 });
  if (reqId !== genreReqId) return;

  const raw = toArray(tagData?.albums?.album).filter(
    (a) => a?.name && a?.artist?.name && !isJunkTitle(a.name) && !isEpTitle(a.name)
  );

  const seen = new Set();
  const candidates = [];
  for (const item of raw) {
    const key = normalizeTitleKey(item.name, item.artist.name);
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push(item);
    if (candidates.length >= 42) break;
  }

  const verifiedList = await Promise.all(
    candidates.map(async (item, idx) => {
      const verified = await verifyLastFmFullAlbum(item.artist.name, item.name);
      if (!verified) return null;
      const cover = extractLastFmCover(verified.image) || extractLastFmCover(item.image);
      const payload = toAlbumPayloadFromLastFm({
        name: verified.name || item.name,
        artist: verified.artist || item.artist.name,
        image: cover ? [{ size: "extralarge", "#text": cover }] : []
      });
      payload.genre = cleanName;
      payload.popularity = Number(verified.listeners || 0) || Math.max(1, 500 - idx);
      return payload;
    })
  );

  shelfItems = await shelfPromise;
  if (reqId !== genreReqId) return;

  const albums = verifiedList.filter(Boolean).slice(0, 36);
  if (albums.length) genreAlbumsCache.set(lfmTag, albums);

  activeGenreAlbums = albums;
  $("genre-detail-status").textContent = "";
  renderGenreAlbumsGrid();
}

// ------------------------------------------------------------
// View Router & History Stack
// ------------------------------------------------------------
const VIEW_IDS = {
  station: "station-view",
  shelf: "shelf-view",
  search: "search-view",
  listeners: "listeners-view",
  "album-detail": "album-detail-view",
  "artist-detail": "artist-detail-view",
  "list-detail": "list-detail-view",
  "genre-detail": "genre-detail-view"
};


// Keep mobile navigation as a direct child of <body> so position:fixed is
// anchored to the viewport in installed iOS PWAs (not to the header).
function relocateMainNavForViewport() {
  const nav = $("main-nav");
  const header = document.querySelector(".site-header");
  if (!nav || !header) return;

  const mobile = window.matchMedia("(max-width: 760px)").matches;
  if (mobile && nav.parentElement !== document.body) {
    document.body.appendChild(nav);
  } else if (!mobile && nav.parentElement !== header) {
    const controls = header.querySelector(".header-controls");
    header.insertBefore(nav, controls || null);
  }
  nav.classList.toggle("mobile-bottom-nav", mobile);
}

function setActiveNav(view, activeTabOverride = null) {
  stopPreview();
  currentView = view;
  const ready = Boolean(sessionUser && userProfile?.tastes?.length);
  const navKey = activeTabOverride || view;

  $("main-nav")?.classList.toggle("hidden", !ready);
  document.body.classList.toggle("app-ready", ready);
  $("sign-out-btn")?.classList.toggle("hidden", !sessionUser);
  $("dev-day-controls")?.classList.toggle("hidden", view !== "station" || !ready);

  ["station", "shelf", "search", "listeners", "profile"].forEach((k) => {
    $(`nav-${k}`)?.classList.toggle("active", navKey === k);
  });

  $("auth-view")?.classList.toggle("hidden", view !== "auth" && view !== "profile-edit");
  Object.entries(VIEW_IDS).forEach(([k, id]) => $(id)?.classList.toggle("hidden", view !== k));
  window.scrollTo(0, 0);
}

function pushRoute() {
  if (currentRoute) {
    viewHistory.push(currentRoute);
    if (viewHistory.length > 25) viewHistory.shift();
  }
}

function goBack() {
  const prev = viewHistory.pop();
  if (!prev) return showStationView(false);
  const handlers = {
    station: () => showStationView(false),
    shelf: () => showShelfView(false),
    search: () => showSearchView(prev.query || "", false),
    listeners: () => showListenersView(false),
    "public-profile": () => openPublicProfile(prev.profile, false, Boolean(prev.asOwnTab)),
    "album-detail": () => openAlbumDetail(prev.album, false),
    "artist-detail": () => openArtistDetail(prev.artist, false),
    "list-detail": () => openListDetail(prev.listId, prev.ownerProfile, false),
    "genre-detail": () => openGenreDetail(prev.genre, false)
  };
  (handlers[prev.type] || handlers.station)();
}

// ------------------------------------------------------------
// Auth, Profile Editor & Top 5 Favorite Albums
// ------------------------------------------------------------
function renderTasteSelector(selected = []) {
  const container = $("taste-options");
  container.innerHTML = "";
  AVAILABLE_TASTES.forEach((taste) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `taste-chip${selected.includes(taste) ? " selected" : ""}`;
    btn.textContent = taste;
    btn.addEventListener("click", () => btn.classList.toggle("selected"));
    container.appendChild(btn);
  });
}

function refreshArtistChips() {
  const container = $("selected-artists");
  container.innerHTML = "";
  draftArtists.forEach((label) => {
    const chip = document.createElement("span");
    chip.className = "removable-chip";
    chip.innerHTML = `<span>${escapeHtml(label)}</span><button type="button" aria-label="Remove ${escapeHtml(label)}">×</button>`;
    chip.querySelector("button").addEventListener("click", () => {
      draftArtists = draftArtists.filter((a) => a !== label);
      refreshArtistChips();
    });
    container.appendChild(chip);
  });
}

function renderTopFiveEditor() {
  $("top-five-count").textContent = `${draftTopFive.length}/5`;
  const input = $("album-search-input");
  input.disabled = draftTopFive.length >= 5;
  input.placeholder =
    draftTopFive.length >= 5
      ? "Top 5 full — remove one below to replace"
      : "Search an album or paste an Apple Music link...";

  const grid = $("top-five-editor-grid");
  grid.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const alb = draftTopFive[i];
    const slot = document.createElement("div");
    slot.className = "top-five-slot";
    if (alb) {
      slot.innerHTML = `
        <div class="top-five-cover">${alb.cover_url ? `<img src="${escapeHtml(alb.cover_url)}" alt="${escapeHtml(alb.title)}" />` : VINYL_PLACEHOLDER_SVG}</div>
        <button class="top-five-remove" type="button" aria-label="Remove ${escapeHtml(alb.title)}">×</button>
        <span class="top-five-title">${escapeHtml(alb.title)}</span>
        <span class="top-five-artist">${escapeHtml(alb.artist)}</span>
      `;
      slot.querySelector(".top-five-remove").addEventListener("click", () => {
        draftTopFive.splice(i, 1);
        renderTopFiveEditor();
      });
    } else {
      slot.innerHTML = `<div class="top-five-cover empty">${VINYL_PLACEHOLDER_SVG}</div><span class="top-five-artist">#${i + 1}</span>`;
    }
    grid.appendChild(slot);
  }
}

function updateAvatarPreview() {
  renderAvatar($("avatar-preview"), draftAvatarUrl, $("name-input").value || userProfile?.display_name || "?");
  $("remove-avatar-btn").classList.toggle("hidden", !draftAvatarUrl);
}

function setAuthMode(mode) {
  authMode = mode;
  $("auth-feedback").classList.add("hidden");

  const isEdit = mode === "edit";
  const showProfile = mode === "signup" || isEdit;

  $("auth-eyebrow").textContent = isEdit ? "Listener Profile" : "Station Access";
  $("auth-heading").innerHTML = isEdit
    ? `Edit your <span class="editorial-accent">profile</span>.`
    : `Tune your daily <span class="editorial-accent">selection</span>.`;
  $("auth-copy").textContent = isEdit
    ? "Update your photo, bio, genres, favorite artists, and Top 5 albums."
    : "One album a day, matched to what you gravitate toward. No scores, no star ratings—just music and notes from listeners.";

  $("auth-mode-switch").classList.toggle("hidden", isEdit);
  $("mode-signin").classList.toggle("active", mode === "signin");
  $("mode-signup").classList.toggle("active", mode === "signup");

  ["avatar-field", "name-field", "bio-field", "tastes-fieldset", "artists-fieldset", "albums-fieldset"].forEach((id) =>
    $(id).classList.toggle("hidden", !showProfile)
  );
  ["email-field", "password-field"].forEach((id) => $(id).classList.toggle("hidden", isEdit));

  $("name-input").required = showProfile;
  $("email-input").required = !isEdit;
  $("password-input").required = !isEdit;
  $("cancel-auth-btn").classList.toggle("hidden", !(isEdit && userProfile?.tastes?.length));

  if (isEdit && userProfile) {
    $("name-input").value = userProfile.display_name || "";
    $("bio-input").value = userProfile.bio || "";
    draftAvatarUrl = userProfile.avatar_url || "";
    renderTasteSelector(userProfile.tastes || []);
    draftArtists = (userProfile.favorite_artists || []).map(formatDisplayNameCase);
    draftTopFive = Array.isArray(userProfile.top_five_albums) ? userProfile.top_five_albums.slice(0, 5) : [];
    refreshArtistChips();
    renderTopFiveEditor();
    updateAvatarPreview();
    $("auth-submit-btn").textContent = "Save profile";
  } else if (mode === "signup") {
    $("name-input").value = "";
    $("bio-input").value = "";
    draftAvatarUrl = "";
    draftArtists = [];
    draftTopFive = [];
    renderTasteSelector([]);
    refreshArtistChips();
    renderTopFiveEditor();
    updateAvatarPreview();
    $("auth-submit-btn").textContent = "Create account";
  } else {
    $("auth-submit-btn").textContent = "Sign in";
  }
}

function showAuthView(mode = "signin") {
  if (mode !== "edit") viewHistory = [];
  currentRoute = { type: mode === "edit" ? "profile-edit" : "auth" };
  setActiveNav(mode === "edit" ? "profile-edit" : "auth", mode === "edit" ? "profile" : "auth");
  setAuthMode(mode);
}

async function openMyProfile(clearHistory = true) {
  if (!sessionUser) return showAuthView("signin");
  if (!userProfile?.tastes?.length) return showAuthView("edit");
  if (clearHistory) viewHistory = [];
  userProfile = (await loadUserProfile(sessionUser.id)) || userProfile;
  await openPublicProfile(userProfile, false, true);
}

// ------------------------------------------------------------
// Station View (Daily Recommendation + 4 Home Discovery Sections)
// ------------------------------------------------------------
function renderStationButtons() {
  $("want-btn").classList.toggle("selected", Boolean(currentInteraction.saved && !currentInteraction.listened));
  $("listened-btn").classList.toggle("selected", Boolean(currentInteraction.listened));
  $("personal-note-input").value = currentInteraction.positive_note || "";
  syncReactionChoices("station-reaction-choices", currentInteraction.reaction);
}

async function saveStationInteraction(patch) {
  if (!sessionUser || !currentAlbum) return;
  currentInteraction = { ...currentInteraction, ...patch };
  renderStationButtons();
  try {
    currentInteraction = await upsertAlbumOnShelf({
      album_id: currentAlbum.id,
      title: currentAlbum.title,
      artist: currentAlbum.artist,
      cover_url: currentAlbumCoverUrl || currentAlbum.coverUrl || coverCache[currentAlbum.id] || "",
      release_year: currentAlbum.year,
      release_date: currentAlbum.release_date || null,
      saved: currentInteraction.saved,
      listened: currentInteraction.listened,
      is_tbr: false,
      positive_note: currentInteraction.positive_note || null,
      reaction: currentInteraction.reaction || null
    });
    renderStationButtons();
  } catch {
    $("note-status").textContent = "Could not save";
  }
}

function mapStoredPickToAlbum(p) {
  return {
    id: p.album_id,
    mediaType: "album",
    title: p.title,
    artist: p.artist,
    year: p.release_year || "—",
    release_date: p.release_date || null,
    runtime: p.runtime || "—",
    label: p.label || "—",
    genre: p.genre || "",
    tags: p.tags || [],
    synopsis: fixReasonCapitalization(p.synopsis || ""),
    aesthetic: p.aesthetic || "editorial",
    reason: fixReasonCapitalization(p.reason || `Curated for ${userProfile.display_name}`),
    coverUrl: p.cover_url || "",
    collectionId: p.itunes_collection_id || null,
    artistId: p.itunes_artist_id || null,
    reviews: []
  };
}

async function showStationView(clearHistory = true) {
  if (!sessionUser) return showAuthView("signin");
  if (!userProfile?.tastes?.length) return showAuthView("edit");

  const reqId = ++stationReqId;
  if (clearHistory) viewHistory = [];
  currentRoute = { type: "station" };
  setActiveNav("station");

  const activeDate = getActiveDate();
  const dateSeed = getDateSeed(activeDate);
  $("current-date-label").textContent = formatDisplayDate(activeDate);

  const coverEl = $("album-cover");
  coverEl.classList.add("loading");
  $("album-artist").textContent = "";
  $("album-title").textContent = "Tuning transmission…";
  $("album-synopsis").textContent = "";
  $("album-tags").innerHTML = "";
  $("reviews-list").innerHTML = "";
  $("listener-greeting").textContent = `Curating for ${userProfile.display_name}`;

  renderHomeDiscoverySections(reqId);

  const [storedPick, pastPicks, myShelf] = await Promise.all([
    loadDailyPick(sessionUser.id, dateSeed),
    loadPastDailyPicks(sessionUser.id, dateSeed),
    loadUserShelf(sessionUser.id)
  ]);
  if (reqId !== stationReqId) return;

  const excluded = buildExcludedSets(userProfile, pastPicks, myShelf);
  const storedPickIsEligible =
    storedPick &&
    !isStoredPickInvalid(storedPick) &&
    !isExcludedCandidate(storedPick.title, storedPick.artist, excluded);

  let resolvedAlbum = storedPickIsEligible ? mapStoredPickToAlbum(storedPick) : null;

  // A saved pick can become ineligible after the listener marks it as listened.
  // Replace it for today rather than showing an album already on the listened shelf.
  if (!resolvedAlbum) {
    const dynamicPick = await generateDynamicDailyPick(userProfile, dateSeed, excluded);
    if (reqId !== stationReqId) return;

    const replacement = dynamicPick ||
      getFallbackCatalogRecommendation(userProfile, activeDate, excluded);

    if (replacement) {
      const savedReplacement = await saveDailyPick(sessionUser.id, dateSeed, replacement);
      resolvedAlbum = mapStoredPickToAlbum(savedReplacement);
    }
    if (reqId !== stationReqId) return;
  }

  if (!resolvedAlbum) {
    currentAlbum = null;
    currentInteraction = emptyInteraction();
    coverEl.classList.remove("loading");
    coverEl.removeAttribute("src");
    $("album-artist").textContent = "";
    $("album-title").textContent = "Your next discovery is on its way.";
    $("album-synopsis").textContent =
      "You've already explored the albums currently available for your profile. Add more artists or genres to unlock fresh recommendations.";
    $("album-tags").innerHTML = "";
    $("album-year").textContent = "—";
    $("album-runtime").textContent = "—";
    $("album-label").textContent = "—";
    $("listener-greeting").textContent = "No eligible album today";
    $("reviews-list").innerHTML = "";
    $("review-source-note").textContent = "";
    renderStationButtons();
    return;
  }

  currentAlbum = resolvedAlbum;
  const [interaction, communityNotes] = await Promise.all([
    loadInteraction(sessionUser.id, currentAlbum.id),
    loadCommunityNotes(currentAlbum.id)
  ]);
  if (reqId !== stationReqId) return;

  currentInteraction = interaction;
  $("listener-greeting").textContent = currentAlbum.reason;
  $("station-view").dataset.aesthetic = currentAlbum.aesthetic || "editorial";

  coverEl.alt = `${currentAlbum.title} by ${currentAlbum.artist}`;
  currentAlbumCoverUrl = currentAlbum.coverUrl || coverCache[currentAlbum.id] || "";
  if (currentAlbumCoverUrl) {
    coverEl.src = currentAlbumCoverUrl;
    coverEl.onload = () => coverEl.classList.remove("loading");
    if (coverEl.complete) coverEl.classList.remove("loading");
  } else {
    const idSnap = currentAlbum.id;
    resolveAlbumCover(currentAlbum).then((url) => {
      if (currentAlbum?.id === idSnap && url) {
        currentAlbumCoverUrl = url;
        coverEl.src = url;
      }
      coverEl.classList.remove("loading");
    });
  }

  $("media-type-badge").textContent = currentAlbum.mediaType || "Album";
  $("album-year").textContent = currentAlbum.year || "—";
  $("album-runtime").textContent = currentAlbum.runtime || "—";
  $("album-label").textContent = currentAlbum.label || "—";
  $("album-artist").textContent = currentAlbum.artist;
  $("album-title").textContent = currentAlbum.title;
  $("album-synopsis").textContent = currentAlbum.synopsis || "";

  renderClickableGenrePills(
    $("album-tags"),
    extractCleanGenreTags(currentAlbum.tags, currentAlbum.genre, currentAlbum.artist)
  );
  renderNotes($("reviews-list"), $("review-source-note"), currentAlbum.reviews, communityNotes);
  $("note-status").textContent = "";
  renderStationButtons();
}

function openStationAlbumDetail() {
  if (!currentAlbum) return;
  openAlbumDetail({
    album_id: currentAlbum.id,
    collectionId: currentAlbum.collectionId,
    artistId: currentAlbum.artistId,
    title: currentAlbum.title,
    artist: currentAlbum.artist,
    cover_url: currentAlbumCoverUrl || currentAlbum.coverUrl || coverCache[currentAlbum.id] || "",
    release_year: String(currentAlbum.year || ""),
    release_date: currentAlbum.release_date || null,
    runtime: currentAlbum.runtime,
    genre: currentAlbum.genre || currentAlbum.tags?.[0] || "",
    tags: currentAlbum.tags || [],
    label: currentAlbum.label,
    synopsis: currentAlbum.synopsis,
    reviews: currentAlbum.reviews,
    coverQuery: currentAlbum.coverQuery
  });
}

// ------------------------------------------------------------
// Album Detail Page (+ Genre Tags, List Picker & Verified Similar Albums)
// ------------------------------------------------------------
function setIconBtnLabel(btnId, text) {
  const btn = $(btnId);
  if (!btn) return;
  const label = btn.querySelector(".btn-label");
  if (label) label.textContent = text;
  btn.title = text;
  btn.setAttribute("aria-label", text);
}

function renderDetailButtons() {
  const tbr = isItemTbr(activeDetailInteraction);
  $("detail-want-btn").classList.toggle("selected", Boolean(activeDetailInteraction.saved && !activeDetailInteraction.listened && !tbr));
  $("detail-tbr-btn").classList.toggle("selected", tbr);
  $("detail-listened-btn").classList.toggle("selected", Boolean(activeDetailInteraction.listened));
  $("detail-note-input").value = activeDetailInteraction.positive_note || "";
  syncReactionChoices("detail-reaction-choices", activeDetailInteraction.reaction);

  const inTopFive = (userProfile?.top_five_albums || []).some((a) => a.album_id === activeDetailAlbum?.album_id);
  $("detail-topfive-btn").classList.toggle("selected", inTopFive);
  setIconBtnLabel("detail-topfive-btn", inTopFive ? "In Top 5" : "+ Top 5");

  const inAnyList = userLists.some((l) => (l.albums || []).some((a) => a.album_id === activeDetailAlbum?.album_id));
  $("detail-list-btn")?.classList.toggle("selected", inAnyList);
  setIconBtnLabel("detail-list-btn", inAnyList ? "In list" : "+ List");
}

async function saveDetailInteraction(patch) {
  if (!sessionUser || !activeDetailAlbum) return;
  activeDetailInteraction = { ...activeDetailInteraction, ...patch };
  renderDetailButtons();
  try {
    activeDetailInteraction = await upsertAlbumOnShelf({
      ...activeDetailAlbum,
      saved: activeDetailInteraction.saved,
      listened: activeDetailInteraction.listened,
      is_tbr: activeDetailInteraction.is_tbr,
      positive_note: activeDetailInteraction.positive_note || null,
      reaction: activeDetailInteraction.reaction || null
    });
    renderDetailButtons();
  } catch {
    $("detail-note-status").textContent = "Could not save";
  }
}

async function openAlbumDetail(input, push = true) {
  if (!sessionUser) return showAuthView("signin");
  if (push) pushRoute();

  const reqId = ++detailReqId;
  const cat = CATALOG_ITEMS.find((c) => c.id === input.album_id);

  activeDetailAlbum = {
    album_id: input.album_id,
    collectionId: input.collectionId || (input.album_id?.startsWith("itunes-") ? input.album_id.replace("itunes-", "") : null),
    artistId: input.artistId || null,
    title: input.title || cat?.title || "Untitled Album",
    artist: input.artist || cat?.artist || "Unknown Artist",
    cover_url: input.cover_url || coverCache[input.album_id] || "",
    release_year: input.release_year || (cat ? String(cat.year) : ""),
    release_date: input.release_date || null,
    runtime: input.runtime || cat?.runtime || "",
    genre: input.genre || cat?.tags?.[0] || "",
    tags: Array.isArray(input.tags) ? input.tags : (cat?.tags || []),
    label: input.label || cat?.label || "",
    synopsis: input.synopsis || cat?.synopsis || "",
    reviews: input.reviews || cat?.reviews || [],
    coverQuery: input.coverQuery || cat?.coverQuery || ""
  };

  defaultPreviewTrack = null;
  currentRoute = { type: "album-detail", album: { ...activeDetailAlbum } };
  setActiveNav("album-detail");

  const tagsEl = ensureAlbumDetailTagsContainer();
  $("detail-album-cover").src = activeDetailAlbum.cover_url;
  $("detail-album-cover").alt = `${activeDetailAlbum.title} by ${activeDetailAlbum.artist}`;
  $("detail-album-artist-btn").textContent = activeDetailAlbum.artist;
  $("detail-album-title").textContent = activeDetailAlbum.title;
  $("detail-album-year").textContent = activeDetailAlbum.release_year || "—";
  $("detail-album-runtime").textContent = activeDetailAlbum.runtime || "—";
  $("detail-album-genre").textContent = activeDetailAlbum.genre || "—";

  const initialTags = extractCleanGenreTags(activeDetailAlbum.tags, activeDetailAlbum.genre, activeDetailAlbum.artist);
  activeDetailAlbum.tags = initialTags;
  renderClickableGenrePills(tagsEl, initialTags);

  $("detail-album-label").textContent = activeDetailAlbum.label || "";
  $("detail-preview-wrap").classList.add("hidden");
  $("detail-list-picker")?.classList.add("hidden");
  $("detail-album-synopsis").textContent = activeDetailAlbum.synopsis || "";
  $("detail-album-synopsis").classList.toggle("hidden", !activeDetailAlbum.synopsis);
  $("detail-tracklist-count").textContent = "Loading...";
  $("detail-tracklist").innerHTML = "";
  $("detail-note-status").textContent = "";

  loadSimilarAlbumsForDetail(activeDetailAlbum, reqId);

  const [interaction, communityNotes, lists] = await Promise.all([
    loadInteraction(sessionUser.id, activeDetailAlbum.album_id),
    loadCommunityNotes(activeDetailAlbum.album_id),
    loadUserLists(sessionUser.id)
  ]);
  if (reqId !== detailReqId) return;

  userLists = lists;
  activeDetailInteraction = interaction;
  renderDetailButtons();
  renderNotes($("detail-notes-list"), $("detail-notes-count"), activeDetailAlbum.reviews, communityNotes);

  // Fetch synopsis + album tags (with automatic fallback to artist top tags)
  (async () => {
    const info = await fetchLastFm("album.getInfo", {
      artist: activeDetailAlbum.artist,
      album: activeDetailAlbum.title,
      autocorrect: 1
    });
    if (reqId !== detailReqId) return;

    if (!activeDetailAlbum.synopsis) {
      const summary = cleanLastFmWiki(info?.album?.wiki?.summary || "");
      if (summary) {
        activeDetailAlbum.synopsis = summary;
        $("detail-album-synopsis").textContent = summary;
        $("detail-album-synopsis").classList.remove("hidden");
      }
    }

    const lfmTagNames = toArray(info?.album?.tags?.tag).map((t) => t?.name).filter(Boolean);
    let mergedGenres = extractCleanGenreTags(
      [...(activeDetailAlbum.tags || []), ...lfmTagNames],
      activeDetailAlbum.genre,
      activeDetailAlbum.artist
    );

    if (mergedGenres.length < 2) {
      const artistTagsData = await fetchLastFm("artist.getTopTags", {
        artist: activeDetailAlbum.artist,
        autocorrect: 1
      });
      if (reqId !== detailReqId) return;

      const artistTagNames = toArray(artistTagsData?.toptags?.tag)
        .slice(0, 8)
        .map((t) => t?.name)
        .filter(Boolean);

      mergedGenres = extractCleanGenreTags(
        [...mergedGenres, ...artistTagNames],
        activeDetailAlbum.genre,
        activeDetailAlbum.artist
      );
    }

    if (mergedGenres.length) {
      activeDetailAlbum.tags = mergedGenres;
      renderClickableGenrePills(tagsEl, mergedGenres);
    }
  })();

  let colId = activeDetailAlbum.collectionId;
  if (!colId && !activeDetailAlbum.album_id?.startsWith("tbr-")) {
    const found = await searchNonSingleAlbums(activeDetailAlbum.coverQuery || `${activeDetailAlbum.artist} ${activeDetailAlbum.title}`, 3);
    if (reqId !== detailReqId) return;
    const best =
      found.find((r) => r.collectionId && r.title.toLowerCase().includes(activeDetailAlbum.title.toLowerCase().slice(0, 8))) ||
      found.find((r) => r.collectionId);
    if (best) {
      colId = best.collectionId;
      activeDetailAlbum.collectionId = colId;
      activeDetailAlbum.artistId = activeDetailAlbum.artistId || best.artistId;
      activeDetailAlbum.release_date = activeDetailAlbum.release_date || best.release_date || null;
      if (!activeDetailAlbum.cover_url && best.cover_url) {
        activeDetailAlbum.cover_url = best.cover_url;
        $("detail-album-cover").src = activeDetailAlbum.cover_url;
      }
    }
  }

  if (!colId) {
    $("detail-tracklist-count").textContent = "Tracklist unavailable";
    return;
  }

  const lookupRes = await lookupItunes(colId, "song", 100);
  if (reqId !== detailReqId) return;

  const colMeta = lookupRes.find((r) => r.wrapperType === "collection");
  const tracks = lookupRes.filter((r) => r.wrapperType === "track");

  if (colMeta) {
    activeDetailAlbum.artistId = activeDetailAlbum.artistId || colMeta.artistId;
    activeDetailAlbum.release_date = colMeta.releaseDate || activeDetailAlbum.release_date || null;
    if (!activeDetailAlbum.cover_url && colMeta.artworkUrl100) {
      activeDetailAlbum.cover_url = toHighResCover(colMeta.artworkUrl100);
      $("detail-album-cover").src = activeDetailAlbum.cover_url;
    }
    if (colMeta.releaseDate) {
      const y = colMeta.releaseDate.slice(0, 4);
      if (!activeDetailAlbum.release_year || activeDetailAlbum.release_year === "—") {
        activeDetailAlbum.release_year = y;
      }
      $("detail-album-year").textContent = isFutureReleaseDate(colMeta.releaseDate)
        ? formatShortReleaseDate(colMeta.releaseDate)
        : activeDetailAlbum.release_year;

      if ((activeDetailInteraction.saved || activeDetailInteraction.listened) && !activeDetailInteraction.release_date) {
        sb.from("user_album_interactions")
          .update({ release_date: colMeta.releaseDate, release_year: y })
          .eq("user_id", sessionUser.id)
          .eq("album_id", activeDetailAlbum.album_id);
      }

      if (activeDetailInteraction.saved && !activeDetailInteraction.listened && !activeDetailInteraction.is_tbr && isFutureReleaseDate(colMeta.releaseDate)) {
        saveDetailInteraction({ saved: true, listened: false, is_tbr: true });
      }
    }
    if (colMeta.primaryGenreName) {
      activeDetailAlbum.genre = colMeta.primaryGenreName;
      $("detail-album-genre").textContent = colMeta.primaryGenreName;
      const merged = extractCleanGenreTags(activeDetailAlbum.tags || [], colMeta.primaryGenreName, activeDetailAlbum.artist);
      activeDetailAlbum.tags = merged;
      renderClickableGenrePills(tagsEl, merged);
    }
    if (colMeta.copyright && (!activeDetailAlbum.label || activeDetailAlbum.label === "—")) {
      $("detail-album-label").textContent = colMeta.copyright;
    }
  }

  if (!tracks.length) {
    $("detail-tracklist-count").textContent = "Tracklist unavailable";
    return;
  }

  const totalMs = tracks.reduce((s, t) => s + (t.trackTimeMillis || 0), 0);
  if (totalMs) $("detail-album-runtime").textContent = `${Math.round(totalMs / 60000)} min`;
  $("detail-tracklist-count").textContent = `${tracks.length} ${tracks.length === 1 ? "track" : "tracks"}`;

  const playable = tracks.filter((t) => t.previewUrl);
  const picked = playable.find((t) => (t.trackTimeMillis || 0) >= 60000) || playable[0];
  if (picked) {
    defaultPreviewTrack = { trackId: picked.trackId || picked.trackName, trackName: picked.trackName, previewUrl: picked.previewUrl };
  }

  const listEl = $("detail-tracklist");
  listEl.innerHTML = "";
  tracks.forEach((track, idx) => {
    const numStr = String(track.trackNumber || idx + 1).padStart(2, "0");
    const tObj = track.previewUrl ? { trackId: track.trackId || `${idx}-${track.trackName}`, trackName: track.trackName, previewUrl: track.previewUrl } : null;
    const li = document.createElement("li");
    li.className = `track-row${tObj ? " has-preview" : ""}`;
    li.dataset.trackId = tObj ? String(tObj.trackId) : "";
    li.dataset.trackNum = numStr;
    if (tObj) li.title = "Click to preview (15s)";
    li.innerHTML = `<span class="track-num">${numStr}</span><span class="track-name">${escapeHtml(track.trackName)}</span><span class="track-dur">${formatDuration(track.trackTimeMillis)}</span>`;
    if (tObj) li.addEventListener("click", () => togglePreviewTrack(tObj));
    listEl.appendChild(li);
  });

  updatePreviewUI();
}

async function loadSimilarAlbumsForDetail(album, reqId) {
  const sec = $("album-similar-section");
  const grid = $("album-similar-grid");
  if (!sec || !grid) return;
  sec.classList.add("hidden");
  grid.innerHTML = "";

  const seen = new Set([normalizeTitleKey(album.title, album.artist)]);
  const picks = [];

  const simData = await fetchLastFm("artist.getSimilar", { artist: album.artist, limit: 14, autocorrect: 1 });
  if (reqId !== detailReqId) return;

  const simArtists = toArray(simData?.similarartists?.artist).map((a) => a?.name).filter(Boolean).slice(0, 8);

  if (simArtists.length) {
    const responses = await Promise.all(
      simArtists.map((name) => fetchLastFm("artist.getTopAlbums", { artist: name, limit: 10, autocorrect: 1 }))
    );
    if (reqId !== detailReqId) return;

    for (let idx = 0; idx < responses.length && picks.length < 4; idx++) {
      const artistName = simArtists[idx];
      const candidates = toArray(responses[idx]?.topalbums?.album).filter(
        (a) => a?.name && !isJunkTitle(a.name) && !isEpTitle(a.name) && !seen.has(normalizeTitleKey(a.name, artistName))
      );

      for (const cand of candidates.slice(0, 4)) {
        const candArtist = cand.artist?.name || artistName;
        const verified = await verifyLastFmFullAlbum(candArtist, cand.name);
        if (reqId !== detailReqId) return;
        if (!verified) continue;

        const cover = extractLastFmCover(verified.image) || extractLastFmCover(cand.image);
        const payload = toAlbumPayloadFromLastFm({
          name: verified.name || cand.name,
          artist: verified.artist || candArtist,
          image: cover ? [{ size: "extralarge", "#text": cover }] : []
        });
        seen.add(normalizeTitleKey(payload.title, payload.artist));
        picks.push(payload);
        break;
      }
    }
  }

  if (picks.length < 4 && album.genre) {
    const tagData = await fetchLastFm("tag.getTopAlbums", { tag: album.genre.toLowerCase(), limit: 20 });
    if (reqId !== detailReqId) return;
    for (const item of toArray(tagData?.albums?.album)) {
      if (picks.length >= 4) break;
      if (!item?.name || !item?.artist?.name || isJunkTitle(item.name) || isEpTitle(item.name)) continue;
      const key = normalizeTitleKey(item.name, item.artist.name);
      if (seen.has(key)) continue;

      const verified = await verifyLastFmFullAlbum(item.artist.name, item.name);
      if (reqId !== detailReqId) return;
      if (!verified) continue;

      seen.add(key);
      const cover = extractLastFmCover(verified.image) || extractLastFmCover(item.image);
      picks.push(
        toAlbumPayloadFromLastFm({
          name: verified.name || item.name,
          artist: verified.artist || item.artist.name,
          image: cover ? [{ size: "extralarge", "#text": cover }] : []
        })
      );
    }
  }

  if (!picks.length || reqId !== detailReqId) return;
  picks.forEach((alb) => {
    const existing = findEquivalentShelfItem(alb);
    grid.appendChild(createAlbumCard(alb, { mode: "discovery", existing }));
  });
  sec.classList.remove("hidden");
}

function renderDetailListPicker() {
  const box = $("detail-list-picker");
  if (!box || !activeDetailAlbum) return;
  box.innerHTML = "";

  const albumEntry = {
    album_id: activeDetailAlbum.album_id,
    collectionId: activeDetailAlbum.collectionId || null,
    artistId: activeDetailAlbum.artistId || null,
    title: activeDetailAlbum.title,
    artist: activeDetailAlbum.artist,
    cover_url: activeDetailAlbum.cover_url || "",
    release_year: activeDetailAlbum.release_year || "",
    release_date: activeDetailAlbum.release_date || null
  };

  const hasCurrentAnnual = userLists.some((l) => l.list_type === "annual" && Number(l.list_year) === CURRENT_YEAR);

  if (!hasCurrentAnnual) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "list-picker-row";
    btn.innerHTML = `<span>★ Top ${CURRENT_YEAR} (Annual Top 10)</span><span class="meta-label">Start &amp; add</span>`;
    btn.addEventListener("click", async () => {
      const created = await ensureAnnualList(CURRENT_YEAR);
      await updateListAlbums(created.id, [albumEntry]);
      renderDetailButtons();
      renderDetailListPicker();
    });
    box.appendChild(btn);
  }

  const sorted = [...userLists].sort(
    (a, b) => (b.list_type === "annual") - (a.list_type === "annual") || (b.list_year || 0) - (a.list_year || 0)
  );

  sorted.forEach((list) => {
    const albums = Array.isArray(list.albums) ? list.albums : [];
    const inList = albums.some((a) => a.album_id === albumEntry.album_id);
    const isAnnual = list.list_type === "annual";
    const isFull = isAnnual && albums.length >= 10 && !inList;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `list-picker-row${inList ? " added" : ""}`;
    btn.innerHTML = `
      <span>${isAnnual ? "★ " : ""}${escapeHtml(list.title)}</span>
      <span class="meta-label">${inList ? "✓ Added" : isFull ? "Full (10/10)" : isAnnual ? `${albums.length}/10` : "+ Add"}</span>
    `;
    btn.addEventListener("click", async () => {
      if (isFull) return;
      const next = inList
        ? albums.filter((a) => a.album_id !== albumEntry.album_id)
        : [...albums, albumEntry];
      await updateListAlbums(list.id, next);
      renderDetailButtons();
      renderDetailListPicker();
    });
    box.appendChild(btn);
  });

  const form = document.createElement("form");
  form.className = "list-picker-quick-form";
  form.innerHTML = `
    <input type="text" placeholder="New list name..." required />
    <button type="submit" class="mini-btn">Create</button>
  `;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = form.querySelector("input").value.trim();
    if (!title) return;
    await createUserList({ title, albums: [albumEntry] });
    renderDetailButtons();
    renderDetailListPicker();
  });
  box.appendChild(form);
}

// ------------------------------------------------------------
// Artist Detail Page (Avatar + Popularity Sort + Similar Artists)
// ------------------------------------------------------------
function updateFavArtistBtn() {
  if (!activeDetailArtist || !userProfile) return;
  const isFav = (userProfile.favorite_artists || []).some((a) => a.toLowerCase() === activeDetailArtist.name.toLowerCase());
  $("detail-artist-fav-btn").classList.toggle("selected", isFav);
  $("detail-artist-fav-btn").textContent = isFav ? "Favorited artist" : "+ Favorite artist";
}

function renderArtistReleases() {
  const fillGrid = (sectionId, countId, gridId, list, singular, plural) => {
    const sec = $(sectionId);
    // Artist discographies come directly from provider search results, so dedupe
    // them here as well (not only in the user's Shelf).
    const canonicalList = uniqueAlbumsByIdentity(list);
    if (!canonicalList.length) return sec.classList.add("hidden");
    $(countId).textContent = `${canonicalList.length} ${canonicalList.length === 1 ? singular : plural}`;
    const grid = $(gridId);
    grid.innerHTML = "";
    sortAlbumsList(canonicalList, activeArtistSort).forEach((payload) => {
      const existing = findEquivalentShelfItem(payload);
      grid.appendChild(createAlbumCard(payload, { mode: "artist", existing }));
    });
    sec.classList.remove("hidden");
  };

  fillGrid("artist-lps-section", "artist-lps-count", "artist-lps-grid", activeArtistLps, "album", "albums");
  fillGrid("artist-eps-section", "artist-eps-count", "artist-eps-grid", activeArtistEps, "EP", "EPs");
  $("detail-artist-empty").classList.toggle("hidden", activeArtistLps.length > 0 || activeArtistEps.length > 0);
}

async function openArtistDetail(input, push = true) {
  if (!sessionUser) return showAuthView("signin");
  if (push) pushRoute();

  const reqId = ++artistReqId;
  activeDetailArtist = { artistId: input.artistId || null, name: formatDisplayNameCase(input.name || "Artist"), genre: input.genre || "" };
  currentRoute = { type: "artist-detail", artist: { ...activeDetailArtist } };
  setActiveNav("artist-detail");

  activeArtistLps = [];
  activeArtistEps = [];
  if ($("artist-sort-select")) $("artist-sort-select").value = activeArtistSort;
  $("detail-artist-name").textContent = activeDetailArtist.name;
  $("detail-artist-genre").textContent = activeDetailArtist.genre || "Artist";
  $("detail-artist-status").textContent = "Loading discography...";
  $("artist-lps-section").classList.add("hidden");
  $("artist-eps-section").classList.add("hidden");
  $("detail-artist-empty").classList.add("hidden");
  updateFavArtistBtn();

  const artistAvatarEl = ensureArtistAvatarElement();
  renderAvatar(artistAvatarEl, "", activeDetailArtist.name);
  fetchArtistPhoto(activeDetailArtist.name).then((photoUrl) => {
    if (reqId === artistReqId && photoUrl) renderAvatar(artistAvatarEl, photoUrl, activeDetailArtist.name);
  });

  const shelfPromise = loadUserShelf(sessionUser.id);
  const topAlbumsPromise = fetchLastFm("artist.getTopAlbums", { artist: activeDetailArtist.name, limit: 50, autocorrect: 1 });
  loadSimilarArtistsForDetail(activeDetailArtist.name, reqId);

  let artistId = activeDetailArtist.artistId;
  if (!artistId) {
    let matches = await queryItunes(activeDetailArtist.name, "musicArtist", 5);
    if (!matches.length && /[,&]/.test(activeDetailArtist.name)) {
      matches = await queryItunes(activeDetailArtist.name.split(/[,&]/)[0].trim(), "musicArtist", 5);
    }
    if (reqId !== artistReqId) return;
    const exact = matches.find((a) => a.artistName?.toLowerCase() === activeDetailArtist.name.toLowerCase()) || matches[0];
    if (exact) {
      artistId = exact.artistId;
      activeDetailArtist.artistId = artistId;
      activeDetailArtist.name = exact.artistName || activeDetailArtist.name;
      activeDetailArtist.genre = exact.primaryGenreName || activeDetailArtist.genre;
      $("detail-artist-name").textContent = activeDetailArtist.name;
      $("detail-artist-genre").textContent = activeDetailArtist.genre || "Artist";
      updateFavArtistBtn();
    }
  }

  let lps = [];
  let eps = [];
  const topData = await topAlbumsPromise;
  if (reqId !== artistReqId) return;

  const popByCleanTitle = new Map();
  const topEntries = toArray(topData?.topalbums?.album).filter((a) => a?.name);
  topEntries.forEach((a, idx) => {
    const clean = normalizeAlbumTitleForMatch(a.name);
    const score = Number(a.playcount || 0) || Math.max(1, 500 - idx);
    if (clean && (!popByCleanTitle.has(clean) || score > popByCleanTitle.get(clean))) {
      popByCleanTitle.set(clean, score);
    }
  });

  const resolveArtistAlbPopularity = (title) => {
    const clean = normalizeAlbumTitleForMatch(title);
    if (!clean) return 0;
    if (popByCleanTitle.has(clean)) return popByCleanTitle.get(clean);
    for (const [k, v] of popByCleanTitle.entries()) {
      if (k.length >= 4 && (clean.startsWith(k) || k.startsWith(clean))) return v;
    }
    return 0;
  };

  if (artistId) {
    const res = await lookupItunes(artistId, "album", 100);
    if (reqId !== artistReqId) return;
    const meta = res.find((r) => r.wrapperType === "artist");
    if (meta?.primaryGenreName) $("detail-artist-genre").textContent = meta.primaryGenreName;

    const seen = new Set();
    const unique = res.filter((r) => {
      if (r.wrapperType !== "collection" || !isNonSingleRelease(r)) return false;
      const k = r.collectionName.toLowerCase().trim();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    const mapWithPop = (r) => ({
      ...toAlbumPayloadFromItunes(r),
      trackCount: r.trackCount,
      popularity: resolveArtistAlbPopularity(r.collectionName)
    });

    lps = unique.filter((r) => classifyRelease(r) === "lp").map(mapWithPop);
    eps = unique.filter((r) => classifyRelease(r) === "ep").map(mapWithPop);
  } else {
    const raw = topEntries.filter((a) => !isJunkTitle(a.name));
    const seen = new Set();
    raw.forEach((a, idx) => {
      const k = a.name.toLowerCase().trim();
      if (seen.has(k)) return;
      seen.add(k);
      const payload = {
        ...toAlbumPayloadFromLastFm({ name: a.name, artist: a.artist?.name || activeDetailArtist.name, image: a.image }),
        popularity: Number(a.playcount || 0) || Math.max(1, 500 - idx)
      };
      if (isEpTitle(payload.title)) eps.push(payload);
      else lps.push(payload);
    });
  }

  shelfItems = await shelfPromise;
  if (reqId !== artistReqId) return;

  activeArtistLps = lps;
  activeArtistEps = eps;
  $("detail-artist-status").textContent = "";
  renderArtistReleases();
}

async function loadSimilarArtistsForDetail(artistName, reqId) {
  const sec = $("artist-similar-section");
  const list = $("artist-similar-list");
  if (!sec || !list) return;
  sec.classList.add("hidden");
  list.innerHTML = "";

  const simData = await fetchLastFm("artist.getSimilar", { artist: artistName, limit: 10, autocorrect: 1 });
  if (reqId !== artistReqId) return;

  const similar = toArray(simData?.similarartists?.artist).filter((a) => a?.name).slice(0, 8);
  if (!similar.length) return;

  similar.forEach((a) => {
    list.appendChild(createArtistPill({ name: a.name, genre: "Similar artist" }));
  });
  sec.classList.remove("hidden");
}

// ------------------------------------------------------------
// Shelf View (Want / TBR / Listened / Lists + Exact Date Sorting)
// ------------------------------------------------------------
async function showShelfView(clearHistory = true) {
  if (!sessionUser) return showAuthView("signin");
  if (clearHistory) viewHistory = [];
  currentRoute = { type: "shelf" };
  setActiveNav("shelf");
  $("shelf-sort-select").value = activeShelfSort;

  const [items, lists] = await Promise.all([loadUserShelf(sessionUser.id), loadUserLists(sessionUser.id)]);
  shelfItems = items;
  userLists = lists;
  renderShelf();
  backfillReleaseDatesIfNeeded();
  if (activeShelfSort === "popularity") backfillPopularityIfNeeded();
}

function sortShelfList(list, mode) {
  const sorters = {
    "year-desc": (a, b) => getReleaseDateSortKey(b, false) - getReleaseDateSortKey(a, false),
    "year-asc": (a, b) => getReleaseDateSortKey(a, true) - getReleaseDateSortKey(b, true),
    popularity: (a, b) => Number(b.popularity || 0) - Number(a.popularity || 0),
    title: (a, b) => (a.title || "").localeCompare(b.title || ""),
    artist: (a, b) => (a.artist || "").localeCompare(b.artist || ""),
    recent: (a, b) => (b.updated_at || "").localeCompare(a.updated_at || "")
  };
  return [...list].sort(sorters[mode] || sorters.recent);
}

async function backfillReleaseDatesIfNeeded() {
  if (isBackfillingDates || !sessionUser) return;
  const missing = shelfItems.filter((i) => !i.release_date && i.album_id?.startsWith("itunes-"));
  if (!missing.length) return;

  isBackfillingDates = true;
  try {
    const batch = missing.slice(0, 25);
    const ids = batch.map((i) => i.album_id.replace("itunes-", ""));
    const results = await lookupItunesBatch(ids);
    const byId = new Map(results.filter((r) => r.collectionId && r.releaseDate).map((r) => [`itunes-${r.collectionId}`, r]));

    let updatedAny = false;
    await Promise.all(
      batch.map(async (item) => {
        const meta = byId.get(item.album_id);
        if (!meta?.releaseDate) return;
        item.release_date = meta.releaseDate;
        item.release_year = item.release_year || meta.releaseDate.slice(0, 4);
        updatedAny = true;
        await sb
          .from("user_album_interactions")
          .update({ release_date: meta.releaseDate, release_year: item.release_year })
          .eq("user_id", sessionUser.id)
          .eq("album_id", item.album_id);
      })
    );

    if (updatedAny && currentView === "shelf" && activeShelfTab !== "lists") renderShelf();
  } finally {
    isBackfillingDates = false;
  }
}

async function backfillPopularityIfNeeded() {
  const missing = shelfItems.filter((i) => !i.popularity && i.title && i.artist && !isItemTbr(i));
  if (!missing.length) return;
  await Promise.all(
    missing.slice(0, 12).map(async (item) => {
      const listeners = await fetchAlbumPopularity(item.artist, item.title);
      if (listeners > 0) {
        item.popularity = listeners;
        await sb.from("user_album_interactions").update({ popularity: listeners }).eq("user_id", sessionUser.id).eq("album_id", item.album_id);
      }
    })
  );
  if (currentView === "shelf" && activeShelfSort === "popularity" && activeShelfTab !== "lists") renderShelf();
}

function renderListsPanel() {
  const promptEl = $("annual-list-prompt");
  if (!promptEl) return;
  const currentAnnual = userLists.find((l) => l.list_type === "annual" && Number(l.list_year) === CURRENT_YEAR);
  const annualCount = currentAnnual?.albums?.length || 0;

  promptEl.innerHTML = `
    <div class="annual-prompt-left">
      <span class="annual-icon-badge">${ANNUAL_ICON_SVG}</span>
      <div>
        <p class="annual-prompt-title">${currentAnnual ? `Top ${CURRENT_YEAR} · ${annualCount}/10 albums` : `Build your Top ${CURRENT_YEAR}`}</p>
        <p class="annual-prompt-copy">${
          currentAnnual
            ? "Featured on your public profile as part of your yearly collection."
            : `Pick your 10 favorite albums of ${CURRENT_YEAR}. Your annual lists stay highlighted on your profile every year.`
        }</p>
      </div>
    </div>
    <button id="annual-prompt-action" class="primary-btn tbr-save-btn" type="button">
      ${currentAnnual ? `Edit Top ${CURRENT_YEAR}` : `Start Top ${CURRENT_YEAR}`}
    </button>
  `;

  $("annual-prompt-action").addEventListener("click", async () => {
    const list = await ensureAnnualList(CURRENT_YEAR);
    openListDetail(list.id, null);
  });

  const grid = $("user-lists-grid");
  grid.innerHTML = "";
  const sorted = [...userLists].sort(
    (a, b) => (b.list_type === "annual") - (a.list_type === "annual") || (b.list_year || 0) - (a.list_year || 0)
  );
  $("lists-empty-state").classList.toggle("hidden", sorted.length > 0);
  sorted.forEach((list) => grid.appendChild(createListCard(list, null)));
}

function renderShelf() {
  const canonicalShelf = uniqueAlbumsByIdentity(shelfItems);
  const buckets = {
    tbr: canonicalShelf.filter((i) => isItemTbr(i)),
    want: canonicalShelf.filter((i) => i.saved && !i.listened && !isItemTbr(i)),
    listened: canonicalShelf.filter((i) => i.listened)
  };

  $("count-want").textContent = buckets.want.length;
  $("count-tbr").textContent = buckets.tbr.length;
  $("count-listened").textContent = buckets.listened.length;
  if ($("count-lists")) $("count-lists").textContent = userLists.length;

  ["want", "tbr", "listened", "lists"].forEach((k) => {
    $(`tab-${k}`)?.classList.toggle("active", activeShelfTab === k);
  });

  const isListsTab = activeShelfTab === "lists";
  $("lists-panel")?.classList.toggle("hidden", !isListsTab);
  $("shelf-grid").classList.toggle("hidden", isListsTab);
  $("tbr-manual-bar").classList.toggle("hidden", activeShelfTab !== "tbr");
  document.querySelector(".shelf-sort-wrap")?.classList.toggle("hidden", isListsTab);

  if (isListsTab) {
    $("shelf-empty-state").classList.add("hidden");
    renderListsPanel();
    return;
  }

  const visible = sortShelfList(buckets[activeShelfTab], activeShelfSort);
  const grid = $("shelf-grid");
  grid.innerHTML = "";
  $("shelf-empty-state").classList.toggle("hidden", visible.length > 0);

  visible.forEach((item) => {
    grid.appendChild(
      createAlbumCard(item, {
        mode: "shelf",
        onShelfChanged: async (removedId) => {
          shelfItems = removedId ? shelfItems.filter((s) => s.album_id !== removedId) : await loadUserShelf(sessionUser.id);
          renderShelf();
        }
      })
    );
  });
}

// ------------------------------------------------------------
// List Detail View (Custom Lists & Annual Top 10)
// ------------------------------------------------------------
async function openListDetail(listId, ownerProfile = null, push = true) {
  if (!sessionUser) return showAuthView("signin");
  if (push) pushRoute();

  let list = (ownerProfile ? publicLists : userLists).find((l) => l.id === listId);
  if (!list) {
    const { data } = await sb.from("user_lists").select("*").eq("id", listId).maybeSingle();
    list = data;
  }
  if (!list) return goBack();

  activeDetailList = list;
  currentRoute = { type: "list-detail", listId: list.id, ownerProfile };
  setActiveNav("list-detail");

  const isOwner = list.user_id === sessionUser.id;
  const isAnnual = list.list_type === "annual";
  const albums = Array.isArray(list.albums) ? list.albums : [];

  $("list-detail-eyebrow").innerHTML = isAnnual
    ? `${ANNUAL_ICON_SVG}<span>Annual Top 10 · ${list.list_year}</span>`
    : `<span>${ownerProfile ? `${escapeHtml(ownerProfile.display_name)}'s List` : "Custom List"}</span>`;
  $("list-detail-title").textContent = list.title;
  $("list-detail-desc").textContent = list.description || "";
  $("list-detail-desc").classList.toggle("hidden", !list.description);
  $("list-detail-meta").textContent = isAnnual
    ? `${albums.length} / 10 albums`
    : `${albums.length} ${albums.length === 1 ? "album" : "albums"}`;

  $("list-delete-btn").classList.toggle("hidden", !isOwner);
  $("list-add-search-wrap").classList.toggle("hidden", !isOwner || (isAnnual && albums.length >= 10));
  $("list-album-search").value = "";
  $("list-search-results").classList.add("hidden");

  const grid = $("list-detail-grid");
  grid.innerHTML = "";
  $("list-detail-empty").classList.toggle("hidden", albums.length > 0);

  albums.forEach((alb, idx) => {
    const ownItem = shelfItems.find((saved) =>
      saved.album_id === alb.album_id ||
      (saved.collectionId && alb.collectionId && String(saved.collectionId) === String(alb.collectionId))
    ) || null;
    const card = createAlbumCard(alb, { mode: "public", existing: ownItem });
    if (isAnnual) {
      const rank = document.createElement("span");
      rank.className = "list-rank-badge";
      rank.textContent = `#${idx + 1}`;
      card.querySelector(".shelf-cover-wrap").appendChild(rank);
    }

    if (isOwner) {
      const actions = document.createElement("div");
      actions.className = "shelf-card-actions";
      actions.innerHTML = `
        ${idx > 0 ? `<button class="text-btn js-move-up" type="button">← Move up</button>` : ""}
        ${idx < albums.length - 1 ? `<button class="text-btn js-move-down" type="button">Move down →</button>` : ""}
        <button class="text-btn js-remove-from-list" type="button">Remove</button>
      `;
      actions.querySelector(".js-move-up")?.addEventListener("click", async () => {
        const next = [...albums];
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        await updateListAlbums(list.id, next);
        openListDetail(list.id, ownerProfile, false);
      });
      actions.querySelector(".js-move-down")?.addEventListener("click", async () => {
        const next = [...albums];
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
        await updateListAlbums(list.id, next);
        openListDetail(list.id, ownerProfile, false);
      });
      actions.querySelector(".js-remove-from-list").addEventListener("click", async () => {
        const next = albums.filter((_, i) => i !== idx);
        await updateListAlbums(list.id, next);
        openListDetail(list.id, ownerProfile, false);
      });
      card.appendChild(actions);
    }

    grid.appendChild(card);
  });
}

// ------------------------------------------------------------
// Search Dropdown & Full Search Results (Popularity Default + Artist Photos)
// ------------------------------------------------------------
async function populateAlbumDropdown(term, container, onClear) {
  if (term.length < 2) return container.classList.add("hidden");
  const results = await searchNonSingleAlbums(term, 12);
  container.innerHTML = "";
  if (!results.length) return container.classList.add("hidden");

  results.forEach((item) => {
    const isFuture = isFutureReleaseDate(item.release_date, item.release_year);
    const existing = findEquivalentShelfItem(item);
    const payload = { ...item, positive_note: existing?.positive_note || null };
    const thumb = item.thumb_url || item.cover_url || "";

    const row = document.createElement("div");
    row.className = "search-result-item";
    row.innerHTML = `
      <div class="search-result-left clickable-part js-open-album">
        <img class="search-thumb" src="${escapeHtml(thumb)}" alt="" />
        <span class="search-item-text">
          <span class="search-item-title">${escapeHtml(payload.title)}</span>
          <span class="search-item-sub">${escapeHtml(payload.artist)}${payload.release_year ? ` · ${payload.release_year}` : ""}${isFuture ? " · Upcoming" : ""}</span>
        </span>
      </div>
      <div class="search-quick-actions">
        <button class="mini-btn js-want ${existing?.saved && !existing?.listened ? "active" : ""}" type="button">${isFuture ? "+ TBR" : "+ Want"}</button>
        <button class="mini-btn js-listened ${existing?.listened ? "active" : ""}" type="button">+ Listened</button>
      </div>
    `;

    row.querySelector(".js-open-album").addEventListener("click", () => {
      container.classList.add("hidden");
      openAlbumDetail(payload);
    });
    const quickSave = async (listened) => {
      await upsertAlbumOnShelf({ ...payload, saved: !listened, listened, is_tbr: !listened && isFuture });
      shelfItems = await loadUserShelf(sessionUser.id);
      if (currentView === "shelf") {
        activeShelfTab = listened ? "listened" : isFuture ? "tbr" : "want";
        renderShelf();
      }
      onClear();
    };
    row.querySelector(".js-want").addEventListener("click", () => quickSave(false));
    row.querySelector(".js-listened").addEventListener("click", () => quickSave(true));
    container.appendChild(row);
  });

  if (!extractAppleMusicLink(term)) {
    const hint = document.createElement("button");
    hint.type = "button";
    hint.className = "search-result-item clickable";
    hint.innerHTML = `<span class="meta-label">See all results for “${escapeHtml(term)}” →</span>`;
    hint.addEventListener("click", () => {
      container.classList.add("hidden");
      showSearchView(term, false);
    });
    container.appendChild(hint);
  }
  container.classList.remove("hidden");
}

async function showSearchView(initialQuery = "", clearHistory = true) {
  if (!sessionUser) return showAuthView("signin");
  if (clearHistory) viewHistory = [];
  else if (currentView !== "search") pushRoute();

  lastSearchQuery = initialQuery;
  currentRoute = { type: "search", query: initialQuery };
  setActiveNav("search");
  $("global-search-input").value = initialQuery;
  $("global-search-dropdown").classList.add("hidden");

  if (initialQuery.trim()) {
    await runFullSearch(initialQuery.trim());
  } else {
    $("search-results-status").textContent = "Search by album title, artist name, listener, or paste an Apple Music album link.";
    ["search-artists-section", "search-albums-section", "search-listeners-section", "search-empty-state"].forEach((id) =>
      $(id).classList.add("hidden")
    );
    $("global-search-input").focus();
  }
}

function renderSearchAlbumsGrid() {
  const grid = $("search-albums-grid");
  grid.innerHTML = "";
  sortAlbumsList(lastSearchAlbums, activeSearchSort).forEach((payload) => {
    const existing = findEquivalentShelfItem(payload);
    grid.appendChild(createAlbumCard(payload, { mode: "search", existing }));
  });
}

async function runFullSearch(query) {
  const reqId = ++searchReqId;
  lastSearchQuery = query;
  lastSearchAlbums = [];
  currentRoute = { type: "search", query };
  $("global-search-dropdown").classList.add("hidden");
  if ($("search-sort-select")) $("search-sort-select").value = activeSearchSort;
  $("search-results-status").textContent = `Searching for “${query}”...`;
  ["search-artists-section", "search-albums-section", "search-listeners-section", "search-empty-state"].forEach((id) =>
    $(id).classList.add("hidden")
  );

  const isLink = Boolean(extractAppleMusicLink(query));
  const [albums, artists, listeners, myShelf] = await Promise.all([
    searchNonSingleAlbums(query, 20),
    isLink ? Promise.resolve([]) : searchArtistsHybrid(query, 8),
    isLink ? Promise.resolve([]) : searchListeners(query),
    loadUserShelf(sessionUser.id)
  ]);
  if (reqId !== searchReqId) return;
  shelfItems = myShelf;

  const total = artists.length + albums.length + listeners.length;
  $("search-results-status").textContent = isLink
    ? `${total} ${total === 1 ? "album" : "albums"} found from link`
    : `${total} ${total === 1 ? "result" : "results"} for “${query}”`;
  if (!total) return $("search-empty-state").classList.remove("hidden");

  if (artists.length) {
    const list = $("search-artists-list");
    list.innerHTML = "";
    artists.forEach((a) => list.appendChild(createArtistPill(a)));
    $("search-artists-section").classList.remove("hidden");
  }

  if (albums.length) {
    lastSearchAlbums = albums;
    const popPromise = Promise.all(
      lastSearchAlbums.map(async (alb) => {
        alb.popularity = await fetchAlbumPopularity(alb.artist, alb.title);
      })
    );
    await Promise.race([popPromise, new Promise((r) => setTimeout(r, 1500))]);
    if (reqId !== searchReqId) return;

    renderSearchAlbumsGrid();
    $("search-albums-section").classList.remove("hidden");

    popPromise.then(() => {
      if (reqId === searchReqId && currentView === "search" && activeSearchSort === "popularity") {
        renderSearchAlbumsGrid();
      }
    });
  }

  if (listeners.length) {
    const list = $("search-listeners-list");
    list.innerHTML = "";
    listeners.forEach((p) => list.appendChild(createListenerCard(p)));
    $("search-listeners-section").classList.remove("hidden");
  }
}

// ------------------------------------------------------------
// Listeners Directory & Public Profile (Own Profile, Edit, Share & Follow)
// ------------------------------------------------------------
async function showListenersView(clearHistory = true) {
  if (!sessionUser) return showAuthView("signin");
  if (clearHistory) viewHistory = [];
  viewingOwnProfile = false;
  currentRoute = { type: "listeners" };
  setActiveNav("listeners");
  $("listeners-directory").classList.remove("hidden");
  $("public-profile-view").classList.add("hidden");
  await renderListenersDirectory($("user-search-input").value);
}

async function renderListenersDirectory(query = "") {
  const requestId = ++listenersDirectoryReqId;
  const list = $("listeners-list");
  const empty = $("listeners-empty");
  const cleanQuery = String(query || "").trim().toLocaleLowerCase();

  $("listeners-tab-all")?.classList.toggle("active", activeListenersTab === "all");
  $("listeners-tab-following")?.classList.toggle("active", activeListenersTab === "following");
  list.innerHTML = "";
  empty.classList.add("hidden");

  try {
    const [count] = await Promise.all([loadFollowingCount()]);
    if (requestId !== listenersDirectoryReqId) return;
    if ($("listeners-count-following")) $("listeners-count-following").textContent = String(count);

    let users = [];
    if (activeListenersTab === "following") {
      users = await loadFollowProfiles(sessionUser.id, "following");
      if (cleanQuery) {
        users = users.filter((profile) => (profile.display_name || "").toLocaleLowerCase().includes(cleanQuery));
      }
      followingCountCache = Math.max(count, users.length);
      updateFollowingCountBadge();
    } else {
      users = await searchListeners(query);
    }

    if (requestId !== listenersDirectoryReqId) return;
    list.innerHTML = "";
    users.forEach((profile) => list.appendChild(createListenerCard(profile)));

    if (!users.length) {
      empty.textContent = activeListenersTab === "following"
        ? (cleanQuery ? "No followed listeners match this search." : "You're not following anyone yet.")
        : (cleanQuery ? "No listeners found matching that search." : "No listeners found yet.");
      empty.classList.remove("hidden");
    }
  } catch (error) {
    if (requestId !== listenersDirectoryReqId) return;
    console.error("Listeners directory error:", error);
    empty.textContent = "Couldn't load listeners right now. Please try again.";
    empty.classList.remove("hidden");
  }
}

function ensureFollowListDialog() {
  let overlay = $("follow-list-overlay");
  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.id = "follow-list-overlay";
  overlay.className = "follow-list-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <section class="follow-list-dialog" role="dialog" aria-modal="true" aria-labelledby="follow-list-title" tabindex="-1">
      <header class="follow-list-dialog-header">
        <div>
          <p class="eyebrow">Listener network</p>
          <h2 id="follow-list-title" class="section-heading">Followers</h2>
        </div>
        <button id="follow-list-close" class="follow-list-close" type="button" aria-label="Close">×</button>
      </header>
      <div id="follow-list-items" class="follow-list-items" aria-live="polite">
        <p class="meta-label">Loading...</p>
      </div>
    </section>
  `;
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeFollowListDialog();
  });
  $("follow-list-close").addEventListener("click", closeFollowListDialog);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && $("follow-list-overlay")?.classList.contains("is-open")) {
      closeFollowListDialog();
    }
  });
  return overlay;
}

function closeFollowListDialog() {
  const overlay = $("follow-list-overlay");
  if (!overlay) return;
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("follow-dialog-open");
}

async function openFollowList(profile, relation) {
  const requestId = ++followListReqId;
  const overlay = ensureFollowListDialog();
  const title = $("follow-list-title");
  const items = $("follow-list-items");
  const label = relation === "followers" ? "Followers" : "Following";

  title.textContent = `${profile.display_name}'s ${label}`;
  items.innerHTML = '<p class="meta-label">Loading listeners...</p>';
  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("follow-dialog-open");

  try {
    const profiles = await loadFollowProfiles(profile.user_id, relation);
    if (requestId !== followListReqId) return;
    items.innerHTML = "";

    if (!profiles.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = relation === "followers" ? "No followers yet." : "Not following anyone yet.";
      items.appendChild(empty);
      return;
    }

    profiles.forEach((person) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "follow-list-person";
      const avatar = document.createElement("div");
      avatar.className = "avatar-circle avatar-md";
      renderAvatar(avatar, person.avatar_url, person.display_name);
      const copy = document.createElement("span");
      copy.className = "follow-list-person-copy";
      copy.innerHTML = `<strong>${escapeHtml(person.display_name || "Listener")}</strong>${person.bio ? `<span>${escapeHtml(person.bio)}</span>` : ""}`;
      const arrow = document.createElement("span");
      arrow.className = "follow-list-person-arrow";
      arrow.textContent = "›";
      row.append(avatar, copy, arrow);
      row.addEventListener("click", () => {
        closeFollowListDialog();
        openPublicProfile(person, true, person.user_id === sessionUser.id);
      });
      items.appendChild(row);
    });
  } catch (error) {
    if (requestId !== followListReqId) return;
    console.error("Follow list error:", error);
    items.innerHTML = `<p class="empty-state">Could not load this list. Please try again.</p>`;
  }
}

async function shareListenerProfile(profile, triggerBtn) {
  const shareUrl = `${window.location.origin}${window.location.pathname}?listener=${encodeURIComponent(profile.user_id)}`;
  const label = triggerBtn?.querySelector(".btn-label") || triggerBtn?.querySelector("span");
  const originalLabel = label?.textContent || "Share";
  const showFeedback = (message) => {
    if (!label) return;
    label.textContent = message;
    window.setTimeout(() => { if (label.isConnected) label.textContent = originalLabel; }, 1800);
  };

  if (navigator.share) {
    try {
      await navigator.share({
        title: `${profile.display_name} · RECOMMENTATION STATION`,
        text: `Check out ${profile.display_name}'s music profile`,
        url: shareUrl
      });
      return;
    } catch (error) {
      // Dismissing the native share sheet is not an error and should not trigger a copy prompt.
      if (error?.name === "AbortError") return;
    }
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
    } else {
      const field = document.createElement("textarea");
      field.value = shareUrl;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      if (!copied) throw new Error("Clipboard unavailable");
    }
    showFeedback("Link copied");
  } catch (error) {
    console.warn("Clipboard unavailable; showing manual copy fallback:", error);
    window.prompt("Copy profile link:", shareUrl);
  }
}

async function openPublicProfile(profile, push = true, asOwnTab = false) {
  if (!sessionUser) return showAuthView("signin");
  if (push) pushRoute();

  const requestId = ++publicProfileReqId;
  activePublicProfile = profile;
  viewingOwnProfile = asOwnTab;
  const isMe = profile.user_id === sessionUser.id;
  currentRoute = { type: "public-profile", profile, asOwnTab };

  setActiveNav("listeners", asOwnTab ? "profile" : "listeners");
  $("listeners-directory").classList.add("hidden");
  $("public-profile-view").classList.remove("hidden");
  $("back-to-listeners-btn").classList.toggle("hidden", asOwnTab && viewHistory.length === 0);

  renderAvatar($("public-avatar"), profile.avatar_url, profile.display_name);
  $("public-name").textContent = profile.display_name;
  $("public-bio").textContent = profile.bio || "";
  $("public-bio").classList.toggle("hidden", !profile.bio);
  renderClickableGenrePills($("public-tastes"), profile.tastes || []);

  const artistsEl = $("public-artists");
  artistsEl.innerHTML = "";
  if (profile.favorite_artists?.length) {
    artistsEl.innerHTML = `<span class="meta-label">Favorite artists:</span>`;
    profile.favorite_artists.forEach((rawName) => {
      const name = formatDisplayNameCase(rawName);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "text-btn";
      btn.textContent = name;
      btn.addEventListener("click", () => openArtistDetail({ name }));
      artistsEl.appendChild(btn);
    });
    artistsEl.classList.remove("hidden");
  } else {
    artistsEl.classList.add("hidden");
  }

  const { statsEl, actionsEl } = ensurePublicProfileControls();
  if (statsEl) statsEl.innerHTML = '<span class="meta-label">Loading network...</span>';
  if (actionsEl) actionsEl.innerHTML = "";

  const [items, lists, followSummary] = await Promise.all([
    loadUserShelf(profile.user_id),
    loadUserLists(profile.user_id),
    loadFollowSummary(profile.user_id)
  ]);
  if (requestId !== publicProfileReqId) return;

  if (statsEl) {
    statsEl.innerHTML = `
      <button type="button" class="follow-stat-btn" data-follow-kind="followers" aria-label="View ${followSummary.followers} followers">
        <strong>${followSummary.followers}</strong><span>${followSummary.followers === 1 ? "follower" : "followers"}</span>
      </button>
      <button type="button" class="follow-stat-btn" data-follow-kind="following" aria-label="View ${followSummary.following} following">
        <strong>${followSummary.following}</strong><span>following</span>
      </button>
    `;
    statsEl.classList.toggle("hidden", !followSummary.available);
    statsEl.querySelectorAll("[data-follow-kind]").forEach((button) => {
      button.addEventListener("click", () => openFollowList(profile, button.dataset.followKind));
    });
  }

  if (actionsEl) {
    actionsEl.innerHTML = "";

    if (isMe) {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "taste-chip profile-action-btn";
      editBtn.innerHTML = `${ICON_EDIT_SVG}<span>Edit profile</span>`;
      editBtn.addEventListener("click", () => {
        pushRoute();
        showAuthView("edit");
      });
      actionsEl.appendChild(editBtn);
    } else if (followSummary.available) {
      let isFollowing = followSummary.isFollowing;
      let followerCount = followSummary.followers;
      const followBtn = document.createElement("button");
      followBtn.type = "button";
      followBtn.className = "taste-chip profile-action-btn";

      const syncFollowBtn = () => {
        followBtn.classList.toggle("selected", isFollowing);
        followBtn.innerHTML = isFollowing
          ? `${ICON_USER_CHECK_SVG}<span class="btn-label">Following</span>`
          : `${ICON_USER_PLUS_SVG}<span class="btn-label">Follow</span>`;
        const followerStat = statsEl?.querySelector('[data-follow-kind="followers"] strong');
        if (followerStat) followerStat.textContent = String(followerCount);
      };
      syncFollowBtn();

      followBtn.addEventListener("click", async () => {
        followBtn.disabled = true;
        try {
          isFollowing = await toggleFollowUser(profile.user_id, isFollowing);
          followerCount = Math.max(0, followerCount + (isFollowing ? 1 : -1));
          syncFollowBtn();
        } catch (error) {
          console.error("Follow toggle error:", error);
          followBtn.title = "Couldn't update follow status. Please try again.";
        } finally {
          followBtn.disabled = false;
        }
      });
      actionsEl.appendChild(followBtn);
    }

    const shareBtn = document.createElement("button");
    shareBtn.type = "button";
    shareBtn.className = "taste-chip profile-action-btn";
    shareBtn.setAttribute("aria-label", "Share profile link");
    shareBtn.title = "Share profile";
    shareBtn.innerHTML = `${ICON_SHARE_SVG}<span class="btn-label">Share</span>`;
    shareBtn.addEventListener("click", () => shareListenerProfile(profile, shareBtn));
    actionsEl.appendChild(shareBtn);
  }

  const topFive = Array.isArray(profile.top_five_albums) ? profile.top_five_albums.slice(0, 5) : [];
  const topGrid = $("public-top-five-grid");
  topGrid.innerHTML = "";
  $("public-top-five-section").classList.toggle("hidden", !topFive.length);
  topFive.forEach((alb) => {
    const slot = document.createElement("div");
    slot.className = "top-five-slot";
    slot.innerHTML = `
      <button class="top-five-cover clickable" type="button" aria-label="Open ${escapeHtml(alb.title)}">
        ${alb.cover_url ? `<img src="${escapeHtml(alb.cover_url)}" alt="${escapeHtml(alb.title)}" loading="lazy" />` : VINYL_PLACEHOLDER_SVG}
      </button>
      <span class="top-five-title">${escapeHtml(alb.title)}</span>
      <span class="top-five-artist">${escapeHtml(alb.artist)}</span>
    `;
    slot.querySelector("button").addEventListener("click", () => openAlbumDetail(alb));
    topGrid.appendChild(slot);
  });

  publicShelfItems = items;
  publicLists = lists;

  const annuals = publicLists
    .filter((l) => l.list_type === "annual")
    .sort((a, b) => (b.list_year || 0) - (a.list_year || 0));

  const badgesRow = $("public-annual-badges");
  if (badgesRow) {
    badgesRow.innerHTML = "";
    $("public-annual-lists")?.classList.toggle("hidden", !annuals.length);
    annuals.forEach((list) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "annual-badge-btn";
      btn.innerHTML = `
        ${ANNUAL_ICON_SVG}
        <span class="annual-badge-name">${escapeHtml(list.title)}</span>
        <span class="meta-label">${(list.albums || []).length}/10</span>
      `;
      btn.addEventListener("click", () => openListDetail(list.id, profile));
      badgesRow.appendChild(btn);
    });
  }

  activePublicShelfTab = "listened";
  renderPublicShelf();
}

function renderPublicShelf() {
  const canonicalPublicShelf = uniqueAlbumsByIdentity(publicShelfItems);
  const buckets = {
    listened: canonicalPublicShelf.filter((i) => i.listened),
    tbr: canonicalPublicShelf.filter((i) => isItemTbr(i)),
    want: canonicalPublicShelf.filter((i) => i.saved && !i.listened && !isItemTbr(i))
  };

  $("public-count-listened").textContent = buckets.listened.length;
  $("public-count-want").textContent = buckets.want.length;
  $("public-count-tbr").textContent = buckets.tbr.length;
  if ($("public-count-lists")) $("public-count-lists").textContent = publicLists.length;

  ["listened", "want", "tbr", "lists"].forEach((k) => {
    $(`public-tab-${k}`)?.classList.toggle("active", activePublicShelfTab === k);
  });

  const isLists = activePublicShelfTab === "lists";
  $("public-shelf-grid").classList.toggle("hidden", isLists);
  $("public-lists-grid")?.classList.toggle("hidden", !isLists);

  if (isLists) {
    document.querySelector(".public-shelf-toolbar")?.classList.add("hidden");
    const grid = $("public-lists-grid");
    grid.innerHTML = "";
    $("public-shelf-empty").classList.toggle("hidden", publicLists.length > 0);
    publicLists.forEach((list) => grid.appendChild(createListCard(list, activePublicProfile)));
    return;
  }

  const visible = sortShelfList(buckets[activePublicShelfTab] || [], activePublicShelfSort);
  const sortControl = $("public-shelf-sort-select");
  if (sortControl) sortControl.value = activePublicShelfSort;
  const sortWrap = document.querySelector(".public-shelf-toolbar");
  if (sortWrap) sortWrap.classList.remove("hidden");
  const grid = $("public-shelf-grid");
  grid.innerHTML = "";
  $("public-shelf-empty").classList.toggle("hidden", visible.length > 0);
  visible.forEach((item) => {
    // Quick actions on another listener's profile always update the signed-in listener's own shelf.
    const ownItem = shelfItems.find((saved) =>
      saved.album_id === item.album_id ||
      sameAlbumIdentity(saved, item) ||
      (saved.collectionId && item.collectionId && String(saved.collectionId) === String(item.collectionId))
    ) || null;
    grid.appendChild(createAlbumCard(item, { mode: "public", existing: ownItem }));
  });
}

// ------------------------------------------------------------
// Onboarding Search Handlers (Artists & Non-Single Top 5 Albums)
// ------------------------------------------------------------
const handleOnboardingArtistSearch = debounce(async () => {
  const term = $("artist-search-input").value.trim();
  const box = $("artist-search-results");
  if (term.length < 2) return box.classList.add("hidden");

  const results = await searchArtistsHybrid(term, 8);
  box.innerHTML = "";
  results.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "search-result-item clickable";
    btn.innerHTML = `<span class="search-item-text"><span class="search-item-title">${escapeHtml(item.name)}</span><span class="search-item-sub">${escapeHtml(item.genre || "Artist")}</span></span>`;
    btn.addEventListener("click", () => {
      if (!draftArtists.some((a) => a.toLowerCase() === item.name.toLowerCase())) {
        draftArtists.push(item.name);
        refreshArtistChips();
      }
      $("artist-search-input").value = "";
      box.classList.add("hidden");
    });
    box.appendChild(btn);
  });
  box.classList.toggle("hidden", !box.children.length);
}, 450);

const handleOnboardingAlbumSearch = debounce(async () => {
  const term = $("album-search-input").value.trim();
  const box = $("album-search-results");
  if (term.length < 2 || draftTopFive.length >= 5) return box.classList.add("hidden");

  const results = await searchNonSingleAlbums(term, 12);
  box.innerHTML = "";
  results.forEach((payload) => {
    const thumb = payload.thumb_url || payload.cover_url || "";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "search-result-item clickable";
    btn.innerHTML = `
      <div class="search-result-left">
        <img class="search-thumb" src="${escapeHtml(thumb)}" alt="" />
        <span class="search-item-text">
          <span class="search-item-title">${escapeHtml(payload.title)}</span>
          <span class="search-item-sub">${escapeHtml(payload.artist)}${payload.release_year ? ` · ${payload.release_year}` : ""}</span>
        </span>
      </div>`;
    btn.addEventListener("click", () => {
      if (draftTopFive.length < 5 && !draftTopFive.some((a) => a.album_id === payload.album_id)) {
        draftTopFive.push(payload);
        renderTopFiveEditor();
      }
      $("album-search-input").value = "";
      box.classList.add("hidden");
    });
    box.appendChild(btn);
  });
  box.classList.toggle("hidden", !box.children.length);
}, 450);

// ------------------------------------------------------------
// Event Listeners
// ------------------------------------------------------------
on("brand-home-btn", "click", () => sessionUser && userProfile?.tastes?.length && showStationView());
on("nav-station", "click", () => showStationView());
on("nav-shelf", "click", () => showShelfView());
on("nav-search", "click", () => showSearchView(lastSearchQuery));
on("nav-listeners", "click", () => showListenersView());
on("nav-profile", "click", () => openMyProfile());

on("mode-signin", "click", () => setAuthMode("signin"));
on("mode-signup", "click", () => setAuthMode("signup"));
on("cancel-auth-btn", "click", () => (viewHistory.length ? goBack() : openMyProfile()));
on("sign-out-btn", "click", async () => {
  stopPreview();
  await sb.auth.signOut();
  sessionUser = null;
  userProfile = null;
  followingCountCache = null;
  showAuthView("signin");
});

// Station triggers
["station-cover-btn", "album-title", "station-open-details-btn"].forEach((id) =>
  on(id, "click", openStationAlbumDetail)
);
on("album-artist", "click", () => currentAlbum && openArtistDetail({ artistId: currentAlbum.artistId, name: currentAlbum.artist }));

on("want-btn", "click", () => {
  const next = !(currentInteraction.saved && !currentInteraction.listened);
  saveStationInteraction({ saved: next, listened: next ? false : currentInteraction.listened });
});
on("listened-btn", "click", () => {
  const next = !currentInteraction.listened;
  saveStationInteraction({ listened: next, saved: next ? false : currentInteraction.saved });
});
on("personal-note-form", "submit", async (e) => {
  e.preventDefault();
  $("note-status").textContent = "Saving...";
  const hasShelf = currentInteraction.saved || currentInteraction.listened;
  await saveStationInteraction({ positive_note: $("personal-note-input").value.trim(), listened: hasShelf ? currentInteraction.listened : true });
  $("note-status").textContent = "Saved";
  renderNotes($("reviews-list"), $("review-source-note"), currentAlbum.reviews, await loadCommunityNotes(currentAlbum.id));
});


function bindReactionChoices(containerId, inputId, saveFn) {
  const container = $(containerId);
  if (!container) return;
  container.querySelectorAll("[data-reaction]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.dataset.reaction;
      const current = container.querySelector('[aria-pressed="true"]')?.dataset.reaction || null;
      const next = current === value ? null : value;
      syncReactionChoices(containerId, next);
      saveFn(next);
    });
  });
}

bindReactionChoices("station-reaction-choices", "personal-note-input", (reaction) => {
  currentInteraction.reaction = reaction;
});
bindReactionChoices("detail-reaction-choices", "detail-note-input", (reaction) => {
  activeDetailInteraction.reaction = reaction;
});

// Album & Artist Detail triggers
on("album-detail-back", "click", goBack);
on("artist-detail-back", "click", goBack);
on("detail-preview-btn", "click", () =>
  activePreviewTrack && !previewAudio.paused ? stopPreview() : defaultPreviewTrack && togglePreviewTrack(defaultPreviewTrack)
);
on("detail-album-artist-btn", "click", () =>
  activeDetailAlbum && openArtistDetail({ artistId: activeDetailAlbum.artistId, name: activeDetailAlbum.artist })
);

on("detail-want-btn", "click", () => {
  const isFuture = isFutureReleaseDate(activeDetailAlbum?.release_date, activeDetailAlbum?.release_year);
  if (isFuture) {
    const onTbr = isItemTbr(activeDetailInteraction);
    return saveDetailInteraction({ is_tbr: !onTbr, saved: !onTbr, listened: false });
  }
  const on = Boolean(activeDetailInteraction.saved && !activeDetailInteraction.listened && !isItemTbr(activeDetailInteraction));
  saveDetailInteraction({ saved: !on, listened: false, is_tbr: false });
});
on("detail-tbr-btn", "click", () => {
  const on = isItemTbr(activeDetailInteraction);
  saveDetailInteraction({ is_tbr: !on, saved: !on, listened: false });
});
on("detail-listened-btn", "click", () => {
  saveDetailInteraction({ listened: !activeDetailInteraction.listened, saved: false, is_tbr: false });
});
on("detail-topfive-btn", "click", async () => {
  if (!activeDetailAlbum || !userProfile) return;
  const current = Array.isArray(userProfile.top_five_albums) ? [...userProfile.top_five_albums] : [];
  const idx = current.findIndex((a) => a.album_id === activeDetailAlbum.album_id);

  if (idx >= 0) {
    current.splice(idx, 1);
  } else {
    if (current.length >= 5) {
      setIconBtnLabel("detail-topfive-btn", "Top 5 full (5/5)");
      setTimeout(renderDetailButtons, 1800);
      return;
    }
    current.push({
      album_id: activeDetailAlbum.album_id,
      collectionId: activeDetailAlbum.collectionId || null,
      artistId: activeDetailAlbum.artistId || null,
      title: activeDetailAlbum.title,
      artist: activeDetailAlbum.artist,
      cover_url: activeDetailAlbum.cover_url || "",
      release_year: activeDetailAlbum.release_year || ""
    });
  }

  await saveProfilePatch({
    top_five_albums: current,
    favorite_albums: current.map((a) => `${a.title} — ${a.artist}`)
  });
  renderDetailButtons();
});

on("detail-list-btn", "click", async () => {
  const box = $("detail-list-picker");
  if (!box) return;
  const opening = box.classList.contains("hidden");
  if (opening) {
    userLists = await loadUserLists(sessionUser.id);
    renderDetailListPicker();
  }
  box.classList.toggle("hidden", !opening);
});

on("detail-note-form", "submit", async (e) => {
  e.preventDefault();
  $("detail-note-status").textContent = "Saving...";
  const hasShelf = activeDetailInteraction.saved || activeDetailInteraction.listened || activeDetailInteraction.is_tbr;
  await saveDetailInteraction({
    positive_note: $("detail-note-input").value.trim(),
    reaction: activeDetailInteraction.reaction || null,
    listened: hasShelf ? activeDetailInteraction.listened : true
  });
  $("detail-note-status").textContent = "Saved";
  renderNotes($("detail-notes-list"), $("detail-notes-count"), activeDetailAlbum.reviews, await loadCommunityNotes(activeDetailAlbum.album_id));
});

on("detail-artist-fav-btn", "click", async () => {
  if (!activeDetailArtist || !userProfile) return;
  const favs = userProfile.favorite_artists || [];
  const exists = favs.some((a) => a.toLowerCase() === activeDetailArtist.name.toLowerCase());
  const next = exists ? favs.filter((a) => a.toLowerCase() !== activeDetailArtist.name.toLowerCase()) : [...favs, activeDetailArtist.name];
  await saveProfilePatch({ favorite_artists: next });
  updateFavArtistBtn();
});

// Profile Avatar & Form
on("name-input", "input", () => !draftAvatarUrl && updateAvatarPreview());
on("avatar-file-input", "change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    draftAvatarUrl = await processAvatarFile(file);
    updateAvatarPreview();
  } catch (err) {
    $("auth-feedback").textContent = err.message;
    $("auth-feedback").classList.remove("hidden");
  }
  e.target.value = "";
});
on("remove-avatar-btn", "click", () => { draftAvatarUrl = ""; updateAvatarPreview(); });

on("artist-search-input", "input", handleOnboardingArtistSearch);
on("album-search-input", "input", handleOnboardingAlbumSearch);
on("artist-search-input", "keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  handleOnboardingArtistSearch.cancel();
  const val = formatDisplayNameCase(e.target.value.trim());
  if (val && !draftArtists.some((a) => a.toLowerCase() === val.toLowerCase())) {
    draftArtists.push(val);
    refreshArtistChips();
  }
  e.target.value = "";
  $("artist-search-results").classList.add("hidden");
});

on("auth-form", "submit", async (e) => {
  e.preventDefault();
  const fb = $("auth-feedback");
  fb.classList.add("hidden");

  try {
    const profilePayload = () => {
      const display_name = $("name-input").value.trim();
      const tastes = Array.from($("taste-options").querySelectorAll(".taste-chip.selected")).map((c) => c.textContent);
      if (!display_name || !tastes.length) throw new Error("Please enter your name and pick at least one genre.");
      return {
        display_name,
        bio: $("bio-input").value.trim(),
        avatar_url: draftAvatarUrl,
        tastes,
        favorite_artists: draftArtists.map(formatDisplayNameCase),
        favorite_albums: draftTopFive.map((a) => `${a.title} — ${a.artist}`),
        top_five_albums: draftTopFive
      };
    };

    if (authMode === "edit") {
      await saveProfilePatch(profilePayload());
      return openMyProfile();
    }

    const email = $("email-input").value.trim();
    const password = $("password-input").value;

    if (authMode === "signup") {
      const draft = profilePayload();
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) throw error;
      if (data.user && data.session) {
        sessionUser = data.user;
        followingCountCache = null;
        userProfile = await upsertUserProfile({ user_id: data.user.id, ...draft });
        await handlePostLoginNavigation();
      } else {
        fb.textContent = "Check your inbox to confirm your email, then sign in.";
        fb.classList.remove("hidden");
      }
    } else {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      sessionUser = data.user;
      followingCountCache = null;
      userProfile = await loadUserProfile(data.user.id);
      await handlePostLoginNavigation();
    }
  } catch (err) {
    fb.textContent = err.message || "Authentication error.";
    fb.classList.remove("hidden");
  }
});

// Shelf, Search & Listeners
const handleShelfDropdown = debounce(() => {
  populateAlbumDropdown($("shelf-album-search").value.trim(), $("shelf-search-results"), () => {
    $("shelf-album-search").value = "";
    $("shelf-search-results").classList.add("hidden");
  });
}, 450);

const handleGlobalDropdown = debounce(() => {
  populateAlbumDropdown($("global-search-input").value.trim(), $("global-search-dropdown"), () =>
    $("global-search-dropdown").classList.add("hidden")
  );
}, 450);

on("shelf-album-search", "input", handleShelfDropdown);
on("shelf-album-search", "keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleShelfDropdown.cancel();
    const q = e.target.value.trim();
    $("shelf-search-results").classList.add("hidden");
    if (q) showSearchView(q, false);
  }
});

on("global-search-input", "input", handleGlobalDropdown);
on("global-search-form", "submit", (e) => {
  e.preventDefault();
  handleGlobalDropdown.cancel();
  const q = $("global-search-input").value.trim();
  if (q) runFullSearch(q);
});
on("user-search-input", "input", debounce(() => renderListenersDirectory($("user-search-input").value), 300));
on("listeners-tab-all", "click", () => {
  activeListenersTab = "all";
  renderListenersDirectory($("user-search-input").value);
});
on("listeners-tab-following", "click", () => {
  activeListenersTab = "following";
  renderListenersDirectory($("user-search-input").value);
});

document.addEventListener("click", (e) => {
  if (!e.target.closest("#artists-fieldset")) $("artist-search-results")?.classList.add("hidden");
  if (!e.target.closest("#albums-fieldset")) $("album-search-results")?.classList.add("hidden");
  if (!e.target.closest("#shelf-view .search-box")) $("shelf-search-results")?.classList.add("hidden");
  if (!e.target.closest("#global-search-form")) $("global-search-dropdown")?.classList.add("hidden");
  if (!e.target.closest("#detail-list-picker") && !e.target.closest("#detail-list-btn")) $("detail-list-picker")?.classList.add("hidden");
  if (!e.target.closest("#list-add-search-wrap")) $("list-search-results")?.classList.add("hidden");
});

["want", "tbr", "listened", "lists"].forEach((tab) => {
  on(`tab-${tab}`, "click", () => { activeShelfTab = tab; renderShelf(); });
  on(`public-tab-${tab}`, "click", () => { activePublicShelfTab = tab; renderPublicShelf(); });
});

if ($("shelf-sort-select")) $("shelf-sort-select").value = activeShelfSort;
on("public-shelf-sort-select", "change", () => {
  activePublicShelfSort = $("public-shelf-sort-select").value;
  renderPublicShelf();
});
on("shelf-sort-select", "change", () => {
  activeShelfSort = $("shelf-sort-select").value;
  try { localStorage.setItem(SHELF_SORT_KEY, activeShelfSort); } catch { /* ignore */ }
  renderShelf();
  if (activeShelfSort === "popularity") backfillPopularityIfNeeded();
});

on("search-sort-select", "change", () => {
  activeSearchSort = $("search-sort-select").value;
  if (lastSearchAlbums.length) renderSearchAlbumsGrid();
});

on("artist-sort-select", "change", () => {
  activeArtistSort = $("artist-sort-select").value;
  if (activeArtistLps.length || activeArtistEps.length) renderArtistReleases();
});

on("genre-detail-back", "click", goBack);
on("genre-sort-select", "change", () => {
  activeGenreSort = $("genre-sort-select").value;
  if (activeGenreAlbums.length) renderGenreAlbumsGrid();
});

// Mobile Shelf Column Toggle (Defaults cleanly to 2 columns)
function applyShelfMobileCols(cols) {
  const isTwo = cols === "2";
  const grid = $("shelf-grid");
  if (!grid) return;
  grid.classList.toggle("mobile-cols-2", isTwo);
  grid.classList.toggle("mobile-cols-1", !isTwo);
  if ($("shelf-grid-toggle")) $("shelf-grid-toggle").textContent = isTwo ? "1 col" : "2 cols";
  try { localStorage.setItem(SHELF_COLS_KEY, isTwo ? "2" : "1"); } catch { /* ignore */ }
}

applyShelfMobileCols(localStorage.getItem(SHELF_COLS_KEY) === "1" ? "1" : "2");
on("shelf-grid-toggle", "click", () => {
  const isTwo = $("shelf-grid").classList.contains("mobile-cols-2");
  applyShelfMobileCols(isTwo ? "1" : "2");
});

// TBR Manual Entry
on("tbr-toggle-form-btn", "click", () => {
  $("tbr-manual-form").classList.toggle("hidden");
  if (!$("tbr-manual-form").classList.contains("hidden")) $("tbr-title-input").focus();
});
on("tbr-cancel-btn", "click", () => {
  $("tbr-manual-form").classList.add("hidden");
  $("tbr-manual-form").reset();
});
on("tbr-manual-form", "submit", async (e) => {
  e.preventDefault();
  const title = $("tbr-title-input").value.trim();
  const artist = $("tbr-artist-input").value.trim();
  const release_date = $("tbr-date-input").value || null;
  if (!title || !artist) return;

  const slug = `${artist}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  await upsertAlbumOnShelf({
    album_id: `tbr-${slug}-${Date.now()}`,
    title,
    artist,
    cover_url: "",
    release_year: release_date ? release_date.slice(0, 4) : "",
    release_date,
    saved: true,
    listened: false,
    is_tbr: true
  });
  e.target.reset();
  e.target.classList.add("hidden");
  shelfItems = await loadUserShelf(sessionUser.id);
  renderShelf();
});

// Lists: Create, Delete & Add Albums
on("new-list-toggle-btn", "click", () => {
  $("new-list-form").classList.toggle("hidden");
  if (!$("new-list-form").classList.contains("hidden")) $("new-list-title").focus();
});
on("new-list-cancel-btn", "click", () => {
  $("new-list-form").classList.add("hidden");
  $("new-list-form").reset();
});
on("new-list-form", "submit", async (e) => {
  e.preventDefault();
  const title = $("new-list-title").value.trim();
  const description = $("new-list-desc").value.trim();
  if (!title) return;
  const created = await createUserList({ title, description });
  e.target.reset();
  e.target.classList.add("hidden");
  renderShelf();
  openListDetail(created.id, null);
});

on("list-detail-back", "click", goBack);
on("list-delete-btn", "click", async () => {
  if (!activeDetailList) return;
  if (!confirm(`Delete "${activeDetailList.title}"?`)) return;
  await deleteUserList(activeDetailList.id);
  showShelfView(false);
});

const handleListAlbumSearch = debounce(async () => {
  const term = $("list-album-search").value.trim();
  const box = $("list-search-results");
  if (term.length < 2 || !activeDetailList) return box.classList.add("hidden");

  const results = await searchNonSingleAlbums(term, 10);
  box.innerHTML = "";
  const existingAlbums = Array.isArray(activeDetailList.albums) ? activeDetailList.albums : [];

  results.forEach((payload) => {
    const alreadyIn = existingAlbums.some((a) => a.album_id === payload.album_id);
    const thumb = payload.thumb_url || payload.cover_url || "";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "search-result-item clickable";
    btn.innerHTML = `
      <div class="search-result-left">
        <img class="search-thumb" src="${escapeHtml(thumb)}" alt="" />
        <span class="search-item-text">
          <span class="search-item-title">${escapeHtml(payload.title)}</span>
          <span class="search-item-sub">${escapeHtml(payload.artist)}${payload.release_year ? ` · ${payload.release_year}` : ""}</span>
        </span>
      </div>
      <span class="meta-label">${alreadyIn ? "Added" : "+ Add"}</span>
    `;
    btn.addEventListener("click", async () => {
      if (alreadyIn) return;
      const isAnnual = activeDetailList.list_type === "annual";
      if (isAnnual && existingAlbums.length >= 10) return;
      const next = [...existingAlbums, payload];
      await updateListAlbums(activeDetailList.id, next);
      $("list-album-search").value = "";
      box.classList.add("hidden");
      openListDetail(activeDetailList.id, null, false);
    });
    box.appendChild(btn);
  });
  box.classList.toggle("hidden", !box.children.length);
}, 450);

on("list-album-search", "input", handleListAlbumSearch);

on("back-to-listeners-btn", "click", () => {
  if (viewHistory.length) return goBack();
  $("public-profile-view").classList.add("hidden");
  $("listeners-directory").classList.remove("hidden");
});

// ------------------------------------------------------------
// Boot & Shared Profile Deep Link (?listener=UUID)
// ------------------------------------------------------------
async function handlePostLoginNavigation() {
  if (pendingListenerParam) {
    const targetId = pendingListenerParam;
    pendingListenerParam = null;
    const sharedProfile = await loadUserProfile(targetId);
    if (sharedProfile) {
      return openPublicProfile(sharedProfile, false, sharedProfile.user_id === sessionUser.id);
    }
  }
  showStationView();
}

window.addEventListener("resize", relocateMainNavForViewport, { passive: true });
window.addEventListener("orientationchange", relocateMainNavForViewport, { passive: true });
relocateMainNavForViewport();

(async function init() {
  injectCompatStyles();
  ensureHomeDiscoveryContainers();
  $("current-date-label").textContent = formatDisplayDate(getActiveDate());
  try {
    const { data } = await sb.auth.getSession();
    if (data?.session?.user) {
      sessionUser = data.session.user;
      followingCountCache = null;
      userProfile = await loadUserProfile(sessionUser.id);
      await handlePostLoginNavigation();
    } else {
      showAuthView("signin");
    }
  } catch (err) {
    console.error("Init error:", err);
    showAuthView("signin");
  }
})();