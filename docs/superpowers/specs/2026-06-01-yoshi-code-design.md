# Yoshi Code — App d'apprentissage du code pour enfant

**Date :** 2026-06-01
**Auteur :** Seb (slynet76)
**Statut :** Design validé, prêt pour le plan d'implémentation

## 1. Objectif

Application Android pour apprendre à coder à un enfant de 13 ans, dans un esprit
ludique façon *Scratch* / *Lapins Crétins — Apprends à coder*. L'enfant guide un
dino (Yoshi) sur une grille pour gober des œufs et atteindre son nid, en assemblant
des blocs de programmation. Le **code Python équivalent** s'affiche en temps réel
pour faire le pont entre blocs et vrai code.

Usage **familial privé**. Distribution via APK sur le téléphone de l'enfant, pas de
Play Store.

## 2. Public & approche pédagogique

- **Cible :** enfant de 13 ans, lecteur à l'aise.
- **Approche :** hybride blocs → code, avec une dimension puzzle (résoudre des défis).
- **Progression des concepts :** séquence → boucle → condition.

## 3. Périmètre v1 (MVP)

- ~12 niveaux progressifs faits main.
- Blocs : `avance`, `tourne_droite`, `tourne_gauche`, `gobe`, `repete N fois`,
  `si mur_devant`, `si oeuf_ici`.
- Panneau de code Python généré en temps réel.
- Système d'étoiles (1 à 3).
- Sauvegarde locale de la progression.
- 100% hors-ligne.

**Hors périmètre v1 (idées futures) :** éditeur de niveaux, comptes/cloud,
sons avancés, niveaux additionnels, mode multijoueur.

## 4. Approche technique retenue

**Approche A — Blockly dans une WebView Expo.**

Le cœur interactif (éditeur de blocs + jeu) est une page web embarquée chargée
dans l'app Expo via `react-native-webview`. On utilise **Google Blockly** pour
l'édition des blocs tactiles et la **génération automatique du code Python**.
L'enrobage « app » (menus, carte des niveaux, étoiles, sauvegarde) reste en
React Native natif.

Justification : Blockly gère la partie la plus difficile (drag-drop tactile,
emboîtement, génération de code), éprouvé (utilisé par code.org). Réutilise le
pipeline Expo → APK → release GitHub déjà maîtrisé par Seb. Tout est embarqué,
donc hors-ligne.

Approches écartées :
- **B (blocs natifs RN maison)** : réimplémenter Blockly = des semaines, mauvais
  rapport effort/valeur.
- **C (100% web, Expo simple wrapper)** : moins « app native », packaging moins
  propre, fermeture des évolutions natives futures.

## 5. Architecture

```
App Expo (React Native)
├── Écran Accueil
├── Écran Carte des niveaux (12 niveaux, étoiles gagnées)
└── Écran Jeu
    └── WebView (react-native-webview)
        └── Atelier web embarqué
            ├── Blockly (palette + assemblage des blocs)
            ├── Générateur Python (fourni par Blockly)
            └── Moteur de jeu (grille, dino, œufs, exécution pas-à-pas)
```

### Unités isolées (chacune testable seule)

- **Moteur de jeu** — logique pure : applique une liste de commandes sur une
  grille, calcule le résultat (succès/échec, étoiles). Aucune dépendance UI.
- **Définition des blocs** — déclaration Blockly des blocs + mapping vers Python
  et vers les commandes du moteur.
- **Chargeur de niveaux** — JSON → état de grille initial ; validation de cohérence.
- **Couche de sauvegarde** — lecture/écriture de la progression via AsyncStorage.

### Le pont (bridge) RN ↔ WebView

- RN → WebView : « charge le niveau N » (JSON du niveau).
- WebView → RN : « niveau réussi, X étoiles, Y blocs » → RN sauvegarde et débloque
  le niveau suivant.

## 6. Modèle d'un niveau

Un niveau est un fichier JSON :

