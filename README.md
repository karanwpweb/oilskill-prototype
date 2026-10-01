# OilSkill: Web Demo Prototype

Pre-sale prototype of the **OilSkill Online Intelligence & Membership Platform** (Mozambique oil & gas), prepared by WPWeb Infotech for the client's demo evaluation.

- **Demo submission:** Monday 5 October 2026
- **Walkthrough meeting:** Thursday 8 October 2026, 14:00 CAT (17:30 IST)

The prototype is plain HTML/CSS/JavaScript: no build step, no server code, no database. It has two parts:

| Part | File | What it is |
|---|---|---|
| Public website | `prototype/index.html` | The OilSkill site in English, Portuguese and French |
| Demo backend | `prototype/admin.html` | A look-alike of the WordPress admin showing every back-office feature |

The website and the backend share the same browser storage. **What you change in the backend appears on the website straight away, in the same browser.**

---

## 1. Login details

### Backend (WordPress admin look-alike): `admin.html`

| Role | Username / email | Password | Can do |
|---|---|---|---|
| **Administrator** | `admin@oilskill-demo.test` | `Admin@2026` | Everything, including Users, Settings and Payment settings |
| Editor (content & data reviewer) | `editor@oilskill-demo.test` | `Editor@2026` | Content, homepage, data sync, members (no Users or Settings menus, so cannot reset demo data) |

### Website member accounts: `index.html` → Log in

All member accounts use the password **`Member@2026`**.

| Email | Membership state | Use it to show |
|---|---|---|
| `pro@oilskill-demo.test` | Professional, active (monthly) | Premium content unlocked, dashboard, billing, cancel |
| `free@oilskill-demo.test` | Registered (free) | Premium content locked, "upgrade" prompts |
| `cancelled@oilskill-demo.test` | Cancelled, access until period end | Access kept until the paid period ends |
| `expired@oilskill-demo.test` | Expired | Access removed, "renew" prompts |
| `corporate@oilskill-demo.test` | Corporate, active | Corporate plan |
| `failed@oilskill-demo.test` | Payment failed / pending | Failed payment notice and retry |

Shortcut: the website's **Demo guide** page (footer → Demo guide, or `index.html#/en/guide`) has **Log in as** buttons for every account.

> These are demo-only test accounts. They exist only inside the prototype (in the browser) and are not connected to any real system.

---

## 2. What's built in the prototype

Everything below exists and can be clicked. Website links use the language prefix (`#/en/`, `#/pt/`, `#/fr/`): replace `en` with `pt` or `fr` to open the same page in another language.

### 2.1 Website pages (`index.html`)

