const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY";

const LOCAL_PROFILE_KEY = "recommentation_station_profile_v1";
const LOCAL_INTERACTIONS_KEY = "recommentation_station_interactions_v1";

// Automatically switches to Supabase once real keys are pasted
const hasSupabaseKeys =
  SUPABASE_URL.startsWith("https://") &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_ANON_KEY.startsWith("YOUR_");

const sb =
  hasSupabaseKeys && window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// State
let sessionUser = null;
let userProfile = null;
let currentInteraction = { saved: false, listened: false, positive_note: "" };
let currentAlbum = null;
let authMode = "signin"; // "signin" | "signup" | "edit"
let dayOffset = 0;

// DOM Elements
const authView = document.getElementById("auth-view");
const stationView = document.getElementById("station-view");
const editProfileBtn = document.getElementById("edit-profile-btn");
const signOutBtn = document.getElementById("sign-out-btn");
const cancelAuthBtn = document.getElementById("cancel-auth-btn");

const authModeSwitch = document.getElementById("auth-mode-switch");
const modeSigninBtn = document.getElementById("mode-signin");
const modeSignupBtn = document.getElementById("mode-signup");
const authForm = document.getElementById("auth-form");
const nameField = document.getElementById("name-field");
const nameInput = document.getElementById("name-input");
const emailField = document.getElementById("email-field");
const emailInput = document.getElementById("email-input");
const passwordField = document.getElementById("password-field");
const passwordInput = document.getElementById("password-input");
const tastesFieldset = document.getElementById("tastes-fieldset");
const tasteOptionsContainer = document.getElementById("taste-options");
const authFeedback = document.getElementById("auth-feedback");
const authSubmitBtn = document.getElementById("auth-submit-btn");

const saveBtn = document.getElementById("save-btn");
const listenedBtn = document.getElementById("listened-btn");
const personalNoteForm = document.getElementById("personal-note-form");
const personalNoteInput = document.getElementById("personal-note-input");
const noteStatus = document.getElementById("note-status");
const currentDateLabel = document.getElementById("current-date-label");

// Taste Selector
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

// Date & Recommendation Helpers
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
  const albumPool = CATALOG_ITEMS.filter((item) => item.mediaType === "album");
  const tastes = profile?.tastes || [];
  const matchedPool = albumPool.filter((album) =>
    album.tags.some((tag) => tastes.includes(tag))
  );
  const pool = matchedPool.length > 0 ? matchedPool : albumPool;

  const userSeed = profile.user_id || profile.display_name.toLowerCase();
  const seed = `${userSeed}|${getDateSeed(date)}`;
  const index = hashString(seed) % pool.length;
  return normalizeItemForDisplay(pool[index]);
}

// Local Storage Fallback Helpers (used until Supabase keys are configured)
function getLocalInteractionsMap() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_INTERACTIONS_KEY) || "{}");
  } catch {
    return {};
  }
}

// Data Layer (Supabase if configured, otherwise LocalStorage)
async function loadUserProfile(user) {
  if (!sb) {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_PROFILE_KEY) || "null");
    } catch {
      return null;
    }
  }

  const { data, error } = await sb
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error loading profile:", error);
    return null;
  }
  return data;
}

