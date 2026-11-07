# PrintFair — Milestone 3 Implementation Notes

## Implemented in this source revision

1. Replaced the fixed sample PDF count with PDF.js inspection of the selected file. The app checks file size, extension/MIME, PDF header, parse success, password-protection errors, and the actual page count.
2. Added reusable page-range validation and automated range/allowance smoke tests.
3. Moved local demo PDF bytes into IndexedDB instead of saving file data in `localStorage`.
4. Added an optional Supabase integration for account authentication, student/staff roles, shared requests, station data, private PDF upload, cancellation, corrections, one-time kiosk code consumption, short-lived signed PDF links, and realtime refresh.
5. Added database-side checks for page-range boundaries, one active request per student, and the daily 20-page allowance.
6. Added student registration using `@my.xu.edu.ph` addresses and real sign-in/password recovery when Supabase is configured.
7. Added staff-only kiosk sign-in in cloud mode and station selection from shared station records.
8. Added setup documentation and identified items that still require deployment, configuration, or live testing.

## Screen list and responsibility

| Area | Screens | Purpose |
|---|---|---|
| Student | Login / Registration | Authenticate XU student accounts |
| Student | Dashboard | View remaining allowance, station status, active request |
| Student | Upload PDF | Select and validate a real PDF |
| Student | Review & Submit | Configure page ranges and reserve pages |
| Student | My Requests / Retrieval Code | Track request and use the code at the library PC |
| Student | Allowance / History | Review recorded page usage and past requests |
| Shared | Printing Stations | Show staff-maintained station availability |
| Admin | Dashboard | View request and station overview |
| Admin | Station Management | Add stations and update availability |
| Admin | Transactions / Details | Search, inspect, and correct request records |
| Kiosk | Staff Sign-in / Retrieval | Authenticate staff, validate code, open private PDF |

## Main data handled

- Profile: authentication ID, full name, display name, XU email, year level, program, role.
- Station: ID, name, floor/location, status, reason, last update, updater.
- Request: request ID, student identity snapshot, file name, private storage path, actual page count from browser parsing, selected range, requested page count, counted pages, status, code, station, request/retrieval timestamps, expiry, reason, history.

## Manual test plan still required after backend setup

| Test | Expected result |
|---|---|
| Select valid multi-page PDF | Parser reports its actual page count |
| Select empty/non-PDF/corrupt/password-protected file | Upload is rejected with a clear message |
| Ranges `1-5`, `1,3,5`, `2-4,7` | Accepted with 5, 3, and 4 pages selected |
| Ranges `0-3`, `8-4`, letters, or beyond document | Rejected |
| Request above remaining daily allowance | Rejected by UI and database function |
| Second active request | Rejected |
| Cancel active request | Status becomes Cancelled, reserved pages are released, cloud file removal is attempted |
| Valid/unknown/expired/used kiosk code | Valid code retrieves once; other cases show an error; expired status is saved |
| Valid kiosk retrieval | Request history changes and private PDF link opens |
| Admin station change | Student/kiosk station status refreshes in cloud mode |
| Admin search/correction | Matching records appear; correction requires a reason and obeys allowance checks |

## Validation run on this package

- `node --check` passed for `app.js`, `backend.js`, `storage.js`, `domain.js`, and `kiosk.js`.
- `node tests/printfair-smoke-test.js` passed.
- Supabase SQL and browser interactions still require execution in a real Supabase project and browser/device environment. This package alone does not prove those integration tests passed.
