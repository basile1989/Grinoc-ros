# Grinocéros

Petite application web installable (PWA) pour apprendre les animaux, les véhicules
et les objets du quotidien. Une image au hasard s'affiche à l'ouverture et son nom
est lu (avec le cri pour un animal). Tout l'écran est un bouton : la zone de
l'image ou le bouton bleu « Écouter » relit le nom, le bouton orange « Suivant »
passe à une autre image. Zoom, sélection et menus sont bloqués pour les petites
mains. Le navigateur bloque le son tant que l'écran n'a pas été touché une fois :
à l'ouverture, le premier appui lance la lecture.

Aucune dépendance, aucun serveur : des fichiers HTML/CSS/JS statiques.

## Tester sur l'ordinateur

```
python -m http.server 8000
```

puis ouvrir http://localhost:8000 dans Chrome.

## Installer sur un téléphone Android (sans Play Store)

Une PWA doit être servie en HTTPS pour être installable. Le plus simple est
GitHub Pages (gratuit) :

1. Créer un dépôt GitHub (public ou privé) et y pousser tout le contenu de ce dossier.
2. Dans le dépôt : Settings → Pages → Source : « Deploy from a branch », branche `main`, dossier `/ (root)`.
3. Après une minute, l'adresse est `https://<votre-compte>.github.io/<nom-du-depot>/`.
4. Sur le téléphone, ouvrir cette adresse dans Chrome, puis menu ⋮ → « Ajouter à l'écran d'accueil » / « Installer l'application ».

Alternative sans compte GitHub : glisser le dossier sur https://app.netlify.com/drop
(Netlify Drop) qui donne aussi une adresse HTTPS.

Une fois installée, l'application fonctionne hors ligne (les fichiers sont mis en
cache par `sw.js`). Pour forcer une mise à jour après modification, changer la
valeur de `VERSION` dans `sw.js`.

## Voix et sons

- Le nom est lu par la synthèse vocale du téléphone (voix française). Sur Android,
  la voix « Synthèse vocale Google » en français doit être installée
  (Paramètres → Système → Langues → Synthèse vocale).
- Pour les animaux, l'application cherche `sounds/<id>.ogg` puis `sounds/<id>.mp3`.
  S'il n'y a pas de fichier, elle lit l'onomatopée (« Ouaf ouaf ! »). Les sons sont
  coupés après 5 secondes.
- Les sons fournis viennent de Wikimedia Commons ; les auteurs et licences sont
  listés dans `sounds/CREDITS.md`.

## Ajouter ou modifier des éléments

Tout est dans `data.js` : un emoji, le nom prononcé, la catégorie
(`animal`, `vehicule`, `objet`) et, pour les animaux, l'onomatopée `cri`.
