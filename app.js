const SUPABASE_URL = "https://kenilapjkhfgyyyqfcog.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vCjojbNSbAWFeXXacnxYJA_M0PxLvKI";

const COVER_CACHE_KEY = "recommentation_station_covers_v1";
const THEME_KEY = "recommentation_station_theme_v1";
const PREVIEW_MAX_SECONDS = 15;

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// App State
let sessionUser = null;
let userProfile = null;
let currentView = "station";
let currentRouteState = { type: "station" };
let viewHistory = [];
let authMode = "signin";
let dayOffset = 0;

let currentAlbum = null;
let currentAlbumCoverUrl = "";
let currentInteraction = { saved: false, listened: false, positive_note: "" };

let shelfItems = [];
let activeShelfTab = "want";

let lastSearchQuery = "";

let publicProfileCurrent = null;
let publicShelfItems = [];
let activePublicShelfTab = "listened";

// Detail Views State
let activeDetailAlbum = null;
let activeDetailInteraction = { saved: false, listened: false, positive_note: "" };
let detailRequestId = 0;
let defaultPreviewTrack = null;

let activeDetailArtist = null;
let artistRequestId = 0;

// Shared Audio Preview Controller
const previewAudio = new Audio();
let activePreviewTrack = null; // { trackId, trackName, previewUrl }

// Profile Form Draft State
let draftArtists = [];
let draftAlbums = [];
let draftAvatarUrl = "";

// Cover URL Cache
let coverCache = {};
try {
  coverCache = JSON.parse(localStorage.getItem(COVER_CACHE_KEY) || "{}");
} catch {
  coverCache = {};
}

// DOM References
const mainNav = document.getElementById("main-nav");
const navStation = document.getElementById("nav-station");
const navShelf = document.getElementById("nav-shelf");
const navSearch = document.getElementById("nav-search");
const navListeners = document.getElementById("nav-listeners");
const navProfile = document.getElementById("nav-profile");
const brandHomeBtn = document.getElementById("brand-home-btn");
const themeToggleBtn = document.getElementById("theme-toggle-btn");
const signOutBtn = document.getElementById("sign-out-btn");
const currentDateLabel = document.getElementById("current-date-label");
const devDayControls = document.getElementById("dev-day-controls");

// Views
const authView = document.getElementById("auth-view");
const stationView = document.getElementById("station-view");
const shelfView = document.getElementById("shelf-view");
const searchView = document.getElementById("search-view");
const listenersView = document.getElementById("listeners-view");
const albumDetailView = document.getElementById("album-detail-view");
const artistDetailView = document.getElementById("artist-detail-view");

// Auth / Profile Elements
const authEyebrow = document.getElementById("auth-eyebrow");
const authHeading = document.getElementById("auth-heading");
const authCopy = document.getElementById("auth-copy");
const authModeSwitch = document.getElementById("auth-mode-switch");
const modeSigninBtn = document.getElementById("mode-signin");
const modeSignupBtn = document.getElementById("mode-signup");
const authForm = document.getElementById("auth-form");

const avatarField = document.getElementById("avatar-field");
const avatarPreview = document.getElementById("avatar-preview");
const avatarFileInput = document.getElementById("avatar-file-input");
const removeAvatarBtn = document.getElementById("remove-avatar-btn");

const nameField = document.getElementById("name-field");
const nameInput = document.getElementById("name-input");
const bioField = document.getElementById("bio-field");
const bioInput = document.getElementById("bio-input");
const emailField = document.getElementById("email-field");
const emailInput = document.getElementById("email-input");
const passwordField = document.getElementById("password-field");
const passwordInput = document.getElementById("password-input");

const tastesFieldset = document.getElementById("tastes-fieldset");
const tasteOptionsContainer = document.getElementById("taste-options");
const artistsFieldset = document.getElementById("artists-fieldset");
const artistSearchInput = document.getElementById("artist-search-input");
const artistSearchResults = document.getElementById("artist-search-results");
const selectedArtistsContainer = document.getElementById("selected-artists");
const albumsFieldset = document.getElementById("albums-fieldset");
const albumSearchInput = document.getElementById("album-search-input");
const albumSearchResults = document.getElementById("album-search-results");
const selectedAlbumsContainer = document.getElementById("selected-albums");

const authFeedback = document.getElementById("auth-feedback");
const authSubmitBtn = document.getElementById("auth-submit-btn");
const cancelAuthBtn = document.getElementById("cancel-auth-btn");

// Station Elements
const stationCoverBtn = document.getElementById("station-cover-btn");
const stationOpenDetailsBtn = document.getElementById("station-open-details-btn");
const stationArtistBtn = document.getElementById("album-artist");
const stationTitleEl = document.getElementById("album-title");
const wantBtn = document.getElementById("want-btn");
const listenedBtn = document.getElementById("listened-btn");
const personalNoteForm = document.getElementById("personal-note-form");
const personalNoteInput = document.getElementById("personal-note-input");
const noteStatus = document.getElementById("note-status");

// Shelf Elements
const shelfAlbumSearch = document.getElementById("shelf-album-search");
const shelfSearchResults = document.getElementById("shelf-search-results");
const tabWant = document.getElementById("tab-want");
const tabListened = document.getElementById("tab-listened");
const countWant = document.getElementById("count-want");
const countListened = document.getElementById("count-listened");
const shelfGrid = document.getElementById("shelf-grid");
const shelfEmptyState = document.getElementById("shelf-empty-state");

// Search Results Page Elements
const globalSearchForm = document.getElementById("global-search-form");
const globalSearchInput = document.getElementById("global-search-input");
const globalSearchDropdown = document.getElementById("global-search-dropdown");
const searchResultsStatus = document.getElementById("search-results-status");
const searchArtistsSection = document.getElementById("search-artists-section");
const searchArtistsList = document.getElementById("search-artists-list");
const searchAlbumsSection = document.getElementById("search-albums-section");
const searchAlbumsGrid = document.getElementById("search-albums-grid");
const searchListenersSection = document.getElementById("search-listeners-section");
const searchListenersList = document.getElementById("search-listeners-list");
const searchEmptyState = document.getElementById("search-empty-state");

// Listeners Elements
const listenersDirectory = document.getElementById("listeners-directory");
const userSearchInput = document.getElementById("user-search-input");
const listenersList = document.getElementById("listeners-list");
const listenersEmpty = document.getElementById("listeners-empty");
const publicProfileView = document.getElementById("public-profile-view");
const backToListenersBtn = document.getElementById("back-to-listeners-btn");
const publicTabListened = document.getElementById("public-tab-listened");
const publicTabWant = document.getElementById("public-tab-want");
const publicCountListened = document.getElementById("public-count-listened");
const publicCountWant = document.getElementById("public-count-want");
const publicShelfGrid = document.getElementById("public-shelf-grid");
const publicShelfEmpty = document.getElementById("public-shelf-empty");

// Album Detail Elements
const albumDetailBack = document.getElementById("album-detail-back");
const detailAlbumCover = document.getElementById("detail-album-cover");
const detailAlbumYear = document.getElementById("detail-album-year");
const detailAlbumRuntime = document.getElementById("detail-album-runtime");
const detailAlbumGenre = document.getElementById("detail-album-genre");
const detailWantBtn = document.getElementById("detail-want-btn");
const detailListenedBtn = document.getElementById("detail-listened-btn");
const detailPreviewWrap = document.getElementById("detail-preview-wrap");
const detailPreviewBtn = document.getElementById("detail-preview-btn");
const detailPreviewIcon = document.getElementById("detail-preview-icon");
const detailPreviewText = document.getElementById("detail-preview-text");
const detailAlbumLabel = document.getElementById("detail-album-label");
const detailAlbumArtistBtn = document.getElementById("detail-album-artist-btn");
const detailAlbumTitle = document.getElementById("detail-album-title");
const detailAlbumSynopsis = document.getElementById("detail-album-synopsis");
const detailTracklistCount = document.getElementById("detail-tracklist-count");
const detailTracklist = document.getElementById("detail-tracklist");
const detailNotesCount = document.getElementById("detail-notes-count");
const detailNotesList = document.getElementById("detail-notes-list");
const detailNoteForm = document.getElementById("detail-note-form");
const detailNoteInput = document.getElementById("detail-note-input");
const detailNoteStatus = document.getElementById("detail-note-status");

// Artist Detail Elements
const artistDetailBack = document.getElementById("artist-detail-back");
const detailArtistGenre = document.getElementById("detail-artist-genre");
const detailArtistName = document.getElementById("detail-artist-name");
const detailArtistFavBtn = document.getElementById("detail-artist-fav-btn");
const artistLpsSection = document.getElementById("artist-lps-section");
const artistLpsCount = document.getElementById("artist-lps-count");
const artistLpsGrid = document.getElementById("artist-lps-grid");
const artistEpsSection = document.getElementById("artist-eps-section");
const artistEpsCount = document.getElementById("artist-eps-count");
const artistEpsGrid = document.getElementById("artist-eps-grid");
const detailArtistStatus = document.getElementById("detail-artist-status");
const detailArtistEmpty = document.getElementById("detail-artist-empty");

// ------------------------------------------------------------
// Theme Management (Dark by default)
// ------------------------------------------------------------
function applyTheme(theme) {
  const isLight = theme === "light";
  if (isLight) {
    document.documentElement.setAttribute("data-theme", "light");
    themeToggleBtn.textContent = "Dark";
  } else {
    document.documentElement.removeAttribute("data-theme");
    themeToggleBtn.textContent = "Light";
  }
  try {
    localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
  } catch {
    // Ignore storage errors
  }
}

(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved === "light" ? "light" : "dark");
})();

themeToggleBtn.addEventListener("click", () => {
  const isCurrentlyLight = document.documentElement.getAttribute("data-theme") === "light";
  applyTheme(isCurrentlyLight ? "dark" : "light");
});

