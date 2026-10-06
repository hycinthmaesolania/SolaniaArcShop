import { useState } from 'react';

/** Change these to your real contact details. */
const FACEBOOK_URL = 'https://www.facebook.com/hycinth.solania'; 
const CONTACT_EMAIL = 'hycinthmaesolania@gmail.com';
const CONTACT_HOURS = 'Mon–Sat, 8am–6pm';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Please enter your name.';
    if (!EMAIL_RE.test(email.trim())) next.email = 'Please enter a valid email address.';
    if (!message.trim()) next.message = 'Please write a message.';
    setErrors(next);
    if (Object.keys(next).length) return;

    // No backend yet: open the visitor's email app with the message filled in.
    const subject = encodeURIComponent(`Message from ${name.trim()}`);
    const body = encodeURIComponent(`${message.trim()}\n\n${name.trim()}\n${email.trim()}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <section id="contact" className="contact" aria-labelledby="contact-title" data-reveal>
      <div className="contact__info">
        <p className="eyebrow">Contact us</p>
        <h2 id="contact-title">Questions about an order or a product?</h2>
        <p>Send us a message and we’ll get back to you as soon as we can.</p>
       <ul className="contact__list">
  <li>
    <span>Email</span>
    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
    <a
      className="contact__gmail"
      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}`}
      target="_blank"
      rel="noopener noreferrer"
    >

    </a>
  </li>
  <li>
    <span>Hours</span>
    {CONTACT_HOURS}
    <li>
  <span>Facebook</span>
  <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">
    Message us on Facebook
  </a>
</li>
  </li>
</ul>
      </div>

      <form className="contact__form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="ct-name">Name</label>
          <input
            id="ct-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={errors.name ? true : undefined}
            autoComplete="name"
          />
          {errors.name && <p className="field__error" role="alert">{errors.name}</p>}
        </div>
        <div className="field">
          <label htmlFor="ct-email">Email</label>
          <input
            id="ct-email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={errors.email ? true : undefined}
            autoComplete="email"
          />
          {errors.email && <p className="field__error" role="alert">{errors.email}</p>}
        </div>
        <div className="field">
          <label htmlFor="ct-message">Message</label>
          <textarea
            id="ct-message"
            className="input"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            aria-invalid={errors.message ? true : undefined}
          />
          {errors.message && <p className="field__error" role="alert">{errors.message}</p>}
        </div>
        <button type="submit" className="btn btn--ink">Send message</button>
        {sent && (
          <p className="hint" role="status">
            Your email app should open with the message ready to send.
          </p>
        )}
      </form>
    </section>
  );
}
