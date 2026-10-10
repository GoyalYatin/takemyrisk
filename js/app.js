"use strict";

const CONFIG_URL = "config.json";

const $ = (selector, root = document) => root.querySelector(selector);
const list = (value) => (Array.isArray(value) ? value : []);
const hasText = (value) => typeof value === "string" && value.trim().length > 0;

function createElement(tag, attributes = {}, children = []) {
  const node = document.createElement(tag);

  Object.entries(attributes).forEach(([name, value]) => {
    if (value === undefined || value === null || value === false) return;
    if (name === "className") node.className = value;
    else if (name === "text") node.textContent = String(value);
    else if (name === "onClick") node.addEventListener("click", value);
    else if (name === "onSubmit") node.addEventListener("submit", value);
    else if (name === "checked" || name === "open" || name === "required") node[name] = Boolean(value);
    else node.setAttribute(name, String(value));
  });

  list(Array.isArray(children) ? children : [children])
    .flat(Infinity)
    .filter((child) => child !== null && child !== undefined && child !== false)
    .forEach((child) => node.append(child instanceof Node ? child : document.createTextNode(String(child))));

  return node;
}

function safeHref(value, fallback = "#") {
  if (!hasText(value)) return fallback;
  const href = value.trim();
  if (href.startsWith("#") || /^(https?:|mailto:|tel:)/i.test(href)) return href;
  return fallback;
}

function linkAttributes(href) {
  const safe = safeHref(href);
  return /^https?:/i.test(safe) ? { href: safe, target: "_blank", rel: "noopener noreferrer" } : { href: safe };
}

function applyTheme(theme = {}) {
  const properties = {
    primary: "--primary",
    primaryDark: "--primary-dark",
    accent: "--accent",
    background: "--background",
    surface: "--surface",
    soft: "--soft",
    text: "--text",
    muted: "--muted"
  };

  Object.entries(properties).forEach(([key, property]) => {
    const value = theme[key];
    if (hasText(value) && (!window.CSS || CSS.supports("color", value))) {
      document.documentElement.style.setProperty(property, value);
    }
  });
}

function applyMetadata(site = {}) {
  if (hasText(site.language)) document.documentElement.lang = site.language;
  document.title = site.pageTitle || site.name || "Chartered Accountant";

  const description = $("meta[name='description']");
  if (description && hasText(site.description)) description.content = site.description;

  const themeColor = $("meta[name='theme-color']");
  if (themeColor && hasText(site.theme?.primary)) themeColor.content = site.theme.primary;

  const favicon = $("link[rel='icon']");
  const faviconPath = safeAssetPath(site.logo?.iconPath || site.logo?.path);
  if (favicon && faviconPath) favicon.href = faviconPath;
}

function sectionHeading(section = {}) {
  return createElement("div", { className: "section-heading" }, [
    hasText(section.eyebrow) && createElement("p", { className: "eyebrow", text: section.eyebrow }),
    hasText(section.title) && createElement("h2", { text: section.title }),
    hasText(section.subtitle) && createElement("p", { className: "section-heading__subtitle", text: section.subtitle })
  ]);
}

function icon(type) {
  const paths = {
    pin: "M12 21s7-5.2 7-12A7 7 0 1 0 5 9c0 6.8 7 12 7 12Zm0-9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z",
    phone: "M7.1 3.5 9.3 8 7.7 9.6c.9 2 2.7 3.8 4.7 4.7l1.6-1.6 4.5 2.2-.5 3.6c-.1.9-.9 1.5-1.8 1.5C9.5 19.6 4.4 14.5 4 7.8c0-.9.6-1.7 1.5-1.8l1.6-2.5Z",
    mail: "M3 6.5 12 13l9-6.5M4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11A1.5 1.5 0 0 1 4.5 5Z",
    clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4l3 2"
  };

  return createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false" }, [
    createElement("path", { d: paths[type] || paths.mail })
  ]);
}

