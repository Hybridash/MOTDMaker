const assert = require("assert");
const M = require("../src/motd.js");

// parsing
assert.deepStrictEqual(M.parse("§aHi §lyo"), [{ text: "Hi ", color: "#55FF55" }, { text: "yo", color: "#55FF55", bold: true }]);

// widths: "Hello" = H6 e6 l3 l3 o6 = 24
assert.strictEqual(M.width("Hello"), 24);
assert.strictEqual(M.width("§lHello"), 29);
assert.strictEqual(M.width("i i"), 8);
assert.strictEqual(M.plain("§aA§lB"), "AB");

// server.properties escaping
assert.strictEqual(M.toProperties("§aHello\n§bWorld"), "\\u00A7aHello\\n\\u00A7bWorld");
assert.strictEqual(M.toProperties("a\\b"), "a\\\\b");
assert.strictEqual(M.toProperties("  centered"), "\\  centered");
assert.strictEqual(M.toProperties("★"), "\\u2605");
assert.strictEqual(M.toProperties("a=b:c"), "a=b:c");
console.log("motd tests passed");
