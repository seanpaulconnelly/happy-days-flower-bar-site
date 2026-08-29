/**
 * The inquiry form's *authored* microcopy — ux-spec §6.4, verbatim.
 *
 * This is deliberately NOT in `copy.ts`. Everything in `copy.ts` is the
 * business owner's approved wording, transcribed from `website-spec.md` and
 * `owner-answers.md`, and changing it needs the owner's approval. The strings
 * below are interface text written by the UX spec (validation messages, state
 * headings, the "Choose one" option) and are owned by the spec, not the owner.
 * They are still not typed inline in JSX, for the same reason: one place to
 * read, one place to change.
 *
 * Two exceptions live in `copy.ts` because they *are* owner copy and are only
 * referenced from here: the field labels and submit label (`copy.inquiry`) and
 * the auto-reply paragraph, which is the whole success panel — its first
 * sentence is the heading and the remainder is the body (`copy.autoReply`,
 * decision D16). There is deliberately no `successHeading` string here.
 *
 * Apostrophes are typographic (`’`) throughout, like every other string on the
 * page (decision D3, design review 5f-07). The wording is the ux-spec's.
 */
export const formCopy = {
  requiredNote: 'Required fields are marked *',
  selectPlaceholder: 'Choose one',
  otherLabel: 'Tell us the type of event',
} as const;

export const formErrors = {
  name: { required: 'Enter your name.' },
  email: {
    required: 'Enter your email address.',
    invalid: 'Enter a valid email address, like name@example.com.',
  },
  phone: { invalid: 'Enter a valid phone number, or leave this blank.' },
  eventDate: {
    required: 'Enter your event date.',
    past: 'Choose a date that hasn’t passed yet.',
  },
  eventLocation: { required: 'Enter where your event will be held.' },
  eventType: { required: 'Choose a type of event.' },
  eventTypeOther: { required: 'Tell us what type of event you’re planning.' },
  guestCount: {
    required: 'Enter your estimated number of guests.',
    invalid: 'Enter a whole number of guests, like 40.',
  },
  summary: 'Check the highlighted fields and try again.',
} as const;

export const formStatus = {
  submitting: 'Sending…',
  /**
   * Fallback heading for the unreachable case where the Name field is empty
   * (validation makes it so). With a name, the heading is the auto-reply's own
   * first sentence with `{name}` substituted — see D16 and `Inquiry.tsx`.
   */
  successHeadingFallback: 'Thanks! We received your inquiry.',
  successAgain: 'Send another inquiry',
  errorHeading: 'We couldn’t send your inquiry.',
  errorBody: 'Your details are still here. Try again, or email us directly.',
  errorMailto: 'Or email us directly',
} as const;
