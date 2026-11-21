# English Club — Phone Number Registration

A single-page registration form for selected English Club members. Members submit their
Tunisian phone number, and the club administration uses the collected numbers to add them to
the official WhatsApp group.

The site is plain HTML, CSS, and JavaScript — no build step, no framework, and no backend.

## Getting started

1. Open `app.js` and find the configuration block at the top of the file:

   ```js
   const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";
   ```

2. Create a form at [formspree.io](https://formspree.io), then replace `YOUR_FORM_ID` with your
   form's ID (e.g. `https://formspree.io/f/abcdwxyz`).

3. Serve the folder with any static server and open it in a browser:

   ```bash
   python3 -m http.server 8000
   ```

   Then visit <http://localhost:8000>.

> Until a real endpoint is configured, the form deliberately shows an error instead of a
> success message — it never fakes a submission.

## What gets sent

A single JSON field, so it is easy to recognise in Formspree responses or email notifications:

```json
{ "phone_number": "+21625678901" }
```

## Project structure

| File         | Purpose                                                    |
| ------------ | ---------------------------------------------------------- |
| `index.html` | Page markup and the registration form                      |
| `styles.css` | Full design system, layout, and responsive rules           |
| `app.js`     | Form validation, input formatting, and Formspree submission |
| `favicon.svg`| Small club emblem used as the browser tab icon             |

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
or a university server. Upload the four files (or point the host at this repository) — there is
nothing to compile.
