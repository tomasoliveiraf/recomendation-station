const SUPABASE_URL = "https://kenilapjkhfgyyyqfcog.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vCjojbNSbAWFeXXacnxYJA_M0PxLvKI";
const LASTFM_API_KEY = "206b77af8d8f6e6edeafd71d306992ea";

const ITUNES_COUNTRY = "PT";
const COVER_CACHE_KEY = "recommentation_station_covers_v1";
const THEME_KEY = "recommentation_station_theme_v1";
const SHELF_COLS_KEY = "recommentation_station_shelf_cols_v1";
const SHELF_SORT_KEY = "recommentation_station_shelf_sort_v1";
const VALID_SHELF_SORTS = ["recent", "year-desc", "year-asc", "popularity", "title", "artist"];
const PREVIEW_MAX_SECONDS = 15;

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const $ = (id) => document.getElementById(id);

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

const VINYL_PLACEHOLDER_SVG = `
  <svg class="slot-vinyl-svg" viewBox="0 0 28 28" aria-hidden="true">
    <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" stroke-width="1.2" />
    <circle cx="14" cy="14" r="8.2" fill="none" stroke="currentColor" stroke-width="0.6" opacity="0.45" />
    <circle cx="14" cy="14" r="4" fill="none" stroke="currentColor" stroke-width="1" />
    <circle cx="14" cy="14" r="1.1" fill="currentColor" />
  </svg>
`;

// ------------------------------------------------------------
// App State
// ------------------------------------------------------------
let sessionUser = null;
let userProfile = null;
let currentView = "station";
let currentRoute = { type: "station" };
let viewHistory = [];
let authMode = "signin";
let dayOffset = 0;

let currentAlbum = null;
let currentAlbumCoverUrl = "";
let currentInteraction = emptyInteraction();
let stationReqId = 0;

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

let publicShelfItems = [];
let activePublicShelfTab = "listened";

let activeDetailAlbum = null;
let activeDetailInteraction = emptyInteraction();
let detailReqId = 0;
let defaultPreviewTrack = null;

let activeDetailArtist = null;
let artistReqId = 0;

let draftArtists = [];
let draftTopFive = [];
let draftAvatarUrl = "";

const previewAudio = new Audio();
let activePreviewTrack = null;

let coverCache = {};
try {
  coverCache = JSON.parse(localStorage.getItem(COVER_CACHE_KEY) || "{}");
} catch {
  coverCache = {};
}