function safeAssetPath(value) {
  if (!hasText(value)) return "";
  const path = value.trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(path) && !/^https?:/i.test(path)) return "";
  if (path.startsWith("//")) return "";
  return path;
}

function buildBrandVisual(site = {}, footer = false) {
  const logoPath = safeAssetPath(site.logo?.path);
  if (logoPath) {
    return createElement("img", {
      className: footer ? "brand__logo brand__logo--footer" : "brand__logo",
      src: logoPath,
      alt: site.logo.alt || site.name || "Website logo"
    });
  }

  return createElement("span", {
    className: footer ? "brand__mark brand__mark--footer" : "brand__mark",
    text: site.shortName || "CA",
    "aria-hidden": "true"
  });
}

function buildHeader(config) {
  const navigation = config.navigation || {};
  const site = config.site || {};
  const ui = config.ui || {};
  const navId = "main-navigation";

  const nav = createElement("nav", { id: navId, className: "nav", "aria-label": navigation.ariaLabel || "Main navigation" }, [
    createElement("div", { className: "nav__links" }, [
      list(navigation.items).map((item) =>
        createElement("a", { ...linkAttributes(item.href), text: item.label })
      ),
      navigation.cta && createElement("a", {
        className: "button button--small button--primary",
        ...linkAttributes(navigation.cta.href),
        text: navigation.cta.label
      })
    ])
  ]);

  const toggle = createElement("button", {
    className: "nav-toggle",
    type: "button",
    "aria-controls": navId,
    "aria-expanded": "false",
    "aria-label": ui.menuOpen || "Open navigation menu"
  }, [
    createElement("span", { className: "nav-toggle__line" }),
    createElement("span", { className: "nav-toggle__line" }),
    createElement("span", { className: "nav-toggle__line" })
  ]);

  const setMenu = (open) => {
    nav.classList.toggle("nav--open", open);
    toggle.classList.toggle("nav-toggle--open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? (ui.menuClose || "Close navigation menu") : (ui.menuOpen || "Open navigation menu"));
  };

  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) setMenu(false);
  });

  return createElement("header", { className: "site-header" }, [
    createElement("div", { className: "container site-header__inner" }, [
      createElement("a", { className: "brand", href: "#home", "aria-label": `${site.name || "CA"} home` }, [
        buildBrandVisual(site),
        !hasText(site.logo?.path) && createElement("span", { className: "brand__copy" }, [
          createElement("strong", { text: site.name || "Chartered Accountant" }),
          hasText(site.designation) && createElement("span", { text: site.designation })
        ])
      ]),
      nav,
      toggle
    ])
  ]);
}

function buildHero(hero = {}) {
  const panel = hero.panel || {};
  return createElement("section", { className: "hero", id: "home" }, [
    createElement("div", { className: "container hero__grid" }, [
      createElement("div", { className: "hero__content" }, [
        hasText(hero.eyebrow) && createElement("p", { className: "eyebrow eyebrow--light", text: hero.eyebrow }),
        createElement("h1", { text: hero.title }),
        hasText(hero.subtitle) && createElement("p", { className: "hero__subtitle", text: hero.subtitle }),
        createElement("div", { className: "hero__actions" }, [
          hero.primaryButton && createElement("a", { className: "button button--accent", ...linkAttributes(hero.primaryButton.href), text: hero.primaryButton.label }),
          hero.secondaryButton && createElement("a", { className: "button button--ghost", ...linkAttributes(hero.secondaryButton.href), text: hero.secondaryButton.label })
        ]),
        list(hero.highlights).length > 0 && createElement("ul", { className: "hero__highlights" },
          list(hero.highlights).map((item) => createElement("li", { text: item }))
        )
      ]),
      createElement("aside", { className: "hero-panel" }, [
        hasText(panel.label) && createElement("p", { className: "hero-panel__label", text: panel.label }),
        hasText(panel.title) && createElement("h2", { text: panel.title }),
        createElement("ol", {}, list(panel.items).map((item, index) =>
          createElement("li", {}, [
            createElement("span", { text: String(index + 1).padStart(2, "0"), "aria-hidden": "true" }),
            createElement("strong", { text: item })
          ])
        ))
      ])
    ])
  ]);
}

