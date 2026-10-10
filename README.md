# JSON-driven Chartered Accountant Website

A responsive, single-page static website for an individual chartered accountant. Business identity, profile, services, practice highlights, process, testimonials, FAQs, contact details, form labels and theme colours are loaded from `config.json` at runtime.

There is no backend, package installation, build step, TypeScript, or JavaScript framework.

## Project structure

```text
.
├── index.html          # Minimal browser shell
├── config.json         # All editable website and business content
├── css/
│   └── styles.css      # Responsive layout and visual design
└── js/
    └── app.js          # Loads, validates and renders the JSON data
```

## Run locally

A browser will normally block `fetch("config.json")` when `index.html` is opened directly as a `file://` URL. Serve the folder over HTTP instead.

From this directory, run:

```powershell
python -m http.server 8000
```

Then open <http://localhost:8000>.

Other static hosts and local servers work as well, including GitHub Pages, Netlify, Cloudflare Pages, `npx serve`, and VS Code Live Server.

## Customise the website

Edit `config.json` and reload the page. No HTML or JavaScript editing is needed for ordinary content changes.

| Config key | Controls |
|---|---|
| `site` | Name, title, description, credentials, language and theme |
| `ui` | Accessibility and loading/error labels |
| `navigation` | Menu links and header call to action |
| `hero` | Main headline, buttons, highlights and side panel |
| `profile` | Individual biography, credentials and profile card |
| `servicesSection` / `services` | Service heading and service cards |
| `statistics` | Practice highlight figures |
| `approach` | Engagement process |
| `testimonialSection` / `testimonials` | Client feedback |
| `faqSection` / `faqs` | Frequently asked questions |
| `contact` | Contact details and email-form configuration |
| `footer` | Summary, disclaimer, links and copyright |

Arrays such as `services`, `testimonials`, and `faqs` can be shortened or emptied. Empty optional sections are omitted.

## Contact form behavior

The project intentionally has no backend. Submitting the form creates a pre-filled `mailto:` link and opens the visitor's default email application. The visitor must review and send the email there; the website does not transmit or store form data.

Set these values under `contact.form`:

- `recipient`: destination email address
- `subjectPrefix`: prefix used in the generated email subject
- field labels, placeholders, service options, button text and privacy note

For reliable production form delivery, connect the form to a backend or a form-handling service and update the submit handler in `js/app.js`.

## Theme

Theme values are CSS colours and are applied as custom properties:

```json
"theme": {
  "primary": "#153e52",
  "primaryDark": "#0b2734",
  "accent": "#c08b3e",
  "background": "#fbfaf7",
  "surface": "#ffffff",
  "soft": "#eef3f2",
  "text": "#17252d",
  "muted": "#60717a"
}
```

## Before publishing

`config.json` contains fictional sample data. Replace and verify all of the following:

1. The CA's name, qualifications, ICAI membership details and years of experience.
2. Every service description and professional claim.
3. Address, telephone number and email address. The `.example` email domain will not receive mail.
4. Statistics and testimonials. Obtain permission before publishing client names or quotes.
5. Disclaimer and any privacy/legal content required for the intended jurisdiction.

The renderer uses text nodes rather than injecting config values as HTML, validates required top-level content, uses accessible form labels and navigation controls, and includes responsive and reduced-motion styling.
