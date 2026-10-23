// Journal entries, newest first is not required (the page sorts by date).
// To add an entry: put photos in journal/ (and a 640px copy in journal/thumbs/),
// add an object below, then copy any journal/<slug>.html and change data-slug.
//   type: "Travel" or "Goal" (any word works and becomes a filter)
//   date / end: "YYYY-MM-DD" (end is optional, for multi-day trips)
//   stops: places for the map, each { name, lat, lon }
//   photos: { src, alt, tone, w, h } -- alt doubles as the caption; tone is an optional placeholder colour
const journalData = [
  {
    slug: "tashkent-samarkand",
    title: "Tashkent & Samarkand",
    type: "Travel",
    date: "2026-07-18",
    end: "2026-07-20",
    place: "Uzbekistan",
    stops: [
      {
        name: "Tashkent",
        lat: 41.2995,
        lon: 69.2401
      },
      {
        name: "Samarkand",
        lat: 39.6542,
        lon: 66.9597
      }
    ],
    summary: "Three days walking through Tashkent and Samarkand, noticing familiar places from a slightly different perspective.",
    body: [
      "Three days walking through Tashkent and Samarkand &mdash; an afternoon of walking, observing, and noticing familiar places from a slightly different perspective."
    ],
    cover: "tashkent-1.jpg",
    photos: [
      {
        src: "tashkent-1.jpg",
        alt: "Tashkent city skyline at night, with illuminated buildings reflecting in a canal",
        tone: "#262428",
        w: 960,
        h: 1280
      },
      {
        src: "samarkand-1.jpg",
        alt: "A white mosque with turquoise domes in the evening light",
        tone: "#788b97",
        w: 1920,
        h: 2560
      },
      {
        src: "samarkand-2.jpg",
        alt: "People sitting inside a mosque hall beneath a large chandelier",
        tone: "#807b71",
        w: 1920,
        h: 2560
      }
    ]
  },
  {
    slug: "tashkent-may",
    title: "Tashkent",
    type: "Travel",
    date: "2026-05-18",
    end: "2026-05-20",
    place: "Tashkent, Uzbekistan",
    stops: [
      {
        name: "Tashkent",
        lat: 41.2995,
        lon: 69.2401
      }
    ],
    summary: "Evenings along the canal, lit-up towers, and the city at night.",
    body: [
      "Evenings along the canal, lit-up towers, and the city at night."
    ],
    cover: "tashkent-may-1.jpg",
    photos: [
      {
        src: "tashkent-may-1.jpg",
        alt: "Illuminated skyscrapers at night reflected in a canal, with restaurants along the water",
        tone: "#3e3945",
        w: 1200,
        h: 1592
      },
      {
        src: "tashkent-may-2.jpg",
        alt: "The Hilton tower lit up in blue at night, seen through a hedge",
        tone: "#2e332c",
        w: 1200,
        h: 1592
      },
      {
        src: "tashkent-may-3.jpg",
        alt: "A canal lined with restaurants under a purple and orange sunset sky",
        tone: "#6c6558",
        w: 1200,
        h: 1600
      },
      {
        src: "tashkent-may-4.jpg",
        alt: "A busy canal-side promenade at dusk with the moon visible in the sky",
        tone: "#4b5566",
        w: 1200,
        h: 1600
      }
    ]
  },
  {
    slug: "d",
    title: "d",
    type: "Goal",
    date: "2026-05-11",
    end: null,
    place: "",
    stops: [],
    summary: "Insha'allah.",
    body: [
      "Insha'allah."
    ],
    cover: "d-thumb.jpg",
    photos: []
  },
  {
    slug: "samarkand-may",
    title: "Samarkand",
    type: "Travel",
    date: "2025-05-10",
    end: null,
    place: "Samarkand, Uzbekistan",
    stops: [
      {
        name: "Samarkand",
        lat: 39.6542,
        lon: 66.9597
      }
    ],
    summary: "Blue domes and quiet courtyards across the old city.",
    body: [
      "Blue domes and quiet courtyards across the old city."
    ],
    cover: "samarkand-may-1.jpg",
    photos: [
      {
        src: "samarkand-may-1.jpg",
        alt: "An ornate archway framing a tiled madrasa",
        tone: "#82766e",
        w: 1200,
        h: 1600
      },
      {
        src: "samarkand-may-2.jpg",
        alt: "A ribbed turquoise dome above a courtyard with a tree",
        tone: "#636b67",
        w: 1440,
        h: 1800
      },
      {
        src: "samarkand-may-3.jpg",
        alt: "A large tiled building with a blue dome, photographed after rain",
        tone: "#8b7d6f",
        w: 1440,
        h: 1800
      },
      {
        src: "samarkand-may-4.jpg",
        alt: "A building with a large turquoise dome, photographed at sunset",
        tone: "#82847b",
        w: 1440,
        h: 1800
      }
    ]
  },
  {
    slug: "surxondaryo",
    title: "Surxondaryo",
    type: "Travel",
    date: "2025-03-31",
    end: null,
    place: "Surxondaryo, Uzbekistan",
    stops: [
      {
        name: "Surxondaryo",
        lat: 38.25,
        lon: 67.2
      }
    ],
    summary: "A hike through green mountain valleys, streams, and snow-capped peaks in Surxondaryo.",
    body: [
      "A hike through green mountain valleys, streams, and snow-capped peaks in Surxondaryo."
    ],
    cover: "surxondaryo-1.jpg",
    photos: [
      {
        src: "surxondaryo-1.jpg",
        alt: "A mountain valley with green trees and snow-capped peaks in the distance",
        tone: "#426369",
        w: 958,
        h: 1197
      },
      {
        src: "surxondaryo-2.jpg",
        alt: "A green valley between rocky slopes, with snowy peaks beyond",
        tone: "#586c60",
        w: 958,
        h: 1197
      },
      {
        src: "surxondaryo-3.jpg",
        alt: "A stream running through a sunlit valley surrounded by trees",
        tone: "#375560",
        w: 958,
        h: 1197
      },
      {
        src: "surxondaryo-4.jpg",
        alt: "A paved road running through a green valley toward the mountains",
        tone: "#48708e",
        w: 958,
        h: 1197
      },
      {
        src: "surxondaryo-5.jpg",
        alt: "Trees and green hills with a snow-capped ridge behind them",
        tone: "#376a55",
        w: 958,
        h: 1197
      },
      {
        src: "surxondaryo-6.jpg",
        alt: "A green meadow leading up to snow-streaked mountains",
        tone: "#447374",
        w: 958,
        h: 1197
      },
      {
        src: "surxondaryo-7.jpg",
        alt: "Sunlight over a stream winding through a green mountain valley",
        tone: "#345360",
        w: 958,
        h: 1197
      },
      {
        src: "surxondaryo-8.jpg",
        alt: "A steep, snow-streaked mountain ridge above a green forested valley",
        tone: "#505f6b",
        w: 958,
        h: 1197
      },
      {
        src: "surxondaryo-9.jpg",
        alt: "A rocky cliffside overlooking a green valley and snow-streaked peaks",
        tone: "#485765",
        w: 958,
        h: 1197
      }
    ]
  },
  {
    slug: "bukhara",
    title: "Bukhara",
    type: "Travel",
    date: "2024-04-12",
    end: null,
    place: "Bukhara, Uzbekistan",
    stops: [
      {
        name: "Bukhara",
        lat: 39.7747,
        lon: 64.4286
      }
    ],
    summary: "The Kalyan Minaret at dusk, and the old city's mosques and courtyards.",
    body: [
      "The Kalyan Minaret at dusk, and the old city's mosques and courtyards."
    ],
    cover: "bukhara-1.jpg",
    photos: [
      {
        src: "bukhara-1.jpg",
        alt: "The Kalyan Minaret lit up at dusk beside a mosque",
        tone: "#458090",
        w: 1440,
        h: 1800
      },
      {
        src: "bukhara-2.jpg",
        alt: "The Kalyan Minaret and a lit-up mosque entrance at dusk",
        tone: "#6d868a",
        w: 1440,
        h: 1800
      },
      {
        src: "bukhara-3.jpg",
        alt: "An ornate tiled entrance portal of a mosque lit up at dusk",
        tone: "#707b80",
        w: 1440,
        h: 1800
      },
      {
        src: "bukhara-4.jpg",
        alt: "A blue tiled dome with intricate patterns above a mosque entrance",
        tone: "#45737f",
        w: 1440,
        h: 1800
      },
      {
        src: "bukhara-5.jpg",
        alt: "People walking down a long courtyard toward the Kalyan Minaret",
        tone: "#7a7e68",
        w: 1440,
        h: 1800
      }
    ]
  }
];
