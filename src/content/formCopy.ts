/**
 * The inquiry form's *authored* microcopy — ux-spec §6.4, verbatim.
 *
 * This is deliberately NOT in `copy.ts`. Everything in `copy.ts` is the
 * business owner's approved wording, transcribed from `website-spec.md` and
 * `answers-from-bethany.md`, and changing it needs her approval. The strings
 * below are interface text written by the UX spec (validation messages, state
 * headings, the "Choose one" option) and are owned by the spec, not the owner.
 * They are still not typed inline in JSX, for the same reason: one place to
 * read, one place to change.
 *
 * Two exceptions live in `copy.ts` because they *are* owner copy and are only
 * referenced from here: the field labels and submit label (`copy.inquiry`) and
 * the auto-reply paragraph reused as the success body (`copy.autoReply`,
 * decision D9).
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
    past: "Choose a date that hasn't passed yet.",
  },
  eventLocation: { required: 'Enter where your event will be held.' },
  eventType: { required: 'Choose a type of event.' },
  eventTypeOther: { required: "Tell us what type of event you're planning." },
  guestCount: {
    required: 'Enter your estimated number of guests.',
    invalid: 'Enter a whole number of guests, like 40.',
  },
  summary: 'Check the highlighted fields and try again.',
} as const;

export const formStatus = {
  submitting: 'Sending…',
  /** `{name}` is substituted with the Name field, as typed (ux-spec §6.4, D9). */
  successHeading: 'Thanks, {name}!',
  /** Fallback when the name is somehow empty (validation makes this unreachable). */
  successHeadingFallback: 'Thanks! We received your inquiry.',
  successAgain: 'Send another inquiry',
  errorHeading: "We couldn't send your inquiry.",
  errorBody: 'Your details are still here. Try again, or email us directly.',
  errorMailto: 'Or email us directly',
} as const;
