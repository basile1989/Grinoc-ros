(() => {
  const carte = document.getElementById("carte");
  const image = document.getElementById("image");
  const nom = document.getElementById("nom");
  const suivant = document.getElementById("suivant");
  const ecouter = document.getElementById("ecouter");

  let courant = null;
  let audioEnCours = null;

  // ---- Synthèse vocale ----
  const synth = window.speechSynthesis;
  let voixFr = null;

  function choisirVoix() {
    if (!synth) return;
    const voix = synth.getVoices();
    voixFr =
      voix.find(v => v.lang === "fr-FR" && /google|natural|premium/i.test(v.name)) ||
      voix.find(v => v.lang === "fr-FR") ||
      voix.find(v => v.lang && v.lang.toLowerCase().startsWith("fr")) ||
      null;
  }
  if (synth) {
    choisirVoix();
    synth.onvoiceschanged = choisirVoix;
  }

  function parler(texte, options = {}) {
    return new Promise(resolve => {
      if (!synth || !texte) return resolve();
      synth.cancel();
      const u = new SpeechSynthesisUtterance(texte);
      u.lang = "fr-FR";
      if (voixFr) u.voice = voixFr;
      u.rate = options.rate ?? 0.85;
      u.pitch = options.pitch ?? 1;
      let fini = false;
      const terminer = () => { if (!fini) { fini = true; resolve(); } };
      u.onend = terminer;
      u.onerror = terminer;
      // Securite : certains Android n'envoient pas toujours onend.
      setTimeout(terminer, 600 + texte.length * 120);
      synth.speak(u);
    });
  }

  // ---- Cri de l'animal ----
  // Essaie sounds/<id>.ogg puis sounds/<id>.mp3 ; sinon l'onomatopee est lue.
  const DUREE_MAX_MS = 5000;

  function jouerFichier(url) {
    return new Promise((resolve, reject) => {
      const a = new Audio(url);
      let lance = false;
      a.onerror = () => (lance ? resolve() : reject());
      a.onended = resolve;
      a.play().then(() => {
        lance = true;
        audioEnCours = a;
        setTimeout(() => { if (audioEnCours === a) { a.pause(); resolve(); } }, DUREE_MAX_MS);
      }).catch(reject);
    });
  }

  function jouerCri(item) {
    if (item.cat !== "animal") return;
    if (audioEnCours) { audioEnCours.pause(); audioEnCours = null; }
    jouerFichier("sounds/" + item.id + ".ogg")
      .catch(() => jouerFichier("sounds/" + item.id + ".mp3"))
      .catch(() => parler(item.cri, { rate: 0.9, pitch: 1.1 }));
  }

  // ---- Affichage ----
  function tirer() {
    let choix;
    do {
      choix = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    } while (courant && choix.id === courant.id && ITEMS.length > 1);
    return choix;
  }

  function afficher(item) {
    courant = item;
    if (synth) synth.cancel();
    if (audioEnCours) { audioEnCours.pause(); audioEnCours = null; }
    image.textContent = item.emoji;
    nom.textContent = item.nom;
    nom.classList.remove("visible");
  }

  async function dire() {
    if (!courant) return;
    carte.classList.remove("pop");
    void carte.offsetWidth; // relance l'animation
    carte.classList.add("pop");
    nom.classList.add("visible");
    await parler(courant.nom);
    jouerCri(courant);
  }

  // ---- Toucher : reaction des que le doigt se pose, un seul declenchement ----
  const DELAI_MIN_MS = 500;
  let dernierToucher = 0;

  function surZone(el, action) {
    el.addEventListener("pointerdown", ev => {
      if (!ev.isPrimary) return;
      ev.preventDefault();
      el.classList.add("presse");
      const maintenant = Date.now();
      if (maintenant - dernierToucher < DELAI_MIN_MS) return;
      dernierToucher = maintenant;
      action();
    });
    const relacher = () => el.classList.remove("presse");
    el.addEventListener("pointerup", relacher);
    el.addEventListener("pointercancel", relacher);
    el.addEventListener("pointerleave", relacher);
  }

  function nouvelleImage() {
    afficher(tirer());
    dire();
  }

  surZone(carte, dire);
  surZone(ecouter, dire);
  surZone(suivant, nouvelleImage);

  // ---- Bloquer tout le reste : zoom, menu long appui, selection, glissement ----
  const bloquer = ev => ev.preventDefault();
  document.addEventListener("contextmenu", bloquer);
  document.addEventListener("selectstart", bloquer);
  document.addEventListener("dragstart", bloquer);
  document.addEventListener("dblclick", bloquer);
  document.addEventListener("gesturestart", bloquer);
  document.addEventListener("touchmove", bloquer, { passive: false });
  document.addEventListener("touchstart", ev => {
    if (ev.touches.length > 1) ev.preventDefault();
  }, { passive: false });
  document.addEventListener("wheel", ev => {
    if (ev.ctrlKey) ev.preventDefault();
  }, { passive: false });
  document.addEventListener("keydown", ev => {
    if ((ev.ctrlKey || ev.metaKey) && ["+", "-", "=", "0"].includes(ev.key)) ev.preventDefault();
  });

  // Premiere image : lue tout de suite. Le navigateur peut refuser tout son
  // avant le premier toucher ; comme tout l'ecran est un bouton, le premier
  // appui relance la lecture de toute facon.
  afficher(tirer());
  dire();

  // ---- PWA ----
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
})();