// ------------------------------------------------------------
// Audio Preview Engine (15s clip with gentle fade-out)
// ------------------------------------------------------------
function updatePreviewUI() {
  const isPlaying = Boolean(activePreviewTrack && !previewAudio.paused);
  const displayTrack = activePreviewTrack || defaultPreviewTrack;

  if (!displayTrack) {
    detailPreviewWrap.classList.add("hidden");
    return;
  }

  detailPreviewWrap.classList.remove("hidden");
  detailPreviewBtn.classList.toggle("playing", isPlaying);
  detailPreviewIcon.textContent = isPlaying ? "■" : "▶";
  detailPreviewText.textContent = isPlaying
    ? `Playing · ${displayTrack.trackName}`
    : `Preview · ${displayTrack.trackName}`;

  // Sync active highlight inside the compact tracklist
  detailTracklist.querySelectorAll(".track-row").forEach((row) => {
    const isRowPlaying =
      isPlaying && String(row.dataset.trackId) === String(activePreviewTrack.trackId);
    row.classList.toggle("is-playing", isRowPlaying);
    const numEl = row.querySelector(".track-num");
    if (numEl) {
      numEl.textContent = isRowPlaying ? "▶" : row.dataset.trackNum;
    }
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

  const isSamePlaying =
    activePreviewTrack &&
    String(activePreviewTrack.trackId) === String(track.trackId) &&
    !previewAudio.paused;

  if (isSamePlaying) {
    stopPreview();
    return;
  }

  previewAudio.pause();
  previewAudio.src = track.previewUrl;
  previewAudio.currentTime = 0;
  previewAudio.volume = 1;
  activePreviewTrack = track;

  previewAudio
    .play()
    .then(() => updatePreviewUI())
    .catch((err) => {
      console.error("Preview playback error:", err);
      stopPreview();
    });
}

previewAudio.addEventListener("timeupdate", () => {
  if (!activePreviewTrack || previewAudio.paused) return;
  const t = previewAudio.currentTime;

  if (t >= PREVIEW_MAX_SECONDS) {
    stopPreview();
    return;
  }

  // Gentle fade-out during the last 1.5 seconds
  if (t >= PREVIEW_MAX_SECONDS - 1.5) {
    const remaining = Math.max(0, PREVIEW_MAX_SECONDS - t);
    previewAudio.volume = Math.min(1, remaining / 1.5);
  }
});

previewAudio.addEventListener("ended", stopPreview);

// ------------------------------------------------------------
// Utilities
// ------------------------------------------------------------
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function debounce(fn, delay = 280) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function formatDuration(ms) {
  if (!ms || Number.isNaN(ms)) return "";
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function classifyRelease(item) {
  const name = (item.collectionName || "").trim();
  const count = Number(item.trackCount || 0);

  if (/\s*[-–]\s*Single$/i.test(name) || /\(Single\)$/i.test(name)) {
    return "single";
  }
  if (/\s*[-–]\s*EP$/i.test(name) || /\(EP\)$/i.test(name) || /\bEP$/i.test(name)) {
    return "ep";
  }
  if (count > 0 && count <= 2) {
    return "single";
  }
  if (count >= 3 && count <= 4) {
    return "ep";
  }
  return "lp";
}

function renderAvatar(el, avatarUrl, name) {
  if (avatarUrl) {
    el.innerHTML = `<img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(name || "Avatar")}" />`;
  } else {
    const initial = (name || "?").trim().charAt(0).toUpperCase();
    el.textContent = initial || "?";
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
        const ctx = canvas.getContext("2d");

        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// ------------------------------------------------------------
// iTunes Search & Lookup API (Fetch + JSONP Fallback)
// ------------------------------------------------------------
function fetchItunesJsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `itunesCb_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const script = document.createElement("script");
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("iTunes JSONP timeout"));
    }, 6000);

    function cleanup() {
      clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    const sep = url.includes("?") ? "&" : "?";
    script.src = `${url}${sep}callback=${callbackName}`;
    script.onerror = () => {
      cleanup();
      reject(new Error("iTunes JSONP error"));
    };
    document.body.appendChild(script);
  });
}

async function fetchItunesRaw(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Fetch failed");
    const data = await res.json();
    return data.results || [];
  } catch {
    try {
      const data = await fetchItunesJsonp(url);
      return data.results || [];
    } catch {
      return [];
    }
  }
}

async function queryItunes(term, entity, limit = 6) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=${entity}&limit=${limit}`;
  return fetchItunesRaw(url);
}

async function lookupItunes(id, entity, limit = 50) {
  const url = `https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}&entity=${entity}&limit=${limit}`;
  return fetchItunesRaw(url);
}

function toHighResCover(artworkUrl100) {
  if (!artworkUrl100) return "";
  return artworkUrl100.replace(/100x100bb/i, "800x800bb");
}

async function resolveAlbumCover(album) {
  if (coverCache[album.id]) return coverCache[album.id];

  const query = album.coverQuery || `${album.artist} ${album.title}`;
  const results = await queryItunes(query, "album", 3);
  const match =
    results.find((r) =>
      r.collectionName?.toLowerCase().includes(album.title.toLowerCase().slice(0, 8))
    ) || results[0];

  const highRes = match ? toHighResCover(match.artworkUrl100) : "";
  if (highRes) {
    coverCache[album.id] = highRes;
    try {
      localStorage.setItem(COVER_CACHE_KEY, JSON.stringify(coverCache));
    } catch {
      // Ignore quota errors
    }
  }
  return highRes;
}

// ------------------------------------------------------------
// Date & Daily Recommendation Engine
// ------------------------------------------------------------
function getActiveDate() {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return date;
}

function getDateSeed(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function formatDisplayDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function normalizeItemForDisplay(rawItem) {
  const positiveReviews = (rawItem.reviews || [])
    .filter((rev) => rev.sentiment === "positive" && rev.text)
    .map(({ author, source, text }) => ({ author, source, text }));
  return { ...rawItem, reviews: positiveReviews };
}

function getDailyRecommendation(profile, date) {
  const allAlbums = CATALOG_ITEMS.filter((item) => item.mediaType === "album");
  const tastes = profile?.tastes || [];
  const favAlbumsLower = (profile?.favorite_albums || []).map((a) => a.toLowerCase());

  const freshAlbums = allAlbums.filter(
    (album) => !favAlbumsLower.some((fav) => fav.includes(album.title.toLowerCase()))
  );
  const candidatePool = freshAlbums.length > 0 ? freshAlbums : allAlbums;

  const matchedPool = candidatePool.filter((album) =>
    album.tags.some((tag) => tastes.includes(tag))
  );
  const pool = matchedPool.length > 0 ? matchedPool : candidatePool;

  const seed = `${profile.user_id}|${getDateSeed(date)}`;
  const index = hashString(seed) % pool.length;
  return normalizeItemForDisplay(pool[index]);
}

// ------------------------------------------------------------
// Supabase Data Layer
// ------------------------------------------------------------
async function loadUserProfile(userId) {
  const { data, error } = await sb
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error loading profile:", error);
    return null;
  }
  return data;
}

async function upsertUserProfile(payload) {
  const { data, error } = await sb
    .from("user_profiles")
    .upsert(
      {
        ...payload,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function loadInteraction(userId, albumId) {
  const { data, error } = await sb
    .from("user_album_interactions")
    .select("*")
    .eq("user_id", userId)
    .eq("album_id", albumId)
    .maybeSingle();

  if (error) {
    console.error("Error loading interaction:", error);
    return { saved: false, listened: false, positive_note: "" };
  }
  return data || { saved: false, listened: false, positive_note: "" };
}

async function loadCommunityNotes(albumId) {
  const { data, error } = await sb
    .from("user_album_interactions")
    .select("user_id, positive_note")
    .eq("album_id", albumId)
    .not("positive_note", "is", null);

  if (error || !data?.length) return [];

  const nonEmpty = data.filter((row) => row.positive_note && row.positive_note.trim());
  if (!nonEmpty.length) return [];

  const userIds = [...new Set(nonEmpty.map((r) => r.user_id))];
  const { data: profiles } = await sb
    .from("user_profiles")
    .select("user_id, display_name")
    .in("user_id", userIds);

  const nameMap = {};
  (profiles || []).forEach((p) => {
    nameMap[p.user_id] = p.display_name;
  });

  return nonEmpty.map((row) => ({
    author: nameMap[row.user_id] || "Listener",
    source: row.user_id === sessionUser?.id ? "Your Note" : "Station Listener",
    text: row.positive_note.trim()
  }));
}

async function upsertAlbumOnShelf(albumData) {
  const { data, error } = await sb
    .from("user_album_interactions")
    .upsert(
      {
        user_id: sessionUser.id,
        album_id: albumData.album_id,
        title: albumData.title || null,
        artist: albumData.artist || null,
        cover_url: albumData.cover_url || null,
        release_year: albumData.release_year ? String(albumData.release_year) : null,
        saved: Boolean(albumData.saved),
        listened: Boolean(albumData.listened),
        positive_note: albumData.positive_note ?? null,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id,album_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteAlbumFromShelf(albumId) {
  const { error } = await sb
    .from("user_album_interactions")
    .delete()
    .eq("user_id", sessionUser.id)
    .eq("album_id", albumId);

  if (error) throw error;
}

async function loadUserShelf(userId) {
  const { data, error } = await sb
    .from("user_album_interactions")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error loading shelf:", error);
    return [];
  }

  return (data || []).map((row) => {
    if (!row.title) {
      const cat = CATALOG_ITEMS.find((c) => c.id === row.album_id);
      if (cat) {
        return {
          ...row,
          title: cat.title,
          artist: cat.artist,
          release_year: String(cat.year),
          cover_url: row.cover_url || coverCache[cat.id] || ""
        };
      }
    }
    return row;
  });
}

async function searchListeners(query = "") {
  let req = sb
    .from("user_profiles")
    .select("user_id, display_name, bio, avatar_url, tastes, favorite_artists")
    .order("updated_at", { ascending: false })
    .limit(24);

  if (query.trim()) {
    req = req.ilike("display_name", `%${query.trim()}%`);
  }

  const { data, error } = await req;
  if (error) {
    console.error("Error searching listeners:", error);
    return [];
  }
  return data || [];
}

// ------------------------------------------------------------
// View Router & History Stack
// ------------------------------------------------------------
function setActiveNav(view) {
  stopPreview();
  currentView = view;
  const isAuthedWithProfile = Boolean(sessionUser && userProfile?.tastes?.length);

  mainNav.classList.toggle("hidden", !isAuthedWithProfile);
  signOutBtn.classList.toggle("hidden", !sessionUser);
  devDayControls.classList.toggle("hidden", view !== "station" || !isAuthedWithProfile);

  navStation.classList.toggle("active", view === "station");
  navShelf.classList.toggle("active", view === "shelf");
  navSearch.classList.toggle("active", view === "search");
  navListeners.classList.toggle("active", view === "listeners");
  navProfile.classList.toggle("active", view === "profile");

  authView.classList.toggle("hidden", view !== "auth" && view !== "profile");
  stationView.classList.toggle("hidden", view !== "station");
  shelfView.classList.toggle("hidden", view !== "shelf");
  searchView.classList.toggle("hidden", view !== "search");
  listenersView.classList.toggle("hidden", view !== "listeners");
  albumDetailView.classList.toggle("hidden", view !== "album-detail");
  artistDetailView.classList.toggle("hidden", view !== "artist-detail");

  window.scrollTo(0, 0);
}

function pushCurrentRouteToHistory() {
  if (currentRouteState) {
    viewHistory.push(currentRouteState);
    if (viewHistory.length > 25) viewHistory.shift();
  }
}

function goBack() {
  const prev = viewHistory.pop();
  if (!prev) {
    showStationView(false);
    return;
  }
  switch (prev.type) {
    case "station":
      showStationView(false);
      break;
    case "shelf":
      showShelfView(false);
      break;
    case "search":
      showSearchView(prev.query || "", false);
      break;
    case "listeners":
      showListenersView(false);
      break;
    case "public-profile":
      setActiveNav("listeners");
      currentRouteState = prev;
      openPublicProfile(prev.profile, false);
      break;
    case "album-detail":
      openAlbumDetail(prev.album, false);
      break;
    case "artist-detail":
      openArtistDetail(prev.artist, false);
      break;
    default:
      showStationView(false);
  }
}

// ------------------------------------------------------------
// Auth & Profile Editor
// ------------------------------------------------------------
function renderTasteSelector(selectedTastes = []) {
  tasteOptionsContainer.innerHTML = "";
  AVAILABLE_TASTES.forEach((taste) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "taste-chip";
    btn.textContent = taste;
    if (selectedTastes.includes(taste)) {
      btn.classList.add("selected");
    }
    btn.addEventListener("click", () => btn.classList.toggle("selected"));
    tasteOptionsContainer.appendChild(btn);
  });
}

function renderRemovableChips(container, items, onRemove) {
  container.innerHTML = "";
  items.forEach((label) => {
    const chip = document.createElement("span");
    chip.className = "removable-chip";
    chip.innerHTML = `<span>${escapeHtml(label)}</span>`;
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.setAttribute("aria-label", `Remove ${label}`);
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => onRemove(label));
    chip.appendChild(removeBtn);
    container.appendChild(chip);
  });
}

function refreshArtistChips() {
  renderRemovableChips(selectedArtistsContainer, draftArtists, (item) => {
    draftArtists = draftArtists.filter((a) => a !== item);
    refreshArtistChips();
  });
}

function refreshAlbumChips() {
  renderRemovableChips(selectedAlbumsContainer, draftAlbums, (item) => {
    draftAlbums = draftAlbums.filter((a) => a !== item);
    refreshAlbumChips();
  });
}

function updateAvatarPreview() {
  renderAvatar(avatarPreview, draftAvatarUrl, nameInput.value || userProfile?.display_name || "?");
  removeAvatarBtn.classList.toggle("hidden", !draftAvatarUrl);
}

function setAuthMode(mode) {
  authMode = mode;
  authFeedback.classList.add("hidden");
  authFeedback.textContent = "";

  const isEdit = mode === "edit";
  const isSignup = mode === "signup";
  const showProfileFields = isSignup || isEdit;

  if (isEdit) {
    authEyebrow.textContent = "Listener Profile";
    authHeading.innerHTML = `Edit your <span class="editorial-accent">profile</span>.`;
    authCopy.textContent = "Update your photo, bio, musical tastes, and favorite references.";
  } else {
    authEyebrow.textContent = "Station Access";
    authHeading.innerHTML = `Tune your daily <span class="editorial-accent">selection</span>.`;
    authCopy.textContent =
      "One album a day, matched to what you gravitate toward. No scores, no star ratings—just music and notes from listeners who loved it.";
  }

  authModeSwitch.classList.toggle("hidden", isEdit);
  modeSigninBtn.classList.toggle("active", mode === "signin");
  modeSignupBtn.classList.toggle("active", mode === "signup");

  avatarField.classList.toggle("hidden", !showProfileFields);
  nameField.classList.toggle("hidden", !showProfileFields);
  nameInput.required = showProfileFields;
  bioField.classList.toggle("hidden", !showProfileFields);

  emailField.classList.toggle("hidden", isEdit);
  emailInput.required = !isEdit;

  passwordField.classList.toggle("hidden", isEdit);
  passwordInput.required = !isEdit;

  tastesFieldset.classList.toggle("hidden", !showProfileFields);
  artistsFieldset.classList.toggle("hidden", !showProfileFields);
  albumsFieldset.classList.toggle("hidden", !showProfileFields);
  cancelAuthBtn.classList.toggle("hidden", !(isEdit && userProfile?.tastes?.length));

  if (isEdit && userProfile) {
    nameInput.value = userProfile.display_name || "";
    bioInput.value = userProfile.bio || "";
    draftAvatarUrl = userProfile.avatar_url || "";
    renderTasteSelector(userProfile.tastes || []);
    draftArtists = [...(userProfile.favorite_artists || [])];
    draftAlbums = [...(userProfile.favorite_albums || [])];
    refreshArtistChips();
    refreshAlbumChips();
    updateAvatarPreview();
    authSubmitBtn.textContent = "Save profile";
  } else if (isSignup) {
    nameInput.value = "";
    bioInput.value = "";
    draftAvatarUrl = "";
    renderTasteSelector([]);
    draftArtists = [];
    draftAlbums = [];
    refreshArtistChips();
    refreshAlbumChips();
    updateAvatarPreview();
    authSubmitBtn.textContent = "Create account";
  } else {
    authSubmitBtn.textContent = "Sign in";
  }
}

function showAuthView(mode = "signin") {
  viewHistory = [];
  currentRouteState = { type: mode === "edit" ? "profile" : "auth" };
  setActiveNav(mode === "edit" ? "profile" : "auth");
  setAuthMode(mode);
}

// ------------------------------------------------------------
// Station View (Daily Recommendation)
// ------------------------------------------------------------
function renderStationInteractionButtons() {
  wantBtn.classList.toggle("selected", Boolean(currentInteraction.saved));
  listenedBtn.classList.toggle("selected", Boolean(currentInteraction.listened));
  personalNoteInput.value = currentInteraction.positive_note || "";
}

async function saveStationInteraction(patch) {
  if (!sessionUser || !currentAlbum) return;

  currentInteraction = { ...currentInteraction, ...patch };
  renderStationInteractionButtons();

  try {
    await upsertAlbumOnShelf({
      album_id: currentAlbum.id,
      title: currentAlbum.title,
      artist: currentAlbum.artist,
      cover_url: currentAlbumCoverUrl || coverCache[currentAlbum.id] || "",
      release_year: currentAlbum.year,
      saved: currentInteraction.saved,
      listened: currentInteraction.listened,
      positive_note: currentInteraction.positive_note || null
    });
  } catch (err) {
    console.error("Error saving interaction:", err);
    noteStatus.textContent = "Could not save";
  }
}

async function showStationView(clearHistory = true) {
  if (!sessionUser) {
    showAuthView("signin");
    return;
  }
  if (!userProfile || !userProfile.tastes?.length) {
    showAuthView("edit");
    return;
  }

  if (clearHistory) viewHistory = [];
  currentRouteState = { type: "station" };
  setActiveNav("station");

  const activeDate = getActiveDate();
  currentAlbum = getDailyRecommendation(userProfile, activeDate);
  currentInteraction = await loadInteraction(sessionUser.id, currentAlbum.id);

  currentDateLabel.textContent = formatDisplayDate(activeDate);
  document.getElementById("listener-greeting").textContent =
    `Curated for ${userProfile.display_name}`;
  stationView.dataset.aesthetic = currentAlbum.aesthetic || "editorial";

  const coverEl = document.getElementById("album-cover");
  coverEl.classList.add("loading");
  coverEl.alt = `${currentAlbum.title} by ${currentAlbum.artist}`;
  const albumIdForRender = currentAlbum.id;
  currentAlbumCoverUrl = coverCache[currentAlbum.id] || "";

  resolveAlbumCover(currentAlbum).then((url) => {
    if (currentAlbum?.id === albumIdForRender && url) {
      currentAlbumCoverUrl = url;
      coverEl.src = url;
      coverEl.onload = () => coverEl.classList.remove("loading");
    } else {
      coverEl.classList.remove("loading");
    }
  });

  document.getElementById("media-type-badge").textContent = currentAlbum.mediaType;
  document.getElementById("album-year").textContent = currentAlbum.year;
  document.getElementById("album-runtime").textContent = currentAlbum.runtime;
  document.getElementById("album-label").textContent = currentAlbum.label;
  stationArtistBtn.textContent = currentAlbum.artist;
  stationTitleEl.textContent = currentAlbum.title;
  document.getElementById("album-synopsis").textContent = currentAlbum.synopsis;

  const tagsContainer = document.getElementById("album-tags");
  tagsContainer.innerHTML = "";
  currentAlbum.tags.forEach((tag) => {
    const span = document.createElement("span");
    span.className = "tag-pill";
    span.textContent = tag;
    tagsContainer.appendChild(span);
  });

  const reviewsList = document.getElementById("reviews-list");
  reviewsList.innerHTML = "";
  document.getElementById("review-source-note").textContent =
    `${currentAlbum.reviews.length} listener ${currentAlbum.reviews.length === 1 ? "note" : "notes"}`;

  currentAlbum.reviews.forEach((rev) => {
    const card = document.createElement("blockquote");
    card.className = "review-card";
    card.innerHTML = `
      <p class="review-quote">“${escapeHtml(rev.text)}”</p>
      <footer class="review-author">— ${escapeHtml(rev.author)} (${escapeHtml(rev.source)})</footer>
    `;
    reviewsList.appendChild(card);
  });

  noteStatus.textContent = "";
  renderStationInteractionButtons();
}

function openCurrentStationAlbumDetail() {
  if (!currentAlbum) return;
  openAlbumDetail({
    album_id: currentAlbum.id,
    title: currentAlbum.title,
    artist: currentAlbum.artist,
    cover_url: currentAlbumCoverUrl || coverCache[currentAlbum.id] || "",
    release_year: String(currentAlbum.year || ""),
    runtime: currentAlbum.runtime,
    label: currentAlbum.label,
    synopsis: currentAlbum.synopsis,
    reviews: currentAlbum.reviews,
    coverQuery: currentAlbum.coverQuery
  });
}

// ------------------------------------------------------------
// Album Detail Page
// ------------------------------------------------------------
function renderDetailInteractionState() {
  detailWantBtn.classList.toggle("selected", Boolean(activeDetailInteraction.saved));
  detailListenedBtn.classList.toggle("selected", Boolean(activeDetailInteraction.listened));
  detailNoteInput.value = activeDetailInteraction.positive_note || "";
}

async function saveDetailInteraction(patch) {
  if (!sessionUser || !activeDetailAlbum) return;

  activeDetailInteraction = { ...activeDetailInteraction, ...patch };
  renderDetailInteractionState();

  try {
    await upsertAlbumOnShelf({
      album_id: activeDetailAlbum.album_id,
      title: activeDetailAlbum.title,
      artist: activeDetailAlbum.artist,
      cover_url: activeDetailAlbum.cover_url || "",
      release_year: activeDetailAlbum.release_year || "",
      saved: activeDetailInteraction.saved,
      listened: activeDetailInteraction.listened,
      positive_note: activeDetailInteraction.positive_note || null
    });
  } catch (err) {
    console.error("Error saving album detail interaction:", err);
    detailNoteStatus.textContent = "Could not save";
  }
}

async function openAlbumDetail(albumInput, pushHistory = true) {
  if (!sessionUser) return showAuthView("signin");
  if (pushHistory) pushCurrentRouteToHistory();

  const reqId = ++detailRequestId;
  const catalogMatch = CATALOG_ITEMS.find((c) => c.id === albumInput.album_id);

  activeDetailAlbum = {
    album_id: albumInput.album_id,
    collectionId:
      albumInput.collectionId ||
      (albumInput.album_id?.startsWith("itunes-") ? albumInput.album_id.replace("itunes-", "") : null),
    artistId: albumInput.artistId || null,
    title: albumInput.title || catalogMatch?.title || "Untitled Album",
    artist: albumInput.artist || catalogMatch?.artist || "Unknown Artist",
    cover_url: albumInput.cover_url || coverCache[albumInput.album_id] || "",
    release_year: albumInput.release_year || (catalogMatch ? String(catalogMatch.year) : ""),
    runtime: albumInput.runtime || catalogMatch?.runtime || "",
    genre: albumInput.genre || catalogMatch?.tags?.[0] || "",
    label: albumInput.label || catalogMatch?.label || "",
    synopsis: albumInput.synopsis || catalogMatch?.synopsis || "",
    reviews: albumInput.reviews || catalogMatch?.reviews || [],
    coverQuery: albumInput.coverQuery || catalogMatch?.coverQuery || ""
  };

  defaultPreviewTrack = null;
  currentRouteState = { type: "album-detail", album: { ...activeDetailAlbum } };
  setActiveNav("album-detail");

  detailAlbumCover.src = activeDetailAlbum.cover_url || "";
  detailAlbumCover.alt = `${activeDetailAlbum.title} by ${activeDetailAlbum.artist}`;
  detailAlbumArtistBtn.textContent = activeDetailAlbum.artist;
  detailAlbumTitle.textContent = activeDetailAlbum.title;
  detailAlbumYear.textContent = activeDetailAlbum.release_year || "—";
  detailAlbumRuntime.textContent = activeDetailAlbum.runtime || "—";
  detailAlbumGenre.textContent = activeDetailAlbum.genre || "—";
  detailAlbumLabel.textContent = activeDetailAlbum.label || "";
  detailPreviewWrap.classList.add("hidden");

  if (activeDetailAlbum.synopsis) {
    detailAlbumSynopsis.textContent = activeDetailAlbum.synopsis;
    detailAlbumSynopsis.classList.remove("hidden");
  } else {
    detailAlbumSynopsis.classList.add("hidden");
  }

  detailTracklistCount.textContent = "Loading...";
  detailTracklist.innerHTML = "";
  detailNoteStatus.textContent = "";

  const [interaction, communityNotes] = await Promise.all([
    loadInteraction(sessionUser.id, activeDetailAlbum.album_id),
    loadCommunityNotes(activeDetailAlbum.album_id)
  ]);

  if (reqId !== detailRequestId) return;

  activeDetailInteraction = interaction;
  renderDetailInteractionState();
  renderDetailNotes(activeDetailAlbum.reviews, communityNotes);

  // Resolve iTunes collectionId if not already known
  let colId = activeDetailAlbum.collectionId;
  if (!colId) {
    const query = activeDetailAlbum.coverQuery || `${activeDetailAlbum.artist} ${activeDetailAlbum.title}`;
    const found = await queryItunes(query, "album", 3);
    if (reqId !== detailRequestId) return;
    const best =
      found.find((r) =>
        r.collectionName?.toLowerCase().includes(activeDetailAlbum.title.toLowerCase().slice(0, 8))
      ) || found[0];
    if (best) {
      colId = best.collectionId;
      activeDetailAlbum.collectionId = colId;
      activeDetailAlbum.artistId = activeDetailAlbum.artistId || best.artistId;
      if (!activeDetailAlbum.cover_url && best.artworkUrl100) {
        activeDetailAlbum.cover_url = toHighResCover(best.artworkUrl100);
        detailAlbumCover.src = activeDetailAlbum.cover_url;
      }
    }
  }

  if (colId) {
    const lookupResults = await lookupItunes(colId, "song", 100);
    if (reqId !== detailRequestId) return;

    const colMeta = lookupResults.find((r) => r.wrapperType === "collection");
    const tracks = lookupResults.filter((r) => r.wrapperType === "track");

    if (colMeta) {
      activeDetailAlbum.artistId = activeDetailAlbum.artistId || colMeta.artistId;
      if (!activeDetailAlbum.cover_url && colMeta.artworkUrl100) {
        activeDetailAlbum.cover_url = toHighResCover(colMeta.artworkUrl100);
        detailAlbumCover.src = activeDetailAlbum.cover_url;
      }
      if (colMeta.releaseDate && !activeDetailAlbum.release_year) {
        activeDetailAlbum.release_year = colMeta.releaseDate.slice(0, 4);
        detailAlbumYear.textContent = activeDetailAlbum.release_year;
      }
      if (colMeta.primaryGenreName) {
        detailAlbumGenre.textContent = colMeta.primaryGenreName;
      }
      if (colMeta.copyright && !activeDetailAlbum.label) {
        detailAlbumLabel.textContent = colMeta.copyright;
      }
    }

    if (tracks.length > 0) {
      const totalMs = tracks.reduce((sum, t) => sum + (t.trackTimeMillis || 0), 0);
      if (totalMs) {
        detailAlbumRuntime.textContent = `${Math.round(totalMs / 60000)} min`;
      }
      detailTracklistCount.textContent = `${tracks.length} ${tracks.length === 1 ? "track" : "tracks"}`;

      // Pick a representative track for the mini play button (prefer first track >= 60s to avoid short intros)
      const playableTracks = tracks.filter((t) => Boolean(t.previewUrl));
      const picked =
        playableTracks.find((t) => (t.trackTimeMillis || 0) >= 60000) || playableTracks[0] || null;
      if (picked) {
        defaultPreviewTrack = {
          trackId: picked.trackId || picked.trackName,
          trackName: picked.trackName,
          previewUrl: picked.previewUrl
        };
      }

      detailTracklist.innerHTML = "";
      tracks.forEach((track, idx) => {
        const trackNumStr = String(track.trackNumber || idx + 1).padStart(2, "0");
        const trackObj = track.previewUrl
          ? {
              trackId: track.trackId || `${idx}-${track.trackName}`,
              trackName: track.trackName,
              previewUrl: track.previewUrl
            }
          : null;

        const li = document.createElement("li");
        li.className = `track-row${trackObj ? " has-preview" : ""}`;
        li.dataset.trackId = trackObj ? String(trackObj.trackId) : "";
        li.dataset.trackNum = trackNumStr;
        if (trackObj) li.title = "Click to preview (15s)";

        li.innerHTML = `
          <span class="track-num">${trackNumStr}</span>
          <span class="track-name">${escapeHtml(track.trackName)}</span>
          <span class="track-dur">${formatDuration(track.trackTimeMillis)}</span>
        `;

        if (trackObj) {
          li.addEventListener("click", () => togglePreviewTrack(trackObj));
        }

        detailTracklist.appendChild(li);
      });

      updatePreviewUI();
    } else {
      detailTracklistCount.textContent = "Tracklist unavailable";
    }
  } else {
    detailTracklistCount.textContent = "Tracklist unavailable";
  }
}

function renderDetailNotes(curatedNotes = [], communityNotes = []) {
  const combined = [...(curatedNotes || []), ...(communityNotes || [])];
  detailNotesList.innerHTML = "";
  detailNotesCount.textContent = `${combined.length} ${combined.length === 1 ? "note" : "notes"}`;

  if (combined.length === 0) {
    detailNotesList.innerHTML = `<p class="meta-label">No listener notes yet—leave the first impression below.</p>`;
    return;
  }

  combined.forEach((rev) => {
    const card = document.createElement("blockquote");
    card.className = "review-card";
    card.innerHTML = `
      <p class="review-quote">“${escapeHtml(rev.text)}”</p>
      <footer class="review-author">— ${escapeHtml(rev.author)} (${escapeHtml(rev.source)})</footer>
    `;
    detailNotesList.appendChild(card);
  });
}

// ------------------------------------------------------------
// Artist Detail Page (LPs first, EPs second, Singles excluded)
// ------------------------------------------------------------
function updateFavoriteArtistButton() {
  if (!activeDetailArtist || !userProfile) return;
  const favs = userProfile.favorite_artists || [];
  const isFav = favs.some((a) => a.toLowerCase() === activeDetailArtist.name.toLowerCase());
  detailArtistFavBtn.classList.toggle("selected", isFav);
  detailArtistFavBtn.textContent = isFav ? "Favorited artist" : "+ Favorite artist";
}

function renderArtistReleaseGrid(container, items, fallbackArtistName, artistId) {
  container.innerHTML = "";
  items.forEach((item) => {
    const year = item.releaseDate ? item.releaseDate.slice(0, 4) : "";
    const cover = toHighResCover(item.artworkUrl100);
    const albumPayload = {
      album_id: `itunes-${item.collectionId}`,
      collectionId: item.collectionId,
      artistId: item.artistId || artistId,
      title: item.collectionName,
      artist: item.artistName || fallbackArtistName,
      cover_url: cover,
      release_year: year,
      genre: item.primaryGenreName || "",
      label: item.copyright || ""
    };

    const card = document.createElement("article");
    card.className = "shelf-card";
    card.innerHTML = `
      <button class="shelf-cover js-open-album" type="button" aria-label="Open ${escapeHtml(albumPayload.title)}">
        ${cover ? `<img src="${escapeHtml(cover)}" alt="${escapeHtml(albumPayload.title)}" loading="lazy" />` : ""}
      </button>
      <div class="shelf-card-meta">
        <button class="shelf-card-title js-open-album" type="button">${escapeHtml(albumPayload.title)}</button>
        <span class="meta-label">${year || "Release"}${item.trackCount ? ` · ${item.trackCount} tracks` : ""}</span>
      </div>
    `;

    card.querySelectorAll(".js-open-album").forEach((el) => {
      el.addEventListener("click", () => openAlbumDetail(albumPayload));
    });

    container.appendChild(card);
  });
}

async function openArtistDetail(artistInput, pushHistory = true) {
  if (!sessionUser) return showAuthView("signin");
  if (pushHistory) pushCurrentRouteToHistory();

  const reqId = ++artistRequestId;
  activeDetailArtist = {
    artistId: artistInput.artistId || null,
    name: artistInput.name || "Artist",
    genre: artistInput.genre || ""
  };

  currentRouteState = { type: "artist-detail", artist: { ...activeDetailArtist } };
  setActiveNav("artist-detail");

  detailArtistName.textContent = activeDetailArtist.name;
  detailArtistGenre.textContent = activeDetailArtist.genre || "Artist";
  detailArtistStatus.textContent = "Loading discography...";
  artistLpsSection.classList.add("hidden");
  artistEpsSection.classList.add("hidden");
  detailArtistEmpty.classList.add("hidden");
  artistLpsGrid.innerHTML = "";
  artistEpsGrid.innerHTML = "";
  updateFavoriteArtistButton();

  // Resolve artistId if missing
  let artistId = activeDetailArtist.artistId;
  if (!artistId) {
    let artistMatches = await queryItunes(activeDetailArtist.name, "musicArtist", 5);
    if (!artistMatches.length && /[,&]/.test(activeDetailArtist.name)) {
      const primaryName = activeDetailArtist.name.split(/[,&]/)[0].trim();
      artistMatches = await queryItunes(primaryName, "musicArtist", 5);
    }
    if (reqId !== artistRequestId) return;

    const exact =
      artistMatches.find(
        (a) => a.artistName?.toLowerCase() === activeDetailArtist.name.toLowerCase()
      ) || artistMatches[0];

    if (exact) {
      artistId = exact.artistId;
      activeDetailArtist.artistId = artistId;
      activeDetailArtist.name = exact.artistName || activeDetailArtist.name;
      activeDetailArtist.genre = exact.primaryGenreName || activeDetailArtist.genre;
      detailArtistName.textContent = activeDetailArtist.name;
      detailArtistGenre.textContent = activeDetailArtist.genre || "Artist";
      updateFavoriteArtistButton();
    }
  }

  let rawReleases = [];
  if (artistId) {
    const lookupRes = await lookupItunes(artistId, "album", 100);
    if (reqId !== artistRequestId) return;
    const artistMeta = lookupRes.find((r) => r.wrapperType === "artist");
    if (artistMeta?.primaryGenreName) {
      detailArtistGenre.textContent = artistMeta.primaryGenreName;
    }
    rawReleases = lookupRes.filter((r) => r.wrapperType === "collection" && r.collectionName);
  } else {
    rawReleases = await queryItunes(activeDetailArtist.name, "album", 40);
    if (reqId !== artistRequestId) return;
  }

  // Deduplicate by lowercase title & sort newest first
  const seenTitles = new Set();
  const uniqueReleases = rawReleases
    .filter((a) => {
      const key = a.collectionName.toLowerCase().trim();
      if (seenTitles.has(key)) return false;
      seenTitles.add(key);
      return true;
    })
    .sort((a, b) => (b.releaseDate || "").localeCompare(a.releaseDate || ""));

  // Split into LPs and EPs, completely removing Singles
  const lps = [];
  const eps = [];
  uniqueReleases.forEach((rel) => {
    const type = classifyRelease(rel);
    if (type === "lp") lps.push(rel);
    else if (type === "ep") eps.push(rel);
  });

  detailArtistStatus.textContent = "";

  if (lps.length > 0) {
    artistLpsCount.textContent = `${lps.length} ${lps.length === 1 ? "album" : "albums"}`;
    renderArtistReleaseGrid(artistLpsGrid, lps, activeDetailArtist.name, artistId);
    artistLpsSection.classList.remove("hidden");
  }

  if (eps.length > 0) {
    artistEpsCount.textContent = `${eps.length} ${eps.length === 1 ? "EP" : "EPs"}`;
    renderArtistReleaseGrid(artistEpsGrid, eps, activeDetailArtist.name, artistId);
    artistEpsSection.classList.remove("hidden");
  }

  if (lps.length === 0 && eps.length === 0) {
    detailArtistEmpty.classList.remove("hidden");
  }
}

// ------------------------------------------------------------
// Shelf View (Want to listen / Listened + Search to Add)
// ------------------------------------------------------------
async function showShelfView(clearHistory = true) {
  if (!sessionUser) return showAuthView("signin");
  if (clearHistory) viewHistory = [];
  currentRouteState = { type: "shelf" };
  setActiveNav("shelf");
  shelfItems = await loadUserShelf(sessionUser.id);
  renderShelf();
}

function renderShelf() {
  const wantList = shelfItems.filter((item) => item.saved && !item.listened);
  const listenedList = shelfItems.filter((item) => item.listened);

  countWant.textContent = wantList.length;
  countListened.textContent = listenedList.length;
  tabWant.classList.toggle("active", activeShelfTab === "want");
  tabListened.classList.toggle("active", activeShelfTab === "listened");

  const visibleItems = activeShelfTab === "want" ? wantList : listenedList;
  shelfGrid.innerHTML = "";
  shelfEmptyState.classList.toggle("hidden", visibleItems.length > 0);

  visibleItems.forEach((item) => {
    const card = document.createElement("article");
    card.className = "shelf-card";

    const switchLabel = item.listened ? "Move to Want" : "Mark Listened";
    const noteText = item.positive_note ? escapeHtml(item.positive_note) : "";
    const albumPayload = {
      album_id: item.album_id,
      title: item.title || item.album_id,
      artist: item.artist || "Unknown artist",
      cover_url: item.cover_url || "",
      release_year: item.release_year || ""
    };

    card.innerHTML = `
      <button class="shelf-cover js-open-album" type="button" aria-label="Open ${escapeHtml(albumPayload.title)}">
        ${item.cover_url ? `<img src="${escapeHtml(item.cover_url)}" alt="${escapeHtml(albumPayload.title)}" loading="lazy" />` : ""}
      </button>
      <div class="shelf-card-meta">
        <button class="shelf-card-title js-open-album" type="button">${escapeHtml(albumPayload.title)}</button>
        <button class="shelf-card-artist js-open-artist" type="button">${escapeHtml(albumPayload.artist)}${item.release_year ? ` · ${escapeHtml(item.release_year)}` : ""}</button>
      </div>
      ${noteText ? `<p class="shelf-card-note">“${noteText}”</p>` : ""}
      <div class="shelf-card-actions">
        <button class="text-btn js-switch-shelf" type="button">${switchLabel}</button>
        <button class="text-btn js-edit-note" type="button">${noteText ? "Edit note" : "Add note"}</button>
        <button class="text-btn js-remove-shelf" type="button">Remove</button>
      </div>
      <div class="shelf-note-editor hidden">
        <textarea rows="2" placeholder="Write a positive note (no scores)...">${noteText}</textarea>
        <div class="note-actions">
          <button class="text-btn js-save-note" type="button">Save</button>
          <button class="text-btn js-cancel-note" type="button">Cancel</button>
        </div>
      </div>
    `;

    card.querySelectorAll(".js-open-album").forEach((el) => {
      el.addEventListener("click", () => openAlbumDetail(albumPayload));
    });

    card.querySelector(".js-open-artist").addEventListener("click", () => {
      openArtistDetail({ name: albumPayload.artist });
    });

    card.querySelector(".js-switch-shelf").addEventListener("click", async () => {
      const nextListened = !item.listened;
      await upsertAlbumOnShelf({
        ...item,
        listened: nextListened,
        saved: !nextListened
      });
      shelfItems = await loadUserShelf(sessionUser.id);
      renderShelf();
    });

    card.querySelector(".js-remove-shelf").addEventListener("click", async () => {
      await deleteAlbumFromShelf(item.album_id);
      shelfItems = shelfItems.filter((s) => s.album_id !== item.album_id);
      renderShelf();
    });

    const noteEditor = card.querySelector(".shelf-note-editor");
    const textarea = noteEditor.querySelector("textarea");

    card.querySelector(".js-edit-note").addEventListener("click", () => {
      noteEditor.classList.toggle("hidden");
      if (!noteEditor.classList.contains("hidden")) textarea.focus();
    });

    card.querySelector(".js-cancel-note").addEventListener("click", () => {
      noteEditor.classList.add("hidden");
    });

    card.querySelector(".js-save-note").addEventListener("click", async () => {
      await upsertAlbumOnShelf({
        ...item,
        positive_note: textarea.value.trim() || null
      });
      shelfItems = await loadUserShelf(sessionUser.id);
      renderShelf();
    });

    shelfGrid.appendChild(card);
  });
}

// Reusable album dropdown renderer
async function populateAlbumDropdown(term, container, onSelectClear) {
  if (term.length < 2) {
    container.classList.add("hidden");
    return;
  }

  const results = await queryItunes(term, "album", 6);
  container.innerHTML = "";

  if (results.length === 0) {
    container.classList.add("hidden");
    return;
  }

  results.forEach((item) => {
    if (!item.collectionName || !item.artistName) return;
    const albumId = `itunes-${item.collectionId}`;
    const year = item.releaseDate ? item.releaseDate.slice(0, 4) : "";
    const existing = shelfItems.find((s) => s.album_id === albumId);
    const payloadBase = {
      album_id: albumId,
      collectionId: item.collectionId,
      artistId: item.artistId,
      title: item.collectionName,
      artist: item.artistName,
      cover_url: toHighResCover(item.artworkUrl100),
      release_year: year,
      genre: item.primaryGenreName || "",
      label: item.copyright || "",
      positive_note: existing?.positive_note || null
    };

    const row = document.createElement("div");
    row.className = "search-result-item";
    row.innerHTML = `
      <div class="search-result-left clickable-part js-open-album">
        <img class="search-thumb" src="${escapeHtml(item.artworkUrl100 || "")}" alt="" />
        <span class="search-item-text">
          <span class="search-item-title">${escapeHtml(item.collectionName)}</span>
          <span class="search-item-sub">${escapeHtml(item.artistName)}${year ? ` · ${year}` : ""}</span>
        </span>
      </div>
      <div class="search-quick-actions">
        <button class="mini-btn js-add-want ${existing?.saved && !existing?.listened ? "active" : ""}" type="button">+ Want</button>
        <button class="mini-btn js-add-listened ${existing?.listened ? "active" : ""}" type="button">+ Listened</button>
      </div>
    `;

    row.querySelector(".js-open-album").addEventListener("click", () => {
      container.classList.add("hidden");
      openAlbumDetail(payloadBase);
    });

    row.querySelector(".js-add-want").addEventListener("click", async () => {
      await upsertAlbumOnShelf({ ...payloadBase, saved: true, listened: false });
      shelfItems = await loadUserShelf(sessionUser.id);
      if (currentView === "shelf") {
        activeShelfTab = "want";
        renderShelf();
      }
      onSelectClear();
    });

    row.querySelector(".js-add-listened").addEventListener("click", async () => {
      await upsertAlbumOnShelf({ ...payloadBase, saved: false, listened: true });
      shelfItems = await loadUserShelf(sessionUser.id);
      if (currentView === "shelf") {
        activeShelfTab = "listened";
        renderShelf();
      }
      onSelectClear();
    });

    container.appendChild(row);
  });

  const hintRow = document.createElement("button");
  hintRow.type = "button";
  hintRow.className = "search-result-item clickable";
  hintRow.innerHTML = `<span class="meta-label">See all results for “${escapeHtml(term)}” →</span>`;
  hintRow.addEventListener("click", () => {
    container.classList.add("hidden");
    showSearchView(term, false);
  });
  container.appendChild(hintRow);

  container.classList.remove("hidden");
}

// ------------------------------------------------------------
// Full Search Results View
// ------------------------------------------------------------
async function showSearchView(initialQuery = "", clearHistory = true) {
  if (!sessionUser) return showAuthView("signin");
  if (clearHistory) viewHistory = [];
  else if (currentView !== "search") pushCurrentRouteToHistory();

  lastSearchQuery = initialQuery;
  currentRouteState = { type: "search", query: initialQuery };
  setActiveNav("search");

  globalSearchInput.value = initialQuery;
  globalSearchDropdown.classList.add("hidden");

  if (initialQuery.trim()) {
    await runFullSearch(initialQuery.trim());
  } else {
    searchResultsStatus.textContent = "Search by album title, artist name, or listener.";
    searchArtistsSection.classList.add("hidden");
    searchAlbumsSection.classList.add("hidden");
    searchListenersSection.classList.add("hidden");
    searchEmptyState.classList.add("hidden");
    globalSearchInput.focus();
  }
}

async function runFullSearch(query) {
  lastSearchQuery = query;
  currentRouteState = { type: "search", query };
  globalSearchDropdown.classList.add("hidden");

  searchResultsStatus.textContent = `Searching for “${query}”...`;
  searchArtistsSection.classList.add("hidden");
  searchAlbumsSection.classList.add("hidden");
  searchListenersSection.classList.add("hidden");
  searchEmptyState.classList.add("hidden");

  const [albumsRaw, artistsRaw, listeners, myShelf] = await Promise.all([
    queryItunes(query, "album", 16),
    queryItunes(query, "musicArtist", 8),
    searchListeners(query),
    loadUserShelf(sessionUser.id)
  ]);

  shelfItems = myShelf;

  const seenArtists = new Set();
  const artists = artistsRaw.filter((a) => {
    if (!a.artistName) return false;
    const key = a.artistName.toLowerCase();
    if (seenArtists.has(key)) return false;
    seenArtists.add(key);
    return true;
  });

  const albums = albumsRaw.filter((a) => a.collectionName && a.artistName);
  const totalCount = artists.length + albums.length + listeners.length;

  searchResultsStatus.textContent = `${totalCount} ${totalCount === 1 ? "result" : "results"} for “${query}”`;

  if (totalCount === 0) {
    searchEmptyState.classList.remove("hidden");
    return;
  }

  if (artists.length > 0) {
    searchArtistsList.innerHTML = "";
    artists.forEach((a) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "artist-pill-btn";
      btn.innerHTML = `
        <span class="artist-pill-name">${escapeHtml(a.artistName)}</span>
        <span class="artist-pill-genre">${escapeHtml(a.primaryGenreName || "Artist")}</span>
      `;
      btn.addEventListener("click", () => {
        openArtistDetail({
          artistId: a.artistId,
          name: a.artistName,
          genre: a.primaryGenreName || ""
        });
      });
      searchArtistsList.appendChild(btn);
    });
    searchArtistsSection.classList.remove("hidden");
  }

  if (albums.length > 0) {
    searchAlbumsGrid.innerHTML = "";
    albums.forEach((item) => {
      const albumId = `itunes-${item.collectionId}`;
      const year = item.releaseDate ? item.releaseDate.slice(0, 4) : "";
      const cover = toHighResCover(item.artworkUrl100);
      const existing = shelfItems.find((s) => s.album_id === albumId);

      const albumPayload = {
        album_id: albumId,
        collectionId: item.collectionId,
        artistId: item.artistId,
        title: item.collectionName,
        artist: item.artistName,
        cover_url: cover,
        release_year: year,
        genre: item.primaryGenreName || "",
        label: item.copyright || ""
      };

      const card = document.createElement("article");
      card.className = "shelf-card";
      card.innerHTML = `
        <button class="shelf-cover js-open-album" type="button" aria-label="Open ${escapeHtml(albumPayload.title)}">
          ${cover ? `<img src="${escapeHtml(cover)}" alt="${escapeHtml(albumPayload.title)}" loading="lazy" />` : ""}
        </button>
        <div class="shelf-card-meta">
          <button class="shelf-card-title js-open-album" type="button">${escapeHtml(albumPayload.title)}</button>
          <button class="shelf-card-artist js-open-artist" type="button">${escapeHtml(albumPayload.artist)}${year ? ` · ${year}` : ""}</button>
        </div>
        <div class="search-quick-actions">
          <button class="mini-btn js-want ${existing?.saved && !existing?.listened ? "active" : ""}" type="button">${existing?.saved && !existing?.listened ? "On Want" : "+ Want"}</button>
          <button class="mini-btn js-listened ${existing?.listened ? "active" : ""}" type="button">${existing?.listened ? "Listened" : "+ Listened"}</button>
        </div>
      `;

      card.querySelectorAll(".js-open-album").forEach((el) => {
        el.addEventListener("click", () => openAlbumDetail(albumPayload));
      });

      card.querySelector(".js-open-artist").addEventListener("click", () => {
        openArtistDetail({ artistId: item.artistId, name: item.artistName });
      });

      const wantAction = card.querySelector(".js-want");
      const listenedAction = card.querySelector(".js-listened");

      wantAction.addEventListener("click", async () => {
        await upsertAlbumOnShelf({ ...albumPayload, saved: true, listened: false });
        wantAction.classList.add("active");
        wantAction.textContent = "On Want";
        listenedAction.classList.remove("active");
        listenedAction.textContent = "+ Listened";
      });

      listenedAction.addEventListener("click", async () => {
        await upsertAlbumOnShelf({ ...albumPayload, saved: false, listened: true });
        listenedAction.classList.add("active");
        listenedAction.textContent = "Listened";
        wantAction.classList.remove("active");
        wantAction.textContent = "+ Want";
      });

      searchAlbumsGrid.appendChild(card);
    });
    searchAlbumsSection.classList.remove("hidden");
  }

  if (listeners.length > 0) {
    searchListenersList.innerHTML = "";
    listeners.forEach((profile) => {
      searchListenersList.appendChild(createListenerCard(profile));
    });
    searchListenersSection.classList.remove("hidden");
  }
}

// ------------------------------------------------------------
// Listeners Directory & Public Profile View
// ------------------------------------------------------------
function createListenerCard(profile) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "listener-card";

  const avatarEl = document.createElement("div");
  avatarEl.className = "avatar-circle avatar-md";
  renderAvatar(avatarEl, profile.avatar_url, profile.display_name);

  const tastesSummary = (profile.tastes || []).slice(0, 3).join(" · ");
  const isMe = profile.user_id === sessionUser?.id;

  const infoEl = document.createElement("div");
  infoEl.className = "listener-card-info";
  infoEl.innerHTML = `
    <span class="listener-card-name">${escapeHtml(profile.display_name)}${isMe ? " (You)" : ""}</span>
    ${profile.bio ? `<span class="listener-card-bio">${escapeHtml(profile.bio)}</span>` : ""}
    ${tastesSummary ? `<span class="listener-card-tastes">${escapeHtml(tastesSummary)}</span>` : ""}
  `;

  card.appendChild(avatarEl);
  card.appendChild(infoEl);
  card.addEventListener("click", () => {
    if (currentView !== "listeners") {
      pushCurrentRouteToHistory();
      setActiveNav("listeners");
    }
    openPublicProfile(profile, false);
  });
  return card;
}

async function showListenersView(clearHistory = true) {
  if (!sessionUser) return showAuthView("signin");
  if (clearHistory) viewHistory = [];
  currentRouteState = { type: "listeners" };
  setActiveNav("listeners");
  listenersDirectory.classList.remove("hidden");
  publicProfileView.classList.add("hidden");
  await renderListenersDirectory(userSearchInput.value);
}

async function renderListenersDirectory(query = "") {
  const users = await searchListeners(query);
  listenersList.innerHTML = "";
  listenersEmpty.classList.toggle("hidden", users.length > 0);

  users.forEach((profile) => {
    listenersList.appendChild(createListenerCard(profile));
  });
}

async function openPublicProfile(profile, pushHistory = true) {
  if (pushHistory) pushCurrentRouteToHistory();
  publicProfileCurrent = profile;
  currentRouteState = { type: "public-profile", profile };

  listenersDirectory.classList.add("hidden");
  publicProfileView.classList.remove("hidden");

  renderAvatar(document.getElementById("public-avatar"), profile.avatar_url, profile.display_name);
  document.getElementById("public-name").textContent = profile.display_name;

  const bioEl = document.getElementById("public-bio");
  bioEl.textContent = profile.bio || "";
  bioEl.classList.toggle("hidden", !profile.bio);

  const tastesEl = document.getElementById("public-tastes");
  tastesEl.innerHTML = "";
  (profile.tastes || []).forEach((tag) => {
    const span = document.createElement("span");
    span.className = "tag-pill";
    span.textContent = tag;
    tastesEl.appendChild(span);
  });

  const artistsEl = document.getElementById("public-artists");
  artistsEl.innerHTML = "";
  if (profile.favorite_artists?.length) {
    const label = document.createElement("span");
    label.className = "meta-label";
    label.textContent = "Favorite artists:";
    artistsEl.appendChild(label);

    profile.favorite_artists.forEach((artistName) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "text-btn";
      btn.textContent = artistName;
      btn.addEventListener("click", () => openArtistDetail({ name: artistName }));
      artistsEl.appendChild(btn);
    });
    artistsEl.classList.remove("hidden");
  } else {
    artistsEl.classList.add("hidden");
  }

  publicShelfItems = await loadUserShelf(profile.user_id);
  activePublicShelfTab = "listened";
  renderPublicShelf();
}

function renderPublicShelf() {
  const listenedList = publicShelfItems.filter((item) => item.listened);
  const wantList = publicShelfItems.filter((item) => item.saved && !item.listened);

  publicCountListened.textContent = listenedList.length;
  publicCountWant.textContent = wantList.length;
  publicTabListened.classList.toggle("active", activePublicShelfTab === "listened");
  publicTabWant.classList.toggle("active", activePublicShelfTab === "want");

  const visibleItems = activePublicShelfTab === "listened" ? listenedList : wantList;
  publicShelfGrid.innerHTML = "";
  publicShelfEmpty.classList.toggle("hidden", visibleItems.length > 0);

  visibleItems.forEach((item) => {
    const albumPayload = {
      album_id: item.album_id,
      title: item.title || item.album_id,
      artist: item.artist || "Unknown artist",
      cover_url: item.cover_url || "",
      release_year: item.release_year || ""
    };
    const noteText = item.positive_note ? escapeHtml(item.positive_note) : "";

    const card = document.createElement("article");
    card.className = "shelf-card";
    card.innerHTML = `
      <button class="shelf-cover js-open-album" type="button" aria-label="Open ${escapeHtml(albumPayload.title)}">
        ${item.cover_url ? `<img src="${escapeHtml(item.cover_url)}" alt="${escapeHtml(albumPayload.title)}" loading="lazy" />` : ""}
      </button>
      <div class="shelf-card-meta">
        <button class="shelf-card-title js-open-album" type="button">${escapeHtml(albumPayload.title)}</button>
        <button class="shelf-card-artist js-open-artist" type="button">${escapeHtml(albumPayload.artist)}${item.release_year ? ` · ${escapeHtml(item.release_year)}` : ""}</button>
      </div>
      ${noteText ? `<p class="shelf-card-note">“${noteText}”</p>` : ""}
    `;

    card.querySelectorAll(".js-open-album").forEach((el) => {
      el.addEventListener("click", () => openAlbumDetail(albumPayload));
    });
    card.querySelector(".js-open-artist").addEventListener("click", () => {
      openArtistDetail({ name: albumPayload.artist });
    });

    publicShelfGrid.appendChild(card);
  });
}

// ------------------------------------------------------------
// Onboarding Artist & Album Search Handlers
// ------------------------------------------------------------
const handleOnboardingArtistSearch = debounce(async () => {
  const term = artistSearchInput.value.trim();
  if (term.length < 2) {
    artistSearchResults.classList.add("hidden");
    return;
  }

  const results = await queryItunes(term, "musicArtist", 6);
  artistSearchResults.innerHTML = "";

  if (results.length === 0) {
    artistSearchResults.classList.add("hidden");
    return;
  }

  const seen = new Set();
  results.forEach((item) => {
    if (!item.artistName || seen.has(item.artistName)) return;
    seen.add(item.artistName);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "search-result-item clickable";
    btn.innerHTML = `
      <span class="search-item-text">
        <span class="search-item-title">${escapeHtml(item.artistName)}</span>
        <span class="search-item-sub">${escapeHtml(item.primaryGenreName || "Artist")}</span>
      </span>
    `;
    btn.addEventListener("click", () => {
      if (!draftArtists.includes(item.artistName)) {
        draftArtists.push(item.artistName);
        refreshArtistChips();
      }
      artistSearchInput.value = "";
      artistSearchResults.classList.add("hidden");
    });
    artistSearchResults.appendChild(btn);
  });

  artistSearchResults.classList.remove("hidden");
}, 280);

const handleOnboardingAlbumSearch = debounce(async () => {
  const term = albumSearchInput.value.trim();
  if (term.length < 2) {
    albumSearchResults.classList.add("hidden");
    return;
  }

  const results = await queryItunes(term, "album", 6);
  albumSearchResults.innerHTML = "";

  if (results.length === 0) {
    albumSearchResults.classList.add("hidden");
    return;
  }

  results.forEach((item) => {
    if (!item.collectionName || !item.artistName) return;
    const label = `${item.collectionName} — ${item.artistName}`;
    const year = item.releaseDate ? item.releaseDate.slice(0, 4) : "";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "search-result-item clickable";
    btn.innerHTML = `
      <div class="search-result-left">
        <img class="search-thumb" src="${escapeHtml(item.artworkUrl100 || "")}" alt="" />
        <span class="search-item-text">
          <span class="search-item-title">${escapeHtml(item.collectionName)}</span>
          <span class="search-item-sub">${escapeHtml(item.artistName)}${year ? ` · ${year}` : ""}</span>
        </span>
      </div>
    `;
    btn.addEventListener("click", () => {
      if (!draftAlbums.includes(label)) {
        draftAlbums.push(label);
        refreshAlbumChips();
      }
      albumSearchInput.value = "";
      albumSearchResults.classList.add("hidden");
    });
    albumSearchResults.appendChild(btn);
  });

  albumSearchResults.classList.remove("hidden");
}, 280);

// ------------------------------------------------------------
// Event Listeners
// ------------------------------------------------------------
brandHomeBtn.addEventListener("click", () => {
  if (sessionUser && userProfile?.tastes?.length) showStationView();
});

navStation.addEventListener("click", () => showStationView());
navShelf.addEventListener("click", () => showShelfView());
navSearch.addEventListener("click", () => showSearchView(lastSearchQuery));
navListeners.addEventListener("click", () => showListenersView());
navProfile.addEventListener("click", () => showAuthView("edit"));

modeSigninBtn.addEventListener("click", () => setAuthMode("signin"));
modeSignupBtn.addEventListener("click", () => setAuthMode("signup"));
cancelAuthBtn.addEventListener("click", () => showStationView());

signOutBtn.addEventListener("click", async () => {
  stopPreview();
  await sb.auth.signOut();
  sessionUser = null;
  userProfile = null;
  showAuthView("signin");
});

// Station click targets for Album & Artist pages
stationCoverBtn.addEventListener("click", openCurrentStationAlbumDetail);
stationTitleEl.addEventListener("click", openCurrentStationAlbumDetail);
stationOpenDetailsBtn.addEventListener("click", openCurrentStationAlbumDetail);
stationArtistBtn.addEventListener("click", () => {
  if (currentAlbum) openArtistDetail({ name: currentAlbum.artist });
});

// Detail Page Back, Preview & Actions
albumDetailBack.addEventListener("click", goBack);
artistDetailBack.addEventListener("click", goBack);

detailPreviewBtn.addEventListener("click", () => {
  if (activePreviewTrack && !previewAudio.paused) {
    stopPreview();
  } else if (defaultPreviewTrack) {
    togglePreviewTrack(defaultPreviewTrack);
  }
});

detailAlbumArtistBtn.addEventListener("click", () => {
  if (activeDetailAlbum) {
    openArtistDetail({
      artistId: activeDetailAlbum.artistId,
      name: activeDetailAlbum.artist
    });
  }
});

detailWantBtn.addEventListener("click", () => {
  const nextSaved = !activeDetailInteraction.saved;
  saveDetailInteraction({
    saved: nextSaved,
    listened: nextSaved ? false : activeDetailInteraction.listened
  });
});

detailListenedBtn.addEventListener("click", () => {
  const nextListened = !activeDetailInteraction.listened;
  saveDetailInteraction({
    listened: nextListened,
    saved: nextListened ? false : activeDetailInteraction.saved
  });
});

detailNoteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  detailNoteStatus.textContent = "Saving...";
  const hasShelfStatus = activeDetailInteraction.saved || activeDetailInteraction.listened;
  await saveDetailInteraction({
    positive_note: detailNoteInput.value.trim(),
    listened: hasShelfStatus ? activeDetailInteraction.listened : true
  });
  detailNoteStatus.textContent = "Saved";
  const communityNotes = await loadCommunityNotes(activeDetailAlbum.album_id);
  renderDetailNotes(activeDetailAlbum.reviews, communityNotes);
});

detailArtistFavBtn.addEventListener("click", async () => {
  if (!activeDetailArtist || !userProfile) return;
  const currentFavs = userProfile.favorite_artists || [];
  const exists = currentFavs.some(
    (a) => a.toLowerCase() === activeDetailArtist.name.toLowerCase()
  );
  const nextFavs = exists
    ? currentFavs.filter((a) => a.toLowerCase() !== activeDetailArtist.name.toLowerCase())
    : [...currentFavs, activeDetailArtist.name];

  userProfile = await upsertUserProfile({
    user_id: sessionUser.id,
    display_name: userProfile.display_name,
    bio: userProfile.bio || "",
    avatar_url: userProfile.avatar_url || "",
    tastes: userProfile.tastes || [],
    favorite_artists: nextFavs,
    favorite_albums: userProfile.favorite_albums || []
  });
  updateFavoriteArtistButton();
});

// Profile Avatar & Form Handlers
nameInput.addEventListener("input", () => {
  if (!draftAvatarUrl) updateAvatarPreview();
});

avatarFileInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    draftAvatarUrl = await processAvatarFile(file);
    updateAvatarPreview();
  } catch (err) {
    authFeedback.textContent = err.message;
    authFeedback.classList.remove("hidden");
  }
  avatarFileInput.value = "";
});

