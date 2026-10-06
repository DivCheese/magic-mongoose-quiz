# Magic Mongoose Quiz

A quick browser-based quiz game where users can:

- create an account with a username and password
- play rounds with fresh random questions every time
- race the clock on a 45-second challenge
- see a leaderboard sorted by score, then by quick finish time
- keep only the top 10 scores

## How to run it

1. Open the project folder in a browser, or run a local web server.
2. If you want to serve it locally:

```bash
cd magic-mongoose-quiz
python3 -m http.server 8000
```

3. Then open `http://localhost:8000` in your browser.

## Notes

- This is a front-end demo using browser storage (`localStorage`) for usernames, passwords, and leaderboard entries.
- The quiz picks 5 random questions from a larger bank each round.
- Leaderboard ranking is based on:
  - more correct answers
  - faster completion time
  - higher score total

The score formula used is:

`score = correct answers × 100 − seconds used`
