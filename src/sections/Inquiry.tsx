import { useEffect, useRef, useState, type FormEvent } from 'react';
import Button from '../components/Button';
import Container from '../components/Container';
import Field from '../components/Field';
import SectionHeading from '../components/SectionHeading';
import { site } from '../config/site';
import { autoReply, eventTypes, inquiry } from '../content/copy';
import { formCopy, formErrors, formStatus } from '../content/formCopy';
import { cn } from '../lib/cn';
import { controlClasses, controlProps, errorRing, selectChevron } from '../lib/fieldStyles';
import { fetchNonce, mailtoHref, submitInquiry } from '../lib/inquiry';
import type { InquiryNonce, InquiryPayload } from '../lib/inquiry/types';

/**
 * Inquiry form — ux-spec §6, design-spec §6.9/§6.10, plan §3.2.
 *
 * The deep-green band is the page's one `surface-brand` section; the form card
 * sits on it in warm white, and the submit button is the on-brand primary
 * (warm orange on charcoal, design-spec §6.1) rather than the green pill, which
 * would disappear into the band.
 *
 * Validation runs in JS with `noValidate` on the form so the messages are the
 * spec's, identical in every browser; the native constraint attributes stay on
 * the controls as the no-JS fallback. Blur runs the *format* rules only — a
 * `required` message waits until the field has actually held a value or a
 * submit has been attempted, so tabbing through the form to read it never
 * paints six errors before a character is typed (UX-1). A failed submit shows
 * the summary line and moves focus to the first invalid control in DOM order,
 * never losing what was typed.
 *
 * **Success is shown only on a confirmed `{ ok: true }`** (plan §3.2). Every
 * other outcome — network, CORS, 5xx, an unconfigured endpoint, an explicit
 * rejection — keeps the form and its values and shows the error panel with a
 * prefilled `mailto:`, so a backend outage still leaves the visitor a path. A
 * *quarantined* submission returns `{ ok: true }` and shows the confirmation:
 * the lead was saved, and no visitor is told they looked like a bot.
 *
 * Three anti-spam signals are collected and none of them can block a send
 * (plan §3.2, "a real lead can never be lost"): an off-screen honeypot, the
 * time since mount plus whether the visitor actually interacted, and a signed
 * nonce fetched on mount that is simply omitted if the `GET` fails.
 *
 * Both live regions are mounted from first render, empty, so a screen reader
 * has registered them before anything is announced into them.
 */

const OTHER = 'Other';

type FieldName = (typeof inquiry.fields)[number]['name'];
type ValueKey = FieldName | 'eventTypeOther';
type Values = Record<ValueKey, string>;
type Errors = Partial<Record<ValueKey, string>>;

const LABELS = Object.fromEntries(inquiry.fields.map((f) => [f.name, f.label])) as Record<
  FieldName,
  string
>;

/** DOM order, which is also tab order and the order focus hunts for an error. */
const ORDER: ValueKey[] = [
  'name',
  'organization',
  'email',
  'phone',
  'eventDate',
  'eventLocation',
  'eventType',
  'eventTypeOther',
  'guestCount',
  'notes',
];

const EMPTY: Values = {
  name: '',
  organization: '',
  email: '',
  phone: '',
  eventDate: '',
  eventLocation: '',
  eventType: '',
  guestCount: '',
  notes: '',
  eventTypeOther: '',
};

const fieldId = (key: ValueKey) => `inquiry-${key}`;

