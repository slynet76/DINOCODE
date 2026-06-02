// sprites.js — Sprites SVG Yoshi style épuré (Material-friendly)
// Designs propres, lisibles sur fond clair, sans surcharge décorative.

const ROTATION = { droite: 0, bas: 90, gauche: 180, haut: 270 };

// ─── Yoshi vert (design clean) ───────────────────────────────────────────────
function svgYoshi(direction) {
  const deg = ROTATION[direction] || 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"
    style="width:100%;height:100%;transform:rotate(${deg}deg);transition:transform 0.15s ease;display:block">
    <!-- Ombre légère -->
    <ellipse cx="24" cy="46" rx="13" ry="2.5" fill="rgba(0,0,0,0.12)"/>
    <!-- Corps -->
    <ellipse cx="20" cy="31" rx="13" ry="11" fill="#4caf50"/>
    <!-- Ventre -->
    <ellipse cx="20" cy="33" rx="8.5" ry="7.5" fill="#c8e6c9"/>
    <!-- Piques dos -->
    <polygon points="10,22 7,15 13,21" fill="#388e3c"/>
    <polygon points="17,19 14,12 20,18" fill="#388e3c"/>
    <polygon points="24,18 22,11 27,17" fill="#388e3c"/>
    <!-- Tête -->
    <ellipse cx="32" cy="22" rx="11" ry="10" fill="#4caf50"/>
    <!-- Oeil -->
    <ellipse cx="35" cy="19" rx="4.5" ry="5" fill="white"/>
    <ellipse cx="36" cy="19" rx="2.5" ry="3" fill="#1a237e"/>
    <ellipse cx="35" cy="17.5" rx="1.2" ry="1.2" fill="white"/>
    <!-- Nez -->
    <ellipse cx="41" cy="24" rx="4.5" ry="3.5" fill="#ff8f00"/>
    <ellipse cx="42.5" cy="23" rx="1" ry="0.8" fill="#e65100"/>
    <!-- Joue -->
    <ellipse cx="36" cy="23" rx="3" ry="2" fill="#ef9a9a" opacity="0.5"/>
    <!-- Bras -->
    <ellipse cx="9" cy="31" rx="4.5" ry="6.5" fill="#4caf50" transform="rotate(-20 9 31)"/>
    <!-- Chaussures rouges -->
    <ellipse cx="14" cy="43" rx="6.5" ry="4" fill="#e53935"/>
    <ellipse cx="27" cy="43" rx="6.5" ry="4" fill="#e53935"/>
    <ellipse cx="14" cy="44.5" rx="5.5" ry="2.2" fill="#b71c1c"/>
    <ellipse cx="27" cy="44.5" rx="5.5" ry="2.2" fill="#b71c1c"/>
    <!-- Queue -->
    <ellipse cx="7" cy="26" rx="4.5" ry="3" fill="#4caf50" transform="rotate(-35 7 26)"/>
  </svg>`;
}

// ─── Œuf Yoshi (design épuré) ────────────────────────────────────────────────
const SVG_OEUF = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"
  style="width:100%;height:100%;display:block">
  <ellipse cx="24" cy="45" rx="11" ry="2" fill="rgba(0,0,0,0.10)"/>
  <ellipse cx="24" cy="26" rx="15" ry="18" fill="#f5f5f5"/>
  <!-- Taches étoilées vertes -->
  <path d="M16 19 L17.5 23 L13.5 25.5 L17.5 25.5 L18.5 30 L20.5 25.5 L24.5 26.5 L21.5 23 L23 18.5 L20 22Z" fill="#66bb6a" opacity="0.9"/>
  <path d="M28 13 L29 16.5 L26 18 L29.5 18 L30 21.5 L31.5 18 L34.5 18.5 L32 16 L33 13 L31 15Z" fill="#66bb6a" opacity="0.9"/>
  <path d="M13 31 L14 34 L11.5 35.5 L14.5 35.5 L15 38.5 L16.5 35.5 L19 36 L17 34 L18 31 L16 33Z" fill="#66bb6a" opacity="0.75"/>
  <path d="M31 31 L32 34 L29.5 35.5 L32.5 35.5 L33 38 L34 35.5 L36.5 36 L35 34 L36 31 L34 33Z" fill="#66bb6a" opacity="0.7"/>
  <!-- Reflet -->
  <ellipse cx="19" cy="16" rx="4" ry="5" fill="white" opacity="0.4"/>
  <!-- Contour subtil -->
  <ellipse cx="24" cy="26" rx="15" ry="18" fill="none" stroke="#bdbdbd" stroke-width="1"/>
</svg>`;

// ─── Nid / objectif ──────────────────────────────────────────────────────────
const SVG_NID = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"
  style="width:100%;height:100%;display:block">
  <!-- Étoile (objectif) -->
  <polygon points="24,5 27.5,15.5 39,15.5 29.5,22 33,33 24,26.5 15,33 18.5,22 9,15.5 20.5,15.5"
    fill="#ffc107" stroke="#ff8f00" stroke-width="1" stroke-linejoin="round"/>
  <polygon points="24,8 27,16.5 37,16.5 29,21.5 32,31 24,25.5 16,31 19,21.5 11,16.5 21,16.5"
    fill="#ffe082"/>
  <!-- Reflet -->
  <ellipse cx="20.5" cy="14" rx="3" ry="2" fill="white" opacity="0.35"/>
  <!-- Nid -->
  <ellipse cx="24" cy="43" rx="13" ry="4.5" fill="#8d6e63"/>
  <path d="M12 43 Q18 38 24 41 Q30 38 36 43" stroke="#5d4037" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M13 44.5 Q20 40 24 42 Q28 40 35 44.5" stroke="#a1887f" stroke-width="1.5" fill="none" stroke-linecap="round"/>
</svg>`;

// ─── Mur / obstacle ───────────────────────────────────────────────────────────
const SVG_MUR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"
  style="width:100%;height:100%;display:block">
  <ellipse cx="24" cy="46" rx="13" ry="2" fill="rgba(0,0,0,0.15)"/>
  <!-- Rocher principal -->
  <ellipse cx="23" cy="28" rx="17" ry="15" fill="#9e9e9e"/>
  <ellipse cx="21" cy="26" rx="17" ry="15" fill="#bdbdbd"/>
  <!-- Texture -->
  <ellipse cx="15" cy="23" rx="4" ry="3" fill="#9e9e9e" opacity="0.5"/>
  <ellipse cx="27" cy="19" rx="3" ry="2.5" fill="#9e9e9e" opacity="0.4"/>
  <ellipse cx="22" cy="32" rx="5" ry="3" fill="#9e9e9e" opacity="0.4"/>
  <!-- Petits rochers -->
  <ellipse cx="9" cy="39" rx="7" ry="5" fill="#8a8a8a"/>
  <ellipse cx="36" cy="38" rx="6" ry="5" fill="#8a8a8a"/>
  <!-- Reflet -->
  <ellipse cx="15" cy="19" rx="5" ry="4" fill="white" opacity="0.2"/>
  <ellipse cx="21" cy="26" rx="17" ry="15" fill="none" stroke="#757575" stroke-width="1"/>
</svg>`;

// ─── Case vide (herbe épurée) ─────────────────────────────────────────────────
const SVG_HERBE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"
  style="width:100%;height:100%;display:block">
  <!-- Sol -->
  <rect x="0" y="32" width="48" height="16" fill="#81c784"/>
  <!-- Ligne de sol -->
  <line x1="0" y1="32" x2="48" y2="32" stroke="#66bb6a" stroke-width="1.5"/>
  <!-- Brins d'herbe -->
  <path d="M7 32 Q8 26 9 32" stroke="#4caf50" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M15 32 Q16 24 18 32" stroke="#4caf50" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M23 32 Q24 27 25 32" stroke="#66bb6a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M31 32 Q33 25 34 32" stroke="#4caf50" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M39 32 Q40 28 42 32" stroke="#4caf50" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M11 32 Q12 28 13 32" stroke="#66bb6a" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  <path d="M27 32 Q28 26 30 32" stroke="#4caf50" stroke-width="1.2" fill="none" stroke-linecap="round"/>
</svg>`;

window.SPRITES = { svgYoshi, SVG_OEUF, SVG_NID, SVG_MUR, SVG_HERBE };