| # | Page | Link | What it contains |
|---|---|---|---|
| 1 | **Home** | `#/en/` | Hero banner with Mozambique FLNG illustration, search box, key figures, latest opportunities, Mozambique gas projects (Coral Sul FLNG, Mozambique LNG, Rovuma LNG, Pande & Temane), featured intelligence, audience cards, featured suppliers, news & upcoming webinars, membership + newsletter banner. Fully editable from the backend. |
| 2 | About OilSkill | `#/en/about` | Mission, industry focus, platform purpose, who we serve |
| 3 | Industry Intelligence (list) | `#/en/intel` | Search, filters (category, sector, date, free/premium), sorting, pagination |
| 4 | Intelligence detail | `#/en/intel/i1` | Report summary, key points, download button, source box (imported items), **premium lock** for non-members, related content |
| 5 | Business Opportunities (list) | `#/en/opps` | Search, filters (type, sector, location, status, date), sort by closing date, Open / Closing soon / Closed badges, days left |
| 6 | Opportunity detail | `#/en/opps/o1` | Description, organisation, dates, documents & how to apply (premium-locked on premium items) |
| 7 | Supplier Directory (list) | `#/en/suppliers` | Search, filters (service type, sector, location) |
| 8 | Supplier profile | `#/en/suppliers/sp1` | Overview, services, certifications, company facts; **contact details for members only** |
| 9 | News (list + detail) | `#/en/news`, `#/en/news/n1` | Category/date filters, article page, source attribution on imported news |
| 10 | Webinars (list + detail) | `#/en/webinars`, `#/en/webinars/w1` | Upcoming/Past tabs, speakers, date & time in Mozambique time, **registration form** or external Zoom/Teams link, recordings, members-only webinars |
| 11 | **Membership plans** | `#/en/membership` | Free / Professional (monthly or annual toggle) / Corporate plans, current-plan marker, FAQ |
| 12 | **Registration** | `#/en/register` | Full form with validation, password strength meter, terms consent, preferred language, plan choice |
| 13 | **Login** | `#/en/login` | Email + password, remember me, error message, redirect back to the page you came from |
| 14 | **Forgot / Reset password** | `#/en/forgot` → `#/en/reset` | Request link, open reset link (shown on screen in the demo), set new password |
| 15 | **Checkout** | `#/en/checkout/pro_monthly` | Order summary, recurring billing note, terms checkbox |
| 16 | **Payment gateway (simulated)** | opens from checkout | Sandbox payment page: *approved* card, *declined* card, or *cancel and return* |
| 17 | **Payment result** | after the gateway | Success (membership active) / Failed (nothing charged, retry) / Cancelled |
| 18 | **Member dashboard** | `#/en/account` | Plan, status, renewal/expiry date, notices (failed / cancelled / expired), premium content, my webinars, quick links |
| 19 | My profile | `#/en/account/profile` | Edit details, preferred language (emails follow it), change password |
| 20 | My subscription & billing | `#/en/account/billing` | Current plan, gateway token, payment history, **cancel subscription** (confirmation pop-up), change plan |
| 21 | Search results | `#/en/search?q=lng` | Site-wide search with content-type tabs and sector filter |
| 22 | Contact | `#/en/contact` | Contact form with validation and consent |
| 23 | Privacy Policy / Terms | `#/en/privacy`, `#/en/terms` | Draft placeholder pages (legal text to come from OilSkill) |
| 24 | Image credits | `#/en/credits` | Image register: subject, actual location, source, credit |
| 25 | **Demo guide** | `#/en/guide` | Test accounts with one-click login, walkthrough, working-vs-simulated table, reset button |
| 26 | Page not found | any wrong link | Translated 404 page |

On every page: header with **EN / PT / FR switcher**, mobile menu, footer (also with a language switcher), demo ribbon, cookie banner (accept / essential only), and a "this page is also available in…" banner when the browser language is Portuguese or French.

### 2.2 User flows (step by step)

| Flow | Steps |
|---|---|
| **A. Browse & search** | Home → search box or menu → list page → combine filters → open detail → related items |
| **B. Free registration** | Join OilSkill → fill form (errors shown in the selected language if wrong) → account created → welcome email (Mail Log) → Member dashboard |
| **C. Paid membership + payment** | Membership → Choose plan → Register (or Checkout if already logged in) → Order summary → tick terms → *Proceed to secure payment* → simulated gateway → **Approved**: success page, membership active, receipt email, premium unlocked · **Declined**: failed page, nothing activated, retry · **Cancel**: cancelled page |
| **D. Login** | Log in → wrong password shows an error → correct login → back to the page you were on (e.g. a locked report) |
| **E. Forgot password** | Forgot your password? → email → reset link appears (as it would in the email) → new password → log in |
| **F. Premium access** | Open a ★ Premium report as visitor (locked) → as free member (upgrade prompt) → as Professional (unlocked) → as expired member (renew prompt) |
| **G. Cancel subscription** | My subscription & billing → Cancel → confirm → status "Cancelled (access until …)" → access kept until that date → cancellation email |
| **H. Renewal / failed renewal / expiry** | Backend → MemberPress → Subscriptions → *Simulate renewal* / *Renewal fails* / *Cancel* → *Run expiry now* → log in as that member on the website to see the change |
| **I. Webinar registration** | Webinars → upcoming webinar → Register (name/email prefilled when logged in) → confirmation + email → appears in My webinars and in Backend → Registrations (CSV export). Members-only webinars ask non-members to log in or upgrade |
| **J. Contact** | Contact → form → thank-you message → Backend → Enquiries and Mail Log |
| **K. Supplier contact** | Supplier profile → contact details hidden for visitors/free members → shown for Professional/Corporate |
| **L. Change language** | Any page → EN / PT / FR → same page translated (menus, content, forms, errors, dates, currency); profile language controls email language |
| **M. Data sync (backend)** | Data Sync → Run now → live log → Review Queue → approve / edit / reject / approve + translate → item on website with Imported badge and source link → run again: duplicates skipped → test feed v2: update detected → broken: error logged + admin email |
| **N. Homepage editing (backend)** | Pages → Home → edit text per language, image, project cards, section order/visibility → Update → homepage and preview change |
| **O. Content editing (backend)** | Opportunities / Intelligence / Suppliers / News / Webinars → edit or Add New → Update → visible on the website (Draft hides it, Premium locks it, Trash removes it) |

