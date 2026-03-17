// scripts/generate-tokens-css.mjs
import fs from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const INPUT_PATH = path.join(ROOT, "design-tokens.tokens.json");
const OUTPUT_DIR = path.join(ROOT, "src", "styles");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "tokens.css");

function toKebab(str) {
  return String(str)
    .replace(/\s+/g, "-")
    .replace(/\./g, "-")
    .replace(/_/g, "-")
    .toLowerCase()
    .replace(/-+/g, "-");
}

const vars = {};

function addVar(parts, value) {
  const name = "--" + parts.map(toKebab).filter(Boolean).join("-");
  vars[name] = value;
}

function processToken(pathParts, token) {
  const type = token.type;
  const value = token.value;

  if (type === "color" && typeof value === "string") {
    let v = value;
    // ตัด alpha (#RRGGBBAA -> #RRGGBB)
    if (/^#([0-9a-fA-F]{8})$/.test(v)) {
      v = v.slice(0, 7);
    }
    addVar(pathParts, v);
  } else if (type === "dimension") {
    let v = value;
    if (typeof v === "number") v = `${v}px`;
    addVar(pathParts, v);
  } else if (
    type === "custom-fontStyle" &&
    value &&
    typeof value === "object"
  ) {
    // แตก font style เป็นหลายตัว เช่น ...-fontsize, ...-lineheight ฯลฯ
    Object.entries(value).forEach(([k, v]) => {
      let out = v;
      if (typeof v === "number" && /(size|height)$/i.test(k)) {
        out = `${v}px`;
      }
      addVar([...pathParts, k], out);
    });
  } else if (type === "custom-shadow" && value && typeof value === "object") {
    // แตก shadow เป็นหลายตัว เช่น ...-color, ...-offset-x, ...-radius, ...-spread
    Object.entries(value).forEach(([k, v]) => {
      let out = v;
      if (typeof v === "number") {
        // radius / offset / spread → px
        out = `${v}px`;
      } else if (
        k === "color" &&
        typeof v === "string" &&
        /^#([0-9a-fA-F]{8})$/.test(v)
      ) {
        out = v.slice(0, 7);
      }
      addVar([...pathParts, k], out);
    });
  } else if (value !== null && typeof value !== "object") {
    // เผื่อ type แปลก ๆ ที่เป็น primitive ก็ผูกไว้เป็น var ตรง ๆ
    addVar(pathParts, value);
  }
}

function walk(node, parts = []) {
  if (Array.isArray(node)) {
    node.forEach((child, idx) => walk(child, [...parts, String(idx)]));
  } else if (node && typeof node === "object") {
    if ("type" in node && "value" in node) {
      processToken(parts, node);
    } else {
      Object.entries(node).forEach(([k, v]) => {
        walk(v, [...parts, k]);
      });
    }
  }
}

async function main() {
  const raw = await fs.readFile(INPUT_PATH, "utf8");
  const json = JSON.parse(raw);

  walk(json);

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let css = ":root {\n";
  for (const name of Object.keys(vars).sort()) {
    css += `  ${name}: ${vars[name]};\n`;
  }
  css += "}\n";

  await fs.writeFile(OUTPUT_PATH, css, "utf8");
  console.log("✅ Generated", path.relative(ROOT, OUTPUT_PATH));
  console.log(`ℹ️ Total variables: ${Object.keys(vars).length}`);
}

main().catch((err) => {
  console.error("❌ Error generating tokens.css:", err);
  process.exit(1);
});