removeAvatarBtn.addEventListener("click", () => {
  draftAvatarUrl = "";
  updateAvatarPreview();
});

artistSearchInput.addEventListener("input", handleOnboardingArtistSearch);
albumSearchInput.addEventListener("input", handleOnboardingAlbumSearch);

// Shelf Search (Dropdown + Enter opens Search Results page)
shelfAlbumSearch.addEventListener(
  "input",
  debounce(() => {
    populateAlbumDropdown(shelfAlbumSearch.value.trim(), shelfSearchResults, () => {
      shelfAlbumSearch.value = "";
      shelfSearchResults.classList.add("hidden");
    });
  }, 280)
);

shelfAlbumSearch.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const q = shelfAlbumSearch.value.trim();
    shelfSearchResults.classList.add("hidden");
    if (q) showSearchView(q, false);
  }
});

// Global Search Page (Dropdown + Enter/Submit runs full results)
globalSearchInput.addEventListener(
  "input",
  debounce(() => {
    populateAlbumDropdown(globalSearchInput.value.trim(), globalSearchDropdown, () => {
      globalSearchDropdown.classList.add("hidden");
    });
  }, 280)
);

globalSearchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = globalSearchInput.value.trim();
  if (q) runFullSearch(q);
});

userSearchInput.addEventListener(
  "input",
  debounce(() => renderListenersDirectory(userSearchInput.value), 250)
);

artistSearchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const val = artistSearchInput.value.trim();
    if (val && !draftArtists.includes(val)) {
      draftArtists.push(val);
      refreshArtistChips();
      artistSearchInput.value = "";
      artistSearchResults.classList.add("hidden");
    }
  }
});

document.addEventListener("click", (e) => {
  if (!e.target.closest("#artists-fieldset")) artistSearchResults.classList.add("hidden");
  if (!e.target.closest("#albums-fieldset")) albumSearchResults.classList.add("hidden");
  if (!e.target.closest("#shelf-view .search-box")) shelfSearchResults.classList.add("hidden");
  if (!e.target.closest("#global-search-form")) globalSearchDropdown.classList.add("hidden");
});

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authFeedback.classList.add("hidden");

  try {
    if (authMode === "edit") {
      const displayName = nameInput.value.trim();
      const tastes = Array.from(
        tasteOptionsContainer.querySelectorAll(".taste-chip.selected")
      ).map((chip) => chip.textContent);

      if (!displayName || tastes.length === 0) {
        authFeedback.textContent = "Enter your name and pick at least one style.";
        authFeedback.classList.remove("hidden");
        return;
      }

      userProfile = await upsertUserProfile({
        user_id: sessionUser.id,
        display_name: displayName,
        bio: bioInput.value.trim(),
        avatar_url: draftAvatarUrl,
        tastes,
        favorite_artists: draftArtists,
        favorite_albums: draftAlbums
      });
      showStationView();
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (authMode === "signup") {
      const displayName = nameInput.value.trim();
      const tastes = Array.from(
        tasteOptionsContainer.querySelectorAll(".taste-chip.selected")
      ).map((chip) => chip.textContent);

      if (!displayName || tastes.length === 0) {
        authFeedback.textContent = "Please enter your name and select at least one style.";
        authFeedback.classList.remove("hidden");
        return;
      }

      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user && data.session) {
        sessionUser = data.user;
        userProfile = await upsertUserProfile({
          user_id: data.user.id,
          display_name: displayName,
          bio: bioInput.value.trim(),
          avatar_url: draftAvatarUrl,
          tastes,
          favorite_artists: draftArtists,
          favorite_albums: draftAlbums
        });
        showStationView();
      } else {
        authFeedback.textContent = "Check your inbox to confirm your email, then sign in.";
        authFeedback.classList.remove("hidden");
      }
    } else {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      sessionUser = data.user;
      userProfile = await loadUserProfile(data.user.id);
      showStationView();
    }
  } catch (err) {
    authFeedback.textContent = err.message || "Authentication error.";
    authFeedback.classList.remove("hidden");
  }
});