function buildProfile(profile = {}) {
  const card = profile.card || {};
  const facts = [
    [card.membershipLabel, card.membershipValue],
    [card.experienceLabel, card.experienceValue],
    [card.focusLabel, card.focusValue]
  ].filter(([label, value]) => hasText(label) && hasText(value));

  return createElement("section", { className: "section", id: "about" }, [
    createElement("div", { className: "container profile" }, [
      createElement("div", { className: "profile-card" }, [
        createElement("div", { className: "profile-card__portrait", "aria-hidden": "true" }, [
          createElement("span", { text: card.initials || "CA" })
        ]),
        createElement("div", { className: "profile-card__identity" }, [
          createElement("h3", { text: card.name }),
          createElement("p", { text: card.role }),
          hasText(card.credentials) && createElement("span", { text: card.credentials })
        ]),
        facts.length > 0 && createElement("dl", {}, facts.map(([label, value]) => [
          createElement("div", {}, [createElement("dt", { text: label }), createElement("dd", { text: value })])
        ]))
      ]),
      createElement("div", { className: "profile__content" }, [
        sectionHeading(profile),
        hasText(profile.lead) && createElement("p", { className: "profile__lead", text: profile.lead }),
        list(profile.paragraphs).map((paragraph) => createElement("p", { text: paragraph })),
        list(profile.highlights).length > 0 && createElement("div", { className: "profile__highlights" },
          list(profile.highlights).map((item) => createElement("article", {}, [
            createElement("h3", { text: item.title }),
            createElement("p", { text: item.text })
          ]))
        )
      ])
    ])
  ]);
}

function buildServices(section = {}, services = []) {
  if (!services.length) return null;
  return createElement("section", { className: "section section--soft", id: "services" }, [
    createElement("div", { className: "container" }, [
      sectionHeading(section),
      createElement("div", { className: "service-grid" }, services.map((service) =>
        createElement("article", { className: "service-card" }, [
          hasText(service.number) && createElement("span", { className: "service-card__number", text: service.number, "aria-hidden": "true" }),
          createElement("h3", { text: service.title }),
          createElement("p", { text: service.description }),
          list(service.features).length > 0 && createElement("ul", {},
            list(service.features).map((feature) => createElement("li", { text: feature }))
          )
        ])
      ))
    ])
  ]);
}

function buildStatistics(statistics = {}) {
  const items = list(statistics.items);
  if (!items.length) return null;
  return createElement("section", { className: "statistics", "aria-label": statistics.ariaLabel || "Practice highlights" }, [
    createElement("div", { className: "container statistics__grid" }, items.map((item) =>
      createElement("div", { className: "statistic" }, [
        createElement("strong", { text: item.value }),
        createElement("span", { text: item.label })
      ])
    ))
  ]);
}

function buildApproach(approach = {}) {
  const steps = list(approach.steps);
  if (!steps.length) return null;
  return createElement("section", { className: "section", id: "approach" }, [
    createElement("div", { className: "container" }, [
      sectionHeading(approach),
      createElement("div", { className: "steps" }, steps.map((step) =>
        createElement("article", { className: "step" }, [
          createElement("span", { className: "step__number", text: step.number, "aria-hidden": "true" }),
          createElement("h3", { text: step.title }),
          createElement("p", { text: step.text })
        ])
      ))
    ])
  ]);
}

function buildTestimonials(section = {}, testimonials = []) {
  if (!testimonials.length) return null;
  return createElement("section", { className: "section section--dark" }, [
    createElement("div", { className: "container" }, [
      sectionHeading(section),
      createElement("div", { className: "testimonial-grid" }, testimonials.map((testimonial) =>
        createElement("figure", { className: "testimonial" }, [
          createElement("blockquote", {}, [createElement("p", { text: testimonial.quote })]),
          createElement("figcaption", {}, [
            createElement("strong", { text: testimonial.author }),
            hasText(testimonial.context) && createElement("span", { text: testimonial.context })
          ])
        ])
      ))
    ])
  ]);
}