async function upsertUserProfile(userId, displayName, tastes) {
  if (!sb) {
    const localProfile = { user_id: "local-user", display_name: displayName, tastes };
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(localProfile));
    return localProfile;
  }

  const { data, error } = await sb
    .from("user_profiles")
    .upsert(
      {
        user_id: userId,
        display_name: displayName,
        tastes,
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
  if (!sb) {
    const map = getLocalInteractionsMap();
    return map[albumId] || { saved: false, listened: false, positive_note: "" };
  }

  const { data, error } = await sb
    .from("user_album_interactions")
    .select("saved, listened, positive_note")
    .eq("user_id", userId)
    .eq("album_id", albumId)
    .maybeSingle();

  if (error) {
    console.error("Error loading interaction:", error);
    return { saved: false, listened: false, positive_note: "" };
  }

  return data || { saved: false, listened: false, positive_note: "" };
}

async function saveInteraction(patch) {
  if (!currentAlbum) return;

  currentInteraction = { ...currentInteraction, ...patch };
  renderInteractionState();

  if (!sb) {
    const map = getLocalInteractionsMap();
    map[currentAlbum.id] = currentInteraction;
    localStorage.setItem(LOCAL_INTERACTIONS_KEY, JSON.stringify(map));
    return;
  }

  const { error } = await sb
    .from("user_album_interactions")
    .upsert(
      {
        user_id: sessionUser.id,
        album_id: currentAlbum.id,
        saved: currentInteraction.saved,
        listened: currentInteraction.listened,
        positive_note: currentInteraction.positive_note || null,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id,album_id" }
    );

  if (error) {
    console.error("Error saving interaction:", error);
    noteStatus.textContent = "Could not save";
  }
}

// UI Rendering
function setAuthMode(mode) {
  authMode = mode;
  authFeedback.classList.add("hidden");
  authFeedback.textContent = "";

  // If Supabase is not configured yet, show the clean v0.1 local form
  if (!sb) {
    authModeSwitch.classList.add("hidden");
    nameField.classList.remove("hidden");
    nameInput.required = true;
    emailField.classList.add("hidden");
    emailInput.required = false;
    passwordField.classList.add("hidden");
    passwordInput.required = false;
    tastesFieldset.classList.remove("hidden");

    if (userProfile) {
      nameInput.value = userProfile.display_name || "";
      renderTasteSelector(userProfile.tastes || []);
      cancelAuthBtn.classList.remove("hidden");
      authSubmitBtn.textContent = "Save tastes";
    } else {
      nameInput.value = "";
      renderTasteSelector([]);
      cancelAuthBtn.classList.add("hidden");
      authSubmitBtn.textContent = "Enter Station";
    }
    return;
  }

  const isEdit = mode === "edit";
  const isSignup = mode === "signup";

  authModeSwitch.classList.toggle("hidden", isEdit);
  modeSigninBtn.classList.toggle("active", mode === "signin");
  modeSignupBtn.classList.toggle("active", mode === "signup");

  nameField.classList.toggle("hidden", !isSignup && !isEdit);
  nameInput.required = isSignup || isEdit;

  emailField.classList.toggle("hidden", isEdit);
  emailInput.required = !isEdit;

  passwordField.classList.toggle("hidden", isEdit);
  passwordInput.required = !isEdit;

  tastesFieldset.classList.toggle("hidden", !isSignup && !isEdit);
  cancelAuthBtn.classList.toggle("hidden", !isEdit);

  if (isEdit && userProfile) {
    nameInput.value = userProfile.display_name || "";
    renderTasteSelector(userProfile.tastes || []);
    authSubmitBtn.textContent = "Save profile";
  } else if (isSignup) {
    renderTasteSelector([]);
    authSubmitBtn.textContent = "Create account";
  } else {
    authSubmitBtn.textContent = "Sign in";
  }
}

function showAuthView(mode = "signin") {
  stationView.classList.add("hidden");
  authView.classList.remove("hidden");
  editProfileBtn.classList.add("hidden");
  signOutBtn.classList.toggle("hidden", !sb || !sessionUser);
  setAuthMode(mode);
}

function renderInteractionState() {
  saveBtn.classList.toggle("selected", Boolean(currentInteraction.saved));
  saveBtn.textContent = currentInteraction.saved ? "Saved" : "Save";

  listenedBtn.classList.toggle("selected", Boolean(currentInteraction.listened));
  listenedBtn.textContent = "Listened";

  personalNoteInput.value = currentInteraction.positive_note || "";
}

async function showStationView() {
  if (sb && !sessionUser) {
    showAuthView("signin");
    return;
  }

  if (!userProfile || !userProfile.tastes?.length) {
    showAuthView(sb ? "edit" : "signin");
    return;
  }

  const activeDate = getActiveDate();
  currentAlbum = getDailyRecommendation(userProfile, activeDate);
  currentInteraction = await loadInteraction(sessionUser?.id, currentAlbum.id);

  currentDateLabel.textContent = formatDisplayDate(activeDate);
  editProfileBtn.textContent = `${userProfile.display_name} · Edit tastes`;
  editProfileBtn.classList.remove("hidden");
  signOutBtn.classList.toggle("hidden", !sb);
  document.getElementById("listener-greeting").textContent =
    `Curated for ${userProfile.display_name}`;

  stationView.dataset.aesthetic = currentAlbum.aesthetic || "editorial";

  const coverEl = document.getElementById("album-cover");
  coverEl.src = currentAlbum.coverUrl;
  coverEl.alt = `${currentAlbum.title} by ${currentAlbum.artist}`;

  document.getElementById("media-type-badge").textContent = currentAlbum.mediaType;
  document.getElementById("album-year").textContent = currentAlbum.year;
  document.getElementById("album-runtime").textContent = currentAlbum.runtime;
  document.getElementById("album-label").textContent = currentAlbum.label;
  document.getElementById("album-artist").textContent = currentAlbum.artist;
  document.getElementById("album-title").textContent = currentAlbum.title;
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
      <p class="review-quote">“${rev.text}”</p>
      <footer class="review-author">— ${rev.author} (${rev.source})</footer>
    `;
    reviewsList.appendChild(card);
  });

  noteStatus.textContent = "";
  renderInteractionState();

  authView.classList.add("hidden");
  stationView.classList.remove("hidden");
}

// Event Listeners
modeSigninBtn.addEventListener("click", () => setAuthMode("signin"));
modeSignupBtn.addEventListener("click", () => setAuthMode("signup"));

editProfileBtn.addEventListener("click", () => showAuthView("edit"));
cancelAuthBtn.addEventListener("click", () => showStationView());

signOutBtn.addEventListener("click", async () => {
  if (sb) await sb.auth.signOut();
  sessionUser = null;
  userProfile = null;
  showAuthView("signin");
});

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authFeedback.classList.add("hidden");

  try {
    // Local mode or profile edit
    if (!sb || authMode === "edit") {
      const displayName = nameInput.value.trim();
      const tastes = Array.from(
        tasteOptionsContainer.querySelectorAll(".taste-chip.selected")
      ).map((chip) => chip.textContent);

      if (!displayName || tastes.length === 0) {
        authFeedback.textContent = "Enter your name and pick at least one taste.";
        authFeedback.classList.remove("hidden");
        return;
      }

      userProfile = await upsertUserProfile(sessionUser?.id, displayName, tastes);
      dayOffset = 0;
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
        authFeedback.textContent = "Please enter your name and select at least one taste.";
        authFeedback.classList.remove("hidden");
        return;
      }

      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user && data.session) {
        sessionUser = data.user;
        userProfile = await upsertUserProfile(data.user.id, displayName, tastes);
        showStationView();
      } else {
        authFeedback.textContent = "Check your inbox to confirm your email, then sign in.";
        authFeedback.classList.remove("hidden");
      }
    } else {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      sessionUser = data.user;
      userProfile = await loadUserProfile(data.user);
      showStationView();
    }
  } catch (err) {
    authFeedback.textContent = err.message || "Authentication error.";
    authFeedback.classList.remove("hidden");
  }
});

saveBtn.addEventListener("click", () => {
  saveInteraction({ saved: !currentInteraction.saved });
});

listenedBtn.addEventListener("click", () => {
  saveInteraction({ listened: !currentInteraction.listened });
});

personalNoteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  noteStatus.textContent = "Saving...";
  await saveInteraction({ positive_note: personalNoteInput.value.trim() });
  noteStatus.textContent = "Saved";
});

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
    if (sb) {
      const { data } = await sb.auth.getSession();
      if (data?.session?.user) {
        sessionUser = data.session.user;
        userProfile = await loadUserProfile(sessionUser);
        showStationView();
      } else {
        showAuthView("signin");
      }
    } else {
      userProfile = await loadUserProfile(null);
      if (userProfile) {
        showStationView();
      } else {
        showAuthView("signin");
      }
    }
  } catch (err) {
    console.error("Init error:", err);
    showAuthView("signin");
  }
})();