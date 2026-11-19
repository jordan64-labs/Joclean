document.addEventListener("DOMContentLoaded", () => {
  // 1. Année dynamique dans le pied de page
  const yearSpan = document.getElementById("current-year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // 2. Menu mobile responsive
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Fermer le menu après un clic sur un lien
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 3. Bouton de copie rapide de l'adresse e-mail
  const copyBtn = document.getElementById("copy-email-btn");
  const copyFeedback = document.getElementById("copy-feedback");

  if (copyBtn && copyFeedback) {
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.getAttribute("data-email") || "eijoclean@gmail.com";
      try {
        await navigator.clipboard.writeText(email);
        copyFeedback.textContent = "Adresse e-mail copiée dans le presse-papiers !";
      } catch (_err) {
        copyFeedback.textContent = `Copiez l'adresse manuellement : ${email}`;
      }
      setTimeout(() => {
        copyFeedback.textContent = "";
      }, 4000);
    });
  }

  // 4. Validation du formulaire et génération d'un brouillon mailto
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const fields = [
        { id: "nom", label: "Veuillez indiquer votre nom ou entreprise." },
        { id: "telephone", label: "Veuillez indiquer un numéro de téléphone valide." },
        { id: "commune", label: "Veuillez préciser votre commune." },
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
          errorEl.textContent = "Le numéro de téléphone semble incomplet.";
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

      const recipient = "eijoclean@gmail.com";
      const subject = encodeURIComponent(`Demande de devis Joclean - ${prestation} (${commune})`);
      const body = encodeURIComponent(
        `Bonjour,\n\n` +
        `Je souhaite obtenir un devis pour une prestation de nettoyage :\n\n` +
        `- Nom / Entreprise : ${nom}\n` +
        `- Téléphone : ${telephone}\n` +
        `- Commune : ${commune}\n` +
        `- Prestation : ${prestation}\n\n` +
        `Détails de la demande :\n${message}\n\n` +
        `Cordialement,\n${nom}`
      );

      if (formStatus) {
        formStatus.textContent = "Ouverture de votre application de messagerie...";
      }

      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    });
  }

  // 5. Fenêtre modale des mentions légales
  const legalDialog = document.getElementById("legal-dialog");
  const openLegalBtn = document.getElementById("open-legal-btn");
  const closeLegalBtn = document.getElementById("close-legal-btn");

  if (legalDialog && openLegalBtn && closeLegalBtn) {
    openLegalBtn.addEventListener("click", () => {
      legalDialog.showModal();
    });

    closeLegalBtn.addEventListener("click", () => {
      legalDialog.close();
    });

    legalDialog.addEventListener("click", (event) => {
      if (event.target === legalDialog) {
        legalDialog.close();
      }
    });
  }
});