function buildFaq(section = {}, faqs = []) {
  if (!faqs.length) return null;
  return createElement("section", { className: "section", id: "faq" }, [
    createElement("div", { className: "container faq-layout" }, [
      sectionHeading(section),
      createElement("div", { className: "faq-list" }, faqs.map((faq, index) =>
        createElement("details", { className: "faq-item", open: index === 0 }, [
          createElement("summary", {}, [createElement("span", { text: faq.question }), createElement("span", { className: "faq-item__plus", "aria-hidden": "true", text: "+" })]),
          createElement("p", { text: faq.answer })
        ])
      ))
    ])
  ]);
}

function buildContact(contact = {}) {
  const details = list(contact.details);
  const formConfig = contact.form || {};
  const statusId = "contact-form-status";

  const inputGroup = (id, label, field) => createElement("div", { className: "field" }, [
    createElement("label", { for: id, text: label }),
    field
  ]);

  const form = createElement("form", {
    className: "contact-form",
    onSubmit: (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const subject = `${formConfig.subjectPrefix || "Website enquiry"}: ${data.get("service") || "General"}`;
      const body = [
        `${formConfig.nameLabel || "Name"}: ${data.get("name") || ""}`,
        `${formConfig.emailLabel || "Email"}: ${data.get("email") || ""}`,
        `${formConfig.phoneLabel || "Phone"}: ${data.get("phone") || ""}`,
        `${formConfig.serviceLabel || "Service"}: ${data.get("service") || ""}`,
        "",
        data.get("message") || ""
      ].join("\n");
      const recipient = hasText(formConfig.recipient) ? formConfig.recipient : "";
      window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const status = $(`#${statusId}`, event.currentTarget);
      if (status) status.textContent = formConfig.successMessage || "Your email application should now be open.";
    }
  }, [
    createElement("div", { className: "contact-form__row" }, [
      inputGroup("contact-name", formConfig.nameLabel, createElement("input", { id: "contact-name", name: "name", type: "text", placeholder: formConfig.namePlaceholder, autocomplete: "name", required: true })),
      inputGroup("contact-email", formConfig.emailLabel, createElement("input", { id: "contact-email", name: "email", type: "email", placeholder: formConfig.emailPlaceholder, autocomplete: "email", required: true }))
    ]),
    createElement("div", { className: "contact-form__row" }, [
      inputGroup("contact-phone", formConfig.phoneLabel, createElement("input", { id: "contact-phone", name: "phone", type: "tel", placeholder: formConfig.phonePlaceholder, autocomplete: "tel" })),
      inputGroup("contact-service", formConfig.serviceLabel, createElement("select", { id: "contact-service", name: "service", required: true }, [
        createElement("option", { value: "", text: formConfig.servicePlaceholder, disabled: true, selected: true }),
        list(formConfig.serviceOptions).map((option) => createElement("option", { value: option, text: option }))
      ]))
    ]),
    inputGroup("contact-message", formConfig.messageLabel, createElement("textarea", { id: "contact-message", name: "message", rows: "5", placeholder: formConfig.messagePlaceholder, required: true })),
    createElement("button", { className: "button button--primary", type: "submit", text: formConfig.submitLabel }),
    hasText(formConfig.privacyNote) && createElement("p", { className: "contact-form__note", text: formConfig.privacyNote }),
    createElement("p", { className: "contact-form__status", id: statusId, role: "status", "aria-live": "polite" })
  ]);

  return createElement("section", { className: "section section--soft", id: "contact" }, [
    createElement("div", { className: "container contact" }, [
      createElement("div", { className: "contact__intro" }, [
        sectionHeading(contact),
        details.length > 0 && createElement("ul", { className: "contact-details" }, details.map((detail) =>
          createElement("li", {}, [
            createElement("span", { className: "contact-details__icon" }, [icon(detail.icon)]),
            createElement("div", {}, [
              createElement("strong", { text: detail.label }),
              hasText(detail.href)
                ? createElement("a", { ...linkAttributes(detail.href), text: detail.value })
                : createElement("span", { text: detail.value })
            ])
          ])
        ))
      ]),
      form
    ])
  ]);
}

