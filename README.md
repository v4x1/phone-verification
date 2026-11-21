# English Club — Phone Number Registration

A single-page registration form for selected English Club members. Members submit their
Tunisian phone number, and the club administration uses the collected numbers to add them to
the official WhatsApp group.

The site is plain HTML, CSS, and JavaScript — no build step, no framework, and no backend.

## Getting started

The form is already connected to the club's Formspree form
([`mjywavgb`](https://formspree.io/f/mjywavgb)). Submissions arrive in that Formspree account,
which can forward them by email or show them in its dashboard.

The endpoint is the single configuration point, at the top of `app.js`:

```js
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mjywavgb";
```

To use a different form, replace that URL with your own form's endpoint.

## Running locally

Serve the folder with any static server and open it in a browser:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. No build step or install is needed.

## What gets sent

A single JSON field, so it is easy to recognise in Formspree responses or email notifications:

```json
{ "phone_number": "+21625678901" }
```

## Project structure

| File                          | Purpose                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| `index.html`                  | Page markup and the registration form                        |
| `styles.css`                  | Full design system, layout, and responsive rules             |
| `app.js`                      | Form validation, input formatting, and Formspree submission  |
| `assets/umt-english-logo.png` | Club logo shown on the page (transparent background)         |
| `assets/favicon.png`          | Club emblem used as the browser tab icon                     |

## Behaviour

- The **+216** country code is fixed and rendered separately from the input; only the 8-digit
  national number is entered.
- Input is restricted to digits, formatted live as `XX XXX XXX`. Letters, symbols, and numbers
  that are too short or too long are rejected with a clear inline message.
- Pasted numbers like `+216 25 678 901` or `0021625678901` are normalised automatically.
- Submissions are sent as `POST` requests with `Content-Type: application/json`.
- The submit button is disabled while a request is in flight, preventing duplicates.
- Network, timeout, and server failures show a friendly error and keep the form available for
  retry. Success is only shown after Formspree confirms the request with a 2xx response.
- Fully responsive, keyboard accessible, and honours `prefers-reduced-motion`.

## Deploying

The site is static, so any static host works: GitHub Pages, Netlify, Vercel, Cloudflare Pages,
or a university server. Upload the files and the `assets/` folder (or point the host at this repository) — there is
nothing to compile.
