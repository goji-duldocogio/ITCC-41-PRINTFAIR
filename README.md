# PrintFair — Student Printing Requests + Library PC Retrieval

PrintFair is a Cordova-ready mobile web application for preparing printing requests before students visit the XU Library. Students upload a PDF, choose page ranges, submit a request, and receive a retrieval code. Library staff manage station availability and transaction records, then use the PC retrieval page to retrieve the private PDF. The library's existing printing process, physical logbook, paper requirement, and 20-page daily rule remain in place.

## Run the local demo

1. Extract the project.
2. Open a terminal in the project folder.
3. Run `py -m http.server 8765 --directory www` (or `python -m http.server 8765 --directory www`).
4. Open `http://localhost:8765/index.html` for the app and `http://localhost:8765/kiosk.html` for the kiosk page.
5. In local demo mode, use the same browser profile and origin for both pages. Request metadata is stored in `localStorage`; PDF bytes are stored in IndexedDB. This is a demonstration only and does not sync a phone with a separate library PC.

The local demo login is not real authentication. It exists so the prototype screens can be tested. Sample records and the sample PDF are demo data.

## Enable the shared backend (Supabase)

The project now includes a Supabase adapter, database schema, authentication flow, private PDF bucket, server-side request checks, and realtime subscriptions. **It is not connected until the following setup is completed.**

1. Create a Supabase project.
2. Open the Supabase SQL Editor and run `supabase/printfair.sql`.
3. In Authentication settings, enable email/password sign-in and set the allowed redirect URLs for your hosted app.
4. In `www/backend-config.js`, replace `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your project's URL and publishable/anon key. The app uses a browser-safe publishable key. **Never put a `service_role` key in this file.**
5. In Database → Publications, enable `print_requests` and `stations` in `supabase_realtime` so connected student/admin screens refresh when requests or station statuses change.
6. Create or invite student accounts using the registration screen. The project SQL creates a student profile on sign-up. Email confirmation may need to be completed before sign-in, depending on your Supabase Auth settings.
7. Create the library staff account in Supabase Auth, then assign its profile the `admin` role from the SQL Editor, replacing the email below:

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'library.staff@xu.edu.ph';
   ```

8. If you already created Auth users before running the SQL script, create their missing profiles (then manually assign the staff role):

   ```sql
   insert into public.profiles (id, full_name, display_name, email, role)
   select id,
          coalesce(raw_user_meta_data->>'full_name', ''),
          coalesce(raw_user_meta_data->>'display_name', raw_user_meta_data->>'full_name', ''),
          coalesce(email, ''),
          'student'
   from auth.users
   on conflict (id) do nothing;
   ```

9. Host the `www` folder over HTTPS for real phone/PC use. The same Supabase project is used by the mobile app and the separate library PC webpage. Do not rely on opening files directly with `file://` for cloud mode.

### What the shared backend stores

- **Auth/profile:** authenticated student and authorized staff identities; students can create their own account, while staff role assignment is controlled by the project owner.
- **Database:** station status, print requests, allowance counts, retrieval status, timestamps, and request history.
- **Private Storage:** uploaded PDFs in a non-public `print-documents` bucket. Student uploads are restricted to that student's folder. Staff can create a short-lived signed link after a successful retrieval-code check.
- **Request rules:** the database rechecks page-range syntax, active-request status, and the 20-page daily allowance. A partial unique index prevents two active requests for one student.

The client uses Supabase Auth, Postgres, Storage, and Realtime through `@supabase/supabase-js` v2. PDF page inspection uses PDF.js 3.11.174. Those browser libraries are loaded from their CDNs, so the first load requires internet access. Supabase setup instructions: [Supabase JavaScript installation](https://supabase.com/docs/reference/javascript/installing) and [initializing a client](https://supabase.com/docs/reference/javascript/initializing). PDF.js usage guide: [Mozilla PDF.js Getting Started](https://mozilla.github.io/pdf.js/getting_started/).

## Main flows

### Student

Sign in → check the remaining allowance and station statuses → select a PDF → validate the PDF and read its actual page count → enter page range(s) → review the reserved page total → submit → view the retrieval code and request history → cancel before retrieval when needed.

### Library staff / kiosk

Staff sign in → choose an operational station → enter the student's code → the backend checks that the code exists, is unused, and has not expired → mark the request as Retrieved → create a short-lived link to the private PDF → open it on the library PC. The app records retrieval, not physical printing.

### Admin

Sign in as staff → view dashboard and transactions → search student/document records → update station status → inspect a request → correct the record with a required reason. Changes are written to the shared database in cloud mode.

## Tests

Run the dependency-free page-range/allowance tests with:

```bash
node tests/printfair-smoke-test.js
```

The smoke test covers the requested examples: `1-5`, `1,3,5`, `2-4,7`, `0-3`, `8-4`, letters, and ranges beyond the document. It also checks allowance decisions. It does **not** replace manual browser testing of PDF uploads, authentication, Supabase RLS, file delivery, or mobile/Cordova builds.

## Included project files

- `www/index.html`, `www/app.js`, `www/styles.css` — mobile/student and admin application.
- `www/domain.js` — shared page-range and allowance validation rules.
- `www/storage.js` — IndexedDB file storage for the local demo.
- `www/backend-config.js`, `www/backend.js` — Supabase configuration and integration.
- `www/kiosk.html`, `www/kiosk.js`, `www/kiosk.css` — library PC retrieval page.
- `supabase/printfair.sql` — database tables, RLS policies, private bucket, and RPCs.
- `tests/printfair-smoke-test.js` — automated logic smoke tests.

## Known remaining limitations

- The Supabase backend must be created and configured by the group; this source package does not contain your project credentials or prove a live deployment.
- PDF.js reads the file in the browser and the database rechecks the submitted page count/range, but the server does not independently parse the uploaded PDF. A determined user could tamper with client-supplied page-count metadata; trusted server-side PDF parsing (for example, an Edge Function) is a further hardening step.
- Successful kiosk retrieval is recorded, but PrintFair cannot confirm how many pages were physically printed. Staff must confirm/correct the transaction record as required by the library workflow.
- There is no direct printer hardware control or print-server integration. Students continue using the library's existing computers and printers.
- Automatic end-of-day deletion of all stored PDFs is not scheduled yet. Cancelled cloud requests attempt immediate file removal; a scheduled retention/cleanup job still needs to be configured and tested.
- Staff accounts and roles must be provisioned by the project owner. XU single sign-on is not integrated.
- Realtime screen updates require enabling the listed tables in the Supabase Realtime publication. Without that, users can still load shared records by refreshing.
- A real deployment still needs manual end-to-end testing on Android/Cordova and the actual library PC environment.
