// Ponte Android (Capacitor): espone window.sigillatoreDesktop alle pagine del Banco e del Mazzo.
// Capacitor inietta window.Capacitor prima di questo script; CapacitorHttp (attivo in capacitor.config.json)
// permette a fetch() di scaricare le pagine di Golarion senza blocchi del browser.
(function () {
  const Cap = window.Capacitor;
  if (!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) return;
  const P = Cap.Plugins;
  function htmlATesto(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const radice = doc.querySelector("#mw-content-text .mw-parser-output") || doc.querySelector("#mw-content-text") || doc.body;
    radice.querySelectorAll("script,style,noscript,.mw-editsection,.toc").forEach(e => e.remove());
    const BLOCCHI = new Set(["P","DIV","BR","TR","LI","H1","H2","H3","H4","H5","H6","TABLE","UL","OL","DL","DT","DD","HR","CENTER"]);
    let out = "";
    (function giro(n) {
      for (const c of n.childNodes) {
        if (c.nodeType === 3) out += c.nodeValue.replace(/\s+/g, " ");
        else if (c.nodeType === 1) {
          if (c.tagName === "BR") { out += "\n"; continue; }
          if (c.tagName === "TD" || c.tagName === "TH") { giro(c); out += "\t"; continue; }
          const b = BLOCCHI.has(c.tagName); if (b) out += "\n"; giro(c); if (b) out += "\n";
        }
      }
    })(radice);
    const titolo = ((doc.querySelector("#firstHeading") || {}).textContent || "").trim();
    return (titolo ? titolo + "\n" : "") + out.split("\n").map(r => r.replace(/[ \t]+$/g, "").replace(/^ +/, "")).filter((r, i, a) => r || (a[i - 1] || "")).join("\n");
  }
  function base64(buf) {
    const b = new Uint8Array(buf); let s = ""; const K = 0x8000;
    for (let i = 0; i < b.length; i += K) s += String.fromCharCode.apply(null, b.subarray(i, i + K));
    return btoa(s);
  }
  window.sigillatoreDesktop = {
    async fetchPagina(url) {
      if (!/^https?:\/\/golarion\.altervista\.org\//i.test(url)) throw new Error("link");
      const r = await P.CapacitorHttp.get({ url, headers: { "User-Agent": "Mozilla/5.0 (Linux; Android) Sigillatore" }, responseType: "text" });
      if (r.status >= 400 || !r.data) throw new Error("download " + r.status);
      return htmlATesto(typeof r.data === "string" ? r.data : String(r.data));
    },
    // salva il file e apre la condivisione di Android (salva in File/Drive, stampa, invia su WhatsApp...)
    async salvaFile(nome, arrayBuffer) {
      const data = base64(arrayBuffer);
      const res = await P.Filesystem.writeFile({ path: nome, data, directory: "CACHE" });
      try { await P.Filesystem.writeFile({ path: "Sigillatore/" + nome, data, directory: "DOCUMENTS", recursive: true }); } catch (e) { /* copia in Documenti non consentita su questo telefono */ }
      try { await P.Share.share({ title: nome, url: res.uri, dialogTitle: "Salva o invia " + nome }); }
      catch (e) { if (!/cancel/i.test(String(e && e.message))) throw e; }
      return nome;
    },
    async salvaDati(txt) { await P.Preferences.set({ key: "mazzo", value: txt }); },
    async caricaDati() { const r = await P.Preferences.get({ key: "mazzo" }); return r && r.value; }
  };
})();