### 2.3 Backend screens (`admin.html`)

| Menu | Screens |
|---|---|
| Login | WordPress-style login page |
| Dashboard | At a glance, memberships, data sync status, recent transactions, upcoming webinars, enquiries, language progress |
| Posts (News), Intelligence, Opportunities, Suppliers, Webinars | List (filters, search, status tabs, language column, Trash) + editor (language tabs, fields, Publish box, WPML box) |
| Webinars → Registrations | List, filter, CSV export |
| Media | Image register |
| Pages | Page list; **Home** opens the homepage editor |
| Enquiries | Contact form entries |
| Data Sync | Sources (run now, cron, test feed versions), source detail (config, selectors, mapping, raw data), Review Queue, Logs |
| MemberPress | Members, Memberships (plans + access rules), Subscriptions (lifecycle actions), Transactions (refund), Settings › Payments |
| WPML | Languages, Translation Management, String Translation (editable PT/FR) |
| Users | Backend users + role permissions |
| Mail Log | All emails, previewed in the recipient's language |
| Settings | Reset demo data, production plugin list |

---

## 3. Run or host it

**Local (for practice):**

```bash
python -m http.server 8765 --directory prototype
```

Open http://localhost:8765 (website) and http://localhost:8765/admin.html (backend).

**For the client:** upload the contents of the `prototype/` folder to any static host, such as a folder on the WPWeb staging server, Netlify (drag and drop), or Cloudflare Pages. Send the client the website link plus the login details above. GitHub Pages also works, but only for a public repository or a paid GitHub plan.

After uploading a new version, press **Ctrl + F5** once in your browser so it loads the latest files.

---

## 4. ⚠️ Read before presenting (avoid mistakes)

1. **Use one browser for everything.** Data is stored in the browser you use. Edits made in Chrome won't appear in Edge, on another computer, or on the client's machine. Present the backend and the website in **two tabs of the same browser**.
2. **Start from a clean state.** Just before the meeting, open the backend → **Settings → Reset demo data** (or website → Demo guide → Reset demo data). This restores all sample content, accounts, the homepage and translations.
3. **Don't use a private/incognito window.** It forgets everything when closed.
4. **Click "Update" after every edit.** The homepage editor warns about unsaved changes; the other editors don't.
5. **Edit English first.** If a Portuguese or French field is empty, the site shows the English text.
6. **The backend and website logins are separate.** Logging into the backend doesn't log you into the website. To show premium content on the site, log in there as `pro@oilskill-demo.test`.
7. **Data sync, second run:** running the same source twice shows *duplicates skipped*. That's the intended demonstration. To show fresh imports again, reset demo data.
8. **Use the right words:**
   - The payment page is a **simulated sandbox gateway**, not a live payment.
   - Pictures are **illustrated placeholders** until licensed photos are added (see section 9).
   - Organisations in opportunities and suppliers are **fictional sample data**.
   - Portuguese and French texts are **machine-assisted and pending professional review**.
   - Everything simulated is labelled on screen (SAMPLE, SIMULATED, ILLUSTRATIVE). Say so; don't claim it's live.
9. **Passwords for new registrations** need at least 8 characters, a number and a capital letter (e.g. `Demo@2026`). Registering an email that already exists shows an error on purpose.
10. **Don't change Users, Payments, Media or Memberships during the demo.** Those screens are view-only (section 6).

