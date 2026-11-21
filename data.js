const AVAILABLE_TASTES = [
  "Pop",
  "Alternative Pop",
  "Indie",
  "Rock",
  "Alternative Rock",
  "Hip-Hop",
  "R&B",
  "Soul",
  "Electronic",
  "Ambient",
  "Jazz",
  "Folk",
  "Classical",
  "Metal",
  "Punk",
  "Funk",
  "Blues",
  "Reggae & Dub",
  "MPB & Bossa",
  "Latin",
  "Country",
  "Soundtracks",
  "Experimental"
];
// Official covers are fetched automatically via iTunes Search API using title + artist
const CATALOG_ITEMS = [
  {
    id: "alb-001",
    mediaType: "album",
    title: "Promises",
    artist: "Floating Points, Pharoah Sanders & The London Symphony Orchestra",
    coverQuery: "Floating Points Pharoah Sanders Promises",
    year: 2021,
    runtime: "46 min",
    label: "Luaka Bop",
    aesthetic: "italic",
    tags: ["Jazz & Spiritual", "Ambient & Experimental", "Modern Classical"],
    synopsis:
      "Built around a recurring seven-note motif, this nine-movement suite bridges intimate analog electronics, orchestral strings, and Pharoah Sanders' weathered, luminous tenor saxophone.",
    reviews: [
      {
        author: "M. Vance",
        source: "Community Note",
        sentiment: "positive",
        text: "It breathes like a single continuous thought. Every time the strings swell around the harpsichord pattern, time feels completely suspended."
      },
      {
        author: "Elena R.",
        source: "Listener Log",
        sentiment: "positive",
        text: "Rarely does a collaboration feel this patient. Nothing is rushed; even the silence between phrases carries emotional weight."
      }
    ]
  },
  {
    id: "alb-002",
    mediaType: "album",
    title: "Selected Ambient Works 85–92",
    artist: "Aphex Twin",
    coverQuery: "Aphex Twin Selected Ambient Works 85-92",
    year: 1992,
    runtime: "74 min",
    label: "Apollo",
    aesthetic: "modular",
    tags: ["Electronic & IDM", "Ambient & Experimental", "House & Techno"],
    synopsis:
      "Recorded onto cassette during Richard D. James' teenage years, these tracks pair misty, hypnotic synth pads with crisp, unpretentious acid and breakbeat pulses.",
    reviews: [
      {
        author: "K. Lindqvist",
        source: "Community Note",
        sentiment: "positive",
        text: "There is a tape-hiss warmth here that makes machine music feel deeply human. Ideal for late-night walks when the city goes quiet."
      },
      {
        author: "D. Okafor",
        source: "Listener Log",
        sentiment: "positive",
        text: "Simple melodies that stay with you for days, balanced by percussion that feels tactile and alive."
      }
    ]
  },
  {
    id: "alb-003",
    mediaType: "album",
    title: "Pink Moon",
    artist: "Nick Drake",
    coverQuery: "Nick Drake Pink Moon",
    year: 1972,
    runtime: "28 min",
    label: "Island",
    aesthetic: "italic",
    tags: ["Folk & Acoustic", "Singer-Songwriter"],
    synopsis:
      "Recorded in just two midnight sessions with nothing more than voice, acoustic guitar, and a brief piano overdub, capturing stark vulnerability with extraordinary grace.",
    reviews: [
      {
        author: "S. Almeida",
        source: "Community Note",
        sentiment: "positive",
        text: "Twenty-eight minutes of pure intimacy. You can hear the fingers moving across the strings as if he were sitting across the room."
      },
      {
        author: "H. Mercer",
        source: "Listener Log",
        sentiment: "positive",
        text: "No ornament, no studio polish—just alternating tunings that sound bittersweet and strangely comforting."
      }
    ]
  },
  {
    id: "alb-004",
    mediaType: "album",
    title: "Voodoo",
    artist: "D'Angelo",
    coverQuery: "D'Angelo Voodoo",
    year: 2000,
    runtime: "78 min",
    label: "Virgin",
    aesthetic: "editorial",
    tags: ["Soul & Neo-Soul", "R&B & Funk", "Hip-Hop & Instrumental"],
    synopsis:
      "Tracked live to analog tape at Electric Lady Studios, Voodoo bends rhythmic pocket and layered vocal harmonies into a loose, hypnotic meditation on soul and funk.",
    reviews: [
      {
        author: "T. Brooks",
        source: "Community Note",
        sentiment: "positive",
        text: "The drums sit just behind the beat in a way that makes the whole room sway. Every listen reveals another buried vocal harmony."
      },
      {
        author: "N. Costa",
        source: "Listener Log",
        sentiment: "positive",
        text: "Warm, unhurried, and deeply physical. It feels less like a sequence of singles and more like stepping inside a late-night jam."
      }
    ]
  },
  {
    id: "alb-005",
    mediaType: "album",
    title: "Spiderland",
    artist: "Slint",
    coverQuery: "Slint Spiderland",
    year: 1991,
    runtime: "39 min",
    label: "Touch and Go",
    aesthetic: "modular",
    tags: ["Post-Punk & Art Rock", "Post-Rock & Math Rock", "Indie & Alternative"],
    synopsis:
      "Taut dynamic shifts between whispered spoken-word narratives and sudden, cathartic guitar dissonance that quietly reshaped independent rock.",
    reviews: [
      {
        author: "R. Novak",
        source: "Community Note",
        sentiment: "positive",
        text: "The tension they build out of restraint is unmatched. When the guitars finally erupt, it feels completely earned."
      }
    ]
  },
  {
    id: "alb-006",
    mediaType: "album",
    title: "Heaven or Las Vegas",
    artist: "Cocteau Twins",
    coverQuery: "Cocteau Twins Heaven or Las Vegas",
    year: 1990,
    runtime: "37 min",
    label: "4AD",
    aesthetic: "italic",
    tags: ["Shoegaze & Dream Pop", "Indie & Alternative", "Synthpop & New Wave"],
    synopsis:
      "Shimmering chorus-drenched guitars and Elizabeth Fraser's soaring, impressionistic vocal lines turn pure texture and melody into a glowing dreamscape.",
    reviews: [
      {
        author: "C. Moreau",
        source: "Community Note",
        sentiment: "positive",
        text: "You don't need to decode a single lyric to feel every word. It sounds like sunlight refracting through stained glass."
      }
    ]
  },
  {
    id: "alb-007",
    mediaType: "album",
    title: "Donuts",
    artist: "J Dilla",
    coverQuery: "J Dilla Donuts",
    year: 2006,
    runtime: "43 min",
    label: "Stones Throw",
    aesthetic: "modular",
    tags: ["Hip-Hop & Instrumental", "Soul & Neo-Soul", "Trip-Hop & Downtempo"],
    synopsis:
      "Thirty-one brief, joyful, and deeply bittersweet sample collages crafted on an MPC and turntable, turning fragments of soul records into a wordless autobiography.",
    reviews: [
      {
        author: "L. Ferreira",
        source: "Community Note",
        sentiment: "positive",
        text: "Every chop feels alive and slightly off-grid in the best possible way. Short tracks that loop in your head all afternoon."
      }
    ]
  },
  {
    id: "alb-008",
    mediaType: "album",
    title: "Spirit of Eden",
    artist: "Talk Talk",
    coverQuery: "Talk Talk Spirit of Eden",
    year: 1988,
    runtime: "41 min",
    label: "Parlophone",
    aesthetic: "italic",
    tags: ["Post-Punk & Art Rock", "Post-Rock & Math Rock", "Ambient & Experimental"],
    synopsis:
      "Recorded in near-total darkness through long improvised sessions, abandoning pop structure in favor of fragile silences, organ swells, and sudden brass warmth.",
    reviews: [
      {
        author: "A. Lind",
        source: "Community Note",
        sentiment: "positive",
        text: "An album that rewards lowering the lights and letting it unfold without skipping. The use of space is breathtaking."
      }
    ]
  },
  {
    id: "alb-009",
    mediaType: "album",
    title: "Music Has the Right to Children",
    artist: "Boards of Canada",
    coverQuery: "Boards of Canada Music Has the Right to Children",
    year: 1998,
    runtime: "70 min",
    label: "Warp",
    aesthetic: "modular",
    tags: ["Electronic & IDM", "Trip-Hop & Downtempo", "Ambient & Experimental"],
    synopsis:
      "Detuned analog synthesizers, dusty hip-hop rhythms, and weathered educational-film textures that evoke half-remembered childhood summers.",
    reviews: [
      {
        author: "J. Duarte",
        source: "Community Note",
        sentiment: "positive",
        text: "Nostalgic for a memory you never actually lived. The warped synth tones feel like old VHS tape warming up."
      }
    ]
  },
  {
    id: "alb-010",
    mediaType: "album",
    title: "Spaces",
    artist: "Nils Frahm",
    coverQuery: "Nils Frahm Spaces",
    year: 2013,
    runtime: "74 min",
    label: "Erased Tapes",
    aesthetic: "editorial",
    tags: ["Modern Classical", "Soundtracks & Scores", "Ambient & Experimental"],
    synopsis:
      "Assembled from two years of live recordings on felt pianos, Juno synthesizers, and reel-to-reel tape delays, capturing the physical intimacy of performance.",
    reviews: [
      {
        author: "P. Neves",
        source: "Community Note",
        sentiment: "positive",
        text: "Hearing the felt hammers hit the strings alongside subtle room acoustics makes every crescendo hit twice as hard."
      }
    ]
  },
  {
    id: "alb-011",
    mediaType: "album",
    title: "Construção",
    artist: "Chico Buarque",
    coverQuery: "Chico Buarque Construcao",
    year: 1971,
    runtime: "37 min",
    label: "Philips",
    aesthetic: "italic",
    tags: ["Bossa Nova & MPB", "Singer-Songwriter"],
    synopsis:
      "Orchestral arrangements by Rogério Duprat meet razor-sharp poetic storytelling, shifting effortlessly between delicate samba warmth and dramatic tension.",
    reviews: [
      {
        author: "M. Ribeiro",
        source: "Community Note",
        sentiment: "positive",
        text: "The title track alone is a masterclass in rhythm and language, and the whole album flows with remarkable theatrical beauty."
      }
    ]
  },
  {
    id: "alb-012",
    mediaType: "album",
    title: "Dummy",
    artist: "Portishead",
    coverQuery: "Portishead Dummy",
    year: 1994,
    runtime: "49 min",
    label: "Go! Beat",
    aesthetic: "editorial",
    tags: ["Trip-Hop & Downtempo", "Electronic & IDM", "Indie & Alternative"],
    synopsis:
      "Dusty vinyl crackle, spy-film guitar tremolo, and Beth Gibbons' aching vocals forged a noir atmosphere that still feels completely timeless.",
    reviews: [
      {
        author: "F. Tavares",
        source: "Community Note",
        sentiment: "positive",
        text: "Feels like a late-night black-and-white film you can listen to. Every Rhodes chord and scratched beat sits in its own shadow."
      }
    ]
  }
];