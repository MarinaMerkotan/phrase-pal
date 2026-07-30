# Nhost setup for Phrase Pal

The app uses the current Nhost JavaScript SDK (`@nhost/nhost-js`) and the Nhost CLI directory layout. No Google secret belongs in `.env.local` or browser code.

## 1. Create an Nhost Cloud project

Create a project in the [Nhost Dashboard](https://app.nhost.io). Note its subdomain and region.

## 2. Configure Google OAuth

In Google Cloud Console:

1. Create or select a project.
2. Configure the OAuth consent screen as an External app.
3. Create an OAuth Client ID for a Web application.
4. Add `https://<subdomain>.auth.<region>.nhost.run` as an authorized JavaScript origin.
5. Add the OAuth callback URI shown in Nhost's Google provider settings as an authorized redirect URI.

In Nhost Dashboard → Auth → Sign-in methods → Google, paste the Google Client ID and Client Secret and enable the provider. Keep the Client Secret in Nhost only.

Add these allowed redirect URLs in Nhost Auth settings:

- `http://localhost:3000/auth/callback`
- your production URL followed by `/auth/callback`

## 3. Configure the frontend

Copy the example file and fill in the project values:

```powershell
Copy-Item .env.example .env.local
```

Set `NEXT_PUBLIC_NHOST_SUBDOMAIN`, `NEXT_PUBLIC_NHOST_REGION`, `NHOST_SUBDOMAIN`, `NHOST_REGION`, and `NEXT_PUBLIC_APP_URL`. The public Nhost values are identifiers, not secrets.

## 4. Install and authenticate the CLI

Install the current Nhost CLI using the official instructions at [Nhost CLI documentation](https://docs.nhost.io/reference/cli/commands), then verify it:

```powershell
nhost version
```

Login is interactive and requires your Nhost account or a Personal Access Token:

```powershell
nhost login
```

## 5. Initialize or link the repository

From this project directory:

```powershell
nhost init
nhost link
```

Choose the Nhost project and confirm its subdomain when prompted. If you already have a linked project, skip `nhost init` and run `nhost link` only when changing projects.

## 6. Apply the schema and metadata

Local development:

```powershell
nhost up
```

`nhost up` applies the versioned migrations and metadata. Stop it with:

```powershell
nhost down
```

For a linked cloud project, use the deployment workflow from the Nhost Dashboard/Git integration. The CLI configuration command is:

```powershell
nhost apply --yes
```

Validate the local configuration with:

```powershell
nhost config validate
```

## 7. Start Phrase Pal

```powershell
npm install
npm run dev
```

Open <http://localhost:3000>.

## 8. Resetting local development data

To stop local services and remove their Docker volumes, which deletes local development data, run:

```powershell
nhost down --volumes
nhost up
```

The repository has no required demo seed. Optional development seeds can be added under `nhost/seeds/default` and applied with `nhost up --apply-seeds`.

## Production checklist

- Google Client ID and Client Secret are configured in Nhost, not in Next.js variables.
- The production `/auth/callback` URL is in Nhost allowed redirects and Google authorized redirects.
- The app is built with `npm run lint`, `npm run typecheck`, and `npm run build`.
