(() => {
  "use strict";

  /* =========================================================
     DANGOTE IPO DECODED™
     STOREFRONT APP
     ========================================================= */

  const CONTENT_URL = "./content.json";

  const state = {
    content: null,
    featuredBook: null,
    selectedBook: null,
    previewIndex: 0
  };


  /* =========================================================
     DOM HELPERS
     ========================================================= */

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));


  /* =========================================================
     GENERAL HELPERS
     ========================================================= */

  function setText(selector, value) {
    const element = $(selector);

    if (!element) return;

    element.textContent =
      value !== undefined && value !== null
        ? String(value)
        : "";
  }


  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function isSafeURL(url) {
    if (
      !url ||
      typeof url !== "string"
    ) {
      return false;
    }

    try {
      const parsed =
        new URL(url, window.location.href);

      return (
        parsed.protocol === "https:" ||
        parsed.protocol === "http:"
      );
    } catch {
      return false;
    }
  }


  function getBooks() {
    return (
      state.content?.bookshelf?.books ||
      []
    );
  }


  function getBookById(id) {
    return getBooks().find(
      book => book.id === id
    );
  }


  function findFeaturedBook() {
    const books = getBooks();

    return (
      books.find(
        book => book.featured === true
      ) ||
      books.find(
        book => book.status === "available"
      ) ||
      books[0] ||
      null
    );
  }


  /* =========================================================
     SEO / META
     ========================================================= */

  function renderMeta(content) {
    const site =
      content.site || {};

    const seo =
      content.seo || {};

    if (
      seo.title ||
      site.name
    ) {
      document.title =
        seo.title ||
        site.name;
    }

    const description =
      seo.description ||
      "";

    const descriptionMeta =
      $('meta[name="description"]');

    if (descriptionMeta) {
      descriptionMeta.setAttribute(
        "content",
        description
      );
    }

    const ogTitle =
      $('meta[property="og:title"]');

    if (ogTitle) {
      ogTitle.setAttribute(
        "content",
        seo.title ||
        site.name ||
        ""
      );
    }

    const ogDescription =
      $('meta[property="og:description"]');

    if (ogDescription) {
      ogDescription.setAttribute(
        "content",
        description
      );
    }

    const brand =
      $(".brand-main");

    if (
      brand &&
      site.name
    ) {
      brand.textContent =
        site.name;
    }

    const brandSub =
      $(".brand-sub");

    if (brandSub) {
      brandSub.textContent =
        site.type ||
        "Digital Edition";
    }
  }


  /* =========================================================
     HERO
     ========================================================= */

  function renderHero(content) {
    const hero =
      content.hero || {};

    const book =
      state.featuredBook;

    setText(
      "#hero-eyebrow",
      hero.eyebrow ||
      "DIGITAL EDITION"
    );

    setText(
      "#hero-title",
      hero.title ||
      book?.hook ||
      book?.title ||
      ""
    );

    setText(
      "#hero-subtitle",
      hero.subtitle ||
      book?.title ||
      ""
    );

    setText(
      "#hero-description",
      hero.description ||
      book?.shortDescription ||
      ""
    );

    const primaryCTA =
      $("[data-primary-cta]");

    if (primaryCTA) {
      primaryCTA.textContent =
        hero.primaryCTA ||
        book?.cta ||
        "Get the Book";

      configureBookLink(
        primaryCTA,
        book
      );
    }

    const secondaryCTA =
      $(".hero-actions .button-secondary");

    if (secondaryCTA) {
      secondaryCTA.textContent =
        hero.secondaryCTA ||
        "View Books";

      secondaryCTA.href =
        "#bookshelf";
    }

    const image =
      $("#hero-book-image");

    if (
      image &&
      book
    ) {
      setImage(
        image,
        book.cover,
        `${book.title || "Book"} cover`
      );
    }

    renderHeroMeta(book);
  }


  function renderHeroMeta(book) {
    const container =
      $("#hero-meta");

    if (!container) return;

    container.innerHTML = "";

    if (!book) {
      container.hidden = true;
      return;
    }

    const items = [];

    if (
      book.status === "available"
    ) {
      items.push(
        "Available now"
      );
    }

    if (
      Array.isArray(book.tags)
    ) {
      items.push(
        ...book.tags.slice(0, 3)
      );
    }

    if (!items.length) {
      container.hidden = true;
      return;
    }

    container.hidden = false;

    items.forEach(item => {
      const span =
        document.createElement("span");

      span.className =
        "hero-meta-item";

      span.textContent =
        item;

      container.appendChild(
        span
      );
    });
  }


  /* =========================================================
     FEATURED BOOK
     ========================================================= */

  function renderFeaturedBook(book) {
    if (!book) return;

    setText(
      "#featured-title",
      book.title
    );

    setText(
      "#featured-description",
      book.shortDescription
    );

    setText(
      "#featured-badge",
      book.badge ||
      "FEATURED"
    );

    setText(
      "#featured-hook",
      book.hook ||
      book.shortDescription
    );

    setText(
      "#featured-price",
      book.price ||
      "See current price"
    );

    const image =
      $("#featured-book-image");

    if (image) {
      setImage(
        image,
        book.cover,
        `${book.title || "Book"} cover`
      );
    }

    renderHighlights(
      "#featured-highlights",
      book.highlights
    );

    const checkout =
      $("[data-featured-checkout]");

    if (checkout) {
      configureBookLink(
        checkout,
        book
      );
    }
  }


  /* =========================================================
     BOOKSHELF
     
     IMPORTANT:
     Featured book is intentionally excluded.
     It already has its own featured section.
     ========================================================= */

  function renderBookshelf(content) {
    const container =
      $("#bookshelf-grid");

    if (!container) return;

    const books =
      (
        content.bookshelf?.books ||
        []
      ).filter(
        book => !book.featured
      );

    container.innerHTML = "";

    if (!books.length) {
      return;
    }

    books.forEach(book => {
      const card =
        document.createElement("article");

      card.className =
        "book-card";

      const statusLabel =
        book.status === "available"
          ? (
              book.badge ||
              "AVAILABLE"
            )
          : (
              book.badge ||
              "COMING SOON"
            );

      const actionLabel =
        book.status === "available"
          ? (
              book.cta ||
              "Get the Book"
            )
          : "View Details";

      card.innerHTML = `
        <button
          type="button"
          class="book-card-select"
          data-book-id="${escapeHTML(book.id)}"
          aria-label="View ${escapeHTML(book.title || "book")}"
        >

          <span class="book-card-cover-wrap">

            <img
              class="book-card-cover"
              src="${escapeHTML(book.cover || "")}"
              alt="${escapeHTML(book.title || "Book cover")}"
              loading="lazy"
            />

          </span>

          <span class="book-card-content">

            <span class="book-card-topline">

              <span class="book-card-number">
                ${escapeHTML(book.number || "")}
              </span>

              <span class="book-card-badge">
                ${escapeHTML(statusLabel)}
              </span>

            </span>

            <span class="book-card-title">
              ${escapeHTML(book.title || "")}
            </span>

            <span class="book-card-description">
              ${escapeHTML(book.shortDescription || "")}
            </span>

            <span class="book-card-bottom">

              <span class="book-card-price">
                ${escapeHTML(book.price || "")}
              </span>

              <span class="book-card-action">
                ${escapeHTML(actionLabel)}
              </span>

            </span>

          </span>

        </button>
      `;

      container.appendChild(card);
    });

    bindBookSelection();

    setupImageFallbacks();
  }


  function bindBookSelection() {
    $$("[data-book-id]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const id =
              button.dataset.bookId;

            const book =
              getBookById(id);

            if (!book) return;

            selectBook(book);

            const details =
              $("#book-details");

            if (details) {
              details.scrollIntoView({
                behavior: "smooth",
                block: "start"
              });
            }

          }
        );

      });
  }


  /* =========================================================
     BOOK DETAILS
     ========================================================= */

  function selectBook(book) {
    if (!book) return;

    state.selectedBook =
      book;

    renderBookDetails(
      book
    );

    renderPreview(
      book
    );

    updatePurchaseArea(
      book
    );

    updateStickyPurchase(
      book
    );
  }


  function renderBookDetails(book) {
    const section =
      $("#book-details");

    if (section) {
      section.hidden = false;
    }

    setText(
      "#details-eyebrow",
      book.badge ||
      "BOOK"
    );

    setText(
      "#details-title",
      book.title
    );

    setText(
      "#details-hook",
      book.hook ||
      ""
    );

    setText(
      "#details-description",
      book.shortDescription ||
      ""
    );

    setText(
      "#details-price",
      book.price ||
      ""
    );

    renderHighlights(
      "#details-highlights",
      book.highlights
    );

    const image =
      $("#details-book-image");

    if (image) {
      setImage(
        image,
        book.cover,
        `${book.title || "Book"} cover`
      );
    }

    const checkout =
      $("[data-details-checkout]");

    if (checkout) {
      configureBookLink(
        checkout,
        book
      );
    }
  }


  /* =========================================================
     HIGHLIGHTS
     ========================================================= */

  function renderHighlights(
    selector,
    highlights
  ) {
    const list =
      $(selector);

    if (!list) return;

    list.innerHTML = "";

    if (
      !Array.isArray(highlights) ||
      !highlights.length
    ) {
      list.hidden = true;
      return;
    }

    list.hidden = false;

    highlights.forEach(item => {
      const li =
        document.createElement("li");

      li.textContent =
        item;

      list.appendChild(li);
    });
  }


  /* =========================================================
     PREVIEW
     ========================================================= */

  function renderPreview(book) {
    const section =
      $("#preview");

    const track =
      $("#preview-track");

    const dots =
      $("#preview-dots");

    if (
      !section ||
      !track ||
      !dots
    ) {
      return;
    }

    track.innerHTML = "";
    dots.innerHTML = "";

    const previews =
      Array.isArray(book?.preview)
        ? book.preview
        : [];

    if (!previews.length) {
      section.hidden = true;
      return;
    }

    section.hidden = false;

    state.previewIndex = 0;

    previews.forEach(
      (imagePath, index) => {

        const slide =
          document.createElement("div");

        slide.className =
          "preview-slide";

        slide.dataset.index =
          String(index);

        slide.innerHTML = `
          <img
            src="${escapeHTML(imagePath)}"
            alt="${escapeHTML(book.title || "Book")} preview ${index + 1}"
            loading="${index === 0 ? "eager" : "lazy"}"
          />
        `;

        track.appendChild(
          slide
        );

        const dot =
          document.createElement("button");

        dot.type = "button";

        dot.className =
          "preview-dot";

        dot.dataset.previewIndex =
          String(index);

        dot.setAttribute(
          "aria-label",
          `Show preview ${index + 1}`
        );

        dot.addEventListener(
          "click",
          () => {

            state.previewIndex =
              index;

            updatePreviewPosition();

          }
        );

        dots.appendChild(
          dot
        );
      }
    );

    updatePreviewPosition();

    setupImageFallbacks();
  }


  function updatePreviewPosition() {
    const track =
      $("#preview-track");

    if (!track) return;

    const slides =
      $$(".preview-slide", track);

    const dots =
      $$(".preview-dot");

    if (!slides.length) {
      return;
    }

    track.style.transform =
      `translateX(-${state.previewIndex * 100}%)`;

    slides.forEach(
      (slide, index) => {

        slide.setAttribute(
          "aria-hidden",
          index !== state.previewIndex
        );

      }
    );

    dots.forEach(
      (dot, index) => {

        const active =
          index === state.previewIndex;

        dot.classList.toggle(
          "active",
          active
        );

        if (active) {
          dot.setAttribute(
            "aria-current",
            "true"
          );
        } else {
          dot.removeAttribute(
            "aria-current"
          );
        }

      }
    );
  }


  /* =========================================================
     PURCHASE
     ========================================================= */

  function updatePurchaseArea(book) {
    setText(
      "#purchase-title",
      book?.title ||
      state.content?.site?.name ||
      ""
    );

    setText(
      "#purchase-description",
      book?.hook ||
      book?.shortDescription ||
      ""
    );

    const button =
      $("[data-purchase-button]");

    if (button) {
      configureBookLink(
        button,
        book
      );
    }
  }


  function configureBookLink(
    element,
    book
  ) {
    if (!element) return;

    const isAvailable =
      book?.status === "available";

    const checkout =
      book?.checkout;

    const validCheckout =
      isSafeURL(checkout);

    const canPurchase =
      isAvailable &&
      validCheckout;

    if (canPurchase) {

      element.href =
        checkout;

      element.classList.remove(
        "is-disabled"
      );

      element.removeAttribute(
        "aria-disabled"
      );

      element.removeAttribute(
        "tabindex"
      );

      element.dataset.checkoutReady =
        "true";

    } else {

      element.href =
        "#";

      element.classList.add(
        "is-disabled"
      );

      element.setAttribute(
        "aria-disabled",
        "true"
      );

      element.setAttribute(
        "tabindex",
        "-1"
      );

      element.dataset.checkoutReady =
        "false";
    }

    if (
      book?.status ===
      "coming-soon"
    ) {

      element.textContent =
        "Coming Soon";

    } else {

      element.textContent =
        book?.cta ||
        "Get the Book";

    }
  }


  /* =========================================================
     CHECKOUT TRACKING
     ========================================================= */

  function setupCheckoutTracking() {
    $$(
      "[data-featured-checkout]," +
      "[data-details-checkout]," +
      "[data-checkout-link]," +
      "[data-purchase-button]," +
      "[data-primary-cta]"
    ).forEach(link => {

      if (
        link.dataset.trackingBound ===
        "true"
      ) {
        return;
      }

      link.dataset.trackingBound =
        "true";

      link.addEventListener(
        "click",
        event => {

          if (
            link.dataset.checkoutReady !==
            "true"
          ) {
            event.preventDefault();
            return;
          }

          const book =
            state.selectedBook ||
            state.featuredBook;

          if (
            typeof window.gtag ===
            "function"
          ) {
            window.gtag(
              "event",
              "begin_checkout",
              {
                book_id:
                  book?.id || "",
                book_title:
                  book?.title || ""
              }
            );
          }

        }
      );
    });
  }


  /* =========================================================
     ABOUT
     ========================================================= */

  function renderAbout(content) {
    const about =
      content.about || {};

    setText(
      "#about-eyebrow",
      about.eyebrow ||
      "ABOUT"
    );

    setText(
      "#about-title",
      about.title ||
      ""
    );

    setText(
      "#about-description",
      about.text ||
      about.description ||
      ""
    );
  }


  /* =========================================================
     FAQ
     ========================================================= */

  function renderFAQ(content) {
    const faq =
      content.faq || {};

    const section =
      $("#faq");

    const list =
      $("#faq-list");

    if (!list) return;

    list.innerHTML = "";

    const items =
      Array.isArray(faq.items)
        ? faq.items
        : [];

    if (!items.length) {

      if (section) {
        section.hidden = true;
      }

      return;
    }

    if (section) {
      section.hidden = false;
    }

    items.forEach(
      (item, index) => {

        const details =
          document.createElement(
            "details"
          );

        details.className =
          "faq-item";

        if (index === 0) {
          details.open = true;
        }

        const summary =
          document.createElement(
            "summary"
          );

        summary.textContent =
          item.question ||
          "";

        const answer =
          document.createElement(
            "div"
          );

        answer.className =
          "faq-answer";

        const paragraph =
          document.createElement(
            "p"
          );

        paragraph.textContent =
          item.answer ||
          "";

        answer.appendChild(
          paragraph
        );

        details.appendChild(
          summary
        );

        details.appendChild(
          answer
        );

        list.appendChild(
          details
        );
      }
    );
  }


  /* =========================================================
     FOOTER
     ========================================================= */

  function renderFooter(content) {
    const footer =
      content.footer || {};

    const site =
      content.site || {};

    const brand =
      $(".footer-brand strong");

    if (
      brand &&
      site.name
    ) {
      brand.textContent =
        site.name;
    }

    setText(
      "#footer-text",
      footer.text ||
      content.hero?.subtitle ||
      ""
    );

    setText(
      "#footer-copyright",
      footer.copyright ||
      `© ${new Date().getFullYear()} ${
        site.name || ""
      }. All rights reserved.`
    );

    const privacy =
      $("#openPrivacy");

    if (
      privacy &&
      footer.privacy
    ) {
      privacy.textContent =
        footer.privacy;
    }
  }


  /* =========================================================
     TRUST STRIP
     ========================================================= */

  function renderTrust(content) {
    const section =
      $(".trust-strip");

    const container =
      $("#trust-items");

    if (
      !section ||
      !container
    ) {
      return;
    }

    const trust =
      content.trustStrip;

    if (
      !trust ||
      !Array.isArray(trust.items) ||
      !trust.items.length
    ) {
      section.hidden = true;
      return;
    }

    section.hidden = false;

    container.innerHTML = "";

    trust.items.forEach(
      item => {

        const element =
          document.createElement(
            "div"
          );

        element.className =
          "trust-item";

        if (
          typeof item ===
          "string"
        ) {

          element.textContent =
            item;

        } else {

          element.innerHTML = `
            <strong>
              ${escapeHTML(item.title || "")}
            </strong>

            <span>
              ${escapeHTML(item.text || "")}
            </span>
          `;

        }

        container.appendChild(
          element
        );
      }
    );
  }


  /* =========================================================
     DISCLAIMER
     ========================================================= */

  function renderDisclaimer(content) {
    const element =
      $("#disclaimer-text");

    if (!element) return;

    const disclaimer =
      content.disclaimer;

    if (
      typeof disclaimer ===
      "string"
    ) {
      element.textContent =
        disclaimer;

      return;
    }

    if (
      disclaimer &&
      typeof disclaimer.text ===
      "string"
    ) {
      element.textContent =
        disclaimer.text;
    }
  }


  /* =========================================================
     MOBILE STICKY PURCHASE
     ========================================================= */

  function updateStickyPurchase(book) {
    const bar =
      $(".mobile-sticky-purchase");

    if (!bar) return;

    const info =
      $(".mobile-sticky-info", bar);

    const title =
      $("strong", info);

    const subtitle =
      $("span", info);

    if (title) {
      title.textContent =
        book?.title ||
        "";
    }

    if (subtitle) {
      subtitle.textContent =
        book?.price ||
        "Digital Edition";
    }

    const link =
      $(
        "[data-checkout-link]",
        bar
      );

    if (link) {
      configureBookLink(
        link,
        book
      );
    }

    const canPurchase =
      book?.status === "available" &&
      isSafeURL(book?.checkout);

    bar.dataset.purchaseAvailable =
      canPurchase
        ? "true"
        : "false";

    if (!canPurchase) {
      bar.classList.remove(
        "visible"
      );
    }
  }


  function setupStickyPurchaseBar() {
    const bar =
      $(".mobile-sticky-purchase");

    const hero =
      $(".hero");

    if (
      !bar ||
      !hero ||
      typeof IntersectionObserver ===
        "undefined"
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        entries => {

          entries.forEach(
            entry => {

              const book =
                state.selectedBook ||
                state.featuredBook;

              const canShow =
                book?.status ===
                  "available" &&
                isSafeURL(
                  book?.checkout
                );

              if (
                !entry.isIntersecting &&
                canShow
              ) {

                bar.classList.add(
                  "visible"
                );

              } else {

                bar.classList.remove(
                  "visible"
                );

              }

            }
          );

        },
        {
          threshold: 0
        }
      );

    observer.observe(hero);
  }


  /* =========================================================
     PRIVACY MODAL
     ========================================================= */

  function setupPrivacyModal() {
    const modal =
      $("#privacyModal");

    const openButton =
      $("#openPrivacy");

    const closeButton =
      $("#closePrivacy");

    const backdrop =
      $(".privacy-modal-backdrop");

    if (
      !modal ||
      !openButton ||
      !closeButton
    ) {
      return;
    }

    let previousFocus =
      null;

    function openModal(event) {

      if (event) {
        event.preventDefault();
      }

      previousFocus =
        document.activeElement;

      modal.classList.add(
        "is-open"
      );

      modal.setAttribute(
        "aria-hidden",
        "false"
      );

      document.body.classList.add(
        "modal-open"
      );

      closeButton.focus();
    }


    function closeModal() {

      modal.classList.remove(
        "is-open"
      );

      modal.setAttribute(
        "aria-hidden",
        "true"
      );

      document.body.classList.remove(
        "modal-open"
      );

      if (
        previousFocus &&
        typeof previousFocus.focus ===
          "function"
      ) {
        previousFocus.focus();
      }
    }


    openButton.addEventListener(
      "click",
      openModal
    );

    closeButton.addEventListener(
      "click",
      closeModal
    );

    if (backdrop) {
      backdrop.addEventListener(
        "click",
        closeModal
      );
    }

    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Escape" &&
          modal.classList.contains(
            "is-open"
          )
        ) {
          closeModal();
        }

      }
    );
  }


  /* =========================================================
     SMOOTH SCROLL
     ========================================================= */

  function setupSmoothScroll() {
    document.addEventListener(
      "click",
      event => {

        const link =
          event.target.closest(
            'a[href^="#"]'
          );

        if (!link) return;

        const href =
          link.getAttribute(
            "href"
          );

        if (
          !href ||
          href === "#"
        ) {
          return;
        }

        if (
          link.dataset.checkoutReady ===
          "true"
        ) {
          return;
        }

        const target =
          document.querySelector(
            href
          );

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        history.replaceState(
          null,
          "",
          href
        );
      }
    );
  }


  /* =========================================================
     IMAGE HANDLING
     
     Images now come directly from content.json.
     No assets/ folder is required.
     ========================================================= */

  function setImage(
    image,
    url,
    alt
  ) {
    if (!image) return;

    image.alt =
      alt || "";

    image.classList.remove(
      "image-error"
    );

    if (
      isSafeURL(url)
    ) {
      image.src =
        url;

      return;
    }

    image.removeAttribute(
      "src"
    );

    image.classList.add(
      "image-error"
    );
  }


  function setupImageFallbacks() {
    $$("img").forEach(
      image => {

        if (
          image.dataset.fallbackBound ===
          "true"
        ) {
          return;
        }

        image.dataset.fallbackBound =
          "true";

        image.addEventListener(
          "error",
          () => {

            image.classList.add(
              "image-error"
            );

            console.warn(
              "Image could not be loaded:",
              image.src
            );

          }
        );
      }
    );
  }


  /* =========================================================
     LOADING / ERROR
     ========================================================= */

  function showLoadingState() {
    document.body.classList.add(
      "content-loading"
    );
  }


  function hideLoadingState() {
    document.body.classList.remove(
      "content-loading"
    );

    document.body.classList.add(
      "content-loaded"
    );
  }


  function showErrorState(error) {
    console.error(
      "Storefront error:",
      error
    );

    document.body.classList.remove(
      "content-loading"
    );

    document.body.classList.add(
      "content-error"
    );

    setText(
      "#hero-title",
      "The storefront is loading."
    );

    setText(
      "#hero-description",
      "Please refresh the page and try again."
    );
  }


  /* =========================================================
     LOAD CONTENT.JSON
     ========================================================= */

  async function loadContent() {
    const response =
      await fetch(
        CONTENT_URL,
        {
          cache: "no-store"
        }
      );

    if (!response.ok) {
      throw new Error(
        `Unable to load content.json (${response.status})`
      );
    }

    const data =
      await response.json();

    if (
      !data ||
      typeof data !== "object"
    ) {
      throw new Error(
        "content.json contains invalid data."
      );
    }

    state.content =
      data;

    return data;
  }


  /* =========================================================
     RENDER EVERYTHING
     ========================================================= */

  function renderSite(content) {

    state.featuredBook =
      findFeaturedBook();

    state.selectedBook =
      state.featuredBook;

    renderMeta(
      content
    );

    renderHero(
      content
    );

    renderFeaturedBook(
      state.featuredBook
    );

    renderBookshelf(
      content
    );

    renderTrust(
      content
    );

    renderAbout(
      content
    );

    renderFAQ(
      content
    );

    renderFooter(
      content
    );

    renderDisclaimer(
      content
    );

    if (
      state.featuredBook
    ) {

      renderBookDetails(
        state.featuredBook
      );

      renderPreview(
        state.featuredBook
      );

      updatePurchaseArea(
        state.featuredBook
      );

      updateStickyPurchase(
        state.featuredBook
      );
    }

    setupCheckoutTracking();

    setupImageFallbacks();
  }


  /* =========================================================
     INITIALIZATION
     ========================================================= */

  async function init() {

    showLoadingState();

    try {

      const content =
        await loadContent();

      renderSite(
        content
      );

      hideLoadingState();

    } catch (error) {

      showErrorState(
        error
      );

    }
  }


  /* =========================================================
     UI INITIALIZATION
     ========================================================= */

  function setupUI() {

    setupPrivacyModal();

    setupSmoothScroll();

    setupStickyPurchaseBar();

    setupImageFallbacks();
  }


  /* =========================================================
     START
     ========================================================= */

  function start() {

    setupUI();

    init();
  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      start,
      {
        once: true
      }
    );

  } else {

    start();

  }

})();
