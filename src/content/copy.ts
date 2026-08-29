/**
 * ALL page copy, transcribed verbatim from the two approved sources:
 *   - 1-genesis/.../Happy_Days_Website_Developer_Handoff/website-spec.md
 *   - 1-genesis/.../questions/owner-answers.md  (FAQ, event types, auto-reply)
 *
 * Rules:
 *   - Never paraphrase, never invent. If copy is missing, stop and ask.
 *   - Punctuation is normalised to typographic marks only (decision D3):
 *     `---` -> `—`, `--` -> `–`, straight apostrophes -> `’`, `\$` -> `$`, `\|` -> `|`.
 *     Words, order and spelling are untouched.
 *   - Prices stay strings so they render exactly as approved.
 *   - `scripts/check-copy.mjs` asserts every canonical string below appears in
 *     the rendered DOM.
 */

export const header = {
  wordmark: 'Happy Days Flower Farm',
  nav: [
    { label: 'Flower Bar', href: '#flower-bar' },
    { label: 'About', href: '#about' },
    { label: 'Inquire', href: '#inquire' },
  ],
} as const;

export const hero = {
  // R2: the spec header line reads "Happy Days Flower Farm | Unique Floral
  // Experiences"; the SEO starter pins the H1 to "Unique Floral Experiences".
  eyebrow: 'Happy Days Flower Farm',
  heading: 'Unique Floral Experiences',
  body: 'Locally grown and sourced floral experiences for businesses, events and gatherings across Western Pennsylvania.',
  cta: 'Inquire About Your Date',
} as const;

export const flowerBarIntro = {
  heading: 'A Flower Bar, Brought to You',
  lead: 'Give your guests something beautiful to experience — and take home.',
  body: [
    'Our Pop-Up Flower Bar arrives fully stocked with a curated selection of seasonal flowers and everything guests need to create their own bouquet. We handle the preparation, delivery and setup, then return for pickup when your event is over.',
    'Perfect for client appreciation, employee events, open houses, grand openings, showers, fundraisers and special gatherings.',
  ],
  emphasis: 'You host. We bring the flowers. Your guests create something beautiful.',
  cta: 'View Flower Bar Packages',
} as const;

export const howItWorks = {
  heading: 'How It Works',
  // `number` is data, not text: the source numbers the steps 01–04 because the
  // content is a sequence. Render it from this field, never inline.
  steps: [
    {
      number: '01',
      title: 'Choose Your Flower Bar',
      body: 'Select the package that best fits your expected number of guests.',
    },
    {
      number: '02',
      title: 'We Prepare Everything',
      body: 'We curate and prepare the flowers, greenery, bouquet sleeves, signage and supplies for your event.',
    },
    {
      number: '03',
      title: 'We Deliver & Style',
      body: 'Your flower bar arrives ready for guests to enjoy. We handle delivery, setup and styling.',
    },
    {
      number: '04',
      title: 'Your Guests Create',
      body: 'Guests choose their favorite blooms, build a bouquet and take it home. After your event, we return to collect the flower bar.',
    },
  ],
  closing: 'Simple for you. Memorable for them.',
} as const;

export const packages = {
  heading: 'Flower Bar Packages',
  intro:
    'Every Happy Days Flower Bar includes a curated selection of seasonal flowers and greenery, our 12-bucket flower bar display, bouquet sleeves, signage, preparation, delivery, setup and pickup.',
  items: [
    {
      name: 'The Classic Flower Bar',
      guests: 'Up to 25 guests',
      maxGuests: 25,
      price: '$895',
      description:
        'A complete flower bar experience for smaller gatherings, client events and celebrations.',
      mostPopular: false,
    },
    {
      name: 'The Social Flower Bar',
      guests: '26–50 guests',
      minGuests: 26,
      maxGuests: 50,
      price: '$1,495',
      description:
        'Perfect for corporate events, client appreciation, open houses and larger gatherings.',
      // "This is the recommended package to emphasize visually. A small 'Most
      // Popular' treatment is appropriate." — website-spec.md, re-confirmed in
      // owner-answers.md §5.
      mostPopular: true,
    },
    {
      name: 'The Full Flower Bar',
      guests: '51–75 guests',
      minGuests: 51,
      maxGuests: 75,
      price: '$1,995',
      description:
        'A fully stocked flower bar designed for larger events and high-traffic guest experiences.',
      mostPopular: false,
    },
  ],
  // The source renders this band's second line as one string, "75+ guests —
  // Custom quote"; it is split into the same guests/price fields as the cards
  // above so the layout can treat all four consistently.
  custom: {
    name: 'Custom Floral Experience',
    guests: '75+ guests',
    minGuests: 75,
    price: 'Custom quote',
    description:
      'Planning something bigger? We’ll create a custom flower bar experience based on your event, guest count and floral needs.',
  },
  mostPopularLabel: 'Most Popular',
  cta: 'Inquire About Your Date',
  footnote:
    'Packages include approximately 10 stems per participating guest. Flower varieties and colors vary seasonally based on availability.',
} as const;

