# MOTD Maker

**Design your Minecraft server's MOTD** (the colored text under its name in the multiplayer list) with a live preview, then copy it straight into `server.properties`.

**Use it here: https://hybridash.github.io/MOTDMaker/**

## Features

- **Live server-list preview** that looks like the in-game multiplayer screen, with your server name, player count and ping bars
- **One-click colors and styles**: all 16 Minecraft colors plus bold, italic, underline, strikethrough and scrambled (`&k`, which flickers in the preview like in game)
- **Width meter**: shows how many pixels each line takes using Minecraft's real character widths, and warns you before the end of a line gets cut off
- **Center button**: pads a line with spaces so it sits in the middle of the server list
- **Server icon**: click the icon box to pick any image. It gets cropped and resized to the 64×64 `server-icon.png` Minecraft needs, ready to download
- **Three output formats**:
  - `server.properties`: escaped exactly the way Java reads it (`§` for §, `\n` for the second line, special characters escaped too)
  - `&` codes for plugins
  - Raw `§` codes
- **Share links**: the URL saves your MOTD so you can send it to someone
- Templates to start from

## How to use the output

1. Stop your server.
2. Open `server.properties` and find the line that starts with `motd=`.
3. Replace it with the copied line, save, and start the server again.

## Tests

```
node test/motd.test.js
```

The `server.properties` escaping was also checked against Java's own `Properties.load`, so what you paste is exactly what the server shows.

GitHub Actions runs the tests and deploys to GitHub Pages on every push to `main`.
