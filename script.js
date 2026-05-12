(function () {
  "use strict";

  const supportedLanguages = ["en", "es"];
  const supportedThemes = ["light", "dark"];
  const languageStorageKey = "cvLanguage";
  const themeStorageKey = "cvTheme";

  const state = {
    language: "en",
    theme: "light",
    cv: null
  };

  const root = document.documentElement;

  const sectionTargets = {
    hero: document.querySelector('[data-render="hero"]'),
    summary: document.querySelector('[data-render="summary"]'),
    strengths: document.querySelector('[data-render="strengths"]'),
    experience: document.querySelector('[data-render="experience"]'),
    skills: document.querySelector('[data-render="skills"]'),
    education: document.querySelector('[data-render="education"]'),
    languages: document.querySelector('[data-render="languages"]'),
    downloads: document.querySelector('[data-render="downloads"]'),
    footer: document.querySelector('[data-render="footer"]')
  };

  function isSupportedLanguage(language) {
    return supportedLanguages.includes(language);
  }

  function getStoredValue(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.warn("Storage is unavailable.", error);
      return null;
    }
  }

  function setStoredValue(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.warn("Preference could not be persisted.", error);
    }
  }

  function getBrowserLanguage() {
    const languageCandidates = Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];

    const match = languageCandidates
      .map((language) => String(language || "").slice(0, 2).toLowerCase())
      .find(isSupportedLanguage);

    return match || "en";
  }

  function resolveInitialLanguage() {
    const savedLanguage = getStoredValue(languageStorageKey);
    return isSupportedLanguage(savedLanguage) ? savedLanguage : getBrowserLanguage();
  }

  function resolveInitialTheme() {
    const savedTheme = getStoredValue(themeStorageKey);

    if (supportedThemes.includes(savedTheme)) {
      return savedTheme;
    }

    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  function applyTheme(theme) {
    const safeTheme = supportedThemes.includes(theme) ? theme : "light";
    state.theme = safeTheme;
    root.dataset.theme = safeTheme;
    root.style.colorScheme = safeTheme;

    const toggle = document.querySelector('[data-action="toggle-theme"]');
    if (toggle) {
      const label = state.cv?.ui?.themeToggle || "Toggle theme";
      toggle.setAttribute("aria-label", label);
      toggle.setAttribute("aria-pressed", String(safeTheme === "dark"));
    }
  }

  function createElement(tagName, options = {}, children = []) {
    const element = document.createElement(tagName);

    if (options.className) {
      element.className = options.className;
    }

    if (options.text !== undefined) {
      element.textContent = options.text;
    }

    if (options.id) {
      element.id = options.id;
    }

    if (options.attrs) {
      Object.entries(options.attrs).forEach(([name, value]) => {
        if (value !== undefined && value !== null && value !== false) {
          element.setAttribute(name, String(value));
        }
      });
    }

    children.filter(Boolean).forEach((child) => {
      element.append(child);
    });

    return element;
  }

  function clearElement(element) {
    if (element) {
      element.replaceChildren();
    }
  }

  function createExternalLink(href, text, className) {
    const link = createElement("a", {
      className,
      text,
      attrs: {
        href: sanitizeUrl(href),
        target: "_blank",
        rel: "noopener noreferrer"
      }
    });

    return link;
  }

  function sanitizeUrl(value) {
    const url = String(value || "").trim();

    if (url.startsWith("assets/") || url.startsWith("#")) {
      return url;
    }

    if (url.startsWith("mailto:")) {
      return url;
    }

    try {
      const parsedUrl = new URL(url, window.location.origin);
      const allowedProtocols = ["https:", "mailto:"];
      return allowedProtocols.includes(parsedUrl.protocol) ? parsedUrl.href : "#";
    } catch (error) {
      console.warn("Invalid URL skipped.", error);
      return "#";
    }
  }

  function renderHeading(sectionKey, title) {
    return createElement("div", { className: "section-heading" }, [
      createElement("span", { className: "section-heading__kicker", text: `/${sectionKey}` }),
      createElement("h2", { id: `${sectionKey}-title`, text: title })
    ]);
  }

  function renderHero(cv) {
    const target = sectionTargets.hero;
    clearElement(target);

    const profile = cv.profile;
    const actions = cv.ui.actions;
    const labels = cv.ui.labels;

    const contactList = createElement("div", { className: "hero__actions" }, [
      createElement("a", {
        className: "button button--primary",
        text: actions.email,
        attrs: { href: `mailto:${profile.contact.email}` }
      }),
      createExternalLink(profile.contact.linkedin, actions.linkedin, "button button--ghost"),
      createExternalLink(profile.contact.github, actions.github, "button button--ghost")
    ]);

    const downloadList = createElement("div", { className: "hero__downloads", attrs: { "aria-label": cv.ui.sections.downloads } }, [
      createElement("a", {
        className: "text-link",
        text: actions.downloadPdf,
        attrs: { href: sanitizeUrl(cv.downloads.pdf), download: "" }
      }),
      createElement("a", {
        className: "text-link",
        text: actions.downloadMarkdown,
        attrs: { href: sanitizeUrl(cv.downloads.markdown), download: "" }
      })
    ]);

    const profilePanel = createElement("aside", { className: "hero-card", attrs: { "aria-label": "Profile preview" } }, [
      createElement("img", {
        className: "hero-card__avatar",
        attrs: {
          src: "assets/avatar-placeholder.svg",
          alt: "",
          width: "420",
          height: "420"
        }
      }),
      createElement("div", { className: "hero-card__meta" }, [
        createElement("span", { text: labels.location }),
        createElement("strong", { text: profile.location }),
        createElement("span", { text: labels.availability }),
        createElement("strong", { text: profile.availability })
      ])
    ]);

    const content = createElement("div", { className: "hero__content" }, [
      createElement("p", { className: "eyebrow", text: profile.eyebrow }),
      createElement("h1", { id: "hero-title", text: profile.name }),
      createElement("p", { className: "hero__headline", text: profile.headline }),
      createElement("p", { className: "hero__summary", text: profile.summary }),
      contactList,
      downloadList
    ]);

    target.append(content, profilePanel);
  }

  function renderSummary(cv) {
    const target = sectionTargets.summary;
    clearElement(target);
    target.append(
      renderHeading("summary", cv.ui.sections.summary),
      createElement("p", { className: "lead-copy", text: cv.profile.summary })
    );
  }

  function renderStrengths(cv) {
    const target = sectionTargets.strengths;
    clearElement(target);

    const cards = (cv.strengths || []).map((strength) => createElement("article", { className: "strength-card" }, [
      createElement("h3", { text: strength.title }),
      createElement("p", { text: strength.description })
    ]));

    target.append(renderHeading("strengths", cv.ui.sections.strengths), createElement("div", { className: "strength-grid" }, cards));
  }

  function renderExperience(cv) {
    const target = sectionTargets.experience;
    clearElement(target);

    const items = (cv.experience || []).map((experience) => {
      const bullets = createElement("ul", { className: "experience-card__bullets" },
        (experience.bullets || []).map((bullet) => createElement("li", { text: bullet }))
      );

      const stack = createElement("div", { className: "tag-list", attrs: { "aria-label": cv.ui.labels.stack } },
        (experience.stack || []).map((item) => createElement("span", { className: "tag", text: item }))
      );

      return createElement("article", { className: "experience-card" }, [
        createElement("div", { className: "experience-card__marker", attrs: { "aria-hidden": "true" } }),
        createElement("div", { className: "experience-card__body" }, [
          createElement("div", { className: "experience-card__topline" }, [
            createElement("span", { className: "experience-card__period", text: experience.period }),
            createElement("span", { className: "experience-card__location", text: experience.location })
          ]),
          createElement("h3", { text: experience.role }),
          createElement("p", { className: "experience-card__company", text: experience.company }),
          createElement("p", { className: "experience-card__summary", text: experience.summary }),
          bullets,
          stack
        ])
      ]);
    });

    target.append(renderHeading("experience", cv.ui.sections.experience), createElement("div", { className: "timeline" }, items));
  }

  function renderSkills(cv) {
    const target = sectionTargets.skills;
    clearElement(target);

    const groups = (cv.skills || []).map((skillGroup) => createElement("article", { className: "skill-group" }, [
      createElement("h3", { text: skillGroup.category }),
      createElement("div", { className: "tag-list tag-list--dense" },
        (skillGroup.items || []).map((item) => createElement("span", { className: "tag", text: item }))
      )
    ]));

    target.append(renderHeading("skills", cv.ui.sections.skills), createElement("div", { className: "skills-grid" }, groups));
  }

  function renderEducation(cv) {
    const target = sectionTargets.education;
    clearElement(target);

    const items = (cv.education || []).map((education) => createElement("article", { className: "info-card" }, [
      createElement("h3", { text: education.degree }),
      createElement("p", { text: education.institution }),
      createElement("span", { text: `${education.location} · ${education.date}` })
    ]));

    target.append(renderHeading("education", cv.ui.sections.education), createElement("div", { className: "info-grid" }, items));
  }

  function renderLanguages(cv) {
    const target = sectionTargets.languages;
    clearElement(target);

    const items = (cv.languages || []).map((language) => createElement("article", { className: "info-card info-card--compact" }, [
      createElement("h3", { text: language.name }),
      createElement("p", { text: language.level })
    ]));

    target.append(renderHeading("languages", cv.ui.sections.languages), createElement("div", { className: "info-grid info-grid--compact" }, items));
  }

  function renderDownloads(cv) {
    const target = sectionTargets.downloads;
    clearElement(target);

    const actions = cv.ui.actions;
    const card = createElement("div", { className: "download-card" }, [
      createElement("p", { text: cv.ui.footer }),
      createElement("div", { className: "download-card__actions" }, [
        createElement("a", {
          className: "button button--primary",
          text: actions.downloadPdf,
          attrs: { href: sanitizeUrl(cv.downloads.pdf), download: "" }
        }),
        createElement("a", {
          className: "button button--ghost",
          text: actions.downloadMarkdown,
          attrs: { href: sanitizeUrl(cv.downloads.markdown), download: "" }
        })
      ])
    ]);

    target.append(renderHeading("downloads", cv.ui.sections.downloads), card);
  }

  function renderFooter(cv) {
    const target = sectionTargets.footer;
    clearElement(target);

    const copyButton = createElement("button", {
      className: "text-link text-link--button",
      text: cv.ui.actions.copyEmail,
      attrs: { type: "button", "data-action": "copy-email" }
    });

    const contactLinks = createElement("div", { className: "footer-links" }, [
      createElement("a", { text: cv.ui.actions.email, attrs: { href: `mailto:${cv.profile.contact.email}` } }),
      createExternalLink(cv.profile.contact.linkedin, cv.ui.actions.linkedin, ""),
      createExternalLink(cv.profile.contact.github, cv.ui.actions.github, ""),
      copyButton
    ]);

    target.append(
      createElement("div", { className: "footer-copy" }, [
        createElement("h2", { id: "contact-title", text: cv.ui.sections.contact }),
        createElement("p", { text: cv.ui.footer })
      ]),
      contactLinks
    );
  }

  function updateStaticLabels(cv) {
    document.querySelectorAll("[data-ui]").forEach((element) => {
      const key = element.getAttribute("data-ui");
      if (cv.ui[key]) {
        element.textContent = cv.ui[key];
      }
    });

    document.querySelectorAll("[data-nav]").forEach((element) => {
      const key = element.getAttribute("data-nav");
      if (cv.ui.sections[key]) {
        element.textContent = cv.ui.sections[key];
      }
    });

    const languageSwitch = document.querySelector(".language-switch");
    if (languageSwitch) {
      languageSwitch.setAttribute("aria-label", cv.ui.languageLabel);
    }

    const themeToggle = document.querySelector('[data-action="toggle-theme"]');
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", cv.ui.themeToggle);
    }
  }

  function updateLanguageButtons() {
    document.querySelectorAll("[data-language]").forEach((button) => {
      const isActive = button.getAttribute("data-language") === state.language;
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function updateMetadata(cv) {
    root.lang = cv.meta.language;
    document.title = cv.meta.title;

    setMetaContent('meta[name="description"]', cv.meta.description);
    setMetaContent('meta[property="og:title"]', cv.meta.title);
    setMetaContent('meta[property="og:description"]', cv.meta.description);
    setMetaContent('meta[property="og:url"]', cv.meta.siteUrl);
    setMetaContent('meta[name="twitter:title"]', cv.meta.title);
    setMetaContent('meta[name="twitter:description"]', cv.meta.description);
    setAttributeValue('link[rel="canonical"]', "href", cv.meta.siteUrl);
  }

  function setMetaContent(selector, content) {
    const element = document.querySelector(selector);
    if (element) {
      element.setAttribute("content", content);
    }
  }

  function setAttributeValue(selector, attribute, value) {
    const element = document.querySelector(selector);
    if (element) {
      element.setAttribute(attribute, value);
    }
  }

  function renderCv(cv) {
    state.cv = cv;
    updateMetadata(cv);
    updateStaticLabels(cv);
    updateLanguageButtons();
    applyTheme(state.theme);
    renderHero(cv);
    renderSummary(cv);
    renderStrengths(cv);
    renderExperience(cv);
    renderSkills(cv);
    renderEducation(cv);
    renderLanguages(cv);
    renderDownloads(cv);
    renderFooter(cv);
    initializeCopyEmail(cv);
    initializeRevealAnimations();
  }

  function validateCvShape(cv) {
    return Boolean(cv && cv.meta && cv.ui && cv.profile && cv.downloads);
  }

  async function fetchCv(language) {
    const response = await fetch(`data/cv.${language}.json`, { cache: "no-cache" });

    if (!response.ok) {
      throw new Error(`Unable to load CV data for ${language}.`);
    }

    const cv = await response.json();

    if (!validateCvShape(cv)) {
      throw new Error(`Invalid CV data shape for ${language}.`);
    }

    return cv;
  }

  async function loadLanguage(language) {
    const nextLanguage = isSupportedLanguage(language) ? language : "en";

    try {
      const cv = await fetchCv(nextLanguage);
      state.language = nextLanguage;
      setStoredValue(languageStorageKey, nextLanguage);
      renderCv(cv);
    } catch (error) {
      console.warn(error);

      if (nextLanguage !== "en") {
        const fallbackCv = await fetchCv("en");
        state.language = "en";
        setStoredValue(languageStorageKey, "en");
        renderCv(fallbackCv);
      }
    }
  }

  function initializeLanguageControls() {
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.addEventListener("click", () => {
        const language = button.getAttribute("data-language");
        if (language && language !== state.language) {
          loadLanguage(language);
        }
      });
    });
  }

  function initializeThemeControls() {
    const toggle = document.querySelector('[data-action="toggle-theme"]');

    if (!toggle) {
      return;
    }

    toggle.addEventListener("click", () => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      setStoredValue(themeStorageKey, nextTheme);
    });
  }

  function initializeCopyEmail(cv) {
    const button = document.querySelector('[data-action="copy-email"]');

    if (!button) {
      return;
    }

    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(cv.profile.contact.email);
        button.textContent = cv.ui.actions.copied;
        window.setTimeout(() => {
          button.textContent = cv.ui.actions.copyEmail;
        }, 1800);
      } catch (error) {
        console.warn("Clipboard copy failed.", error);
      }
    });
  }

  function initializeRevealAnimations() {
    const elements = document.querySelectorAll("[data-reveal]");
    const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });

    elements.forEach((element) => observer.observe(element));
  }

  async function initializeApp() {
    state.theme = resolveInitialTheme();
    state.language = resolveInitialLanguage();
    applyTheme(state.theme);
    initializeLanguageControls();
    initializeThemeControls();
    await loadLanguage(state.language);
  }

  initializeApp().catch((error) => {
    console.warn("The CV could not be initialized.", error);
  });
}());