/** Local calendar date as `YYYY-MM-DD` — `toISOString()` would be UTC. */
function todayIso(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/**
 * Deliberately permissive (ux-spec §6.1): the address is checked for shape, not
 * deliverability, and the phone only for "enough digits to be a phone number".
 * Anything stricter rejects real people.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const digitCount = (value: string) => (value.match(/\d/g) ?? []).length;

function validate(values: Values): Errors {
  const errors: Errors = {};

  if (!values.name.trim()) errors.name = formErrors.name.required;

  if (!values.email.trim()) errors.email = formErrors.email.required;
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = formErrors.email.invalid;

  if (values.phone.trim() && digitCount(values.phone) < 7) {
    errors.phone = formErrors.phone.invalid;
  }

  if (!values.eventDate.trim()) errors.eventDate = formErrors.eventDate.required;
  else if (values.eventDate < todayIso()) errors.eventDate = formErrors.eventDate.past;

  if (!values.eventLocation.trim()) errors.eventLocation = formErrors.eventLocation.required;

  if (!values.eventType) errors.eventType = formErrors.eventType.required;
  else if (values.eventType === OTHER && !values.eventTypeOther.trim()) {
    errors.eventTypeOther = formErrors.eventTypeOther.required;
  }

  const guests = values.guestCount.trim();
  if (!guests) errors.guestCount = formErrors.guestCount.required;
  else if (!/^\d+$/.test(guests) || Number(guests) < 1) {
    errors.guestCount = formErrors.guestCount.invalid;
  }

  return errors;
}

type Resolved = {
  name: string;
  organization: string;
  email: string;
  phone: string;
  eventDate: string;
  eventLocation: string;
  eventType: string;
  guestCount: string;
  notes: string;
};

/** The nine spec fields with "Other: …" resolved — used for the payload and the `mailto:`. */
function resolved(values: Values): Resolved {
  return {
    name: values.name.trim(),
    organization: values.organization.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    eventDate: values.eventDate.trim(),
    eventLocation: values.eventLocation.trim(),
    eventType:
      values.eventType === OTHER ? `${OTHER}: ${values.eventTypeOther.trim()}` : values.eventType,
    guestCount: values.guestCount.trim(),
    notes: values.notes.trim(),
  };
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Split the approved auto-reply at the end of its first sentence (D16).
 *
 * The success panel renders the paragraph verbatim, in order: the first
 * sentence becomes the `<h3>` — so the panel has a heading to focus and
 * announce — and the remainder becomes the body. Nothing is added, removed or
 * repeated, which is what D9 as written could not manage (QA-2 / 5f-08).
 */
function splitFirstSentence(text: string): { first: string; rest: string } {
  const end = text.search(/[.!?](\s|$)/);
  if (end === -1) return { first: text, rest: '' };
  return { first: text.slice(0, end + 1), rest: text.slice(end + 1).trim() };
}

const AUTO_REPLY = splitFirstSentence(autoReply.body);

export default function Inquiry() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [showSummary, setShowSummary] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [sentName, setSentName] = useState('');

  const formRef = useRef<HTMLFormElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const otherRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLHeadingElement>(null);

  const mountedAt = useRef(0);
  const interacted = useRef(false);
  const nonce = useRef<InquiryNonce | undefined>(undefined);
  /** Set once "Other" has been chosen, so focus moves into the box only then. */
  const revealedOther = useRef(false);
  /**
   * Keys the visitor has actually put a value into. A `required` error is only
   * useful once someone has had a chance to be right, so blur stays quiet on a
   * field that is still empty and has never held anything (UX-1).
   */
  const dirty = useRef<Set<ValueKey>>(new Set());

  // Signed nonce, best effort. A failure here is invisible and harmless: the
  // POST goes without it and the server treats that as one flag, not a reject.
  useEffect(() => {
    mountedAt.current = Date.now();
    let cancelled = false;
    void fetchNonce().then((value) => {
      if (!cancelled) nonce.current = value;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Focus the panel heading so the outcome is both announced and navigable.
  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
    if (status === 'error') errorRef.current?.focus();
  }, [status]);

  function setValue(key: ValueKey, value: string) {
    if (value.trim()) dirty.current.add(key);
    const next = { ...values, [key]: value };
    setValues(next);
    // "Messages clear as soon as the field becomes valid" (ux-spec §6.3) — but
    // a field with no message yet does not gain one mid-typing.
    if (errors[key]) setErrors({ ...errors, [key]: validate(next)[key] });
  }

  /**
   * UX-5: leaving "Other" hides the text box, so its error has to go with it —
   * otherwise choosing "Other" again reveals a field that is already red before
   * the visitor has typed anything.
   */
  function setEventType(value: string) {
    if (value.trim()) dirty.current.add('eventType');
    const leavingOther = value !== OTHER;
    if (leavingOther) dirty.current.delete('eventTypeOther');

    const next: Values = {
      ...values,
      eventType: value,
      eventTypeOther: leavingOther ? '' : values.eventTypeOther,
    };
    setValues(next);

    const nextErrors: Errors = { ...errors };
    if (errors.eventType) nextErrors.eventType = validate(next).eventType;
    if (leavingOther) delete nextErrors.eventTypeOther;
    setErrors(nextErrors);
  }

  function validateOnBlur(key: ValueKey) {
    // Only the `required` rules can fire on an empty field, so "empty, never
    // filled, no submit yet" is exactly the case that must stay silent (UX-1).
    // Everything else — email shape, phone digits, a past date, a fractional
    // guest count — needs typed content and still validates on blur.
    const untouched = !values[key].trim() && !dirty.current.has(key) && !showSummary;
    setErrors({ ...errors, [key]: untouched ? undefined : validate(values)[key] });
  }

  function reset() {
    setValues(EMPTY);
    setErrors({});
    setShowSummary(false);
    setStatus('idle');
    setSentName('');
    mountedAt.current = Date.now();
    interacted.current = false;
    revealedOther.current = false;
    dirty.current = new Set();
    if (honeypotRef.current) honeypotRef.current.value = '';
    // The restored form is empty, so the first thing to do in it is type a name.
    window.requestAnimationFrame(() => nameRef.current?.focus());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return; // double-submit guard

    const found = validate(values);
    setErrors(found);

    const firstInvalid = ORDER.find((key) => found[key]);
    if (firstInvalid) {
      setShowSummary(true);
      setStatus('idle');
      formRef.current?.querySelector<HTMLElement>(`#${fieldId(firstInvalid)}`)?.focus();
      return;
    }

    setShowSummary(false);
    setStatus('submitting');

    const fields = resolved(values);
    const payload: InquiryPayload = {
      name: fields.name,
      organization: fields.organization || undefined,
      email: fields.email,
      phone: fields.phone || undefined,
      eventDate: fields.eventDate,
      eventLocation: fields.eventLocation,
      eventType: fields.eventType,
      guestCount: fields.guestCount,
      notes: fields.notes || undefined,
      hp_field: honeypotRef.current?.value ?? '',
      elapsedMs: mountedAt.current ? Date.now() - mountedAt.current : 0,
      interacted: interacted.current,
      nonce: nonce.current,
    };

    const result = await submitInquiry(payload);
    if (result.ok) {
      setSentName(values.name.trim());
      setStatus('success');
    } else {
      setStatus('error');
    }
  }

  const submitting = status === 'submitting';
  const success = status === 'success';
  const failed = status === 'error';
  // D16: heading + body are the one approved auto-reply paragraph, split at its
  // first sentence and rendered in order. With no name (unreachable after
  // validation) the ux-spec §6.4 fallback heading stands in for a sentence that
  // would otherwise still carry the `{name}` placeholder.
  const heading = sentName
    ? AUTO_REPLY.first.replace('{name}', sentName)
    : formStatus.successHeadingFallback;
  const body = AUTO_REPLY.rest;

  return (
    <section
      id="inquire"
      aria-labelledby="inquire-heading"
      data-surface="brand"
      className="bg-surface-brand py-section"
    >
      <Container>
        <SectionHeading id="inquire-heading" heading={inquiry.heading} tone="on-brand" />
        <div className="text-lead mx-auto mt-4 max-w-prose-copy space-y-3 text-center text-on-brand-muted">
          {inquiry.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <form
          ref={formRef}
          noValidate
          // A warm-white card inside the brand section: the section's warm-white
          // focus ring would be invisible on it, so the card takes the green
          // ring back (design review 5f-01, design-spec §6.15). The submit stays
          // orange + charcoal because `onBrand` is passed explicitly below.
          data-surface="light"
          aria-busy={submitting || undefined}
          onSubmit={handleSubmit}
          onPointerDown={() => {
            interacted.current = true;
          }}
          onKeyDown={() => {
            interacted.current = true;
          }}
          className="mt-stack mx-auto max-w-form rounded-card bg-surface-alt p-6 shadow-form sm:p-8 lg:p-10"
        >
          {/* Live region 1 of 2: mounted empty from first render (ux-spec §6.3). */}
          <div role="status" aria-live="polite">
            {submitting ? <p className="sr-only">{formStatus.submitting}</p> : null}
            {success ? (
              <div className="rounded-field border border-accent-mint bg-accent-mint-tint p-5 text-brand-ink">
                <h3
                  ref={successRef}
                  tabIndex={-1}
                  className="font-display text-h3 outline-offset-4"
                >
                  {heading}
                </h3>
                <p className="text-body mt-3">{body}</p>
                <button
                  type="button"
                  onClick={reset}
                  // 44 px hit area like every other link on the page; the
                  // negative margin keeps the panel's rhythm (5f-06 / UX-3).
                  className="text-body mt-2 -mb-2 inline-flex min-h-tap items-center font-medium text-brand-ink underline underline-offset-4"
                >
                  {formStatus.successAgain}
                </button>
              </div>
            ) : null}
          </div>

          {!success ? (
            <div className="space-y-5">
              <p className="text-small text-ink-muted">{formCopy.requiredNote}</p>

              <Field id={fieldId('name')} label={LABELS.name} required error={errors.name}>
                <input
                  {...controlProps(fieldId('name'), errors.name)}
                  ref={nameRef}
                  type="text"
                  name="name"
                  readOnly={submitting}
                  value={values.name}
                  onChange={(e) => setValue('name', e.target.value)}
                  onBlur={() => validateOnBlur('name')}
                  required
                  aria-required="true"
                  maxLength={120}
                  autoComplete="name"
                  className={cn(controlClasses.input, errorRing(errors.name))}
                />
              </Field>

              <Field id={fieldId('organization')} label={LABELS.organization}>
                <input
                  {...controlProps(fieldId('organization'))}
                  type="text"
                  name="organization"
                  readOnly={submitting}
                  value={values.organization}
                  onChange={(e) => setValue('organization', e.target.value)}
                  maxLength={120}
                  autoComplete="organization"
                  className={controlClasses.input}
                />
              </Field>

              <Field id={fieldId('email')} label={LABELS.email} required error={errors.email}>
                <input
                  {...controlProps(fieldId('email'), errors.email)}
                  type="email"
                  name="email"
                  readOnly={submitting}
                  value={values.email}
                  onChange={(e) => setValue('email', e.target.value)}
                  onBlur={() => validateOnBlur('email')}
                  required
                  aria-required="true"
                  maxLength={160}
                  inputMode="email"
                  autoComplete="email"
                  spellCheck={false}
                  autoCapitalize="off"
                  className={cn(controlClasses.input, errorRing(errors.email))}
                />
              </Field>

              <Field id={fieldId('phone')} label={LABELS.phone} error={errors.phone}>
                <input
                  {...controlProps(fieldId('phone'), errors.phone)}
                  type="tel"
                  name="phone"
                  readOnly={submitting}
                  value={values.phone}
                  onChange={(e) => setValue('phone', e.target.value)}
                  onBlur={() => validateOnBlur('phone')}
                  maxLength={40}
                  inputMode="tel"
                  autoComplete="tel"
                  className={cn(controlClasses.input, errorRing(errors.phone))}
                />
              </Field>

              <Field
                id={fieldId('eventDate')}
                label={LABELS.eventDate}
                required
                error={errors.eventDate}
              >
                <input
                  {...controlProps(fieldId('eventDate'), errors.eventDate)}
                  type="date"
                  name="eventDate"
                  readOnly={submitting}
                  value={values.eventDate}
                  onChange={(e) => setValue('eventDate', e.target.value)}
                  onBlur={() => validateOnBlur('eventDate')}
                  required
                  aria-required="true"
                  min={todayIso()}
                  autoComplete="off"
                  className={cn(controlClasses.input, errorRing(errors.eventDate))}
                />
              </Field>

              <Field
                id={fieldId('eventLocation')}
                label={LABELS.eventLocation}
                required
                error={errors.eventLocation}
              >
                <input
                  {...controlProps(fieldId('eventLocation'), errors.eventLocation)}
                  type="text"
                  name="eventLocation"
                  readOnly={submitting}
                  value={values.eventLocation}
                  onChange={(e) => setValue('eventLocation', e.target.value)}
                  onBlur={() => validateOnBlur('eventLocation')}
                  required
                  aria-required="true"
                  maxLength={160}
                  autoComplete="off"
                  className={cn(controlClasses.input, errorRing(errors.eventLocation))}
                />
              </Field>

              <Field
                id={fieldId('eventType')}
                label={LABELS.eventType}
                required
                error={errors.eventType}
              >
                <select
                  {...controlProps(fieldId('eventType'), errors.eventType)}
                  name="eventType"
                  disabled={submitting}
                  value={values.eventType}
                  onChange={(e) => {
                    setEventType(e.target.value);
                    if (e.target.value === OTHER && !revealedOther.current) {
                      revealedOther.current = true;
                      window.requestAnimationFrame(() => otherRef.current?.focus());
                    }
                  }}
                  onBlur={() => validateOnBlur('eventType')}
                  required
                  aria-required="true"
                  autoComplete="off"
                  style={selectChevron}
                  className={cn(controlClasses.select, errorRing(errors.eventType))}
                >
                  {/* A real, disabled option — not a placeholder — so nothing is
                      preselected and the visitor has to choose (ux-spec §6.2). */}
                  <option value="" disabled>
                    {formCopy.selectPlaceholder}
                  </option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Toggled with `hidden`, so it leaves the accessibility tree and
                  the tab order entirely while it is not in play. */}
              <Field
                id={fieldId('eventTypeOther')}
                label={formCopy.otherLabel}
                required
                error={errors.eventTypeOther}
                hidden={values.eventType !== OTHER}
              >
                <input
                  {...controlProps(fieldId('eventTypeOther'), errors.eventTypeOther)}
                  ref={otherRef}
                  type="text"
                  name="eventTypeOther"
                  readOnly={submitting}
                  value={values.eventTypeOther}
                  onChange={(e) => setValue('eventTypeOther', e.target.value)}
                  onBlur={() => validateOnBlur('eventTypeOther')}
                  required={values.eventType === OTHER}
                  aria-required={values.eventType === OTHER}
                  maxLength={120}
                  autoComplete="off"
                  className={cn(controlClasses.input, errorRing(errors.eventTypeOther))}
                />
              </Field>

              <Field
                id={fieldId('guestCount')}
                label={LABELS.guestCount}
                required
                error={errors.guestCount}
              >
                <input
                  {...controlProps(fieldId('guestCount'), errors.guestCount)}
                  type="number"
                  name="guestCount"
                  readOnly={submitting}
                  value={values.guestCount}
                  onChange={(e) => setValue('guestCount', e.target.value)}
                  onBlur={() => validateOnBlur('guestCount')}
                  required
                  aria-required="true"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  autoComplete="off"
                  className={cn(controlClasses.input, errorRing(errors.guestCount))}
                />
              </Field>

              <Field id={fieldId('notes')} label={LABELS.notes}>
                <textarea
                  {...controlProps(fieldId('notes'))}
                  name="notes"
                  readOnly={submitting}
                  rows={4}
                  value={values.notes}
                  onChange={(e) => setValue('notes', e.target.value)}
                  maxLength={2000}
                  autoComplete="off"
                  className={controlClasses.textarea}
                />
              </Field>

              {/* Honeypot (plan §3.2). Off-screen rather than `display:none` so a
                  crawler that renders CSS still fills it; meaningless name so no
                  browser's autofill has a reason to. Never blocks a submission —
                  it only decides which sheet tab the row lands in. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="hd-ref-code">Leave this field empty</label>
                <input
                  ref={honeypotRef}
                  id="hd-ref-code"
                  name="hd_ref_code"
                  type="text"
                  defaultValue=""
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
            </div>
          ) : null}

          {/* Live region 2 of 2, directly above the button (ux-spec §6.3). */}
          <div role="alert" className="empty:hidden">
            {failed ? (
              <div className="mt-6 rounded-field border border-danger/30 bg-danger-tint p-5 text-ink">
                <h3
                  ref={errorRef}
                  tabIndex={-1}
                  className="font-display text-h3 text-danger outline-offset-4"
                >
                  {formStatus.errorHeading}
                </h3>
                <p className="text-body mt-3">{formStatus.errorBody}</p>
                <a
                  href={mailtoHref(resolved(values), site.email)}
                  // 44 px hit area (5f-06 / UX-3), replacing `inline-block`.
                  className="text-body mt-1 -mb-2 inline-flex min-h-tap items-center font-medium text-brand-ink underline underline-offset-4"
                >
                  {formStatus.errorMailto}
                </a>
              </div>
            ) : null}
            {showSummary && !failed ? (
              <p className="text-small mt-6 text-danger">{formErrors.summary}</p>
            ) : null}
          </div>

          {!success ? (
            <div className="mt-8">
              <Button
                as="button"
                type="submit"
                variant="primary"
                onBrand
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting ? formStatus.submitting : inquiry.submit}
              </Button>
            </div>
          ) : null}
        </form>
      </Container>
    </section>
  );
}
