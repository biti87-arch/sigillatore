# Sigillatore per Android

App Android con il **Banco del Sigillatore** e il **Mazzo del Sigillatore** (Collana v2.4).

## Scaricare e installare l'app
1. Apri la pagina **Releases** di questo repository dal telefono.
2. Tocca il file `Sigillatore-N.apk` dell'ultima versione per scaricarlo.
3. Aprilo dalle notifiche o dalla cartella Download. Android chiederà di consentire l'installazione da questa fonte: consentila solo per il browser che hai usato.
4. Le versioni successive si installano sopra la precedente e i dati del Mazzo restano.

## Come nasce l'APK
Ogni volta che si aggiorna il ramo `main`, GitHub Actions compila l'app (file `.github/workflows/apk.yml`) e pubblica una nuova release con l'APK. Si può avviare anche a mano da **Actions → Crea APK Android → Run workflow**.

## Struttura
- `www/` — le pagine dell'app (banco.html, mazzo.html), jsPDF e font locali, `js/bridge.js` (download da Golarion, salvataggio file, dati del Mazzo).
- `android/` — progetto Android generato da Capacitor 6.
- `android/app/sigillatore.keystore` — chiave di firma: serve per installare gli aggiornamenti sopra la versione precedente. Non cancellarla.
