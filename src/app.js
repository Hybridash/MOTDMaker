(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const MAX_WIDTH = 270; // pixels the server list shows per MOTD line

  const COLORS = [
    ["0", "Black", "#000000"], ["1", "Dark Blue", "#0000AA"], ["2", "Dark Green", "#00AA00"], ["3", "Dark Aqua", "#00AAAA"],
    ["4", "Dark Red", "#AA0000"], ["5", "Dark Purple", "#AA00AA"], ["6", "Gold", "#FFAA00"], ["7", "Gray", "#AAAAAA"],
    ["8", "Dark Gray", "#555555"], ["9", "Blue", "#5555FF"], ["a", "Green", "#55FF55"], ["b", "Aqua", "#55FFFF"],
    ["c", "Red", "#FF5555"], ["d", "Light Purple", "#FF55FF"], ["e", "Yellow", "#FFFF55"], ["f", "White", "#FFFFFF"],
  ];

  const TEMPLATES = [
    ["&6&l✦ My Server &r&7| &aSurvival &7& &bSkyBlock", "&eNew update! &fJoin now at &bplay.example.net"],
    ["&8&l☠ &4&lTHE HOLLOW &8&l☠", "&7Something is &kwatching&r &7you..."],
    ["&b&lMINIGAMES &f&lNETWORK", "&eBedwars &7• &aSkywars &7• &dParkour &7• &c&lNEW: &6Lava Rising"],
    ["&a&lFriends SMP &7» &fSeason 4", "&7Whitelisted &8• &e1.21.1 &8• &aBe nice!"],
    ["", ""],
  ];

  const l1 = $("l1");
  const l2 = $("l2");
  let lastFocused = l1;

  // & codes → § codes (only real format codes, so a plain "&" in text stays)
  const toSection = (s) => s.replace(/&([0-9a-fk-or])/gi, "§$1");

  // ---- toolbar ----------------------------------------------------------------------------
  const sw = $("swatches");
  for (const [code, name, hex] of COLORS) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "swatch";
    b.style.background = hex;
    b.title = `${name} (&${code})`;
    b.setAttribute("aria-label", name);
    b.dataset.code = code;
    sw.append(b);
  }
  document.querySelectorAll("[data-code]").forEach((b) =>
    b.addEventListener("mousedown", (e) => {
      e.preventDefault(); // keep the cursor in the text box
      insert(lastFocused, "&" + b.dataset.code);
    }));

  [l1, l2].forEach((el) => {
    el.addEventListener("focus", () => (lastFocused = el));
    el.addEventListener("input", update);
  });

  function insert(el, text) {
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    el.value = el.value.slice(0, start) + text + el.value.slice(end);
    el.focus();
    el.setSelectionRange(start + text.length, start + text.length);
    update();
  }

  // Center a line by adding spaces in front (spaces are 4px wide in Minecraft's font)
  document.querySelectorAll("[data-center]").forEach((b) =>
    b.addEventListener("click", () => {
      const el = $(b.dataset.center);
      const trimmed = el.value.replace(/^ +/, "");
      const w = Motd.width(toSection(trimmed));
      const pad = Math.max(0, Math.round((MAX_WIDTH - w) / 2 / 4));
      el.value = " ".repeat(pad) + trimmed;
      update();
    }));

  document.querySelectorAll("[data-t]").forEach((b) =>
    b.addEventListener("click", () => {
      const [a, c] = TEMPLATES[+b.dataset.t];
      l1.value = a;
      l2.value = c;
      update();
      l1.focus();
    }));

  // ---- preview + output -------------------------------------------------------------------
  function renderLine(target, raw, widthEl) {
    target.replaceChildren(Motd.render(toSection(raw)));
    const w = Motd.width(toSection(raw));
    widthEl.textContent = `${w} / ${MAX_WIDTH} px`;
    widthEl.classList.toggle("over", w > MAX_WIDTH);
    widthEl.title = w > MAX_WIDTH ? "Too wide: the end of this line will be cut off in the server list" : "Fits in the server list";
  }

  function update() {
    renderLine($("motd-1"), l1.value, $("w1"));
    renderLine($("motd-2"), l2.value, $("w2"));

    const sect1 = toSection(l1.value), sect2 = toSection(l2.value);
    const motd = sect2 ? sect1 + "\n" + sect2 : sect1;
    $("o-props").textContent = "motd=" + Motd.toProperties(motd);
    $("o-amp").textContent = l2.value ? l1.value + "\n" + l2.value : l1.value;
    $("o-sect").textContent = motd;

    try {
      const data = btoa(unescape(encodeURIComponent(JSON.stringify([l1.value, l2.value, $("name").value]))));
      history.replaceState(null, "", "#m=" + data);
    } catch { /* ignore */ }
  }
  $("name").addEventListener("input", update);

  // ---- copy buttons -----------------------------------------------------------------------
  async function copy(text, btn) {
    const old = btn.textContent;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = "Copied!";
    } catch {
      btn.textContent = "Copy failed";
    }
    setTimeout(() => (btn.textContent = old), 1400);
  }
  document.querySelectorAll("[data-copy]").forEach((b) =>
    b.addEventListener("click", () => copy($(b.dataset.copy).textContent, b)));
  $("share").addEventListener("click", (e) => {
    e.preventDefault();
    copy(location.href, $("share"));
  });

  // ---- server icon (resized to 64×64, the size Minecraft needs) ----------------------------
  $("icon-file").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const ctx = c.getContext("2d");
      const s = Math.min(img.width, img.height);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 64, 64);
      const url = c.toDataURL("image/png");
      $("icon-img").src = url;
      $("icon-img").hidden = false;
      $("icon-ph").hidden = true;
      $("icon-dl").href = url;
      $("icon-dl").hidden = false;
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });

  // Scrambled (&k) text flickers like in game
  setInterval(() => {
    document.querySelectorAll(".obf").forEach((s) => {
      s.textContent = s.textContent.replace(/[^\s]/g, () => String.fromCharCode(33 + Math.floor(Math.random() * 90)));
    });
  }, 80);

  // Load a shared MOTD from the link
  const m = location.hash.match(/#m=([A-Za-z0-9+/=]+)/);
  if (m) {
    try {
      const [a, b, name] = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
      l1.value = a || "";
      l2.value = b || "";
      if (name) $("name").value = name;
    } catch { /* bad link, keep defaults */ }
  }
  update();
})();