---

## 5. What you CAN edit in the backend and where it shows on the website

Log in to `admin.html` as Administrator. Every item below has been tested: change it, click **Update/Save**, then refresh the website tab.

### 5.1 Pages → **Home** (homepage editor) ✅ fully editable

Open: **Pages → Home**, or **✎ Edit Home** in the top bar, or the blue **✎ Edit this page** button on the homepage (visible while you're logged in to the backend).

| What you can change | Where it shows |
|---|---|
| Hero: small label, main heading, intro text | Top banner of the homepage |
| Hero: primary and secondary button labels **and** which page each button opens | Buttons in the top banner |
| Hero: show/hide the search box, search placeholder text | Search box in the top banner |
| Hero: background image (pick from Media list) or a custom image path, caption/credit | Banner background and the caption in its top-right corner |
| Each section's small label, heading and intro text | Section titles down the homepage |
| How many opportunities / suppliers / intelligence / news / webinars are shown | Number of cards in each section |
| Featured intelligence: *latest* or *hand-picked* reports | "Featured intelligence" cards |
| Mozambique project cards: name, operator, location, image, description; add, remove, reorder | "Mozambique's major gas developments" section |
| Membership banner: heading, text, button label; show/hide the newsletter box | Dark banner near the bottom |
| **Sections box:** untick to hide a section, ↑ ↓ to reorder | Order and visibility of homepage sections |

**Languages:** use the **English / Português / Français** tabs at the top of the editor. Each tab shows how many fields are still empty. **Fill empty PT/FR from English** inserts placeholder drafts marked `[PT MT]` / `[FR MT]` (simulated machine translation); replace them with proper text before showing the client.

**Live preview** at the bottom: switch EN/PT/FR and Desktop/Mobile. It shows the *published* version and refreshes after **Update**.

**Restore default content** (Publish box) resets only the homepage.

### 5.2 Content lists ✅ editable

| Backend menu | What you can do | Where it shows on the website |
|---|---|---|
| **Posts (News)** | Add New, edit title and summary per language, category, sector, location, Published/Draft, Premium, Trash/Restore | News page, news detail, homepage "Latest news", search |
| **Intelligence** | Same as above, plus category, report type | Intelligence page and detail, homepage "Featured intelligence", search, member dashboard |
| **Opportunities** | Same, plus opportunity type, organisation, opening date, **closing date** | Opportunities page and detail, homepage. The status badge (Open / Closing soon / Closed) is calculated from the closing date |
| **Suppliers** | Company name, overview, services (checkboxes), city, certifications, year founded, employees, **Featured on homepage** | Supplier Directory and profile, homepage "Featured suppliers" (only ticked suppliers) |
| **Webinars** | Title, summary, **start date & time (Mozambique time)**, platform, registration mode (on-site form / external link), external URL, recording URL | Webinars page (Upcoming/Past tabs), webinar detail, homepage "Upcoming webinars" |

How to use the content editor:
- **Language:** tabs above the title (English / Português / Français). For Suppliers, use the **Language (WPML)** box on the right. If a translation is missing, a **Fill with machine translation (simulated)** button appears.
- **Premium** checkbox (Publish box) = members-only on the website. Visitors and free members see it locked.
- **Status → Draft** hides the item from the website. **Move to Trash** removes it; restore it from the list's **Trash** filter.
- **View on site ↗** (Publish box) opens the item on the website in the language you're editing.
- The list's **Languages** column shows which translations exist: green = translated, yellow = machine-translated, dashed = missing (click to add).

### 5.3 Data Sync ✅ interactive (main demo feature, 20 points)

| Screen | What you can do | Where it shows |
|---|---|---|
| **Data Sync → Sources** | **⟳ Run now** per source, or **Simulate scheduled cron run (all sources)**. Watch the live log. Source C has a **Test feed version** selector: `v1`, `v2` (one changed + one new item), `broken` (error) | Live run output, Logs |
| Click a source name | Configuration, CSS selectors, field mapping, raw source data preview | — |
| **Data Sync → Review Queue** | **Approve**, **Approve + translate**, **Edit mapping** (title, summary, sector, location, closing date) then approve, **Reject**, **Approve all** | Approved items appear on the website (News / Opportunities / Intelligence) with an **Imported** badge and a **Source** box linking to the original |
| **Data Sync → Logs** | View every run, **View details** shows the full log | — |

Recommended demo order: Run Source A → Review Queue → Approve + translate → show it on the website in PT → Run Source A again (duplicates skipped) → Source C: run `v1`, approve, switch to `v2`, run (update detected, old vs new shown) → switch to `broken`, run (error logged, admin email in Mail Log).

### 5.4 MemberPress ✅ interactive actions

| Screen | What you can do | Where it shows on the website (log in as that member) |
|---|---|---|
| **Subscriptions** | **Simulate renewal ITN** (adds a renewal payment, extends access), **Renewal fails** (membership pending, premium locked), **Cancel** (access until period end), **Run expiry now** (on cancelled: expires immediately), **Mark active** | Member dashboard status, My Subscription & Billing, premium content locked/unlocked |
| **Transactions** | **Refund** a successful payment | Member's billing history shows "Refunded" |
| Members | View only | — |
| Memberships | View only (plans, prices, access rules) | — |
| Settings › Payments | View only (illustrative gateway settings) | — |

### 5.5 WPML ✅ String Translation editable

| Screen | What you can do | Where it shows |
|---|---|---|
| **WPML → String Translation** | Search any interface text (menu labels, buttons, form labels, **error messages**, emails) and edit the **Portuguese** and **French** versions → **Save** | Everywhere that text appears on the site in PT/FR (e.g. change `nav.news` PT to "Novidades" and the PT menu changes) |
| Languages, Translation Management | View only (settings, translation progress) | — |

Note: String Translation edits **Portuguese and French only**; the English column is the fixed original. To change homepage English text, use **Pages → Home** (5.1).

### 5.6 Other screens

| Screen | Type | Notes |
|---|---|---|
| **Webinars → Registrations** | View, filter by webinar, **⬇ Export CSV** | Fills when someone registers on a webinar page |
| **Enquiries** | View | Fills when the website Contact form is submitted |
| **Mail Log** | View | Every email the system would send (welcome, receipt, failed payment, cancellation, renewal, password reset, webinar confirmation, sync error), shown in the recipient's language |
| **Dashboard** | View | Counts, memberships, sync status, recent transactions, upcoming webinars, enquiries |
| **Settings** | **Reset demo data** | Restores everything (Administrator only) |

---

## 6. What you CANNOT edit in the demo backend

Don't try to change these during the presentation. If the client asks, explain they're fully editable in the real WordPress build.

| Not editable in the demo | Why / how it works in production |
|---|---|
| **Pages other than Home:** About, Contact, Membership plans, Privacy Policy, Terms, Login/Register, Dashboard | The Pages list shows them, but only **Home** opens an editor. In WordPress every page is editable. |
| Header menu and footer links, footer text, contact details | Fixed in the prototype. WordPress Menus/Widgets in production. |
| Membership plan names, prices, features | View only. Configured in MemberPress in production. |
| Payment gateway settings | View only. Needs OilSkill's approved merchant account. |
| Media Library: uploading images | View only (image register). Add photos by putting files in `prototype/assets/img/photos/` (section 9). |
| Users: adding/removing backend users | View only. New *website members* can register on the website. |
| Rich article body (Gutenberg), PDF attachments, speaker lists | Only title, summary and listed fields are editable. Full block editor in production. |
| English interface strings (buttons, labels, messages) | Only PT/FR are editable in String Translation. |
| Audience cards ("Investors", "Operators & EPCs"…) in English | PT/FR via String Translation (`aud.`); English is fixed. |

---

## 7. Things to do on the website during the demo

| Show | How |
|---|---|
| Language switching | Header **EN / PT / FR** (also in the footer and mobile menu). You stay on the same page. |
| Search & filters | Opportunities: combine sector + location + status; filters appear in the URL; "Clear all"; empty-result message |
| Premium lock | Open any ★ Premium report while logged out → locked → log in as `pro@` → unlocked |
| Registration with validation | Membership → choose Professional → submit the form empty in PT or FR to show translated error messages, then fill it in |
| Payment journey | Checkout → simulated gateway → choose **declined** (failed page, nothing activated) → retry → **approved** → membership active |
| Cancellation | My Account → My subscription & billing → Cancel → access kept until period end |
| Webinar registration | Webinars → upcoming webinar → Register (then show Backend → Webinars → Registrations → Export CSV) |
| Mobile | Browser dev tools (F12 → device toolbar) or a phone |

---

## 8. Working vs simulated (say this honestly)

| Area | Status |
|---|---|
| All pages, navigation, responsive layout | Working |
| Search & filters | Working |
| EN/PT/FR (navigation, content, forms, errors, emails, dates) | Working (PT/FR machine-assisted, pending review) |
| Registration, login, password reset, roles, premium gating | Working (stored in the browser) |
| Member dashboard, billing, cancellation | Working |
| Homepage editor, content editing, String Translation | Working |
| Data sync: parsing RSS/HTML/JSON, mapping, duplicates, updates, errors, review queue | **Working** on bundled source snapshots |
| Data sync: live fetching from external websites on a daily schedule | **Simulated** (production: server-side WordPress plugin + cron) |
| Payment gateway, renewals, refunds | **Simulated** (production: PayFast or approved alternative) |
| Emails | **Simulated** (shown in Mail Log, not sent) |
| Newsletter, PDF downloads, map, social share | **Simulated** |
| Organisations, opportunities, suppliers, reports | **Sample data** |
| Photos | **Illustrated placeholders** |

---

## 9. Adding real Mozambican photos (needed for evaluation criterion 2)

Put licensed photos in `prototype/assets/img/photos/` with these exact file names. They replace the illustrations automatically.

| File name | Subject / actual location | Get permission from |
|---|---|---|
| `coral-sul-flng.jpg` | Coral Sul FLNG, Area 4, Rovuma Basin, offshore Cabo Delgado | Eni media |
| `afungi-mozambique-lng.jpg` | Mozambique LNG site, Afungi Peninsula, Palma | TotalEnergies media |
| `rovuma-lng.jpg` | Rovuma LNG / Area 4 | ExxonMobil Mozambique |
| `temane-cpf.jpg` | Temane Central Processing Facility, Inhambane | Sasol media |
| `port-of-pemba.jpg` | Port of Pemba logistics base | Wikimedia Commons (check licence) / OilSkill |
| `oilskill-professionals.jpg` | Mozambican professionals at an OilSkill event | OilSkill Co. |

About 1600×900 px, under 250 KB each. Then update the `credit` and `status` lines in `prototype/assets/js/data.js` (`IMAGES`). Also have OilSkill confirm the four project descriptions on the homepage (editable in Pages → Home).

---

## 10. Repository contents

```
README.md                    this guide
OILSKILL LOGO JPG.jpg        client logo (original)
SOW - OilSkill ... .xlsx     Scope of Work (25 Sep 2026)
prototype/
  index.html                 website
  admin.html                 demo backend
  assets/css/                site.css (design system), admin.css (WordPress look)
  assets/js/
    store.js                 shared browser storage, demo accounts
    i18n.js                  360+ interface strings in EN / PT / FR
    data.js                  sample content (3 languages), image register, homepage content model
    sync.js                  data extraction & sync engine
    site.js                  website pages and flows
    admin.js                 backend screens
  assets/img/                logo, favicon, photos/
```

### How the prototype maps to the real WordPress build

| Prototype | Production (per SOW) |
|---|---|
| Page templates | WordPress theme templates |
| Sample content & fields | Custom post types + ACF Pro |
| Language dictionaries & tabs | WPML |
| Membership & premium gating | MemberPress |
| Simulated gateway | PayFast (or approved alternative) with recurring billing |
| Sync engine | Custom WordPress plugin, server-side, daily cron |
| `admin.html` | Native WordPress admin |
