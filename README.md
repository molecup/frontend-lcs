# frontend-lcs

Frontend Next.js per LCS con gestione accrediti settimanali dedicata alla Leonessa Cup.

## Requisiti

- Node.js 18+
- Progetto Supabase attivo

## Setup rapido

1) Installa dipendenze

```bash
npm install
```

2) Configura le variabili ambiente (esempio in `.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
STAFF_USER="staff"
STAFF_PASSWORD="cassa"
ACCREDITI_MAX_CAP=400
```

3) Crea le tabelle in Supabase (SQL Editor)

```sql
create extension if not exists pgcrypto;

create type accreditation_status as enum (
  'unused',
  'used_saturday',
  'used_sunday'
);

create table weekends (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  max_capacity int not null,
  created_at timestamptz default now()
);

create table accreditations (
  id uuid primary key default gen_random_uuid(),
  weekend_id uuid not null references weekends(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text not null,
  school text,
  status accreditation_status not null default 'unused',
  qr_token_hash text unique not null,
  marketing_opt_in boolean not null default false,
  privacy_consent boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index accreditations_weekend_email on accreditations (weekend_id, email);
create unique index accreditations_weekend_phone on accreditations (weekend_id, phone);
```

4) Avvia il progetto

```bash
npm run dev
```

## Accrediti Leonessa Cup

Pagine principali:

- `src/app/competitions/[city]/accrediti/page.js` (form accrediti con banner advertising)
- `src/app/competitions/[city]/accrediti/cassa/page.js` (scanner cassa + statistiche)

API:

- `POST /api/accrediti` crea accredito e genera QR + PDF
- `GET /api/accrediti` stato apertura e posti rimanenti
- `POST /api/accrediti/verify` verifica QR e aggiorna stato

QR code:

- Contiene solo un token univoco, nessun dato personale
- Stati: `unused`, `used_saturday`, `used_sunday`

## Note operative

- Accrediti aperti dal lunedi al sabato ore 14:00 (timezone Europe/Rome).
- Un accredito per weekend per email o telefono.
- Il PDF del ticket è la prova ufficiale di accredito.
- Le API server usano `SUPABASE_SERVICE_ROLE_KEY` (non esporla lato client).
