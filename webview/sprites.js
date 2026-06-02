// sprites.js — Sprites SVG Yoshi pour la grille de jeu
// Tous les sprites sont des SVG inline (data URI) intégrés directement dans le DOM.

const ROTATION = { droite: 0, bas: 90, gauche: 180, haut: 270 };

// ─── Yoshi vert ──────────────────────────────────────────────────────────────
function svgYoshi(direction) {
  const deg = ROTATION[direction] || 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style="width:100%;height:100%;transform:rotate(${deg}deg);transition:transform 0.15s">
    <!-- Selle verte dos -->
    <ellipse cx="18" cy="14" rx="7" ry="5" fill="#3aaa1a"/>
    <ellipse cx="26" cy="11" rx="6" ry="4" fill="#3aaa1a"/>
    <!-- Piques dos -->
    <polygon points="14,10 11,4 17,9" fill="#2d8c14"/>
    <polygon points="22,8 19,2 24,7" fill="#2d8c14"/>
    <polygon points="29,9 27,3 32,8" fill="#2d8c14"/>
    <!-- Corps -->
    <ellipse cx="20" cy="30" rx="14" ry="12" fill="#5dcf20"/>
    <!-- Ventre -->
    <ellipse cx="20" cy="32" rx="9" ry="8" fill="#d4f09a"/>
    <!-- Tête -->
    <ellipse cx="34" cy="20" rx="12" ry="11" fill="#5dcf20"/>
    <!-- Oeil blanc -->
    <ellipse cx="37" cy="17" rx="5" ry="5.5" fill="white"/>
    <!-- Pupille -->
    <ellipse cx="38" cy="17" rx="3" ry="3.5" fill="#1a1a2e"/>
    <!-- Reflet oeil -->
    <ellipse cx="36.5" cy="15.5" rx="1.5" ry="1.5" fill="white"/>
    <!-- Nez orange -->
    <ellipse cx="43" cy="22" rx="5" ry="4" fill="#ff8c00"/>
    <ellipse cx="44" cy="21" rx="1.2" ry="1" fill="#cc5500"/>
    <!-- Bouche -->
    <path d="M38 26 Q41 29 44 26" stroke="#cc5500" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <!-- Joue rose -->
    <ellipse cx="38" cy="22" rx="3.5" ry="2.5" fill="#ffaaaa" opacity="0.55"/>
    <!-- Bras -->
    <ellipse cx="8" cy="30" rx="5" ry="7" fill="#5dcf20" transform="rotate(-25 8 30)"/>
    <ellipse cx="9" cy="37" rx="3.5" ry="2.5" fill="#4aad18"/>
    <!-- Pattes / chaussures rouges -->
    <ellipse cx="14" cy="43" rx="7" ry="4.5" fill="#e83020"/>
    <ellipse cx="28" cy="43" rx="7" ry="4.5" fill="#e83020"/>
    <!-- Semelles -->
    <ellipse cx="14" cy="44.5" rx="6" ry="2.5" fill="#b01a10"/>
    <ellipse cx="28" cy="44.5" rx="6" ry="2.5" fill="#b01a10"/>
    <!-- Queue -->
    <ellipse cx="6" cy="24" rx="5" ry="3.5" fill="#5dcf20" transform="rotate(-30 6 24)"/>
  </svg>`;
}

// ─── Œuf Yoshi ───────────────────────────────────────────────────────────────
const SVG_OEUF = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style="width:100%;height:100%">
  <!-- Ombre -->
  <ellipse cx="24" cy="45" rx="12" ry="3" fill="rgba(0,0,0,0.15)"/>
  <!-- Corps de l'oeuf -->
  <ellipse cx="24" cy="25" rx="16" ry="19" fill="#f5f0d8"/>
  <!-- Taches vertes étoilées -->
  <path d="M16 18 L17.5 22 L14 24.5 L18 24.5 L19 28.5 L21 24.5 L25 25.5 L22 22.5 L23.5 18.5 L20.5 21.5 Z" fill="#5dcf20" opacity="0.85"/>
  <path d="M28 12 L29 15 L26.5 16.5 L29.5 16.5 L30 19.5 L31.5 16.5 L34 17 L32 15 L33 12 L31 14 Z" fill="#5dcf20" opacity="0.85"/>
  <path d="M14 30 L15 32.5 L13 34 L15.5 34 L16 36.5 L17 34 L19.5 34.5 L17.5 32.5 L18.5 30 L16.5 32 Z" fill="#5dcf20" opacity="0.85"/>
  <path d="M30 30 L31 33 L29 34.5 L31.5 34.5 L32 37 L33 34.5 L35.5 35 L33.5 33 L34.5 30.5 L32.5 32.5 Z" fill="#5dcf20" opacity="0.7"/>
  <!-- Reflet -->
  <ellipse cx="19" cy="15" rx="4" ry="5" fill="white" opacity="0.35"/>
  <!-- Contour -->
  <ellipse cx="24" cy="25" rx="16" ry="19" fill="none" stroke="#c8b870" stroke-width="1.2"/>
</svg>`;

// ─── Nid (objectif) ──────────────────────────────────────────────────────────
const SVG_NID = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style="width:100%;height:100%">
  <!-- Étoile scintillante -->
  <polygon points="24,6 27,16 38,16 29,22 32,33 24,27 16,33 19,22 10,16 21,16" fill="#ffd700" stroke="#e6a800" stroke-width="1"/>
  <polygon points="24,9 26.5,16 36,16 28.5,21 31,30 24,25.5 17,30 19.5,21 12,16 21.5,16" fill="#ffe840"/>
  <!-- Reflet -->
  <ellipse cx="21" cy="14" rx="3" ry="2" fill="white" opacity="0.4"/>
  <!-- Nid de branches -->
  <ellipse cx="24" cy="42" rx="15" ry="5" fill="#8b5e3c"/>
  <path d="M10 42 Q15 37 20 40 Q24 36 28 40 Q33 37 38 42" stroke="#6b3f1e" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M11 43 Q18 38 24 41 Q30 38 37 43" stroke="#a0714f" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- Mini oeuf dans le nid -->
  <ellipse cx="24" cy="40" rx="6" ry="7" fill="#f5f0d8" stroke="#c8b870" stroke-width="0.8"/>
  <path d="M21 37 L22 39.5 L20 41 L22.5 41 L23 43.5 L24 41 L26 41.5 L24.5 39.5 L25.5 37 L23.5 39 Z" fill="#5dcf20" opacity="0.8" transform="scale(0.7) translate(8,10)"/>
</svg>`;

// ─── Mur / Rocher ─────────────────────────────────────────────────────────────
const SVG_MUR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style="width:100%;height:100%">
  <!-- Ombre -->
  <ellipse cx="25" cy="46" rx="14" ry="3" fill="rgba(0,0,0,0.2)"/>
  <!-- Gros rocher -->
  <ellipse cx="24" cy="29" rx="18" ry="16" fill="#8a8a8a"/>
  <ellipse cx="22" cy="27" rx="18" ry="16" fill="#9e9e9e"/>
  <!-- Texture rocher -->
  <ellipse cx="16" cy="24" rx="4" ry="3" fill="#888" opacity="0.5"/>
  <ellipse cx="28" cy="20" rx="3" ry="2.5" fill="#888" opacity="0.4"/>
  <ellipse cx="22" cy="33" rx="5" ry="3" fill="#888" opacity="0.4"/>
  <!-- Petits rochers -->
  <ellipse cx="10" cy="38" rx="7" ry="5" fill="#7a7a7a"/>
  <ellipse cx="36" cy="37" rx="6" ry="5" fill="#7a7a7a"/>
  <!-- Reflet -->
  <ellipse cx="16" cy="20" rx="5" ry="4" fill="white" opacity="0.2"/>
  <!-- Contour -->
  <ellipse cx="22" cy="27" rx="18" ry="16" fill="none" stroke="#666" stroke-width="1"/>
</svg>`;

// ─── Herbe (case vide) ────────────────────────────────────────────────────────
const SVG_HERBE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style="width:100%;height:100%">
  <!-- Sol -->
  <rect x="0" y="30" width="48" height="18" fill="#5a8f2a" rx="0"/>
  <!-- Petits brins d'herbe -->
  <path d="M6 30 Q7 24 8 30" stroke="#7ac43a" stroke-width="1.5" fill="none"/>
  <path d="M14 30 Q15 22 17 30" stroke="#7ac43a" stroke-width="1.5" fill="none"/>
  <path d="M22 30 Q23 25 24 30" stroke="#8ed44a" stroke-width="1.5" fill="none"/>
  <path d="M30 30 Q32 23 33 30" stroke="#7ac43a" stroke-width="1.5" fill="none"/>
  <path d="M38 30 Q39 26 41 30" stroke="#7ac43a" stroke-width="1.5" fill="none"/>
  <path d="M10 30 Q11 26 12 30" stroke="#8ed44a" stroke-width="1.2" fill="none"/>
  <path d="M26 30 Q27 24 29 30" stroke="#7ac43a" stroke-width="1.2" fill="none"/>
  <path d="M36 30 Q37 27 38 30" stroke="#8ed44a" stroke-width="1.2" fill="none"/>
</svg>`;

window.SPRITES = { svgYoshi, SVG_OEUF, SVG_NID, SVG_MUR, SVG_HERBE };