function buildFooter(config) {
  const footer = config.footer || {};
  const site = config.site || {};
  const copyright = (footer.copyright || "© {year}").replace("{year}", String(new Date().getFullYear()));

  return createElement("footer", { className: "footer" }, [
    createElement("div", { className: "container" }, [
      createElement("div", { className: "footer__main" }, [
        createElement("div", { className: "footer__identity" }, [
          buildBrandVisual(site, true),
          createElement("div", {}, [
            createElement("h2", { text: site.name }),
            hasText(footer.summary) && createElement("p", { text: footer.summary })
          ])
        ]),
        createElement("div", { className: "footer__contact" }, [
          hasText(footer.contactHeading) && createElement("p", { text: footer.contactHeading }),
          hasText(footer.emailHref) && createElement("a", { ...linkAttributes(footer.emailHref), text: footer.emailLabel || footer.emailHref })
        ])
      ]),
      createElement("div", { className: "footer__bottom" }, [
        createElement("div", {}, [
          createElement("p", { text: copyright }),
          hasText(footer.disclaimer) && createElement("p", { className: "footer__disclaimer", text: footer.disclaimer })
        ]),
        list(footer.links).length > 0 && createElement("nav", { "aria-label": "Footer navigation" }, [
          list(footer.links).map((item) => createElement("a", { ...linkAttributes(item.href), text: item.label }))
        ])
      ])
    ])
  ]);
}

function validateConfig(config) {
  if (!config || typeof config !== "object") throw new Error("The configuration must be a JSON object");
  if (!config.site || !hasText(config.site.name)) throw new Error("site.name is required in config.json");
  if (!config.hero || !hasText(config.hero.title)) throw new Error("hero.title is required in config.json");
  return config;
}

function showStatus(title, message, hint = "") {
  const app = $("#app");
  app.replaceChildren(createElement("div", { className: "app-status", role: "status" }, [
    createElement("div", { className: "app-status__mark", text: "CA", "aria-hidden": "true" }),
    createElement("h1", { text: title }),
    createElement("p", { text: message }),
    hasText(hint) && createElement("code", { text: hint })
  ]));
}

function render(config) {
  const cfg = validateConfig(config);
  applyTheme(cfg.site.theme);
  applyMetadata(cfg.site);

  const sections = [
    createElement("a", { className: "skip-link", href: "#main-content", text: cfg.ui?.skipLink || "Skip to main content" }),
    buildHeader(cfg),
    createElement("main", { id: "main-content" }, [
      buildHero(cfg.hero),
      buildProfile(cfg.profile),
      buildServices(cfg.servicesSection, list(cfg.services)),
      buildStatistics(cfg.statistics),
      buildApproach(cfg.approach),
      buildTestimonials(cfg.testimonialSection, list(cfg.testimonials)),
      buildFaq(cfg.faqSection, list(cfg.faqs)),
      buildContact(cfg.contact)
    ].filter(Boolean)),
    buildFooter(cfg)
  ];

  const app = $("#app");
  app.removeAttribute("aria-live");
  app.replaceChildren(...sections);
}

async function init() {
  try {
    const response = await fetch(CONFIG_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(`config.json returned HTTP ${response.status}`);
    render(await response.json());
  } catch (error) {
    console.error("Website configuration error:", error);
    showStatus(
      "The website content could not be loaded",
      `${error.message}. Check that config.json contains valid JSON and serve this folder through a local web server.`,
      "python -m http.server 8000"
    );
  }
}

document.addEventListener("DOMContentLoaded", init);