export const whyHappyDays = {
  heading: 'Why Happy Days?',
  reasons: [
    {
      title: 'Locally Grown + Thoughtfully Sourced',
      body: 'Whenever the season allows, our flower bars feature blooms grown right here at Happy Days Flower Farm in Greensburg, Pennsylvania. We thoughtfully source additional flowers and greenery to create a full, beautiful selection year-round.',
    },
    {
      title: 'Designed Around the Season',
      body: 'No two flower bars need to look exactly alike. Colors, textures and varieties change with the season, creating an experience that feels fresh and unique to your event.',
    },
    {
      title: 'Beautifully Simple',
      body: 'We take care of the flowers, preparation, display, delivery, setup and pickup. Your guests simply choose the blooms they love and create a bouquet to take home.',
    },
    {
      title: 'More Than a Favor',
      body: 'Our flower bars give your guests something beautiful to bring home, something memorable to talk about, and something that makes them feel appreciated and genuinely happy!',
    },
  ],
} as const;

export const gallery = {
  heading: 'A Little Happiness, One Stem at a Time',
  body: 'From client appreciation events and open houses to celebrations and corporate gatherings, our flower bars are designed to become a part of the experience — not just the décor.',
  emphasis: 'Your guests choose. They create. They leave with flowers in hand.',
} as const;

export const about = {
  heading: 'Grown in Greensburg. Made to Be Shared.',
  body: [
    'Happy Days Flower Farm is a specialty cut flower farm in Greensburg, Pennsylvania creating unique floral experiences throughout Western PA.',
    'We grow seasonal flowers with a garden-inspired style and thoughtfully gather additional blooms locally when needed. What began with a single flower planted by our then 4-year-old son for Mother’s Day has grown into something much bigger — a family-inspired journey dedicated to helping others experience, enjoy, and share the simple joy of flowers.',
  ],
} as const;

export const faq = {
  // NOT FROM SOURCE: neither source supplies a heading for the FAQ section
  // (the section itself was approved in owner-answers.md §3a). This is a
  // placeholder for the owner to confirm — flagged in the Phase 3 handoff.
  heading: 'Frequently Asked Questions',
  // Verbatim from owner-answers.md §3a, in SEO display order — see
  // docs/seo-aeo-spec.md §11.1 (source indices 1, 4, 3, 2, 5, 7, 8, 6; request
  // SEO-3). Not one word changed: display order only. This array IS the order
  // of the <details> rows AND of FAQPage.mainEntity, which is what makes a
  // DOM/JSON-LD divergence structurally impossible — do not reorder it and do
  // not introduce an index map.
  items: [
    {
      question: 'What’s included with a Happy Days Flower Bar?',
      answer:
        'Every flower bar includes a curated selection of seasonal flowers and greenery, our 12-bucket flower bar display, bouquet sleeves, signage, preparation, delivery, setup and pickup.',
    },
    {
      question: 'How far do you travel? Is there a travel fee?',
      answer:
        'Happy Days Flower Farm is based in Greensburg and serves Pittsburgh and surrounding communities throughout Western Pennsylvania. Standard delivery, setup and pickup are included within our primary service area, approximately one hour or 50 miles from Greensburg. Events requiring extended travel may receive a custom travel quote.',
    },
    {
      question: 'How far in advance should we book?',
      answer:
        'As early as possible is always best, particularly for popular spring, summer and fall dates. We recommend booking at least 3–4 weeks in advance, but shorter-notice events may be possible depending on availability.',
    },
    {
      question: 'How many flowers does each guest get?',
      answer:
        'Packages include approximately 10 stems per participating guest. Guests choose their own combination of flowers, greenery and seasonal accents.',
    },
    {
      question: 'Can the flowers match our event or brand colors?',
      answer:
        'Yes. We can design the flower selection around a preferred color palette while working with the best seasonal blooms available. Because we work with locally grown and seasonal flowers, exact varieties cannot always be guaranteed.',
    },
    {
      question: 'Do guests need any experience arranging flowers?',
      answer:
        'No. That’s part of the fun. The flower bar is designed to make choosing and combining flowers simple, whether someone has arranged flowers before or not.',
    },
    {
      question: 'Can the flower bar be outdoors? What if it rains?',
      answer:
        'Yes, with appropriate weather conditions and a protected location. Flowers should be kept out of direct sun and extreme heat, and outdoor events should have a covered or indoor backup location in case of rain or severe weather.',
    },
    {
      question: 'What happens after the event?',
      answer:
        'We return after your event to collect the flower bar display and reusable setup pieces. Your guests take their bouquets home with them.',
    }
  ],
} as const;