```json
{
  "id": 4,
  "titre": "La grotte",
  "grille": { "largeur": 4, "hauteur": 3 },
  "dino": { "x": 0, "y": 0, "direction": "droite" },
  "oeufs": [ {"x": 2, "y": 0}, {"x": 3, "y": 1} ],
  "nid": { "x": 3, "y": 2 },
  "murs": [ {"x": 1, "y": 1} ],
  "blocs_autorises": ["avance", "tourne_droite", "tourne_gauche", "gobe", "repete"],
  "objectif": "Gobe les 2 œufs puis rejoins le nid",
  "etoiles": { "max_blocs_3": 5, "max_blocs_2": 8 }
}
```

### Progression des blocs

- **Niv. 1-3 :** `avance`, `tourne_droite`, `tourne_gauche`, `gobe` → séquence.
- **Niv. 4-7 :** ajout de `repete N fois` → boucle.
- **Niv. 8-12 :** ajout de `si mur_devant` / `si oeuf_ici` → condition.

### Système d'étoiles

- ⭐ : niveau terminé (tous les œufs gobés + dino sur le nid).
- ⭐⭐ : terminé en peu de blocs (seuil `max_blocs_2`).
- ⭐⭐⭐ : terminé en utilisant une boucle/condition plutôt que tout répéter à la
  main (seuil `max_blocs_3`).

## 7. Flux d'exécution

Au clic sur **GO DINO !** :

1. Blockly transforme les blocs en liste de commandes + code Python affiché.
2. Le moteur de jeu exécute les commandes une par une, **avec animation** ; la
   ligne de code correspondante s'illumine à chaque pas.
3. Vérification de l'objectif :
   - ✅ Réussi → animation de victoire, calcul des étoiles, notification à RN
     (sauvegarde + déblocage du niveau suivant).
   - ❌ Raté → message bienveillant (« Oups, le dino a foncé dans un mur ! »,
     « Il reste 1 œuf 🥚 »), dino remis au départ, on retente sans pénalité.

**Mode pas-à-pas :** lecture lente + bouton « ▶ pas suivant » pour déboguer
tranquillement.

## 8. Sauvegarde

- 100% locale via `@react-native-async-storage/async-storage`.
- Stocke : niveaux terminés, étoiles par niveau, meilleur score (nb de blocs).
- Pas de compte, pas de cloud, pas d'internet requis.
- Bouton « Réinitialiser la progression » dans les réglages.

## 9. Gestion des erreurs

- Programme vide → invite à poser des blocs.
- Limite de sécurité d'exécution (ex. 200 pas max) pour éviter les boucles infinies.
- Collision mur / sortie de grille → échec propre avec message clair, jamais de
  plantage.

## 10. Distribution

- Repo GitHub **privé** : `slynet76/yoshi-code` (assets Yoshi → cadre familial privé).
- Pipeline existant : push d'un tag (`v0.1.0`) → GitHub Actions build l'APK via EAS
  → APK attaché à une release GitHub → installation manuelle sur le téléphone.

### Organisation du repo

```
yoshi-code/
├── app/                  # écrans React Native (accueil, carte, jeu)
├── webview/              # atelier web : Blockly + moteur de jeu + Python
├── levels/               # les 12 niveaux en JSON
├── assets/               # sprites Yoshi, œufs, sons
├── .github/workflows/    # build APK (pipeline tag→APK→release)
└── docs/superpowers/specs/
```

## 11. Stratégie de tests

- **Moteur de jeu** (logique pure) → tests unitaires Jest : « ce programme sur ce
  niveau → succès + N étoiles ».
- **Chargeur de niveaux** → validation de cohérence de chaque JSON (dino/nid dans
  la grille, pas de chevauchement).
- **Validation des 12 niveaux** → test garantissant qu'au moins une solution existe
  par niveau.
- **Rendu visuel** (WebView/animations) → test manuel sur appareil.

## 12. Stack

- Expo SDK 51 (React Native).
- `react-native-webview`.
- Google Blockly (embarqué dans le bundle web).
- `@react-native-async-storage/async-storage`.
- Jest pour les tests unitaires.
