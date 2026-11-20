document.addEventListener("DOMContentLoaded", () => {
  // 1. Année dynamique
  const yearSpan = document.getElementById("current-year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // 2. Menu mobile
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 3. Galerie Carrousel + Comparateur Avant / Après
  const galleryStage = document.getElementById("gallery-stage");
  const galleryEmpty = document.getElementById("gallery-empty");
  const carouselNav = document.getElementById("carousel-nav");
  const carouselCounter = document.getElementById("carousel-counter");
  const prevBtn = document.getElementById("gallery-prev");
  const nextBtn = document.getElementById("gallery-next");
  const prevBtnBottom = document.getElementById("gallery-prev-bottom");
  const nextBtnBottom = document.getElementById("gallery-next-bottom");
  const filterBtns = document.querySelectorAll(".filter-btn");

  const lightboxDialog = document.getElementById("lightbox-dialog");
  const lightboxMedia = document.getElementById("lightbox-media");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");

  const categoryLabels = {
    vitres: "Nettoyage de vitres",
    residences: "Entretien de résidence",
    locaux: "Locaux professionnels",
    pression: "Haute pression"
  };

  const RAW_BASE = "https://raw.githubusercontent.com/jordan64-labs/Joclean/main/assets/chantiers/";

  let allChantiers = [];
  let filteredList = [];
  let currentIndex = 0;

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function buildBeforeAfterHtml(item, showZoomBtn = false) {
    const afterPath = `assets/chantiers/${item.fichier}`;
    const afterRaw = `${RAW_BASE}${item.fichier}`;
    const beforePath = `assets/chantiers/${item.fichierAvant}`;
    const beforeRaw = `${RAW_BASE}${item.fichierAvant}`;
    const safeTitle = escapeHtml(item.titre);

    return `
      <div class="ba-container" style="--pos: 50%;">
        <img src="${afterPath}" onerror="this.onerror=null;this.src='${afterRaw}';" alt="${safeTitle} — Après" class="ba-img ba-img-after">
        <img src="${beforePath}" onerror="this.onerror=null;this.src='${beforeRaw}';" alt="${safeTitle} — Avant" class="ba-img ba-img-before">
        <span class="ba-badge ba-badge-before">Avant</span>
        <span class="ba-badge ba-badge-after">Après</span>
        <div class="ba-divider"><div class="ba-handle" aria-hidden="true">⇄</div></div>
        <span class="ba-hint">⇄ Glisser le curseur</span>
        <input type="range" class="ba-range" min="0" max="100" value="50" aria-label="Faire glisser pour comparer avant et après">
        ${showZoomBtn ? '<button type="button" class="zoom-hint-btn" aria-label="Agrandir le comparatif">Agrandir ⤢</button>' : ""}
      </div>
    `;
  }

  function wireBeforeAfter(container) {
    const ba = container.querySelector(".ba-container");
    if (!ba) return;
    const range = ba.querySelector(".ba-range");
    if (!range) return;

    const updatePos = () => {
      ba.style.setProperty("--pos", `${range.value}%`);
    };

    range.addEventListener("input", updatePos);
    range.addEventListener("change", updatePos);

    ["touchstart", "touchmove", "touchend", "click"].forEach((evt) => {
      range.addEventListener(evt, (e) => e.stopPropagation(), { passive: true });
    });

    if (container === lightboxMedia) {
      const afterImg = ba.querySelector(".ba-img-after");
      if (afterImg) {
        afterImg.addEventListener("load", () => {
          if (afterImg.naturalWidth && afterImg.naturalHeight) {
            ba.style.aspectRatio = `${afterImg.naturalWidth} / ${afterImg.naturalHeight}`;
          }
        });
      }
    }
  }

  function updateLightbox() {
    if (!lightboxDialog || !lightboxMedia || !lightboxCaption || filteredList.length === 0) return;
    const item = filteredList[currentIndex];
    const hasBefore = Boolean(item.fichierAvant);

    if (hasBefore) {
      lightboxMedia.innerHTML = buildBeforeAfterHtml(item, false);
      wireBeforeAfter(lightboxMedia);
    } else {
      const imgPath = `assets/chantiers/${item.fichier}`;
      const rawFallback = `${RAW_BASE}${item.fichier}`;
      lightboxMedia.innerHTML = `<img src="${imgPath}" onerror="this.onerror=null;this.src='${rawFallback}';" alt="${escapeHtml(item.titre)}">`;
    }

    const modeTag = hasBefore ? " [Avant / Après]" : "";
    lightboxCaption.textContent = `${item.titre} (${item.lieu})${modeTag} — ${item.description} [${currentIndex + 1}/${filteredList.length}]`;

    const hasMultiple = filteredList.length > 1;
    if (lightboxPrev) lightboxPrev.hidden = !hasMultiple;
    if (lightboxNext) lightboxNext.hidden = !hasMultiple;
  }

  function openLightbox() {
    if (!lightboxDialog) return;
    updateLightbox();
    lightboxDialog.showModal();
  }

  function renderSlide() {
    if (!galleryStage || !galleryEmpty) return;

    if (filteredList.length === 0) {
      galleryStage.innerHTML = "";
      galleryEmpty.hidden = false;
      if (carouselNav) carouselNav.hidden = true;
      if (prevBtn) prevBtn.hidden = true;
      if (nextBtn) nextBtn.hidden = true;
      return;
    }

    galleryEmpty.hidden = true;
    if (currentIndex >= filteredList.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = filteredList.length - 1;

    const item = filteredList[currentIndex];
    const hasBefore = Boolean(item.fichierAvant);
    const imgPath = `assets/chantiers/${item.fichier}`;
    const rawFallback = `${RAW_BASE}${item.fichier}`;
    const badgeText = categoryLabels[item.categorie] || "Réalisation";
    const hasMultiple = filteredList.length > 1;

    if (prevBtn) prevBtn.hidden = !hasMultiple;
    if (nextBtn) nextBtn.hidden = !hasMultiple;
    if (carouselNav) carouselNav.hidden = !hasMultiple;
    if (carouselCounter) carouselCounter.textContent = `${currentIndex + 1} / ${filteredList.length}`;

    const mediaHtml = hasBefore
      ? buildBeforeAfterHtml(item, true)
      : `
        <div class="photo-thumb-wrap">
          <img src="${imgPath}" onerror="this.onerror=null;this.src='${rawFallback}';" alt="${escapeHtml(item.titre)} - ${escapeHtml(item.lieu)}" class="photo-thumb">
          <span class="zoom-hint">Toucher pour agrandir</span>
        </div>
      `;

    galleryStage.innerHTML = `
      <article class="photo-card ${hasBefore ? "" : "is-clickable"}">
        ${mediaHtml}
        <div class="photo-meta">
          <div class="photo-badges-row">
            <span class="photo-badge">${escapeHtml(badgeText)} • ${escapeHtml(item.lieu)}</span>
            ${hasBefore ? '<span class="photo-badge-ba">⇄ Avant / Après</span>' : ""}
          </div>
          <h3>${escapeHtml(item.titre)}</h3>
          <p>${escapeHtml(item.description)}</p>
        </div>
      </article>
    `;

    if (hasBefore) {
      wireBeforeAfter(galleryStage);
      const zoomBtn = galleryStage.querySelector(".zoom-hint-btn");
      if (zoomBtn) {
        zoomBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openLightbox();
        });
      }
    } else {
      const card = galleryStage.querySelector(".photo-card");
      if (card) {
        card.addEventListener("click", openLightbox);
      }
    }
  }

  function applyFilter(filter = "all") {
    filteredList = filter === "all"
      ? [...allChantiers]
      : allChantiers.filter((item) => item.categorie === filter);
    currentIndex = 0;
    renderSlide();
  }

  function goPrev() {
    if (filteredList.length <= 1) return;
    currentIndex = (currentIndex - 1 + filteredList.length) % filteredList.length;
    renderSlide();
    if (lightboxDialog && lightboxDialog.open) updateLightbox();
  }

  function goNext() {
    if (filteredList.length <= 1) return;
    currentIndex = (currentIndex + 1) % filteredList.length;
    renderSlide();
    if (lightboxDialog && lightboxDialog.open) updateLightbox();
  }

  if (prevBtn) prevBtn.addEventListener("click", goPrev);
  if (nextBtn) nextBtn.addEventListener("click", goNext);
  if (prevBtnBottom) prevBtnBottom.addEventListener("click", goPrev);
  if (nextBtnBottom) nextBtnBottom.addEventListener("click", goNext);
  if (lightboxPrev) lightboxPrev.addEventListener("click", goPrev);
  if (lightboxNext) lightboxNext.addEventListener("click", goNext);

  let touchStartX = 0;
  let touchOnSlider = false;
  if (galleryStage) {
    galleryStage.addEventListener("touchstart", (e) => {
      touchOnSlider = Boolean(e.target.closest(".ba-container"));
      if (!touchOnSlider) {
        touchStartX = e.changedTouches[0].screenX;
      }
    }, { passive: true });

    galleryStage.addEventListener("touchend", (e) => {
      if (touchOnSlider) return;
      const diff = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(diff) > 45) {
        if (diff > 0) goPrev();
        else goNext();
      }
    }, { passive: true });
  }

  document.addEventListener("keydown", (e) => {
    if (!lightboxDialog || !lightboxDialog.open) return;
    if (document.activeElement && document.activeElement.classList.contains("ba-range")) return;
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilter(btn.getAttribute("data-filter") || "all");
    });
  });

  if (lightboxDialog && lightboxClose) {
    lightboxClose.addEventListener("click", () => lightboxDialog.close());
    lightboxDialog.addEventListener("click", (e) => {
      if (e.target === lightboxDialog) lightboxDialog.close();
    });
  }

  function loadChantiersFresh() {
    const script = document.createElement("script");
    script.src = `js/chantiers.js?t=${Date.now()}`;
    script.onload = () => {
      allChantiers = typeof CHANTIERS !== "undefined" && Array.isArray(CHANTIERS) ? CHANTIERS : [];
      applyFilter("all");
    };
    script.onerror = () => {
      allChantiers = [];
      applyFilter("all");
    };
    document.body.appendChild(script);
  }

  loadChantiersFresh();

  // 4. Avis Clients Google (chargement sans cache de js/avis.js)
  const reviewsGrid = document.getElementById("reviews-grid");
  const ratingValEl = document.getElementById("google-rating-value");
  const ratingCountEl = document.getElementById("google-rating-count");
  const btnLeaveReview = document.getElementById("btn-leave-review");
  const btnAllReviews = document.getElementById("btn-all-reviews");

  function renderReviews(list, config) {
    if (!reviewsGrid) return;
    const link = (config && config.lienAvis) || "https://g.page/r/Cer1lmfHnfCTEAE/review";
    if (btnLeaveReview) btnLeaveReview.href = link;
    if (btnAllReviews) btnAllReviews.href = link;

    const total = (config && config.totalAvis) || list.length;
    if (ratingValEl && config && config.noteGlobale) {
      ratingValEl.textContent = config.noteGlobale;
    }
    if (ratingCountEl && total > 0) {
      ratingCountEl.textContent = `${total} avis`;
    }

    reviewsGrid.innerHTML = "";
    list.forEach((avis) => {
      const note = Math.max(1, Math.min(5, Number(avis.note) || 5));
      const stars = "★".repeat(note) + "☆".repeat(5 - note);
      const initial = escapeHtml((avis.auteur || "C").trim().charAt(0).toUpperCase());
      const comment = (avis.commentaire || "").trim();

      const card = document.createElement("article");
      card.className = "review-card";
      card.innerHTML = `
        <div class="review-card-top">
          <div class="review-avatar" aria-hidden="true">${initial}</div>
          <div class="review-author-info">
            <strong>${escapeHtml(avis.auteur)}</strong>
            ${avis.date ? `<span class="review-date">${escapeHtml(avis.date)}</span>` : ""}
          </div>
          <span class="review-google-tag">Google</span>
        </div>
        <div class="review-stars-row">
          <span class="review-stars" aria-label="${note} étoiles sur 5">${stars}</span>
          ${avis.prestation ? `<span class="review-service-pill">${escapeHtml(avis.prestation)}</span>` : ""}
        </div>
        ${
          comment
            ? `<p class="review-text">« ${escapeHtml(comment)} »</p>`
            : `<p class="review-text-empty">Note ${note}/5 attribuée sur Google.</p>`
        }
      `;
      reviewsGrid.appendChild(card);
    });
  }

  function loadAvisFresh() {
    const script = document.createElement("script");
    script.src = `js/avis.js?t=${Date.now()}`;
    script.onload = () => {
      const list = typeof AVIS_CLIENTS !== "undefined" && Array.isArray(AVIS_CLIENTS) ? AVIS_CLIENTS : [];
      const cfg = typeof GOOGLE_AVIS_CONFIG !== "undefined" ? GOOGLE_AVIS_CONFIG : null;
      renderReviews(list, cfg);
    };
    script.onerror = () => {
      renderReviews([], null);
    };
    document.body.appendChild(script);
  }

  loadAvisFresh();

  // 5. Copie rapide de l'e-mail
  const copyBtn = document.getElementById("copy-email-btn");
  const copyFeedback = document.getElementById("copy-feedback");

  if (copyBtn && copyFeedback) {
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.getAttribute("data-email") || "eijoclean@gmail.com";
      try {
        await navigator.clipboard.writeText(email);
        copyFeedback.textContent = "Adresse e-mail copiée dans le presse-papiers.";
      } catch (_err) {
        copyFeedback.textContent = `Adresse : ${email}`;
      }
      setTimeout(() => {
        copyFeedback.textContent = "";
      }, 4000);
    });
  }

  // 6. Validation du formulaire de devis
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const fields = [
        { id: "nom", label: "Veuillez indiquer votre nom ou entreprise." },
        { id: "telephone", label: "Veuillez saisir un numéro de téléphone." },
        { id: "commune", label: "Veuillez indiquer la commune d'intervention." },
        { id: "prestation", label: "Veuillez choisir une prestation." },
        { id: "message", label: "Veuillez décrire brièvement votre besoin." }
      ];

      let isValid = true;

      fields.forEach(({ id, label }) => {
        const input = document.getElementById(id);
        const errorEl = document.getElementById(`error-${id}`);
        if (!input || !errorEl) return;

        const value = input.value.trim();
        if (!value) {
          errorEl.textContent = label;
          isValid = false;
        } else if (id === "telephone" && value.replace(/\D/g, "").length < 8) {
          errorEl.textContent = "Numéro de téléphone incomplet.";
          isValid = false;
        } else {
          errorEl.textContent = "";
        }
      });

      if (!isValid) {
        if (formStatus) formStatus.textContent = "";
        return;
      }

      const nom = document.getElementById("nom").value.trim();
      const telephone = document.getElementById("telephone").value.trim();
      const commune = document.getElementById("commune").value.trim();
      const prestation = document.getElementById("prestation").value.trim();
      const message = document.getElementById("message").value.trim();

      const subject = encodeURIComponent(`Demande de devis Joclean - ${prestation} (${commune})`);
      const body = encodeURIComponent(
        `Bonjour Jordan,

` +
        `Je souhaite obtenir un devis pour une prestation Joclean :

` +
        `- Nom / Entreprise : ${nom}
` +
        `- Téléphone : ${telephone}
` +
        `- Commune : ${commune}
` +
        `- Prestation : ${prestation}

` +
        `Précisions :
${message}

` +
        `Cordialement,
${nom}`
      );

      if (formStatus) {
        formStatus.textContent = "Ouverture de votre messagerie...";
      }

      window.location.href = `mailto:eijoclean@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  // 7. Modale Mentions légales
  const legalDialog = document.getElementById("legal-dialog");
  const openLegalBtn = document.getElementById("open-legal-btn");
  const closeLegalBtn = document.getElementById("close-legal-btn");

  if (legalDialog && openLegalBtn && closeLegalBtn) {
    openLegalBtn.addEventListener("click", () => legalDialog.showModal());
    closeLegalBtn.addEventListener("click", () => legalDialog.close());
    legalDialog.addEventListener("click", (e) => {
      if (e.target === legalDialog) legalDialog.close();
    });
  }
});
