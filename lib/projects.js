/* The ten projects in the Work section, in order. `embed` says whether the live site can open inside
 * the in-page browser window; Clonix and LUMIQ send headers that forbid framing, so they open a preview
 * with a button to the live site instead. The three Safarline concepts are separate sites, each with its
 * own live address on the cab demo deployment. */
export const PROJECTS = [
  {
    "slug": "osht",
    "title": "OSHT – Agro Trading",
    "lead": "B",
    "kind": "Product · Android, iOS & web · Live",
    "line": "A grain trader's whole business, in his voice.",
    "body": "Brokers and suppliers speak an order in Hindi or English and it becomes a purchase order. Every lorry, paper and payment is tracked from loading to delivery, with a web console for the office.",
    "img": "/assets/img/work/osht.jpg",
    "alt": "OSHT – Agro Trading landing page: Your whole trade, in your voice.",
    "w": 1456,
    "h": 829,
    "url": "https://www.omshriharitrading.com/",
    "credit": [
      {
        "role": "Led by",
        "name": "Shivam Jha",
        "note": "product, app, web console & site"
      },
      {
        "role": "Backend",
        "name": "Saksham Srivastava"
      }
    ],
    "links": [
      {
        "label": "Website",
        "href": "https://www.omshriharitrading.com/"
      },
      {
        "label": "Google Play",
        "href": "https://play.google.com/store/apps/details?id=com.shreehari.vendors"
      },
      {
        "label": "App Store",
        "href": "https://apps.apple.com/in/app/osht-agro-trading/id6802507783"
      }
    ],
    "embed": true
  },
  {
    "slug": "clonix",
    "title": "Clonix",
    "lead": "B",
    "kind": "Our product · SaaS + Chrome extension · Pre-booking",
    "line": "Any website, liquefied into design DNA.",
    "body": "Scan a site into tokens, components and ready-to-drop packs for Cursor, Claude Code and Windsurf, or clone it offline in one click. Now it rebuilds backends too.",
    "img": "/assets/img/work/clonix.jpg",
    "alt": "Clonix landing page: Any website, liquefied into design DNA.",
    "w": 1456,
    "h": 829,
    "url": "https://clonix-tau.vercel.app/",
    "credit": [
      {
        "role": "Founded by",
        "name": "Shivam Jha"
      },
      {
        "role": "Co-founder & backend",
        "name": "Saksham Srivastava"
      }
    ],
    "links": [
      {
        "label": "Try Clonix",
        "href": "https://clonix-tau.vercel.app/"
      }
    ],
    "embed": false,
    "embedNote": "X-Frame-Options: DENY"
  },
  {
    "slug": "lumiq",
    "title": "LUMIQ",
    "lead": "A",
    "kind": "Our product · AI data app · Beta",
    "line": "Data that talks back.",
    "body": "Ask a spreadsheet questions in plain English. Numbers come from code, words come from AI, and every figure is checked before you see it. Rows never leave the browser.",
    "img": "/assets/img/work/lumiq.jpg",
    "alt": "LUMIQ landing page: Data that talks back.",
    "w": 1456,
    "h": 829,
    "url": "https://lumiq-silk.vercel.app",
    "credit": [
      {
        "role": "Built by",
        "name": "Saksham Srivastava"
      }
    ],
    "links": [
      {
        "label": "Launch LUMIQ",
        "href": "https://lumiq-silk.vercel.app"
      }
    ],
    "embed": false,
    "embedNote": "CSP frame-ancestors 'none'"
  },
  {
    "slug": "nexeraai",
    "title": "NexeraAI",
    "lead": "B",
    "kind": "Our product · AI job platform · Live demo",
    "line": "Fast-track the job hunt with AI.",
    "body": "An AI-powered job platform: résumé compatibility scoring, referrals to top companies and smart search that gets candidates to the right role sooner.",
    "img": "/assets/img/work/nexera.jpg",
    "alt": "NexeraAI landing page: Find your job and make sure goal.",
    "w": 1440,
    "h": 900,
    "url": "https://nexera-ai-xi.vercel.app/",
    "credit": [
      {
        "role": "Built by",
        "name": "Shivam Jha"
      }
    ],
    "links": [
      {
        "label": "View live demo",
        "href": "https://nexera-ai-xi.vercel.app/"
      }
    ],
    "embed": true
  },
  {
    "slug": "stockwaves",
    "title": "StockWaves",
    "lead": "A",
    "kind": "Our product · Inventory SaaS · Live",
    "line": "Inventory that moves with the waves.",
    "body": "Real-time control over stock, sales, suppliers and staff, with an AI assistant that answers questions about your actual inventory. FastAPI, async PostgreSQL, React and Docker underneath.",
    "img": "/assets/img/work/stockwaves.jpg",
    "alt": "StockWaves landing page: Inventory that moves with the waves.",
    "w": 1456,
    "h": 829,
    "url": "https://saksham653.github.io/inventory-management-system/",
    "credit": [
      {
        "role": "Built by",
        "name": "Saksham Srivastava"
      }
    ],
    "links": [
      {
        "label": "See StockWaves",
        "href": "https://saksham653.github.io/inventory-management-system/"
      }
    ],
    "embed": true
  },
  {
    "slug": "tbj",
    "title": "TBJ Properties",
    "lead": "B",
    "kind": "Client · Real estate · Live",
    "line": "Find your place in the skyline.",
    "body": "A luxury site for a Gurgaon property partner: plots, flats, houses and commercial spaces, with a property planner and an enquiry flow built to turn browsers into site visits.",
    "img": "/assets/img/work/tbj.jpg",
    "alt": "TBJ Properties website: Find your place in the skyline.",
    "w": 1456,
    "h": 829,
    "url": "https://tbjproperties.in",
    "credit": [
      {
        "role": "Designed & built by",
        "name": "Shivam Jha"
      }
    ],
    "links": [
      {
        "label": "tbjproperties.in",
        "href": "https://tbjproperties.in"
      }
    ],
    "embed": true
  },
  {
    "slug": "adfusion",
    "title": "ADFusion Marketing",
    "lead": "B",
    "kind": "Client · Agency website · Live",
    "line": "We don't just market. We build brands.",
    "body": "A premium agency site with scroll-driven marble scenes, proof from real brands and a strategy-session funnel on every screen.",
    "img": "/assets/img/work/adfusion.jpg",
    "alt": "ADFusion Marketing website: We don't just market. We build brands people remember.",
    "w": 1456,
    "h": 829,
    "url": "https://growth-ignition-engine.vercel.app",
    "credit": [
      {
        "role": "Designed & built by",
        "name": "Shivam Jha"
      }
    ],
    "links": [
      {
        "label": "See the site",
        "href": "https://growth-ignition-engine.vercel.app"
      }
    ],
    "embed": true
  },
  {
    "slug": "dark-luxe",
    "title": "Safarline Dark Luxe",
    "lead": "B",
    "kind": "Concept · Corporate cabs · Live demo",
    "line": "Your workforce, moved like clockwork.",
    "body": "A cinematic, corporate-first site for a cab company: a night-car hero whose copy changes as you scroll, the story of one shift told on a live-tracking phone, and a booking bar for employee transport, airport runs and executive cars.",
    "img": "/assets/img/work/safarline-dark-luxe.jpg",
    "alt": "Safarline Dark Luxe concept: Your workforce, moved like clockwork.",
    "w": 1456,
    "h": 829,
    "url": "https://heyshivm-cab-demo.vercel.app/dark-luxe/",
    "credit": [
      {
        "role": "Designed & built by",
        "name": "Shivam Jha"
      }
    ],
    "links": [
      {
        "label": "Live demo",
        "href": "https://heyshivm-cab-demo.vercel.app/dark-luxe/"
      }
    ],
    "embed": true
  },
  {
    "slug": "golden-travel",
    "title": "Safarline Golden Travel",
    "lead": "B",
    "kind": "Concept · Outstation & tours · Live demo",
    "line": "Every road has a story.",
    "body": "A warm, travel-first site for outstation trips and tours: an eleven-layer illustrated Himalaya that moves as you scroll, a cab that drives the road with you, and a fare finder for one-way, airport, local and tour bookings.",
    "img": "/assets/img/work/safarline-golden-travel.jpg",
    "alt": "Safarline Golden Travel concept: Every road has a story.",
    "w": 1456,
    "h": 829,
    "url": "https://heyshivm-cab-demo.vercel.app/golden-travel/",
    "credit": [
      {
        "role": "Designed & built by",
        "name": "Shivam Jha"
      }
    ],
    "links": [
      {
        "label": "Live demo",
        "href": "https://heyshivm-cab-demo.vercel.app/golden-travel/"
      }
    ],
    "embed": true
  },
  {
    "slug": "bold-kinetic",
    "title": "Safarline Bold Kinetic",
    "lead": "B",
    "kind": "Concept · Companies & travellers · Live demo",
    "line": "Your city. Your company. Your weekend. One ride away.",
    "body": "A taxi-yellow site that speaks to both buyers at once: kinetic type with a photo inside the headline that grows to fill the screen, separate lanes for companies and travellers, and a ride booked over WhatsApp.",
    "img": "/assets/img/work/safarline-bold-kinetic.jpg",
    "alt": "Safarline Bold Kinetic concept: Your city. Your company. Your weekend. One ride away.",
    "w": 1456,
    "h": 829,
    "url": "https://heyshivm-cab-demo.vercel.app/bold-kinetic/",
    "credit": [
      {
        "role": "Designed & built by",
        "name": "Shivam Jha"
      }
    ],
    "links": [
      {
        "label": "Live demo",
        "href": "https://heyshivm-cab-demo.vercel.app/bold-kinetic/"
      }
    ],
    "embed": true
  }
];
