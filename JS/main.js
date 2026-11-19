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

  // 3. Galerie dynamique des chantiers + Filtres + Lightbox
  const galleryGrid = document.getElementById("gallery-grid");
  const galleryEmpty = document.getElementById("gallery-empty");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const lightboxDialog = document.getElementById("lightbox-dialog");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");

  const categoryLabels = {
    vitres: "Nettoyage de vitres",
    residences: "Entretien de résidence",
    locaux: "Locaux professionnels",
    pression: "Haute pression"
  };

  function renderGallery(filter = "all") {
    if (!galleryGrid || !galleryEmpty) return;

    const list = typeof CHANTIERS !== "undefined" && Array.isArray(CHANTIERS) ? CHANTIERS : [];
    const filtered = filter === "all" ? list : list.filter((item) => item.categorie === filter);

    galleryGrid.innerHTML = "";

    if (list.length === 0) {
      galleryEmpty.hidden = false;
      return;
    }

    galleryEmpty.hidden = true;

    filtered.forEach((item) => {
      const card = document.createElement("article");
      card.className = "photo-card";
      const imgPath = `assets/chantiers/${item.fichier}`;
      const badgeText = categoryLabels[item.categorie] || "Réalisation";

      card.innerHTML = `
        <img src="${imgPath}" alt="${item.titre} - ${item.lieu}" class="photo-thumb" loading="lazy">
        <div class="photo-meta">
          <span class="photo-badge">${badgeText} • ${item.lieu}</span>
          <h3>${item.titre}</h3>
          <p>${item.description}</p>
        </div>
      `;

      card.addEventListener("click", () => {
        if (lightboxDialog && lightboxImg && lightboxCaption) {
          lightboxImg.src = imgPath;
          lightboxImg.alt = item.titre;
          lightboxCaption.textContent = `${item.titre} (${item.lieu}) — ${item.description}`;
          lightboxDialog.showModal();
        }
      });

      galleryGrid.appendChild(card);
    });
  }

  renderGallery("all");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderGallery(btn.getAttribute("data-filter") || "all");
    });
  });

  if (lightboxDialog && lightboxClose) {
    lightboxClose.addEventListener("click", () => lightboxDialog.close());
    lightboxDialog.addEventListener("click", (e) => {
      if (e.target === lightboxDialog) lightboxDialog.close();
    });
  }

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
        `Bonjour Jordan,\n\n` +
        `Je souhaite obtenir un devis pour une prestation Joclean :\n\n` +
        `- Nom / Entreprise : ${nom}\n` +
        `- Téléphone : ${telephone}\n` +
        `- Commune : ${commune}\n` +
        `- Prestation : ${prestation}\n\n` +
        `Précisions :\n${message}\n\n` +
        `Cordialement,\n${nom}`
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

  // 7. Apparition douce au défilement
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }
});
