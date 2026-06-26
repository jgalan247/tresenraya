# Tres en Raya — Spanish Learning Game

A static Spanish learning version of Tic-Tac-Toe with local two-player mode and optional online multiplayer using Supabase Realtime.

## What this version includes

- Local two-player mode: Player X and Player O take turns on the same device
- Online room mode: Player X creates a room and Player O joins with a room code
- Players answer a Spanish question correctly to claim a square
- Questions are tracked during each match so the same question is not repeated in that game
- Answer choices are shuffled each time a question is shown
- The Spanish phrase/text is hidden until after the player has answered
- The correct answer is only shown after the player has selected an option
- Clear winner screen when X or O gets three in a row
- Early draw detection: the game stops if every possible winning line has been blocked and no player can still win
- New game button at the end of the match
- Difficulty levels: beginner, intermediate and advanced
- Categories: vocabulary, travel, grammar, slang and listening
- Browser text-to-speech pronunciation using the Web Speech API
- Local statistics saved in the browser with `localStorage`
- No Gemini key and no AI dependency

## Run locally

Open `index.html` in a browser.

Local two-player mode works immediately.

## Enable online multiplayer

Online play needs a Supabase project because GitHub Pages is static and cannot share live game state by itself.

### 1. Create a Supabase project

Create a new project at Supabase.

### 2. Create the rooms table

Open the Supabase SQL editor and run:

```sql
create table if not exists public.tresenraya_rooms (
  room_code text primary key,
  game_state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.tresenraya_rooms enable row level security;

drop policy if exists "Allow public read rooms" on public.tresenraya_rooms;
drop policy if exists "Allow public create rooms" on public.tresenraya_rooms;
drop policy if exists "Allow public update rooms" on public.tresenraya_rooms;

create policy "Allow public read rooms"
on public.tresenraya_rooms
for select
to anon
using (true);

create policy "Allow public create rooms"
on public.tresenraya_rooms
for insert
to anon
with check (true);

create policy "Allow public update rooms"
on public.tresenraya_rooms
for update
to anon
using (true)
with check (true);
```

### 3. Enable Realtime for the table

In Supabase, enable Realtime/Postgres changes for `tresenraya_rooms`, or run:

```sql
alter publication supabase_realtime add table public.tresenraya_rooms;
```

If Supabase says the table is already part of the publication, that is fine.

### 4. Add your Supabase URL and anon key

In `index.html`, replace:

```js
const SUPABASE_URL = "PASTE_YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY";
```

with your project URL and anon/public key from Supabase Project Settings → API.

Do not paste the `service_role` key into the website. Only use the anon/public key.

### 5. Deploy to GitHub Pages

This is a static site, so GitHub Pages can serve it directly from the repository root.

1. Go to repository **Settings**.
2. Open **Pages**.
3. Choose **Deploy from a branch**.
4. Select the `main` branch and `/root` folder.
5. Save.

The site should then be available at:

```text
https://jgalan247.github.io/tresenraya/
```

## How online play works

1. Player X clicks **Crear sala online**.
2. The app creates a room code.
3. Player X shares the code with Player O.
4. Player O opens the same website, enters the code and clicks **Unirse**.
5. Only the player whose turn it is can click a square.
6. The board updates for both players using Supabase Realtime.

## Notes

This is suitable for classroom/demo use. It does not use accounts or authentication. Anyone with the room code can join/update the room, so do not use it for assessments or sensitive data.