function emptyInteraction() {
  return { saved: false, listened: false, is_tbr: false, positive_note: "" };
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
// Theme (Dark Default)
// ------------------------------------------------------------
function applyTheme(theme) {
  const isLight = theme === "light";
  if (isLight) {
    document.documentElement.setAttribute("data-theme", "light");
    $("theme-toggle-btn").textContent = "Dark";
  } else {
    document.documentElement.removeAttribute("data-theme");
    $("theme-toggle-btn").textContent = "Light";
  }
  try {
    localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
  } catch { /* ignore */ }
}

applyTheme(localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark");
$("theme-toggle-btn").addEventListener("click", () => {
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
  $("detail-preview-wrap").classList.toggle("hidden", !track);
  if (!track) return;

  $("detail-preview-btn").classList.toggle("playing", isPlaying);
  $("detail-preview-icon").textContent = isPlaying ? "■" : "▶";
  $("detail-preview-text").textContent = `${isPlaying ? "Playing" : "Preview"} · ${track.trackName}`;

  $("detail-tracklist").querySelectorAll(".track-row").forEach((row) => {
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
// Pure Helpers, Capitalization & Strict Anti-Single Rules
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

function normalizeTitleKey(title, artist) {
  return `${(artist || "").toLowerCase().trim()}::${(title || "").toLowerCase().trim()}`;
}

function formatDuration(ms) {
  if (!ms || Number.isNaN(ms)) return "";
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function getDateSeed(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

function renderAvatar(el, avatarUrl, name) {
  if (avatarUrl) {
    el.innerHTML = `<img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(name || "Avatar")}" />`;
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
// External APIs (Last.fm, iTunes & Apple Music Link Parser)
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

async function fetchAlbumPopularity(artist, title) {
  const data = await fetchLastFm("album.getInfo", { artist, album: title, autocorrect: 1 });
  return Number(data?.album?.listeners || 0) || 0;
}

function fetchItunesJsonp(url) {
  return new Promise((resolve, reject) => {
    const cb = `itunesCb_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const script = document.createElement("script");
    const timer = setTimeout(() => { cleanup(); reject(new Error("JSONP timeout")); }, 6000);
    const cleanup = () => { clearTimeout(timer); delete window[cb]; script.remove(); };
    window[cb] = (data) => { cleanup(); resolve(data); };
    script.src = `${url}${url.includes("?") ? "&" : "?"}callback=${cb}`;
    script.onerror = () => { cleanup(); reject(new Error("JSONP error")); };
    document.body.appendChild(script);
  });
}

async function fetchItunesRaw(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Fetch failed");
    return (await res.json()).results || [];
  } catch {
    try { return (await fetchItunesJsonp(url)).results || []; } catch { return []; }
  }
}

const queryItunes = (term, entity, limit = 6, attribute = "") => {
  const attr = attribute ? `&attribute=${attribute}` : "";
  return fetchItunesRaw(
    `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&country=${ITUNES_COUNTRY}&entity=${entity}${attr}&limit=${limit}`
  );
};

const lookupItunes = (id, entity, limit = 60) =>
  fetchItunesRaw(
    `https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}&country=${ITUNES_COUNTRY}&entity=${entity}&limit=${limit}`
  );

const toHighResCover = (url) => (url ? url.replace(/100x100bb/i, "800x800bb") : "");

function extractAppleMusicLink(input) {
  const match = input.match(/apple\.com\/(?:([a-z]{2})\/)?album\/(?:[^/?]+\/)?(?:id)?(\d+)/i);
  return match ? { country: (match[1] || ITUNES_COUNTRY).toUpperCase(), id: match[2] } : null;
}

async function searchNonSingleAlbums(term, limit = 12) {
  const linkInfo = extractAppleMusicLink(term);
  if (linkInfo) {
    const res = await fetchItunesRaw(
      `https://itunes.apple.com/lookup?id=${linkInfo.id}&country=${linkInfo.country}&entity=album`
    );
    const col = res.find((r) => r.wrapperType === "collection" && r.collectionName);
    return col ? [col] : [];
  }

  const [byTitle, general] = await Promise.all([
    queryItunes(term, "album", 30, "albumTerm"),
    queryItunes(term, "album", 50)
  ]);

  const needle = term.toLowerCase().trim();
  const words = needle.split(/\s+/).filter(Boolean);
  const seen = new Set();
  const merged = [];

  for (const item of [...byTitle, ...general]) {
    if (!isNonSingleRelease(item)) continue;
    const key = normalizeTitleKey(item.collectionName, item.artistName);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  merged.sort((a, b) => {
    const score = (x) => {
      const t = x.collectionName.toLowerCase();
      const ar = x.artistName.toLowerCase();
      const full = `${t} ${ar}`;
      if (t === needle) return 5;
      if (t.startsWith(needle)) return 4;
      if (t.includes(needle)) return 3;
      if (words.length > 1 && words.every((w) => full.includes(w))) return 2;
      if (ar.includes(needle)) return 1;
      return 0;
    };
    return score(b) - score(a);
  });

  return merged.slice(0, limit);
}

function toAlbumPayloadFromItunes(item, existingNote = null) {
  return {
    album_id: `itunes-${item.collectionId}`,
    collectionId: item.collectionId,
    artistId: item.artistId,
    title: item.collectionName,
    artist: item.artistName,
    cover_url: toHighResCover(item.artworkUrl100),
    release_year: item.releaseDate ? item.releaseDate.slice(0, 4) : "",
    release_date: item.releaseDate || null,
    genre: item.primaryGenreName || "",
    label: item.copyright || "",
    positive_note: existingNote
  };
}

async function resolveAlbumCover(album) {
  if (album.coverUrl) return album.coverUrl;
  if (coverCache[album.id]) return coverCache[album.id];

  const results = await searchNonSingleAlbums(album.coverQuery || `${album.artist} ${album.title}`, 3);
  const match = results.find((r) => r.collectionName.toLowerCase().includes(album.title.toLowerCase().slice(0, 8))) || results[0];
  const highRes = match ? toHighResCover(match.artworkUrl100) : "";
  if (highRes) {
    coverCache[album.id] = highRes;
    try { localStorage.setItem(COVER_CACHE_KEY, JSON.stringify(coverCache)); } catch { /* ignore */ }
  }
  return highRes;
}

// ------------------------------------------------------------
// Daily Recommendation Engine (Strictly Verified Full-Length LPs)
// ------------------------------------------------------------
function getActiveDate() {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d;
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
  const lfmTags = (lfmInfo.tags?.tag || [])
    .map((t) => t.name)
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

    const similar = (simData?.similarartists?.artist || []).filter(
      (a) => a.name && !favArtists.some((f) => f.toLowerCase() === a.name.toLowerCase())
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

    const rawCandidates = (tagData?.albums?.album || []).filter(
      (alb) => alb.name && alb.artist?.name && !isExcludedCandidate(alb.name, alb.artist.name, excluded)
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

function getFallbackCatalogRecommendation(profile, date, excludedKeys) {
  const all = CATALOG_ITEMS.filter((i) => i.mediaType === "album");
  const fresh = all.filter((a) => !excludedKeys.has(normalizeTitleKey(a.title, a.artist)));
  const base = fresh.length ? fresh : all;
  const matched = base.filter((a) => a.tags.some((t) => (profile?.tastes || []).includes(t)));
  const pool = matched.length ? matched : base;
  const pick = pool[hashString(`${profile.user_id}|${getDateSeed(date)}`) % pool.length];
  return { ...pick, reason: `Curated for ${profile.display_name}` };
}

// ------------------------------------------------------------
// Supabase Data Layer
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

async function loadPastDailyPicks(userId) {
  const { data } = await sb.from("daily_picks").select("title, artist").eq("user_id", userId).order("pick_date", { ascending: false }).limit(90);
  return data || [];
}

async function saveDailyPick(userId, pickDate, pick) {
  const { data } = await sb
    .from("daily_picks")
    .upsert({ user_id: userId, pick_date: pickDate, ...pick }, { onConflict: "user_id,pick_date" })
    .select()
    .single();
  return data || pick;
}

async function loadInteraction(userId, albumId) {
  const { data } = await sb.from("user_album_interactions").select("*").eq("user_id", userId).eq("album_id", albumId).maybeSingle();
  return data || emptyInteraction();
}

async function loadCommunityNotes(albumId) {
  const { data } = await sb.from("user_album_interactions").select("user_id, positive_note").eq("album_id", albumId).not("positive_note", "is", null);
  const nonEmpty = (data || []).filter((r) => r.positive_note?.trim());
  if (!nonEmpty.length) return [];

  const { data: profiles } = await sb.from("user_profiles").select("user_id, display_name").in("user_id", [...new Set(nonEmpty.map((r) => r.user_id))]);
  const names = Object.fromEntries((profiles || []).map((p) => [p.user_id, p.display_name]));

  return nonEmpty.map((r) => ({
    author: names[r.user_id] || "Listener",
    source: r.user_id === sessionUser?.id ? "Your Note" : "Station Listener",
    text: r.positive_note.trim()
  }));
}

async function upsertAlbumOnShelf(albumData) {
  const isFuture = isFutureReleaseDate(albumData.release_date, albumData.release_year);
  const autoTbr = !albumData.listened && (Boolean(albumData.is_tbr) || (Boolean(albumData.saved) && isFuture));
  let pop = Number(albumData.popularity || 0);
  if (!pop && albumData.artist && albumData.title && !autoTbr) {
    pop = await fetchAlbumPopularity(albumData.artist, albumData.title);
  }

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
        release_date: albumData.release_date || null,
        is_tbr: autoTbr,
        popularity: pop,
        saved: Boolean(albumData.saved) || autoTbr,
        listened: Boolean(albumData.listened),
        positive_note: albumData.positive_note ?? null,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id,album_id" }
    )
    .select()
    .single();

  if (error) throw error;
  syncShelfCache(data);
  return data;
}

async function deleteAlbumFromShelf(albumId) {
  const { error } = await sb.from("user_album_interactions").delete().eq("user_id", sessionUser.id).eq("album_id", albumId);
  if (error) throw error;
  syncShelfCache(null, albumId);
}

async function loadUserShelf(userId) {
  const { data } = await sb.from("user_album_interactions").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
  return (data || []).map((row) => {
    if (row.title) return row;
    const cat = CATALOG_ITEMS.find((c) => c.id === row.album_id);
    return cat ? { ...row, title: cat.title, artist: cat.artist, release_year: String(cat.year), cover_url: row.cover_url || coverCache[cat.id] || "" } : row;
  });
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
// Shared UI Builders (Notes, Album Cards, Listener Cards)
// ------------------------------------------------------------
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
    card.innerHTML = `
      <p class="review-quote">“${escapeHtml(rev.text)}”</p>
      <footer class="review-author">— ${escapeHtml(rev.author)} (${escapeHtml(rev.source)})</footer>
    `;
    listEl.appendChild(card);
  });
}

function createAlbumCard(item, { mode = "artist", existing = null, onShelfChanged = null } = {}) {
  const isTbr = isItemTbr(item);
  const isFuture = isFutureReleaseDate(item.release_date, item.release_year);
  const hasCoverActions = mode === "search" || mode === "artist";
  const noteText = item.positive_note ? escapeHtml(item.positive_note) : "";
  const payload = {
    album_id: item.album_id,
    collectionId: item.collectionId || null,
    artistId: item.artistId || null,
    title: item.title || item.album_id,
    artist: item.artist || "Unknown artist",
    cover_url: item.cover_url || "",
    release_year: item.release_year || "",
    release_date: item.release_date || null,
    genre: item.genre || "",
    label: item.label || ""
  };

  const subtitleHtml =
    mode === "artist"
      ? `<span class="meta-label">${escapeHtml(payload.release_year || "Release")}${item.trackCount ? ` · ${item.trackCount} tracks` : ""}</span>`
      : `<button class="shelf-card-artist js-open-artist" type="button">${escapeHtml(payload.artist)}${payload.release_year && !isTbr ? ` · ${escapeHtml(payload.release_year)}` : ""}</button>`;

  const tbrTagHtml =
    (mode === "shelf" || mode === "public") && isTbr
      ? `<span class="tbr-date-tag">TBR · ${escapeHtml(formatShortReleaseDate(item.release_date))}</span>`
      : "";

  const noteHtml = (mode === "shelf" || mode === "public") && noteText ? `<p class="shelf-card-note">“${noteText}”</p>` : "";

  const coverOverlayHtml = hasCoverActions
    ? `<div class="cover-hover-actions">
         <button class="cover-action-btn js-want" type="button"></button>
         <button class="cover-action-btn js-listened" type="button"></button>
       </div>`
    : "";

  let actionsHtml = "";
  if (mode === "shelf") {
    const toggleTbrBtn = !item.listened
      ? `<button class="text-btn js-toggle-tbr" type="button">${isTbr ? "Move to Want" : "Move to TBR"}</button>`
      : "";
    actionsHtml = `
      <div class="shelf-card-actions">
        <button class="text-btn js-switch-shelf" type="button">${item.listened ? "Move to Want" : "Mark Listened"}</button>
        ${toggleTbrBtn}
        <button class="text-btn js-edit-note" type="button">${noteText ? "Edit note" : "Add note"}</button>
        <button class="text-btn js-remove-shelf" type="button">Remove</button>
      </div>
      <div class="shelf-note-editor hidden">
        <textarea rows="2" placeholder="Write your note (no scores)...">${noteText}</textarea>
        <div class="note-actions">
          <button class="text-btn js-save-note" type="button">Save</button>
          <button class="text-btn js-cancel-note" type="button">Cancel</button>
        </div>
      </div>`;
  }

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
    </div>
    ${noteHtml}
    ${actionsHtml}
  `;

  card.querySelectorAll(".js-open-album").forEach((el) => el.addEventListener("click", () => openAlbumDetail(payload)));
  card.querySelector(".js-open-artist")?.addEventListener("click", () => openArtistDetail({ artistId: payload.artistId, name: payload.artist }));

  if (mode === "shelf") {
    card.querySelector(".js-switch-shelf").addEventListener("click", async () => {
      const nextListened = !item.listened;
      await upsertAlbumOnShelf({ ...item, listened: nextListened, saved: !nextListened, is_tbr: false });
      onShelfChanged?.();
    });
    card.querySelector(".js-toggle-tbr")?.addEventListener("click", async () => {
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
    card.querySelector(".js-remove-shelf").addEventListener("click", async () => {
      await deleteAlbumFromShelf(item.album_id);
      onShelfChanged?.(item.album_id);
    });
    const editor = card.querySelector(".shelf-note-editor");
    const ta = editor.querySelector("textarea");
    card.querySelector(".js-edit-note").addEventListener("click", () => {
      editor.classList.toggle("hidden");
      if (!editor.classList.contains("hidden")) ta.focus();
    });
    card.querySelector(".js-cancel-note").addEventListener("click", () => editor.classList.add("hidden"));
    card.querySelector(".js-save-note").addEventListener("click", async () => {
      await upsertAlbumOnShelf({ ...item, positive_note: ta.value.trim() || null });
      onShelfChanged?.();
    });
  } else if (hasCoverActions) {
    let cardState = existing ? { ...existing } : null;
    const wantEl = card.querySelector(".js-want");
    const listenedEl = card.querySelector(".js-listened");

    const syncButtons = () => {
      const onTbr = Boolean(cardState && isItemTbr(cardState));
      const onWant = Boolean(cardState?.saved && !cardState?.listened && !onTbr);
      const onListened = Boolean(cardState?.listened);

      wantEl.classList.toggle("active", onWant || onTbr);
      wantEl.textContent = onTbr ? "On TBR" : onWant ? "On Want" : isFuture ? "+ TBR" : "+ Want";

      listenedEl.classList.toggle("active", onListened);
      listenedEl.textContent = onListened ? "Listened" : "+ Listened";
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
    openPublicProfile(profile, false);
  });
  return card;
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
  "artist-detail": "artist-detail-view"
};

function setActiveNav(view) {
  stopPreview();
  currentView = view;
  const ready = Boolean(sessionUser && userProfile?.tastes?.length);

  $("main-nav").classList.toggle("hidden", !ready);
  $("sign-out-btn").classList.toggle("hidden", !sessionUser);
  $("dev-day-controls").classList.toggle("hidden", view !== "station" || !ready);

  ["station", "shelf", "search", "listeners", "profile"].forEach((k) => {
    $(`nav-${k}`).classList.toggle("active", view === k);
  });

  $("auth-view").classList.toggle("hidden", view !== "auth" && view !== "profile");
  Object.entries(VIEW_IDS).forEach(([k, id]) => $(id).classList.toggle("hidden", view !== k));
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
    "public-profile": () => { setActiveNav("listeners"); currentRoute = prev; openPublicProfile(prev.profile, false); },
    "album-detail": () => openAlbumDetail(prev.album, false),
    "artist-detail": () => openArtistDetail(prev.artist, false)
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
  viewHistory = [];
  currentRoute = { type: mode === "edit" ? "profile" : "auth" };
  setActiveNav(mode === "edit" ? "profile" : "auth");
  setAuthMode(mode);
}

// ------------------------------------------------------------
// Station View (Daily Recommendation)
// ------------------------------------------------------------
function renderStationButtons() {
  $("want-btn").classList.toggle("selected", Boolean(currentInteraction.saved && !currentInteraction.listened));
  $("listened-btn").classList.toggle("selected", Boolean(currentInteraction.listened));
  $("personal-note-input").value = currentInteraction.positive_note || "";
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
      saved: currentInteraction.saved,
      listened: currentInteraction.listened,
      is_tbr: false,
      positive_note: currentInteraction.positive_note || null
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

  let storedPick = await loadDailyPick(sessionUser.id, dateSeed);
  if (reqId !== stationReqId) return;

  let resolvedAlbum = null;

  if (storedPick && !isStoredPickInvalid(storedPick)) {
    resolvedAlbum = mapStoredPickToAlbum(storedPick);
  } else {
    const [pastPicks, myShelf] = await Promise.all([loadPastDailyPicks(sessionUser.id), loadUserShelf(sessionUser.id)]);
    if (reqId !== stationReqId) return;

    const excluded = buildExcludedSets(userProfile, pastPicks, myShelf);
    const dynamicPick = await generateDynamicDailyPick(userProfile, dateSeed, excluded);
    if (reqId !== stationReqId) return;

    resolvedAlbum = dynamicPick
      ? mapStoredPickToAlbum(await saveDailyPick(sessionUser.id, dateSeed, dynamicPick))
      : getFallbackCatalogRecommendation(userProfile, activeDate, excluded.keys);
    if (reqId !== stationReqId) return;
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

  $("album-tags").innerHTML = (currentAlbum.tags || []).map((t) => `<span class="tag-pill">${escapeHtml(t)}</span>`).join("");
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
    runtime: currentAlbum.runtime,
    genre: currentAlbum.genre || currentAlbum.tags?.[0] || "",
    label: currentAlbum.label,
    synopsis: currentAlbum.synopsis,
    reviews: currentAlbum.reviews,
    coverQuery: currentAlbum.coverQuery
  });
}

// ------------------------------------------------------------
// Album Detail Page
// ------------------------------------------------------------
function renderDetailButtons() {
  const tbr = isItemTbr(activeDetailInteraction);
  $("detail-want-btn").classList.toggle("selected", Boolean(activeDetailInteraction.saved && !activeDetailInteraction.listened && !tbr));
  $("detail-tbr-btn").classList.toggle("selected", tbr);
  $("detail-listened-btn").classList.toggle("selected", Boolean(activeDetailInteraction.listened));
  $("detail-note-input").value = activeDetailInteraction.positive_note || "";

  const inTopFive = (userProfile?.top_five_albums || []).some((a) => a.album_id === activeDetailAlbum?.album_id);
  $("detail-topfive-btn").classList.toggle("selected", inTopFive);
  $("detail-topfive-btn").textContent = inTopFive ? "In Top 5" : "+ Top 5";
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
      positive_note: activeDetailInteraction.positive_note || null
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
    label: input.label || cat?.label || "",
    synopsis: input.synopsis || cat?.synopsis || "",
    reviews: input.reviews || cat?.reviews || [],
    coverQuery: input.coverQuery || cat?.coverQuery || ""
  };

  defaultPreviewTrack = null;
  currentRoute = { type: "album-detail", album: { ...activeDetailAlbum } };
  setActiveNav("album-detail");

  $("detail-album-cover").src = activeDetailAlbum.cover_url;
  $("detail-album-cover").alt = `${activeDetailAlbum.title} by ${activeDetailAlbum.artist}`;
  $("detail-album-artist-btn").textContent = activeDetailAlbum.artist;
  $("detail-album-title").textContent = activeDetailAlbum.title;
  $("detail-album-year").textContent = activeDetailAlbum.release_year || "—";
  $("detail-album-runtime").textContent = activeDetailAlbum.runtime || "—";
  $("detail-album-genre").textContent = activeDetailAlbum.genre || "—";
  $("detail-album-label").textContent = activeDetailAlbum.label || "";
  $("detail-preview-wrap").classList.add("hidden");
  $("detail-album-synopsis").textContent = activeDetailAlbum.synopsis || "";
  $("detail-album-synopsis").classList.toggle("hidden", !activeDetailAlbum.synopsis);
  $("detail-tracklist-count").textContent = "Loading...";
  $("detail-tracklist").innerHTML = "";
  $("detail-note-status").textContent = "";

  const [interaction, communityNotes] = await Promise.all([
    loadInteraction(sessionUser.id, activeDetailAlbum.album_id),
    loadCommunityNotes(activeDetailAlbum.album_id)
  ]);
  if (reqId !== detailReqId) return;

  activeDetailInteraction = interaction;
  renderDetailButtons();
  renderNotes($("detail-notes-list"), $("detail-notes-count"), activeDetailAlbum.reviews, communityNotes);

  if (!activeDetailAlbum.synopsis) {
    fetchLastFm("album.getInfo", { artist: activeDetailAlbum.artist, album: activeDetailAlbum.title, autocorrect: 1 }).then((info) => {
      if (reqId !== detailReqId) return;
      const summary = cleanLastFmWiki(info?.album?.wiki?.summary || "");
      if (summary) {
        activeDetailAlbum.synopsis = summary;
        $("detail-album-synopsis").textContent = summary;
        $("detail-album-synopsis").classList.remove("hidden");
      }
    });
  }

  let colId = activeDetailAlbum.collectionId;
  if (!colId && !activeDetailAlbum.album_id?.startsWith("tbr-")) {
    const found = await searchNonSingleAlbums(activeDetailAlbum.coverQuery || `${activeDetailAlbum.artist} ${activeDetailAlbum.title}`, 3);
    if (reqId !== detailReqId) return;
    const best = found.find((r) => r.collectionName.toLowerCase().includes(activeDetailAlbum.title.toLowerCase().slice(0, 8))) || found[0];
    if (best) {
      colId = best.collectionId;
      activeDetailAlbum.collectionId = colId;
      activeDetailAlbum.artistId = activeDetailAlbum.artistId || best.artistId;
      activeDetailAlbum.release_date = activeDetailAlbum.release_date || best.releaseDate || null;
      if (!activeDetailAlbum.cover_url && best.artworkUrl100) {
        activeDetailAlbum.cover_url = toHighResCover(best.artworkUrl100);
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

      if (activeDetailInteraction.saved && !activeDetailInteraction.listened && !activeDetailInteraction.is_tbr && isFutureReleaseDate(colMeta.releaseDate)) {
        saveDetailInteraction({ saved: true, listened: false, is_tbr: true });
      }
    }
    if (colMeta.primaryGenreName) $("detail-album-genre").textContent = colMeta.primaryGenreName;
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

// ------------------------------------------------------------
// Artist Detail Page (LPs First, EPs Second, Zero Singles + Cover Hover Actions)
// ------------------------------------------------------------
function updateFavArtistBtn() {
  if (!activeDetailArtist || !userProfile) return;
  const isFav = (userProfile.favorite_artists || []).some((a) => a.toLowerCase() === activeDetailArtist.name.toLowerCase());
  $("detail-artist-fav-btn").classList.toggle("selected", isFav);
  $("detail-artist-fav-btn").textContent = isFav ? "Favorited artist" : "+ Favorite artist";
}

async function openArtistDetail(input, push = true) {
  if (!sessionUser) return showAuthView("signin");
  if (push) pushRoute();

  const reqId = ++artistReqId;
  activeDetailArtist = { artistId: input.artistId || null, name: formatDisplayNameCase(input.name || "Artist"), genre: input.genre || "" };
  currentRoute = { type: "artist-detail", artist: { ...activeDetailArtist } };
  setActiveNav("artist-detail");

  $("detail-artist-name").textContent = activeDetailArtist.name;
  $("detail-artist-genre").textContent = activeDetailArtist.genre || "Artist";
  $("detail-artist-status").textContent = "Loading discography...";
  $("artist-lps-section").classList.add("hidden");
  $("artist-eps-section").classList.add("hidden");
  $("detail-artist-empty").classList.add("hidden");
  updateFavArtistBtn();

  // Fetch user's shelf in parallel so hover buttons reflect saved/listened state accurately
  const shelfPromise = loadUserShelf(sessionUser.id);

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

  let raw = [];
  if (artistId) {
    const res = await lookupItunes(artistId, "album", 100);
    if (reqId !== artistReqId) return;
    const meta = res.find((r) => r.wrapperType === "artist");
    if (meta?.primaryGenreName) $("detail-artist-genre").textContent = meta.primaryGenreName;
    raw = res.filter((r) => r.wrapperType === "collection" && isNonSingleRelease(r));
  } else {
    raw = await searchNonSingleAlbums(activeDetailArtist.name, 25);
    if (reqId !== artistReqId) return;
  }

  shelfItems = await shelfPromise;
  if (reqId !== artistReqId) return;

  const seen = new Set();
  const unique = raw
    .filter((a) => {
      const k = a.collectionName.toLowerCase().trim();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => (b.releaseDate || "").localeCompare(a.releaseDate || ""));

  const lps = unique.filter((r) => classifyRelease(r) === "lp");
  const eps = unique.filter((r) => classifyRelease(r) === "ep");

  $("detail-artist-status").textContent = "";

  const fillGrid = (sectionId, countId, gridId, list, singular, plural) => {
    if (!list.length) return;
    $(countId).textContent = `${list.length} ${list.length === 1 ? singular : plural}`;
    const grid = $(gridId);
    grid.innerHTML = "";
    list.forEach((item) => {
      const payload = { ...toAlbumPayloadFromItunes(item), trackCount: item.trackCount };
      const existing = shelfItems.find((s) => s.album_id === payload.album_id);
      grid.appendChild(createAlbumCard(payload, { mode: "artist", existing }));
    });
    $(sectionId).classList.remove("hidden");
  };

  fillGrid("artist-lps-section", "artist-lps-count", "artist-lps-grid", lps, "album", "albums");
  fillGrid("artist-eps-section", "artist-eps-count", "artist-eps-grid", eps, "EP", "EPs");
  $("detail-artist-empty").classList.toggle("hidden", lps.length > 0 || eps.length > 0);
}

// ------------------------------------------------------------
// Shelf View (Want / TBR / Listened + Persistent Sort + Mobile Columns)
// ------------------------------------------------------------
async function showShelfView(clearHistory = true) {
  if (!sessionUser) return showAuthView("signin");
  if (clearHistory) viewHistory = [];
  currentRoute = { type: "shelf" };
  setActiveNav("shelf");
  $("shelf-sort-select").value = activeShelfSort;
  shelfItems = await loadUserShelf(sessionUser.id);
  renderShelf();
  if (activeShelfSort === "popularity") backfillPopularityIfNeeded();
}

function sortShelfList(list, mode) {
  const year = (i) => parseInt(i.release_year || (i.release_date || "").slice(0, 4), 10) || 0;
  const sorters = {
    "year-desc": (a, b) => year(b) - year(a),
    "year-asc": (a, b) => (year(a) || 9999) - (year(b) || 9999),
    popularity: (a, b) => Number(b.popularity || 0) - Number(a.popularity || 0),
    title: (a, b) => (a.title || "").localeCompare(b.title || ""),
    artist: (a, b) => (a.artist || "").localeCompare(b.artist || ""),
    recent: (a, b) => (b.updated_at || "").localeCompare(a.updated_at || "")
  };
  return [...list].sort(sorters[mode] || sorters.recent);
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
  if (currentView === "shelf" && activeShelfSort === "popularity") renderShelf();
}

function renderShelf() {
  const buckets = {
    tbr: shelfItems.filter((i) => isItemTbr(i)),
    want: shelfItems.filter((i) => i.saved && !i.listened && !isItemTbr(i)),
    listened: shelfItems.filter((i) => i.listened)
  };

  ["want", "tbr", "listened"].forEach((k) => {
    $(`count-${k}`).textContent = buckets[k].length;
    $(`tab-${k}`).classList.toggle("active", activeShelfTab === k);
  });
  $("tbr-manual-bar").classList.toggle("hidden", activeShelfTab !== "tbr");

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
// Search Dropdown & Full Search Results (Zero Singles + Link Support)
// ------------------------------------------------------------
async function populateAlbumDropdown(term, container, onClear) {
  if (term.length < 2) return container.classList.add("hidden");
  const results = await searchNonSingleAlbums(term, 12);
  container.innerHTML = "";
  if (!results.length) return container.classList.add("hidden");

  results.forEach((item) => {
    const albumId = `itunes-${item.collectionId}`;
    const isFuture = isFutureReleaseDate(item.releaseDate);
    const existing = shelfItems.find((s) => s.album_id === albumId);
    const payload = toAlbumPayloadFromItunes(item, existing?.positive_note || null);

    const row = document.createElement("div");
    row.className = "search-result-item";
    row.innerHTML = `
      <div class="search-result-left clickable-part js-open-album">
        <img class="search-thumb" src="${escapeHtml(item.artworkUrl100 || "")}" alt="" />
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

async function runFullSearch(query) {
  lastSearchQuery = query;
  currentRoute = { type: "search", query };
  $("global-search-dropdown").classList.add("hidden");
  $("search-results-status").textContent = `Searching for “${query}”...`;
  ["search-artists-section", "search-albums-section", "search-listeners-section", "search-empty-state"].forEach((id) =>
    $(id).classList.add("hidden")
  );

  const isLink = Boolean(extractAppleMusicLink(query));
  const [albums, artistsRaw, listeners, myShelf] = await Promise.all([
    searchNonSingleAlbums(query, 20),
    isLink ? Promise.resolve([]) : queryItunes(query, "musicArtist", 8),
    isLink ? Promise.resolve([]) : searchListeners(query),
    loadUserShelf(sessionUser.id)
  ]);
  shelfItems = myShelf;

  const seenArtists = new Set();
  const artists = artistsRaw.filter((a) => {
    if (!a.artistName) return false;
    const k = a.artistName.toLowerCase();
    return seenArtists.has(k) ? false : (seenArtists.add(k), true);
  });

  const total = artists.length + albums.length + listeners.length;
  $("search-results-status").textContent = isLink
    ? `${total} ${total === 1 ? "album" : "albums"} found from link`
    : `${total} ${total === 1 ? "result" : "results"} for “${query}”`;
  if (!total) return $("search-empty-state").classList.remove("hidden");

  if (artists.length) {
    const list = $("search-artists-list");
    list.innerHTML = "";
    artists.forEach((a) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "artist-pill-btn";
      btn.innerHTML = `<span class="artist-pill-name">${escapeHtml(a.artistName)}</span><span class="artist-pill-genre">${escapeHtml(a.primaryGenreName || "Artist")}</span>`;
      btn.addEventListener("click", () => openArtistDetail({ artistId: a.artistId, name: a.artistName, genre: a.primaryGenreName || "" }));
      list.appendChild(btn);
    });
    $("search-artists-section").classList.remove("hidden");
  }

  if (albums.length) {
    const grid = $("search-albums-grid");
    grid.innerHTML = "";
    albums.forEach((item) => {
      const payload = toAlbumPayloadFromItunes(item);
      const existing = shelfItems.find((s) => s.album_id === payload.album_id);
      grid.appendChild(createAlbumCard(payload, { mode: "search", existing }));
    });
    $("search-albums-section").classList.remove("hidden");
  }

  if (listeners.length) {
    const list = $("search-listeners-list");
    list.innerHTML = "";
    listeners.forEach((p) => list.appendChild(createListenerCard(p)));
    $("search-listeners-section").classList.remove("hidden");
  }
}

// ------------------------------------------------------------
// Listeners Directory & Public Profile
// ------------------------------------------------------------
async function showListenersView(clearHistory = true) {
  if (!sessionUser) return showAuthView("signin");
  if (clearHistory) viewHistory = [];
  currentRoute = { type: "listeners" };
  setActiveNav("listeners");
  $("listeners-directory").classList.remove("hidden");
  $("public-profile-view").classList.add("hidden");
  await renderListenersDirectory($("user-search-input").value);
}

async function renderListenersDirectory(query = "") {
  const users = await searchListeners(query);
  const list = $("listeners-list");
  list.innerHTML = "";
  $("listeners-empty").classList.toggle("hidden", users.length > 0);
  users.forEach((p) => list.appendChild(createListenerCard(p)));
}

async function openPublicProfile(profile, push = true) {
  if (push) pushRoute();
  currentRoute = { type: "public-profile", profile };
  $("listeners-directory").classList.add("hidden");
  $("public-profile-view").classList.remove("hidden");

  renderAvatar($("public-avatar"), profile.avatar_url, profile.display_name);
  $("public-name").textContent = profile.display_name;
  $("public-bio").textContent = profile.bio || "";
  $("public-bio").classList.toggle("hidden", !profile.bio);
  $("public-tastes").innerHTML = (profile.tastes || []).map((t) => `<span class="tag-pill">${escapeHtml(t)}</span>`).join("");

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

  publicShelfItems = await loadUserShelf(profile.user_id);
  activePublicShelfTab = "listened";
  renderPublicShelf();
}

function renderPublicShelf() {
  const buckets = {
    listened: publicShelfItems.filter((i) => i.listened),
    tbr: publicShelfItems.filter((i) => isItemTbr(i)),
    want: publicShelfItems.filter((i) => i.saved && !i.listened && !isItemTbr(i))
  };

  ["listened", "want", "tbr"].forEach((k) => {
    $(`public-count-${k}`).textContent = buckets[k].length;
    $(`public-tab-${k}`).classList.toggle("active", activePublicShelfTab === k);
  });

  const visible = buckets[activePublicShelfTab];
  const grid = $("public-shelf-grid");
  grid.innerHTML = "";
  $("public-shelf-empty").classList.toggle("hidden", visible.length > 0);
  visible.forEach((item) => grid.appendChild(createAlbumCard(item, { mode: "public" })));
}

// ------------------------------------------------------------
// Onboarding Search Handlers (Artists & Non-Single Top 5 Albums)
// ------------------------------------------------------------
const handleOnboardingArtistSearch = debounce(async () => {
  const term = $("artist-search-input").value.trim();
  const box = $("artist-search-results");
  if (term.length < 2) return box.classList.add("hidden");

  const results = await queryItunes(term, "musicArtist", 8);
  box.innerHTML = "";
  const seen = new Set();
  results.forEach((item) => {
    if (!item.artistName || seen.has(item.artistName)) return;
    seen.add(item.artistName);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "search-result-item clickable";
    btn.innerHTML = `<span class="search-item-text"><span class="search-item-title">${escapeHtml(item.artistName)}</span><span class="search-item-sub">${escapeHtml(item.primaryGenreName || "Artist")}</span></span>`;
    btn.addEventListener("click", () => {
      if (!draftArtists.some((a) => a.toLowerCase() === item.artistName.toLowerCase())) {
        draftArtists.push(item.artistName);
        refreshArtistChips();
      }
      $("artist-search-input").value = "";
      box.classList.add("hidden");
    });
    box.appendChild(btn);
  });
  box.classList.toggle("hidden", !box.children.length);
}, 280);

const handleOnboardingAlbumSearch = debounce(async () => {
  const term = $("album-search-input").value.trim();
  const box = $("album-search-results");
  if (term.length < 2 || draftTopFive.length >= 5) return box.classList.add("hidden");

  const results = await searchNonSingleAlbums(term, 12);
  box.innerHTML = "";
  results.forEach((item) => {
    const payload = toAlbumPayloadFromItunes(item);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "search-result-item clickable";
    btn.innerHTML = `
      <div class="search-result-left">
        <img class="search-thumb" src="${escapeHtml(item.artworkUrl100 || "")}" alt="" />
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
}, 280);

// ------------------------------------------------------------
// Event Listeners
// ------------------------------------------------------------
$("brand-home-btn").addEventListener("click", () => sessionUser && userProfile?.tastes?.length && showStationView());
$("nav-station").addEventListener("click", () => showStationView());
$("nav-shelf").addEventListener("click", () => showShelfView());
$("nav-search").addEventListener("click", () => showSearchView(lastSearchQuery));
$("nav-listeners").addEventListener("click", () => showListenersView());
$("nav-profile").addEventListener("click", () => showAuthView("edit"));

$("mode-signin").addEventListener("click", () => setAuthMode("signin"));
$("mode-signup").addEventListener("click", () => setAuthMode("signup"));
$("cancel-auth-btn").addEventListener("click", () => showStationView());
$("sign-out-btn").addEventListener("click", async () => {
  stopPreview();
  await sb.auth.signOut();
  sessionUser = null;
  userProfile = null;
  showAuthView("signin");
});

// Station triggers
[$("station-cover-btn"), $("album-title"), $("station-open-details-btn")].forEach((el) =>
  el.addEventListener("click", openStationAlbumDetail)
);
$("album-artist").addEventListener("click", () => currentAlbum && openArtistDetail({ artistId: currentAlbum.artistId, name: currentAlbum.artist }));

$("want-btn").addEventListener("click", () => {
  const next = !(currentInteraction.saved && !currentInteraction.listened);
  saveStationInteraction({ saved: next, listened: next ? false : currentInteraction.listened });
});
$("listened-btn").addEventListener("click", () => {
  const next = !currentInteraction.listened;
  saveStationInteraction({ listened: next, saved: next ? false : currentInteraction.saved });
});
$("personal-note-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("note-status").textContent = "Saving...";
  const hasShelf = currentInteraction.saved || currentInteraction.listened;
  await saveStationInteraction({ positive_note: $("personal-note-input").value.trim(), listened: hasShelf ? currentInteraction.listened : true });
  $("note-status").textContent = "Saved";
  renderNotes($("reviews-list"), $("review-source-note"), currentAlbum.reviews, await loadCommunityNotes(currentAlbum.id));
});

// Album & Artist Detail triggers
$("album-detail-back").addEventListener("click", goBack);
$("artist-detail-back").addEventListener("click", goBack);
$("detail-preview-btn").addEventListener("click", () =>
  activePreviewTrack && !previewAudio.paused ? stopPreview() : defaultPreviewTrack && togglePreviewTrack(defaultPreviewTrack)
);
$("detail-album-artist-btn").addEventListener("click", () =>
  activeDetailAlbum && openArtistDetail({ artistId: activeDetailAlbum.artistId, name: activeDetailAlbum.artist })
);

$("detail-want-btn").addEventListener("click", () => {
  const isFuture = isFutureReleaseDate(activeDetailAlbum?.release_date, activeDetailAlbum?.release_year);
  if (isFuture) {
    const onTbr = isItemTbr(activeDetailInteraction);
    return saveDetailInteraction({ is_tbr: !onTbr, saved: !onTbr, listened: false });
  }
  const on = Boolean(activeDetailInteraction.saved && !activeDetailInteraction.listened && !isItemTbr(activeDetailInteraction));
  saveDetailInteraction({ saved: !on, listened: false, is_tbr: false });
});
$("detail-tbr-btn").addEventListener("click", () => {
  const on = isItemTbr(activeDetailInteraction);
  saveDetailInteraction({ is_tbr: !on, saved: !on, listened: false });
});
$("detail-listened-btn").addEventListener("click", () => {
  saveDetailInteraction({ listened: !activeDetailInteraction.listened, saved: false, is_tbr: false });
});
$("detail-topfive-btn").addEventListener("click", async () => {
  if (!activeDetailAlbum || !userProfile) return;
  const current = Array.isArray(userProfile.top_five_albums) ? [...userProfile.top_five_albums] : [];
  const idx = current.findIndex((a) => a.album_id === activeDetailAlbum.album_id);

  if (idx >= 0) {
    current.splice(idx, 1);
  } else {
    if (current.length >= 5) {
      $("detail-topfive-btn").textContent = "Top 5 full (5/5)";
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

$("detail-note-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("detail-note-status").textContent = "Saving...";
  const hasShelf = activeDetailInteraction.saved || activeDetailInteraction.listened || activeDetailInteraction.is_tbr;
  await saveDetailInteraction({ positive_note: $("detail-note-input").value.trim(), listened: hasShelf ? activeDetailInteraction.listened : true });
  $("detail-note-status").textContent = "Saved";
  renderNotes($("detail-notes-list"), $("detail-notes-count"), activeDetailAlbum.reviews, await loadCommunityNotes(activeDetailAlbum.album_id));
});

$("detail-artist-fav-btn").addEventListener("click", async () => {
  if (!activeDetailArtist || !userProfile) return;
  const favs = userProfile.favorite_artists || [];
  const exists = favs.some((a) => a.toLowerCase() === activeDetailArtist.name.toLowerCase());
  const next = exists ? favs.filter((a) => a.toLowerCase() !== activeDetailArtist.name.toLowerCase()) : [...favs, activeDetailArtist.name];
  await saveProfilePatch({ favorite_artists: next });
  updateFavArtistBtn();
});

// Profile Avatar & Form
$("name-input").addEventListener("input", () => !draftAvatarUrl && updateAvatarPreview());
$("avatar-file-input").addEventListener("change", async (e) => {
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
$("remove-avatar-btn").addEventListener("click", () => { draftAvatarUrl = ""; updateAvatarPreview(); });

$("artist-search-input").addEventListener("input", handleOnboardingArtistSearch);
$("album-search-input").addEventListener("input", handleOnboardingAlbumSearch);
$("artist-search-input").addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  const val = formatDisplayNameCase(e.target.value.trim());
  if (val && !draftArtists.some((a) => a.toLowerCase() === val.toLowerCase())) {
    draftArtists.push(val);
    refreshArtistChips();
  }
  e.target.value = "";
  $("artist-search-results").classList.add("hidden");
});

$("auth-form").addEventListener("submit", async (e) => {
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
      return showStationView();
    }

    const email = $("email-input").value.trim();
    const password = $("password-input").value;

    if (authMode === "signup") {
      const draft = profilePayload();
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) throw error;
      if (data.user && data.session) {
        sessionUser = data.user;
        userProfile = await upsertUserProfile({ user_id: data.user.id, ...draft });
        showStationView();
      } else {
        fb.textContent = "Check your inbox to confirm your email, then sign in.";
        fb.classList.remove("hidden");
      }
    } else {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      sessionUser = data.user;
      userProfile = await loadUserProfile(data.user.id);
      showStationView();
    }
  } catch (err) {
    fb.textContent = err.message || "Authentication error.";
    fb.classList.remove("hidden");
  }
});

// Shelf, Search & Listeners
$("shelf-album-search").addEventListener("input", debounce(() => {
  populateAlbumDropdown($("shelf-album-search").value.trim(), $("shelf-search-results"), () => {
    $("shelf-album-search").value = "";
    $("shelf-search-results").classList.add("hidden");
  });
}, 280));
$("shelf-album-search").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const q = e.target.value.trim();
    $("shelf-search-results").classList.add("hidden");
    if (q) showSearchView(q, false);
  }
});

$("global-search-input").addEventListener("input", debounce(() => {
  populateAlbumDropdown($("global-search-input").value.trim(), $("global-search-dropdown"), () =>
    $("global-search-dropdown").classList.add("hidden")
  );
}, 280));
$("global-search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = $("global-search-input").value.trim();
  if (q) runFullSearch(q);
});
$("user-search-input").addEventListener("input", debounce(() => renderListenersDirectory($("user-search-input").value), 250));

document.addEventListener("click", (e) => {
  if (!e.target.closest("#artists-fieldset")) $("artist-search-results").classList.add("hidden");
  if (!e.target.closest("#albums-fieldset")) $("album-search-results").classList.add("hidden");
  if (!e.target.closest("#shelf-view .search-box")) $("shelf-search-results").classList.add("hidden");
  if (!e.target.closest("#global-search-form")) $("global-search-dropdown").classList.add("hidden");
});

["want", "tbr", "listened"].forEach((tab) => {
  $(`tab-${tab}`).addEventListener("click", () => { activeShelfTab = tab; renderShelf(); });
  $(`public-tab-${tab}`).addEventListener("click", () => { activePublicShelfTab = tab; renderPublicShelf(); });
});

$("shelf-sort-select").value = activeShelfSort;
$("shelf-sort-select").addEventListener("change", () => {
  activeShelfSort = $("shelf-sort-select").value;
  try { localStorage.setItem(SHELF_SORT_KEY, activeShelfSort); } catch { /* ignore */ }
  renderShelf();
  if (activeShelfSort === "popularity") backfillPopularityIfNeeded();
});

function applyShelfMobileCols(cols) {
  const isTwo = cols === "2";
  const grid = $("shelf-grid");
  grid.classList.toggle("mobile-cols-2", isTwo);
  grid.classList.toggle("mobile-cols-1", !isTwo);
  $("shelf-grid-toggle").textContent = isTwo ? "1 col" : "2 cols";
  try { localStorage.setItem(SHELF_COLS_KEY, isTwo ? "2" : "1"); } catch { /* ignore */ }
}

applyShelfMobileCols(localStorage.getItem(SHELF_COLS_KEY) === "2" ? "2" : "1");
$("shelf-grid-toggle").addEventListener("click", () => {
  const isTwo = $("shelf-grid").classList.contains("mobile-cols-2");
  applyShelfMobileCols(isTwo ? "1" : "2");
});

$("tbr-toggle-form-btn").addEventListener("click", () => {
  $("tbr-manual-form").classList.toggle("hidden");
  if (!$("tbr-manual-form").classList.contains("hidden")) $("tbr-title-input").focus();
});
$("tbr-cancel-btn").addEventListener("click", () => {
  $("tbr-manual-form").classList.add("hidden");
  $("tbr-manual-form").reset();
});
$("tbr-manual-form").addEventListener("submit", async (e) => {
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

$("back-to-listeners-btn").addEventListener("click", () => {
  if (viewHistory.length) return goBack();
  $("public-profile-view").classList.add("hidden");
  $("listeners-directory").classList.remove("hidden");
});

$("sim-prev-day").addEventListener("click", () => { dayOffset -= 1; showStationView(); });
$("sim-next-day").addEventListener("click", () => { dayOffset += 1; showStationView(); });

// ------------------------------------------------------------
// Boot
// ------------------------------------------------------------
(async function init() {
  $("current-date-label").textContent = formatDisplayDate(getActiveDate());
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