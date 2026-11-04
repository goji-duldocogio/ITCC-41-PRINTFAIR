# PrintFair - Mobile UI and PC Retrieval

PrintFair includes student screens, admin screens, and a supporting desktop retrieval webpage. The provided data and interactions use browser-local storage until a shared backend is connected.

## Run in a browser

1. Extract this folder.
2. Open a terminal in this folder.
3. Run one of the following:

```bash
   py -m http.server 8765 --directory www
   ```

   If `py` is unavailable, use `python -m http.server 8765 --directory www`.

4. Open http://localhost:8765/index.html for the mobile interface.
5. Open http://localhost:8765/kiosk.html for the retrieval PC interface.

Use the **same browser profile** for both pages in the local version; the pages share request state via `localStorage`, not a remote database.

For a phone-sized preview in desktop Chrome, press F12, then Ctrl+Shift+M, and select a phone width around 390px.

## Included files

* `www/index.html` - mobile UI entry point
* `www/app.js` - navigation and sample request/state logic
* `www/styles.css` - mobile UI design
* `www/kiosk.html` - PC retrieval webpage
* `www/kiosk.js` - one-time code validation and retrieval state
* `www/kiosk.css` - PC retrieval design
* `www/assets/` - supplied logo, app icon, and sample PDF
* `config.xml`, `package.json` - Cordova-ready project metadata
* `smoke\_test.js` - automated request-history and allowance checks (run with `node smoke\_test.js`)
* `PROGRESS\_REPORT.md` and `.pdf` - project progress documentation

