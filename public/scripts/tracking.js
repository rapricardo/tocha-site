/**
 * Target AI — Script de captura e tracking (padrão ApexMkt GTM)
 * Captura UTMs, click IDs, cookies Meta, dados de sessão.
 * Persiste em sessionStorage e expõe via window.__wlTracking.
 * Popula hidden fields (se existirem) e enriquece links CTA com params.
 */
(function () {
  "use strict";

  // === Utilitários ===
  function getParam(name) {
    var match = RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
    return match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : "";
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : "";
  }

  function generateSessionId() {
    return Date.now().toString(36) + "." + Math.random().toString(36).substring(2, 10);
  }

  // === Coleta de dados (1x por sessão) ===
  var STORAGE_KEY = "__wl_tracking";
  var urlParams = [
    "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
    "gclid", "gbraid", "wbraid", "gad_campaignid", "gad_source",
    "fbclid",
    "ttclid", "msclkid", "li_fat_id", "twclid", "sck",
    "ref"
  ];

  var stored = null;
  try { stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY)); } catch (e) { }

  if (!stored) {
    stored = {};
    urlParams.forEach(function (p) {
      var val = getParam(p);
      if (val) stored[p] = val;
    });

    // Facebook cookies
    var fbc = getCookie("_fbc");
    var fbp = getCookie("_fbp");
    if (fbc) stored.fbc = fbc;
    if (fbp) stored.fbp = fbp;
    if (stored.fbclid && !stored.fbc) {
      stored.fbc = "fb.1." + Date.now() + "." + stored.fbclid;
    }

    // Session data
    stored.landing_page = window.location.href;
    stored.originPage = window.location.href;
    stored.referrer = document.referrer || "";
    stored.user_agent = navigator.userAgent;
    stored.first_visit = new Date().toISOString();
    stored.session_id = generateSessionId();

    // Encode session attributes
    var attrs = {};
    urlParams.forEach(function (p) { if (stored[p]) attrs[p] = stored[p]; });
    try { stored.session_attributes_encoded = btoa(JSON.stringify(attrs)); } catch (e) { }

    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored)); } catch (e) { }
  }

  // === Expor globalmente ===
  window.__wlTracking = stored;

  // === Setar cookie _fbc se necessário ===
  if (stored.fbclid) {
    var fbcVal = stored.fbc || ("fb.1." + Date.now() + "." + stored.fbclid);
    document.cookie = "_fbc=" + encodeURIComponent(fbcVal)
      + ";max-age=" + (90 * 24 * 60 * 60) + ";path=/;SameSite=Lax";
  }

  // === Preencher hidden fields (se existirem) ===
  function populateHiddenFields() {
    var fields = [
      "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
      "gclid", "gbraid", "wbraid", "gad_campaignid", "gad_source",
      "fbclid", "fbc", "fbp",
      "ttclid", "msclkid", "li_fat_id", "twclid", "sck",
      "landing_page", "referrer", "user_agent", "first_visit",
      "session_id", "session_attributes_encoded", "originPage", "ref"
    ];
    fields.forEach(function (f) {
      var el = document.getElementById("h_" + f);
      if (el && stored[f]) el.value = stored[f];
    });
  }

  // === Enriquecer links CTA com params de tracking ===
  function enrichCtaLinks() {
    var links = document.querySelectorAll("a.cta-link");
    if (!links.length) return;

    var trackingParams = [
      "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
      "gclid", "gbraid", "wbraid", "gad_campaignid", "gad_source",
      "fbclid", "fbc", "fbp",
      "ttclid", "msclkid", "li_fat_id", "twclid", "sck",
      "ref", "session_id"
    ];

    links.forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href) return;

      try {
        var url = new URL(href);
        trackingParams.forEach(function (p) {
          if (stored[p]) url.searchParams.set(p, stored[p]);
        });
        link.setAttribute("href", url.toString());
      } catch (e) { }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      populateHiddenFields();
      enrichCtaLinks();
    });
  } else {
    populateHiddenFields();
    enrichCtaLinks();
  }
})();