// Station Actions
wantBtn.addEventListener("click", () => {
  const nextSaved = !currentInteraction.saved;
  saveStationInteraction({
    saved: nextSaved,
    listened: nextSaved ? false : currentInteraction.listened
  });
});

listenedBtn.addEventListener("click", () => {
  const nextListened = !currentInteraction.listened;
  saveStationInteraction({
    listened: nextListened,
    saved: nextListened ? false : currentInteraction.saved
  });
});

personalNoteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  noteStatus.textContent = "Saving...";
  const hasShelfStatus = currentInteraction.saved || currentInteraction.listened;
  await saveStationInteraction({
    positive_note: personalNoteInput.value.trim(),
    listened: hasShelfStatus ? currentInteraction.listened : true
  });
  noteStatus.textContent = "Saved";
});

// Shelf Tabs
tabWant.addEventListener("click", () => {
  activeShelfTab = "want";
  renderShelf();
});

tabListened.addEventListener("click", () => {
  activeShelfTab = "listened";
  renderShelf();
});

// Public Profile Navigation & Tabs
backToListenersBtn.addEventListener("click", () => {
  if (viewHistory.length > 0) {
    goBack();
  } else {
    publicProfileView.classList.add("hidden");
    listenersDirectory.classList.remove("hidden");
  }
});

publicTabListened.addEventListener("click", () => {
  activePublicShelfTab = "listened";
  renderPublicShelf();
});

publicTabWant.addEventListener("click", () => {
  activePublicShelfTab = "want";
  renderPublicShelf();
});

// Dev Day Switcher
document.getElementById("sim-prev-day").addEventListener("click", () => {
  dayOffset -= 1;
  showStationView();
});

document.getElementById("sim-next-day").addEventListener("click", () => {
  dayOffset += 1;
  showStationView();
});

// Boot
(async function init() {
  currentDateLabel.textContent = formatDisplayDate(getActiveDate());

  try {
    const { data } = await sb.auth.getSession();
    if (data?.session?.user) {
      sessionUser = data.session.user;
      userProfile = await loadUserProfile(sessionUser.id);
      showStationView();
    } else {
      showAuthView("signin");
    }
  } catch (err) {
    console.error("Init error:", err);
    showAuthView("signin");
  }
})();