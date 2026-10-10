# Embedded-config Chartered Accountant Website

A responsive, single-page static website for an individual chartered accountant. Business identity, profile, services, practice highlights, process, testimonials, FAQs, contact details, form labels and theme colours are stored as embedded JSON inside `index.html`.

There is no backend, package installation, build step, TypeScript, JavaScript framework, or runtime configuration request.

## Project structure

```text
.
├── index.html          # Page shell plus embedded JSON configuration
├── config.json         # Reference copy of the embedded configuration
├── logo.svg / .png     # Full Take My Risk logo
├── logo-icon.svg / .png# Compact logo and favicon
├── css/
│   └── styles.css      # Responsive layout and visual design
└── js/
    └── app.js          # Parses embedded JSON and renders the page
```

## Open or publish

You can now double-click `index.html` and open it directly in a browser. The website no longer fetches `config.json`, so a local Python server is not required.

The same files can be published directly through GitHub Pages or any static hosting provider.

## Customise the website

Edit the JSON inside this block near the bottom of `index.html`:

```html
<script id="site-config" type="application/json">
  { ...website configuration... }
</script>
```

After changing the embedded JSON, reload the page. Keep the JSON valid: property names and string values require double quotes, and the final item in an object or array must not have a trailing comma.

`config.json` is retained as a readable reference copy, but the browser does **not** load it. If content is changed for production, update the embedded block in `index.html`; optionally mirror the same change in `config.json` to keep the reference copy synchronized.

| Config key | Controls |
|---|---|
| `site` | Name, logo paths, title, description, credentials, language and theme |
| `ui` | Accessibility and status labels |
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

For reliable production form delivery, connect the form to a backend or form-handling service and update the submit handler in `js/app.js`.

## Before publishing

The embedded configuration contains fictional sample data. Replace and verify:

1. The CA's name, qualifications, ICAI membership details and experience.
2. Every service description and professional claim.
3. Address, telephone number and email address. The `.example` email domain cannot receive mail.
4. Statistics and testimonials. Obtain permission before publishing client names or quotes.
5. Disclaimer and any privacy or legal content required for the intended jurisdiction.

The renderer uses text nodes rather than injecting config values as HTML, validates required content, provides accessible form labels and navigation controls, and includes responsive and reduced-motion styling.
