# Joclean — Site vitrine professionnel

Site vitrine moderne de **Joclean EI** (Jordan Fernandez), entreprise de nettoyage de vitres, entretien de résidences, locaux professionnels et nettoyage haute pression en Haute-Garonne (31).

- **URL publique :** https://jordan64-labs.github.io/Joclean/
- **Contact :** 06 81 98 62 93 • eijoclean@gmail.com

## Fonctionnalités clés

- **Identité graphique officielle :** Palette émeraude (`#00A896`) et bleu cobalt (`#1B56A8`) alignée sur le logo Joclean.
- **Galerie de chantiers évolutive :** Ajout simplifié de photos dans `assets/chantiers/` avec filtres par prestation et aperçu plein écran.
- **Conversion mobile optimisée :** Barre d'appel et de devis rapide en bas d'écran sur smartphone.
- **SEO local & Mentions légales :** Balisage `Schema.org` (`LocalBusiness`) et mentions légales complètes intégrées.

## Comment ajouter une photo de chantier sur le site

1. Sur GitHub, ouvre le dossier `assets/chantiers/` puis clique sur **Add file** > **Upload files** pour déposer ta photo (ex. `vitrine-auterive.jpg`), puis clique sur **Commit changes**.
2. Ouvre le fichier `js/chantiers.js`, clique sur l'icône **crayon** (Modifier) et ajoute une entrée dans `const CHANTIERS = [ ... ]` :
   ```javascript
   {
     fichier: "vitrine-auterive.jpg",
     titre: "Nettoyage vitrine commerciale",
     lieu: "Auterive (31)",
     categorie: "vitres",
     description: "Vitres intérieures et extérieures sans traces."
   }
 
