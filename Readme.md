# Joclean — Site vitrine professionnel

Site vitrine statique de l'entreprise individuelle **Joclean** (nettoyage de vitres, entretien de résidences, locaux professionnels et nettoyage haute pression en Haute-Garonne - 31), conçu pour être hébergé gratuitement sur **GitHub Pages** et relié à **Google Fiche d'établissement**.

## Fonctionnalités clés

- **100 % statique et rapide :** HTML5, CSS3 et JavaScript vanille sans dépendances externes ni base de données.
- **Responsive (Mobile-First) :** Affichage adapté aux smartphones, tablettes et ordinateurs avec menu mobile intégré.
- **SEO local intégré :** Balises métadonnées et données structurées `Schema.org` (`LocalBusiness`) pour faciliter l'indexation par Google.
- **Prise de contact simplifiée :** Appel direct en un clic (`tel:`), copie rapide de l'adresse `eijoclean@gmail.com` et formulaire de demande de devis pré-remplissant l'e-mail client.
- **Conformité légale :** Fenêtre modale dédiée aux mentions légales.

## Avant la mise en ligne : personnalisation

Dans le fichier `index.html`, remplace les deux informations laissées en attente :
1. **Numéro de téléphone :** remplace `+33600000000` et `06 XX XX XX XX` par ton numéro professionnel (4 occurrences dans `index.html`).
2. **Numéro SIRET :** remplace `[À compléter : XXX XXX XXX XXXXX]` dans la section Mentions légales en bas de `index.html`.

## Déploiement sur GitHub Pages (gratuit)

1. Crée un nouveau dépôt **public** nommé `joclean` sur ton compte GitHub (`https://github.com/new`).
2. Pousse les fichiers du projet sur la branche `main` (voir commandes ci-dessous).
3. Sur GitHub, va dans **Settings** (Paramètres) > **Pages** (menu de gauche).
4. Sous **Build and deployment** > **Source**, sélectionne **Deploy from a branch**.
5. Choisis la branche **`main`** et le dossier **`/ (root)`**, puis clique sur **Save**.
6. Après 1 à 2 minutes, ton site est en ligne à l'adresse :
   `https://jordan64-labs.github.io/joclean/`

## Ajouter le site sur Google Fiche d'établissement

1. Ouvre ta fiche d'établissement Google (via la recherche Google en tapant *Joclean* ou depuis ton e-mail Google Business Profile).
2. Clique sur **Éditer la fiche** > onglet **Contact**.
3. Dans le champ **Site Web**, colle `https://jordan64-labs.github.io/joclean/` et enregistre.
