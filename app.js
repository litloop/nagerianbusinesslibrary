/* =========================================================
   DANGOTE IPO DECODED™
   Mobile-First Link-in-Bio / Two-Book Storefront
   app.js
   ========================================================= */

(() => {
  "use strict";

  /* -------------------------------------------------------
     CONFIG
  ------------------------------------------------------- */

  const CONTENT_URL = "./content.json";

  const state = {
    content: null,
    currentPreview: 0,
    mobileMenuOpen: false
  };

  /* -------------------------------------------------------
     DOM HELPERS
  ------------------------------------------------------- */

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  const setText = (selector, value) => {
    const element = $(selector);

    if (element && value !== undefined && value !== null) {
      element.textContent = value;
    }
  };

  const setHTML = (selector, value) => {
    const element = $(selector);

    if (element && value !== undefined && value !== null) {
      element.innerHTML = value;
    }
  };

  const escapeHTML = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  /* -------------------------------------------------------
     SAFE URL HANDLING
  ------------------------------------------------------- */

  function isSafeURL(url) {
    if (!url) return false;

    try {
      const parsed = new URL(url, window.location.href);

      return [
        "http:",
        "https:"
      ].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  function applyCheckoutLinks(url) {
    if (!isSafeURL(url)) return;

    $$("[data-checkout-link]").forEach((link) => {
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
  }

  /* -------------------------------------------------------
     BRAND / META
  ------------------------------------------------------- */

  function renderMeta(content) {
    const site = content.site || {};
    const seo = content.seo || {};

    if (seo.title) {
      document.title = seo.title;
    }

    const description = $('meta[name="description"]');

    if (description && seo.description) {
      description.setAttribute("content", seo.description);
    }

    const ogTitle = $('meta[property="og:title"]');

    if (ogTitle && seo.title) {
      ogTitle.setAttribute("content", seo.title);
    }

    const ogDescription = $('meta[property="og:description"]');

    if (ogDescription && seo.description) {
      ogDescription.setAttribute("content", seo.description);
    }

    setText("[data-brand-name]", site.name);
    setText("[data-brand-short]", site.shortName);
  }

  /* -------------------------------------------------------
     HERO
  ------------------------------------------------------- */

  function renderHero(content) {
    const hero = content.hero || {};
    const book = content.books?.[0] || {};

    setText("#hero-eyebrow", hero.eyebrow);
    setText("#hero-title", hero.title);
    setText("#hero-subtitle", hero.subtitle);
    setText("#hero-description", hero.description);

    setText("#hero-cta", hero.primaryCTA);
    setText("#hero-secondary-cta", hero.secondaryCTA);

    const image = $("#hero-book-image");

    if (image && book.mockup) {
      image.src = book.mockup;
      image.alt =
        book.mockupAlt ||
        `${book.title || "Book"} cover`;
    }

    if (hero.primaryCTA) {
      const primaryCTA = $("[data-primary-cta]");

      if (primaryCTA) {
        primaryCTA.textContent = hero.primaryCTA;
      }
    }
  }

  /* -------------------------------------------------------
     TRUST STRIP
  ------------------------------------------------------- */

  function renderTrust(content) {
    const items = content.trustStrip || [];
    const container = $("#trust-items");

    if (!container) return;

    container.innerHTML = items
      .map(
        (item) => `
          <div class="trust-item">
            <span class="trust-item-icon" aria-hidden="true">
              ${escapeHTML(item.icon || "✓")}
            </span>
            <span>${escapeHTML(item.text || item)}</span>
          </div>
        `
      )
      .join("");
  }

  /* -------------------------------------------------------
     TWO-BOOK SHELF
  ------------------------------------------------------- */

  function renderBookshelf(content) {
    const books = content.books || [];
    const grid = $("#bookshelf-grid");

    if (!grid) return;

    grid.innerHTML = books
      .map((book, index) => {
        const featured = book.featured || index === 0;

        return `
          <article class="book-card ${
            featured ? "featured" : ""
          }">

            ${
              book.badge
                ? `<span class="book-badge">${escapeHTML(
                    book.badge
                  )}</span>`
                : ""
            }

            <div class="book-card-cover">
              ${
                book.mockup
                  ? `
                    <img
                      src="${escapeHTML(book.mockup)}"
                      alt="${escapeHTML(
                        book.mockupAlt ||
                          book.title ||
                          "Book cover"
                      )}"
                      loading="lazy"
                    >
                  `
                  : `
                    <div class="book-placeholder">
                      ${escapeHTML(book.title || "Coming soon")}
                    </div>
                  `
              }
            </div>

            <div class="book-card-body">

              ${
                book.eyebrow
                  ? `<p class="book-card-eyebrow">
                      ${escapeHTML(book.eyebrow)}
                    </p>`
                  : ""
              }

              <h3>
                ${escapeHTML(book.title || "")}
              </h3>

              ${
                book.subtitle
                  ? `<p class="book-card-subtitle">
                      ${escapeHTML(book.subtitle)}
                    </p>`
                  : ""
              }

              ${
                book.description
                  ? `<p class="book-card-description">
                      ${escapeHTML(book.description)}
                    </p>`
                  : ""
              }

              ${
                book.price
                  ? `<div class="book-card-price">
                      ${escapeHTML(book.price)}
                    </div>`
                  : ""
              }

              <a
                class="button button-primary book-card-button"
                href="${escapeHTML(book.checkout || "#")}"
                ${
                  isSafeURL(book.checkout)
                    ? 'target="_blank" rel="noopener noreferrer"'
                    : ""
                }
              >
                ${escapeHTML(
                  book.buttonText ||
                    (book.available
                      ? "Get the Book"
                      : "Coming Soon")
                )}
              </a>

            </div>
          </article>
        `;
      })
      .join("");
  }

  /* -------------------------------------------------------
     PROBLEM SECTION
  ------------------------------------------------------- */

  function renderProblem(content) {
    const problem = content.problem || {};

    setText("#problem-eyebrow", problem.eyebrow);
    setText("#problem-title", problem.title);
    setText("#problem-description", problem.description);

    const container = $("#problem-cards");

    if (!container) return;

    container.innerHTML = (problem.points || [])
      .map(
        (item) => `
          <article class="question-card">
            <div class="question-card-icon">
              ${escapeHTML(item.icon || "?")}
            </div>

            <h3>${escapeHTML(item.title || "")}</h3>

            <p>${escapeHTML(item.text || "")}</p>
          </article>
        `
      )
      .join("");
  }

  /* -------------------------------------------------------
     PROMISE
  ------------------------------------------------------- */

  function renderPromise(content) {
    const promise = content.promise || {};

    setText("#promise-eyebrow", promise.eyebrow);
    setText("#promise-title", promise.title);
    setText("#promise-description", promise.description);

    const list = $("#promise-list");

    if (!list) return;

    list.innerHTML = (promise.points || [])
      .map(
        (point) => `
          <li>
            <span class="check-icon" aria-hidden="true">✓</span>
            <span>${escapeHTML(point)}</span>
          </li>
        `
      )
      .join("");
  }

  /* -------------------------------------------------------
     DECISION FLOW
  ------------------------------------------------------- */

  function renderDecisionFlow(content) {
    const flow = content.decisionFlow || {};

    setText("#decision-eyebrow", flow.eyebrow);
    setText("#decision-title", flow.title);
    setText("#decision-description", flow.description);

    const container = $("#decision-flow");

    if (!container) return;

    container.innerHTML = (flow.steps || [])
      .map(
        (step, index) => `
          <article class="decision-step">

            <div class="decision-step-number">
              ${escapeHTML(step.number || index + 1)}
            </div>

            <h3>${escapeHTML(step.title || "")}</h3>

            <p>${escapeHTML(step.text || "")}</p>

          </article>
        `
      )
      .join("");
  }

  /* -------------------------------------------------------
     DECISION OS
  ------------------------------------------------------- */

  function renderDecisionOS(content) {
    const os = content.decisionOS || {};

    setText("#os-eyebrow", os.eyebrow);
    setText("#os-title", os.title);
    setText("#os-description", os.description);

    const container = $("#decision-os-grid");

    if (!container) return;

    container.innerHTML = (os.items || [])
      .map(
        (item) => `
          <article class="os-card">

            <div class="os-card-number">
              ${escapeHTML(item.number || "")}
            </div>

            <h3>${escapeHTML(item.title || "")}</h3>

            <p>${escapeHTML(item.text || "")}</p>

          </article>
        `
      )
      .join("");
  }

  /* -------------------------------------------------------
     LEARNING SECTION
  ------------------------------------------------------- */

  function renderLearning(content) {
    const learning = content.learning || {};

    setText("#learning-eyebrow", learning.eyebrow);
    setText("#learning-title", learning.title);
    setText("#learning-description", learning.description);

    const container = $("#learning-grid");

    if (!container) return;

    container.innerHTML = (learning.items || [])
      .map(
        (item) => `
          <article class="learning-card">

            ${
              item.icon
                ? `<div class="learning-card-icon">
                    ${escapeHTML(item.icon)}
                  </div>`
                : ""
            }

            <h3>${escapeHTML(item.title || "")}</h3>

            <p>${escapeHTML(item.text || "")}</p>

          </article>
        `
      )
      .join("");
  }

  /* -------------------------------------------------------
     TOOLKIT
  ------------------------------------------------------- */

  function renderToolkit(content) {
    const toolkit = content.toolkit || {};

    setText("#toolkit-eyebrow", toolkit.eyebrow);
    setText("#toolkit-title", toolkit.title);
    setText("#toolkit-description", toolkit.description);

    const container = $("#toolkit-list");

    if (!container) return;

    container.innerHTML = (toolkit.items || [])
      .map(
        (item) => `
          <li class="toolkit-item">

            <span class="toolkit-check" aria-hidden="true">
              ✓
            </span>

            <div>
              <strong>${escapeHTML(
                item.title || ""
              )}</strong>

              ${
                item.text
                  ? `<p>${escapeHTML(item.text)}</p>`
                  : ""
              }
            </div>

          </li>
        `
      )
      .join("");
  }

  /* -------------------------------------------------------
     PREVIEW CAROUSEL
  ------------------------------------------------------- */

  function renderPreview(content) {
    const preview = content.preview || {};

    setText("#preview-eyebrow", preview.eyebrow);
    setText("#preview-title", preview.title);
    setText("#preview-description", preview.description);

    const slides = preview.items || [];
    const container = $("#preview-track");

    if (!container) return;

    container.innerHTML = slides
      .map(
        (item, index) => `
          <article
            class="preview-slide ${
              index === 0 ? "active" : ""
            }"
            data-preview-slide="${index}"
          >

            ${
              item.image
                ? `
                  <img
                    src="${escapeHTML(item.image)}"
                    alt="${escapeHTML(
                      item.alt || "Book preview"
                    )}"
                    loading="lazy"
                  >
                `
                : ""
            }

            <div class="preview-slide-content">

              ${
                item.label
                  ? `<span class="preview-label">
                      ${escapeHTML(item.label)}
                    </span>`
                  : ""
              }

              <h3>${escapeHTML(item.title || "")}</h3>

              <p>${escapeHTML(item.text || "")}</p>

            </div>

          </article>
        `
      )
      .join("");

    renderPreviewControls(slides.length);
    showPreview(0);
  }

  function renderPreviewControls(count) {
    const dots = $("#preview-dots");

    if (!dots) return;

    dots.innerHTML = Array.from(
      { length: count },
      (_, index) => `
        <button
          type="button"
          class="preview-dot ${
            index === 0 ? "active" : ""
          }"
          aria-label="Show preview ${index + 1}"
          data-preview-index="${index}"
        ></button>
      `
    ).join("");

    $$("[data-preview-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(
          button.dataset.previewIndex
        );

        showPreview(index);
      });
    });
  }

  function showPreview(index) {
    const slides = $$("[data-preview-slide]");

    if (!slides.length) return;

    state.currentPreview =
      (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle(
        "active",
        slideIndex === state.currentPreview
      );
    });

    $$("[data-preview-index]").forEach(
      (button, buttonIndex) => {
        button.classList.toggle(
          "active",
          buttonIndex === state.currentPreview
        );
      }
    );
  }

  /* -------------------------------------------------------
     AUDIENCE
  ------------------------------------------------------- */

  function renderAudience(content) {
    const audience = content.audience || {};

    setText("#audience-eyebrow", audience.eyebrow);
    setText("#audience-title", audience.title);
    setText("#audience-description", audience.description);

    const container = $("#audience-list");

    if (!container) return;

    container.innerHTML = (audience.items || [])
      .map(
        (item) => `
          <div class="audience-item">

            <div class="audience-icon">
              ${escapeHTML(item.icon || "✓")}
            </div>

            <div>
              <h3>${escapeHTML(item.title || "")}</h3>
              <p>${escapeHTML(item.text || "")}</p>
            </div>

          </div>
        `
      )
      .join("");
  }

  /* -------------------------------------------------------
     PHILOSOPHY
  ------------------------------------------------------- */

  function renderPhilosophy(content) {
    const philosophy = content.philosophy || {};

    setText("#philosophy-eyebrow", philosophy.eyebrow);
    setText("#philosophy-title", philosophy.title);
    setText(
      "#philosophy-description",
      philosophy.description
    );

    const container = $("#philosophy-list");

    if (!container) return;

    container.innerHTML = (philosophy.points || [])
      .map(
        (point) => `
          <li>
            <span aria-hidden="true">→</span>
            <span>${escapeHTML(point)}</span>
          </li>
        `
      )
      .join("");
  }

  /* -------------------------------------------------------
     WHY THIS BOOK
  ------------------------------------------------------- */

  function renderWhy(content) {
    const why = content.whyThisBook || {};

    setText("#why-eyebrow", why.eyebrow);
    setText("#why-title", why.title);
    setText("#why-description", why.description);

    const container = $("#why-grid");

    if (!container) return;

    container.innerHTML = (why.points || [])
      .map(
        (item) => `
          <article class="why-card">

            <h3>${escapeHTML(item.title || "")}</h3>

            <p>${escapeHTML(item.text || "")}</p>

          </article>
        `
      )
      .join("");
  }

  /* -------------------------------------------------------
     ABOUT
  ------------------------------------------------------- */

  function renderAbout(content) {
    const about = content.about || {};

    setText("#about-eyebrow", about.eyebrow);
    setText("#about-title", about.title);
    setText("#about-description", about.description);

    const image = $("#about-image");

    if (image && about.image) {
      image.src = about.image;
      image.alt = about.imageAlt || "";
    }
  }

  /* -------------------------------------------------------
     FAQ
  ------------------------------------------------------- */

  function renderFAQ(content) {
    const faq = content.faq || {};

    setText("#faq-eyebrow", faq.eyebrow);
    setText("#faq-title", faq.title);
    setText("#faq-description", faq.description);

    const container = $("#faq-list");

    if (!container) return;

    container.innerHTML = (faq.items || [])
      .map(
        (item, index) => `
          <article class="faq-item">

            <button
              type="button"
              class="faq-question"
              aria-expanded="false"
              aria-controls="faq-answer-${index}"
            >
              <span>
                ${escapeHTML(item.question || "")}
              </span>

              <span
                class="faq-plus"
                aria-hidden="true"
              >
                +
              </span>
            </button>

            <div
              id="faq-answer-${index}"
              class="faq-answer"
              hidden
            >
              <p>${escapeHTML(item.answer || "")}</p>
            </div>

          </article>
        `
      )
      .join("");

    $$(".faq-question").forEach((button) => {
      button.addEventListener("click", () => {
        toggleFAQ(button);
      });
    });
  }

  function toggleFAQ(button) {
    const expanded =
      button.getAttribute("aria-expanded") === "true";

    const answerId =
      button.getAttribute("aria-controls");

    const answer = document.getElementById(answerId);

    if (!answer) return;

    button.setAttribute(
      "aria-expanded",
      String(!expanded)
    );

    answer.hidden = expanded;

    const plus = $(".faq-plus", button);

    if (plus) {
      plus.textContent = expanded ? "+" : "−";
    }

    const item = button.closest(".faq-item");

    if (item) {
      item.classList.toggle("open", !expanded);
    }
  }

  /* -------------------------------------------------------
     PURCHASE CTA
  ------------------------------------------------------- */

  function renderPurchase(content) {
    const purchase = content.purchase || {};

    setText("#purchase-eyebrow", purchase.eyebrow);
    setText("#purchase-title", purchase.title);
    setText(
      "#purchase-description",
      purchase.description
    );

    $$("[data-purchase-button]").forEach((button) => {
      if (purchase.buttonText) {
        button.textContent = purchase.buttonText;
      }
    });
  }

  /* -------------------------------------------------------
     DISCLAIMER
  ------------------------------------------------------- */

  function renderDisclaimer(content) {
    const disclaimer = content.disclaimer || {};

    setText(
      "#disclaimer-text",
      disclaimer.text
    );
  }

  /* -------------------------------------------------------
     FOOTER
  ------------------------------------------------------- */

  function renderFooter(content) {
    const footer = content.footer || {};

    setText("#footer-text", footer.text);
    setText("#footer-copyright", footer.copyright);

    const linksContainer = $("#footer-links");

    if (!linksContainer) return;

    linksContainer.innerHTML = (footer.links || [])
      .map(
        (link) => `
          <a
            href="${escapeHTML(link.url || "#")}"
            ${
              isSafeURL(link.url)
                ? 'target="_blank" rel="noopener noreferrer"'
                : ""
            }
          >
            ${escapeHTML(link.label || "")}
          </a>
        `
      )
      .join("");
  }

  /* -------------------------------------------------------
     MOBILE NAVIGATION
  ------------------------------------------------------- */

  function setupMobileNavigation() {
    const toggle =
      $("[data-menu-toggle]");

    const menu =
      $("[data-mobile-menu]");

    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
      state.mobileMenuOpen =
        !state.mobileMenuOpen;

      toggle.setAttribute(
        "aria-expanded",
        String(state.mobileMenuOpen)
      );

      menu.classList.toggle(
        "open",
        state.mobileMenuOpen
      );

      document.body.classList.toggle(
        "menu-open",
        state.mobileMenuOpen
      );
    });

    $$(
      "[data-mobile-menu] a"
    ).forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileMenu();
      });
    });
  }

  function closeMobileMenu() {
    state.mobileMenuOpen = false;

    const toggle =
      $("[data-menu-toggle]");

    const menu =
      $("[data-mobile-menu]");

    if (toggle) {
      toggle.setAttribute(
        "aria-expanded",
        "false"
      );
    }

    if (menu) {
      menu.classList.remove("open");
    }

    document.body.classList.remove(
      "menu-open"
    );
  }

  /* -------------------------------------------------------
     SMOOTH SCROLL
  ------------------------------------------------------- */

  function setupSmoothScroll() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId =
          link.getAttribute("href");

        if (
          !targetId ||
          targetId === "#"
        ) {
          return;
        }

        const target =
          document.querySelector(targetId);

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    });
  }

  /* -------------------------------------------------------
     HEADER SCROLL EFFECT
  ------------------------------------------------------- */

  function setupHeaderScroll() {
    const header = $(".site-header");

    if (!header) return;

    const updateHeader = () => {
      header.classList.toggle(
        "scrolled",
        window.scrollY > 20
      );
    };

    updateHeader();

    window.addEventListener(
      "scroll",
      updateHeader,
      { passive: true }
    );
  }

  /* -------------------------------------------------------
     MOBILE STICKY PURCHASE BAR
  ------------------------------------------------------- */

  function setupStickyPurchaseBar() {
    const bar =
      $(".mobile-sticky-purchase");

    if (!bar) return;

    const hero =
      $(".hero");

    if (!hero) return;

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          bar.classList.toggle(
            "visible",
            !entry.isIntersecting
          );
        },
        {
          threshold: 0.15
        }
      );

    observer.observe(hero);
  }

  /* -------------------------------------------------------
     IMAGE FALLBACKS
  ------------------------------------------------------- */

  function setupImageFallbacks() {
    document.addEventListener(
      "error",
      (event) => {
        const image = event.target;

        if (
          image &&
          image.tagName === "IMG"
        ) {
          image.classList.add(
            "image-error"
          );
        }
      },
      true
    );
  }

  /* -------------------------------------------------------
     EXTERNAL CHECKOUT TRACKING
  ------------------------------------------------------- */

  function setupCheckoutTracking() {
    $$("[data-checkout-link]").forEach(
      (button) => {
        button.addEventListener(
          "click",
          () => {
            if (
              typeof window.gtag ===
              "function"
            ) {
              window.gtag(
                "event",
                "checkout_click",
                {
                  event_category: "purchase",
                  event_label:
                    "Dangote IPO Decoded"
                }
              );
            }
          }
        );
      }
    );
  }

  /* -------------------------------------------------------
     ACTIVE NAV LINK
  ------------------------------------------------------- */

  function setupActiveNavigation() {
    const sections =
      $$("section[id]");

    const navLinks =
      $$('a[href^="#"]');

    if (!sections.length) return;

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            const id =
              entry.target.id;

            navLinks.forEach((link) => {
              link.classList.toggle(
                "active",
                link.getAttribute(
                  "href"
                ) === `#${id}`
              );
            });
          });
        },
        {
          rootMargin:
            "-35% 0px -55% 0px"
        }
      );

    sections.forEach((section) => {
      observer.observe(section);
    });
  }

  /* -------------------------------------------------------
     JSON LOADING
  ------------------------------------------------------- */

  async function loadContent() {
    try {
      showLoadingState();

      const response =
        await fetch(CONTENT_URL, {
          cache: "no-cache"
        });

      if (!response.ok) {
        throw new Error(
          `Unable to load content.json (${response.status})`
        );
      }

      const content =
        await response.json();

      state.content = content;

      renderSite(content);

      hideLoadingState();

      console.log(
        "DANGOTE IPO DECODED™ site loaded successfully."
      );
    } catch (error) {
      console.error(error);

      showErrorState(error);
    }
  }

  /* -------------------------------------------------------
     RENDER EVERYTHING
  ------------------------------------------------------- */

  function renderSite(content) {
    renderMeta(content);
    renderHero(content);
    renderTrust(content);

    /*
      Bookshelf is intentionally supported here.
      The HTML section should contain:
      #bookshelf-grid
    */
    renderBookshelf(content);

    renderProblem(content);
    renderPromise(content);
    renderDecisionFlow(content);
    renderDecisionOS(content);
    renderLearning(content);
    renderToolkit(content);
    renderPreview(content);
    renderAudience(content);
    renderPhilosophy(content);
    renderWhy(content);
    renderAbout(content);
    renderFAQ(content);
    renderPurchase(content);
    renderDisclaimer(content);
    renderFooter(content);

    const checkout =
      content.checkout?.url ||
      content.books?.[0]?.checkout;

    if (checkout) {
      applyCheckoutLinks(checkout);
    }

    setupCheckoutTracking();
  }

  /* -------------------------------------------------------
     LOADING / ERROR STATES
  ------------------------------------------------------- */

  function showLoadingState() {
    document.body.classList.add(
      "content-loading"
    );
  }

  function hideLoadingState() {
    document.body.classList.remove(
      "content-loading"
    );
  }

  function showErrorState(error) {
    document.body.classList.remove(
      "content-loading"
    );

    document.body.classList.add(
      "content-error"
    );

    const message =
      document.createElement("div");

    message.className =
      "site-error-message";

    message.innerHTML = `
      <strong>Something went wrong.</strong>
      <p>
        The page content could not be loaded.
        Please check that <code>content.json</code>
        is in the correct folder.
      </p>
    `;

    document.body.prepend(message);
  }

  /* -------------------------------------------------------
     INITIALIZE
  ------------------------------------------------------- */

  function init() {
    setupMobileNavigation();
    setupSmoothScroll();
    setupHeaderScroll();
    setupStickyPurchaseBar();
    setupImageFallbacks();
    setupActiveNavigation();

    loadContent();
  }

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }
})();