/**
 * Type of Event options, verbatim from owner-answers.md §2a, in order.
 * The eighth source line reads "Other (with a box to type in)"; the
 * parenthetical is an instruction to add a free-text box, not option text, so
 * the option label is "Other" and the form reveals a text input when it is
 * selected. Server-side validation uses this list as the allowlist.
 */
export const eventTypes = [
  'Client appreciation',
  'Employee or corporate event',
  'Open house',
  'Grand opening',
  'Fundraiser',
  'Shower or private celebration',
  'Community or hospitality event',
  'Other',
] as const;

export const inquiry = {
  heading: 'Let’s Bring the Flower Bar to You',
  body: [
    'Planning an event, celebrating your clients or looking for something a little different for your guests?',
    'Tell us what you’re planning and we’ll help you choose the right flower bar for your event.',
  ],
  fields: [
    { name: 'name', label: 'Name', required: true, type: 'text' },
    { name: 'organization', label: 'Business / Organization', required: false, type: 'text' },
    { name: 'email', label: 'Email', required: true, type: 'email' },
    { name: 'phone', label: 'Phone', required: false, type: 'tel' },
    { name: 'eventDate', label: 'Event Date', required: true, type: 'date' },
    { name: 'eventLocation', label: 'Event Location', required: true, type: 'text' },
    { name: 'eventType', label: 'Type of Event', required: true, type: 'select' },
    { name: 'guestCount', label: 'Estimated Number of Guests', required: true, type: 'number' },
    {
      name: 'notes',
      label: 'Anything else we should know?',
      required: false,
      type: 'textarea',
    },
  ],
  submit: 'Send My Inquiry',
} as const;

export const footer = {
  lines: [
    'Happy Days Flower Farm',
    'Greensburg, Pennsylvania',
    'Serving Pittsburgh + Western Pennsylvania',
  ],
  socialLabels: {
    instagram: 'Instagram',
    facebook: 'Facebook',
    email: 'Email',
  },
  tagline: 'Unique Floral Experiences • Locally Grown + Thoughtfully Sourced',
} as const;

/**
 * Confirmation email sent to the person who submitted the form. Kept here as
 * the single approved wording; the string that actually ships is the copy in
 * `integrations/apps-script/Code.gs` (Phase 7). `{name}` is substituted with
 * the submitted name. Not rendered on the page, so `check-copy.mjs` skips it.
 */
export const autoReply = {
  body: 'Thanks, {name}! We received your inquiry and can’t wait to hear more about what you’re planning. We’ll be in touch within 2 business days to talk through your event and help you choose the right flower bar.',
  signature: 'Happy Days Flower Farm',
} as const;

export const copy = {
  header,
  hero,
  flowerBarIntro,
  howItWorks,
  packages,
  whyHappyDays,
  gallery,
  about,
  faq,
  eventTypes,
  inquiry,
  footer,
  autoReply,
} as const;

export type Copy = typeof copy;
