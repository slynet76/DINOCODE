// Envoie un message structuré à React Native via le bridge WebView.
function envoyerARN(message) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }
}

// Reçoit le niveau à charger depuis RN.
function ecouterRN(onNiveau) {
  function handler(event) {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'charger_niveau') onNiveau(msg.niveau);
    } catch (e) { /* message non-JSON ignoré */ }
  }
  document.addEventListener('message', handler); // Android
  window.addEventListener('message', handler);   // iOS/dev
}

window.pont = { envoyerARN, ecouterRN };
