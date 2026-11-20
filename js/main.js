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

  // 3. Galerie Carrousel avec chargement sans cache de js/chantiers.js
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
  const lightboxImg = document.getElementById("lightbox-img");
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

  let allChantiers = [];
  let filteredList = [];
  let currentIndex = 0;

  function updateLightbox() {
    if (!lightboxDialog || !lightboxImg || !lightboxCaption || filteredList.length === 0) return;
    const item = filteredList[currentIndex];
    const imgPath = `assets/chantiers/${item.fichier}`;
    const rawFallback = `https://raw.githubusercontent.com/jordan64-labs/Joclean/main/assets/chantiers/${item.fichier}`;

    lightboxImg.onerror = () => {
      lightboxImg.onerror = null;
      lightboxImg.src = rawFallback;
    };
    lightboxImg.src = imgPath;
    lightboxImg.alt = item.titre;
    lightboxCaption.textContent = `${item.titre} (${item.lieu}) — ${item.description} [${currentIndex + 1}/${filteredList.length}]`;

    const hasMultiple = filteredList.length > 1;
    if (lightboxPrev) lightboxPrev.hidden = !hasMultiple;
    if (lightboxNext) lightboxNext.hidden = !hasMultiple;
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
    const imgPath = `assets/chantiers/${item.fichier}`;
    const rawFallback = `https://raw.githubusercontent.com/jordan64-labs/Joclean/main/assets/chantiers/${item.fichier}`;
    const badgeText = categoryLabels[item.categorie] || "Réalisation";
    const hasMultiple = filteredList.length > 1;

    if (prevBtn) prevBtn.hidden = !hasMultiple;
    if (nextBtn) nextBtn.hidden = !hasMultiple;
    if (carouselNav) carouselNav.hidden = !hasMultiple;
    if (carouselCounter) carouselCounter.textContent = `${currentIndex + 1} / ${filteredList.length}`;

    galleryStage.innerHTML = `
      <article class="photo-card">
        <div class="photo-thumb-wrap">
          <img src="${imgPath}" onerror="this.onerror=null;this.src='${rawFallback}';" alt="${item.titre} - ${item.lieu}" class="photo-thumb">
          <span class="zoom-hint">Toucher pour agrandir</span>
        </div>
        <div class="photo-meta">
          <span class="photo-badge">${badgeText} • ${item.lieu}</span>
          <h3>${item.titre}</h3>
          <p>${item.description}</p>
        </div>
      </article>
    `;

    const card = galleryStage.querySelector(".photo-card");
    if (card && lightboxDialog) {
      card.addEventListener("click", () => {
        updateLightbox();
        lightboxDialog.showModal();
      });
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

  // Glissement tactile (swipe) sur mobile
  let touchStartX = 0;
  if (galleryStage) {
    galleryStage.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    galleryStage.addEventListener("touchend", (e) => {
      const diff = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(diff) > 45) {
        if (diff > 0) goPrev();
        else goNext();
      }
    }, { passive: true });
  }

  // Navigation clavier dans la visionneuse
  document.addEventListener("keydown", (e) => {
    if (!lightboxDialog || !lightboxDialog.open) return;
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

  // Chargement dynamique sans cache de js/chantiers.js
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

  // 4. Copie rapide de l'e-mail
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

  // 5. Validation du formulaire de devis
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

  // 6. Modale Mentions légales
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
