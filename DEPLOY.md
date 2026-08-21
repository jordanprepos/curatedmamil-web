# Deploying Curated By Mami L

How the site gets from this folder to **https://mamiel-project.web.app**.

The site is hosted on **Firebase Hosting**, in the same Firebase project
(`mamiel-project`) it already reads its products from. That is the whole reason
this is simple: one project, one login, one command that ships the pages *and*
the database Security Rules together.

There is **no build step**. This folder is the website. What you see in the file
list is what gets uploaded.

---

## Before your first deploy

You only ever do this section once per computer.

### 1. Install the Firebase CLI

```bash
npm install -g firebase-tools
```

Check it worked:

```bash
firebase --version
```

### 2. Sign in

```bash
firebase login
```

A browser window opens. Sign in with the Google account that owns
`mamiel-project`.

### 3. Confirm the project is linked

The repo already contains a `.firebaserc` file that pins this folder to
`mamiel-project`, so there is nothing to configure. Confirm it:

```bash
firebase use
```

You should see `Active Project: default (mamiel-project)`. If you instead get an
error about no active project, run `firebase use --add`, pick `mamiel-project`,
and name the alias `default`.

---

## Deploying

Four steps. Do them in order — steps 1–3 exist so you never discover a problem
on the live site.

### Step 1 — Look at it locally

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000/index.html> and click through all five pages. This
catches typos and broken markup instantly, with no waiting and nothing published.

Stop the server with `Ctrl+C` when you're done.

> Firestore and Analytics need a real web address, so the live catalog and
> visitor stats won't fully work here. Step 3 is where you check those.

### Step 2 — Check what would be uploaded

```bash
firebase deploy --only hosting --dry-run
```

This uploads nothing. It confirms the command is wired up and your login works.

### Step 3 — Publish a private preview first

```bash
firebase hosting:channel:deploy preview --expires 7d
```

This gives you a **temporary, unlisted URL** that looks like:

```
https://mamiel-project--preview-xxxxxxxx.web.app
```

It's a complete, real copy of the site — real https address, real Firestore, real
Analytics — that nobody will find unless you send them the link. It deletes
itself after 7 days.

Open that URL and check the things that only work on a real address:

- **The catalog fills in from the dashboard.** The bags shown should match what's
  marked `Aktif` in the Mami L app, not the older hand-written list.
- **Order buttons open the right chat.** Tap one — WhatsApp should open to
  Mami L's number with the bag's name and price already written.
- **It looks right on a phone.** Open the link on your actual phone, not just a
  narrow browser window.

Send the link to anyone who should see it before it goes public.

### Step 4 — Go live

```bash
firebase deploy
```

That's it. The site is updated at **https://mamiel-project.web.app** within
seconds. (`https://mamiel-project.firebaseapp.com` serves the same site — Firebase
gives every project both addresses.)

Open the live URL and re-check the three things from Step 3. It is a different
web address from the preview, so it deserves its own look.

---

## What `firebase deploy` actually ships

Running it with no flags sends up **two** things:

| | What it is | Why it matters |
| --- | --- | --- |
| **Hosting** | The five pages, `assets/`, the logo | The website itself |
| **Firestore rules** | `firestore.rules` | Decides what the public may read from the database |

They travel together on purpose. The website depends on those rules to read the
product list — if the two ever fell out of step, the catalog would go blank. To
send just one:

```bash
firebase deploy --only hosting
firebase deploy --only firestore:rules
```

### What does *not* get uploaded

The `ignore` list in `firebase.json` keeps the working files off the public
internet: every `.md` file (this one included), `firestore.rules`, `firebase.json`,
`.firebaserc`, and anything starting with a dot. You can confirm any time —
these should all return "not found":

```bash
curl -o /dev/null -w '%{http_code}\n' https://mamiel-project.web.app/README.md
```

---

## Updating the site later

**Changing a bag's name, price, or photo?** Don't deploy at all. Edit it in the
Mami L dashboard app — the website reads the product list live and updates on its
own within seconds.

**Changing the WhatsApp number?** Also no deploy. Set it in the app under
**Lainnya → Nomor WhatsApp**.

**Changing the actual pages** — wording, layout, adding a section? That's a
deploy. Edit the files, then run through the four steps above again.

---

## If something goes wrong

### Undo a bad deploy

There is no `firebase hosting:rollback` command. Roll back one of two ways:

**From the Firebase console** (easiest): open
[Hosting](https://console.firebase.google.com/project/mamiel-project/hosting/main),
find the previous release in the version list, and choose **Rollback**. It's
instant — the old files are still stored.

**From the terminal**, if you still have a good preview channel:

```bash
firebase hosting:clone mamiel-project:preview mamiel-project:live
```

### Take the site down entirely

```bash
firebase hosting:disable
```

Visitors get a "site not found" page until you deploy again.

### The catalog is empty on the live site

The pages show a short hand-written list of bags as a safety net, so a blank or
outdated catalog means the database read failed. Open the site, open the browser
console, and look for `permission-denied`. That points at the Security Rules —
redeploy them:

```bash
firebase deploy --only firestore:rules
```

> **Careful:** the Mami L dashboard app's repo contains its own copy of
> `firestore.rules` for the same project, and whichever one is deployed last
> wins. If someone deployed from that repo, it may have overwritten the rules
> this website needs. The two files must be kept identical.

### `Error: Failed to get Firebase project`

You're either signed out or pointed at the wrong project. Run `firebase login`
again, then `firebase use` to confirm you're on `mamiel-project`.

### Old version still showing after a deploy

Pages are set to never cache, so this is almost always the browser holding onto
`assets/site.css` or `assets/site.js`, which cache for an hour. Hard-refresh
(`Cmd+Shift+R`), or wait an hour.

---

## Managing preview links

```bash
firebase hosting:channel:list             # every preview link and when it expires
firebase hosting:channel:open preview     # open one in the browser
firebase hosting:channel:delete preview   # remove one early
```

---

## Using a real domain name

The `web.app` address is free and permanent, so there's no rush. When Mami L
wants something like `curatedbymamil.com`:

1. Buy the domain from any registrar.
2. In the Firebase console, go to **Hosting → Add custom domain**.
3. Add the DNS records Firebase gives you at your registrar.
4. Wait — Firebase issues the security certificate automatically, usually within
   a few hours.

Custom domains and certificates cost nothing on the free plan.

---

## Related documents

- **`README.md`** — what the project is, and the short version of these commands
- **`PROJECT.md` §10** — *why* the hosting config is set up the way it is, including
  what was deliberately left out and must not be added
