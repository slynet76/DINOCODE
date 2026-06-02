// Envoie un message structuré à React Native via le bridge WebView.
function envoyerARN(message) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }
}

// Reçoit le niveau à charger depuis RN.
// Note : sur Android, ReactNativeWebView dispatch sur document, et cet event bulle vers
// window. On appelle stopPropagation() pour éviter le double-fire (chargerNiveau 2×).
function ecouterRN(onNiveau) {
  function handler(event) {
    if (event.stopPropagation) event.stopPropagation();
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'charger_niveau') onNiveau(msg.niveau);
    } catch (e) { /* message non-JSON ignoré */ }
  }
  document.addEventListener('message', handler); // Android (capture avant bubble)
  window.addEventListener('message', handler);   // iOS/dev
}

window.pont = { envoyerARN, ecouterRN };
