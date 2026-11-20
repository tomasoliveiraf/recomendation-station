const AVAILABLE_TASTES = [
  "Ambient & Experimental",
  "Jazz & Spiritual",
  "Post-Punk & Art Rock",
  "Electronic & IDM",
  "Folk & Acoustic",
  "Soul & Neo-Soul",
  "Hip-Hop & Instrumental"
];

const CATALOG_ITEMS = [
  {
    id: "alb-001",
    mediaType: "album",
    title: "Promises",
    artist: "Floating Points, Pharoah Sanders & The London Symphony Orchestra",
    year: 2021,
    runtime: "46 min",
    label: "Luaka Bop",
    aesthetic: "italic",
    tags: ["Jazz & Spiritual", "Ambient & Experimental", "Orchestral"],
    coverUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80",
    synopsis:
      "Built around a recurring seven-note motif, this nine-movement suite bridges intimate analog electronics, orchestral strings, and Pharoah Sanders' weathered, luminous tenor saxophone.",
    reviews: [
      {
        author: "M. Vance",
        source: "Community Note",
        sentiment: "positive",
        rating: 95,
        text: "It breathes like a single continuous thought. Every time the strings swell around the harpsichord pattern, time feels completely suspended."
      },
      {
        author: "Elena R.",
        source: "Listener Log",
        sentiment: "positive",
        rating: 5,
        text: "Rarely does a collaboration feel this patient. Nothing is rushed; even the silence between phrases carries emotional weight."
      }
    ]
  },
  {
    id: "alb-002",
    mediaType: "album",
    title: "Selected Ambient Works 85–92",
    artist: "Aphex Twin",
    year: 1992,
    runtime: "74 min",
    label: "Apollo",
    aesthetic: "modular",
    tags: ["Electronic & IDM", "Ambient & Experimental"],
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80",
    synopsis:
      "Recorded onto cassette during Richard D. James' teenage years, these tracks pair misty, hypnotic synth pads with crisp, unpretentious acid and breakbeat pulses.",
    reviews: [
      {
        author: "K. Lindqvist",
        source: "Community Note",
        sentiment: "positive",
        rating: 92,
        text: "There is a tape-hiss warmth here that makes machine music feel deeply human. Ideal for late-night walks when the city goes quiet."
      },
      {
        author: "D. Okafor",
        source: "Listener Log",
        sentiment: "positive",
        rating: 4.5,
        text: "Simple melodies that stay with you for days, balanced by percussion that feels tactile and alive."
      }
    ]
  },
  {
    id: "alb-003",
    mediaType: "album",
    title: "Pink Moon",
    artist: "Nick Drake",
    year: 1972,
    runtime: "28 min",
    label: "Island",
    aesthetic: "italic",
    tags: ["Folk & Acoustic"],
    coverUrl: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=900&q=80",
    synopsis:
      "Recorded in just two midnight sessions with nothing more than voice, acoustic guitar, and a brief piano overdub, capturing stark vulnerability with extraordinary grace.",
    reviews: [
      {
        author: "S. Almeida",
        source: "Community Note",
        sentiment: "positive",
        rating: 98,
        text: "Twenty-eight minutes of pure intimacy. You can hear the fingers moving across the strings as if he were sitting across the room."
      },
      {
        author: "H. Mercer",
        source: "Listener Log",
        sentiment: "positive",
        rating: 5,
        text: "No ornament, no studio polish—just alternating tunings that sound bittersweet and strangely comforting."
      }
    ]
  },
  {
    id: "alb-004",
    mediaType: "album",
    title: "Voodoo",
    artist: "D'Angelo",
    year: 2000,
    runtime: "78 min",
    label: "Virgin",
    aesthetic: "editorial",
    tags: ["Soul & Neo-Soul", "Hip-Hop & Instrumental"],
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
    synopsis:
      "Tracked live to analog tape at Electric Lady Studios, Voodoo bends rhythmic pocket and layered vocal harmonies into a loose, hypnotic meditation on soul and funk.",
    reviews: [
      {
        author: "T. Brooks",
        source: "Community Note",
        sentiment: "positive",
        rating: 96,
        text: "The drums sit just behind the beat in a way that makes the whole room sway. Every listen reveals another buried vocal harmony."
      },
      {
        author: "N. Costa",
        source: "Listener Log",
        sentiment: "positive",
        rating: 5,
        text: "Warm, unhurried, and deeply physical. It feels less like a sequence of singles and more like stepping inside a late-night jam."
      }
    ]
  },
  {
    id: "alb-005",
    mediaType: "album",
    title: "Spiderland",
    artist: "Slint",
    year: 1991,
    runtime: "39 min",
    label: "Touch and Go",
    aesthetic: "modular",
    tags: ["Post-Punk & Art Rock"],
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80",
    synopsis:
      "Taut dynamic shifts between whispered spoken-word narratives and sudden, cathartic guitar dissonance that quietly reshaped independent rock.",
    reviews: [
      {
        author: "R. Novak",
        source: "Community Note",
        sentiment: "positive",
        rating: 94,
        text: "The tension they build out of restraint is unmatched. When the guitars finally erupt, it feels completely earned."
      }
    ]
  }
];