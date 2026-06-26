# Tres en Raya — Spanish Learning Game

A static two-player Spanish learning version of Tic-Tac-Toe.

## What this version includes

- Two human players: Player X and Player O
- Players take turns on the same device
- A player must answer a Spanish question correctly to claim a square
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
- No backend, no Gemini key and no AI dependency

## Run locally

Open `index.html` in a browser.

## Deploy to GitHub Pages

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
