import { mkdir, readFile, writeFile } from "node:fs/promises";

const API = "https://commons.wikimedia.org/w/api.php";
const OUTPUT_DIR = new URL("../assets/artworks/", import.meta.url);
const USER_AGENT = "StyleAtlas/1.0 (https://styleatlas.art; open-license content research)";
const ALLOWED_LICENSES = [
  /^public domain/i,
  /^CC0(?:\s|$)/i,
  /^CC BY(?:\s|$|-)/i,
  /^CC BY-SA(?:\s|$|-)/i
];

const searches = {
  "ancient-egyptian": "Nebamun hunting in the marshes British Museum",
  "classical-greek": "Doryphoros ancient Greek sculpture museum",
  byzantine: "Christ Pantocrator Byzantine mosaic",
  gothic: "Chartres Cathedral stained glass rose window",
  renaissance: "Raphael School of Athens fresco",
  mannerism: "Bronzino Eleonora of Toledo portrait",
  baroque: "Caravaggio Calling of Saint Matthew",
  rococo: "Fragonard The Swing painting",
  neoclassicism: "Jacques Louis David Oath of the Horatii",
  romanticism: "Caspar David Friedrich Wanderer above the Sea of Fog",
  realism: "Jean Francois Millet The Gleaners",
  "pre-raphaelite": "John Everett Millais Ophelia painting",
  impressionism: "Claude Monet Impression Sunrise painting",
  "post-impressionism": "Vincent van Gogh Starry Night",
  symbolism: "Gustav Klimt The Kiss painting",
  "arts-crafts": "William Morris Strawberry Thief textile",
  "art-nouveau": "Alphonse Mucha Job cigarette poster",
  fauvism: "Andre Derain Charing Cross Bridge painting",
  expressionism: "Edvard Munch The Scream 1893",
  cubism: "Juan Gris Portrait of Picasso painting",
  futurism: "Giacomo Balla Dynamism of a Dog on a Leash",
  dada: "Raoul Hausmann Mechanical Head Dada",
  constructivism: "El Lissitzky Beat the Whites with the Red Wedge",
  suprematism: "Kazimir Malevich Suprematist Composition",
  "de-stijl": "Piet Mondrian Composition red blue yellow",
  bauhaus: "Bauhaus Dessau building Walter Gropius",
  surrealism: "Salvador Dali surrealist painting museum",
  "art-deco": "Chrysler Building crown Art Deco",
  "abstract-expressionism": "abstract expressionist action painting museum",
  "color-field": "color field painting museum",
  "pop-art": "pop art public mural",
  "op-art": "op art optical geometric artwork",
  minimalism: "minimalist sculpture museum installation",
  "conceptual-art": "conceptual art museum installation",
  "neo-expressionism": "neo expressionist painting museum",
  photorealism: "photorealist painting city reflections",
  postmodernism: "Portland Building Michael Graves",
  lowbrow: "lowbrow pop surrealism mural",
  psychedelic: "1960s psychedelic concert poster",
  "street-art": "street art mural Creative Commons",
  "ink-wash": "Chinese literati ink landscape painting museum",
  gongbi: "Chinese gongbi bird flower painting museum",
  dunhuang: "Dunhuang Mogao caves mural flying apsara",
  "chinese-new-year-print": "Chinese New Year woodblock print door god",
  guochao: "Chinese guochao visual design",
  "ukiyo-e": "Hokusai Great Wave off Kanagawa",
  rinpa: "Ogata Korin Red and White Plum Blossoms",
  nihonga: "Yokoyama Taikan Nihonga painting",
  "wabi-sabi": "Japanese wabi sabi pottery kintsugi",
  kawaii: "kawaii Japanese street fashion Creative Commons",
  superflat: "superflat Japanese contemporary mural",
  "korean-minhwa": "Korean minhwa tiger magpie painting",
  "persian-miniature": "Persian miniature painting museum manuscript",
  "mughal-miniature": "Akbar Mughal miniature painting museum",
  madhubani: "Madhubani Mithila painting Creative Commons",
  "islamic-geometry": "Alhambra Islamic geometric tile pattern",
  thangka: "Tibetan thangka painting museum",
  "mexican-muralism": "Diego Rivera mural Mexico public building",
  "mexican-folk": "Mexican folk art alebrije",
  "african-wax-print": "African wax print fabric pattern",
  afrofuturism: "Afrofuturism art mural Creative Commons",
  swiss: "International Typographic Style Swiss poster",
  "mid-century-modern": "Farnsworth House Mies van der Rohe",
  "scandinavian-modern": "Scandinavian modern furniture interior",
  "streamline-moderne": "Streamline Moderne architecture",
  "atomic-age": "Atomic Age mid century graphic design",
  "new-wave-typography": "New Wave typography poster design",
  memphis: "Memphis Milano furniture design",
  "punk-visual": "punk zine collage poster",
  "grunge-design": "grunge graphic design poster",
  "architectural-brutalism": "Barbican Estate brutalist architecture",
  brutalism: "brutalist web design screenshot",
  "flat-design": "flat design illustration Creative Commons",
  "corporate-memphis": "corporate Memphis flat people illustration",
  "material-design": "Google Material Design interface",
  skeuomorphism: "skeuomorphic user interface design",
  glassmorphism: "glassmorphism user interface design",
  neumorphism: "neumorphism user interface design",
  "acid-graphics": "acid graphics poster design",
  "glitch-art": "glitch art RGB distortion",
  "generative-art": "generative algorithmic art Creative Commons",
  cyberpunk: "cyberpunk neon city Creative Commons",
  steampunk: "steampunk machinery costume Creative Commons",
  solarpunk: "solarpunk green architecture illustration",
  retrofuturism: "retrofuturism space age illustration",
  synthwave: "synthwave retro future neon artwork",
  vaporwave: "vaporwave aesthetic artwork Creative Commons",
  y2k: "Bondi blue Apple iMac G3",
  "frutiger-aero": "Frutiger Aero aesthetic",
  anime: "Japanese anime cel museum",
  manga: "Japanese manga page public domain",
  "american-comics": "Golden Age comic book cover public domain",
  "gothic-subculture": "gothic subculture fashion portrait Creative Commons",
  "dark-fantasy": "dark fantasy artwork Creative Commons",
  "film-noir": "film noir still public domain",
  cottagecore: "cottagecore garden interior Creative Commons",
  "dark-academia": "dark academia library Creative Commons",
  dreamcore: "dreamcore aesthetic Creative Commons",
  weirdcore: "weirdcore aesthetic Creative Commons",
  "liminal-space": "liminal space empty corridor Creative Commons"
};

const clean = (value = "") => value
  .replace(/<[^>]+>/g, "")
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&#039;/g, "'")
  .replace(/&quot;/g, '"')
  .trim();

const wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

async function fetchWithRetry(url, options = {}, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { "User-Agent": USER_AGENT, ...(options.headers || {}) },
        signal: AbortSignal.timeout(25000)
      });
      if (response.status === 429 && attempt < attempts) {
        const retryAfter = Number(response.headers.get("retry-after"));
        await wait(Number.isFinite(retryAfter) ? retryAfter * 1000 : 3000 * attempt);
        continue;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${new URL(url).origin}`);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await wait(900 * attempt);
    }
  }
  throw lastError;
}

function metadataValue(item, key) {
  return clean(item.imageinfo?.[0]?.extmetadata?.[key]?.value || "");
}

function queryScore(item, query) {
  const haystack = clean(`${item.title || ""} ${metadataValue(item, "ImageDescription")} ${metadataValue(item, "Categories")}`).toLowerCase();
  const ignored = new Set(["the", "and", "with", "from", "design", "style", "art", "artwork", "painting", "museum", "creative", "commons"]);
  const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 2 && !ignored.has(term));
  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0) / Math.max(terms.length, 1);
}

function isAllowedLicense(item) {
  const license = metadataValue(item, "LicenseShortName");
  return ALLOWED_LICENSES.some((pattern) => pattern.test(license));
}

async function searchCommons(query) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "30",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1600"
  });
  const response = await fetchWithRetry(`${API}?${params}`, {}, 5);
  const data = await response.json();
  const candidates = (data.query?.pages || []).filter((item) => {
    const image = item.imageinfo?.[0];
    return image?.thumburl
      && image.descriptionurl
      && /^image\/(jpeg|png|webp)$/i.test(image.mime || "")
      && image.width >= 800
      && image.height >= 500
      && isAllowedLicense(item);
  });
  candidates.sort((a, b) => {
    const aInfo = a.imageinfo[0];
    const bInfo = b.imageinfo[0];
    const aExact = clean(a.title).toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
    const bExact = clean(b.title).toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
    return bExact - aExact
      || queryScore(b, query) - queryScore(a, query)
      || bInfo.width * bInfo.height - aInfo.width * aInfo.height;
  });
  return candidates;
}

async function downloadCandidate(id, candidate) {
  const image = candidate.imageinfo[0];
  const urls = [image.thumburl, image.url].filter(Boolean);
  for (const url of urls) {
    try {
      const response = await fetchWithRetry(url, { headers: { Accept: "image/avif,image/webp,image/png,image/jpeg" } }, 2);
      const mime = (response.headers.get("content-type") || "").split(";")[0];
      if (!/^image\/(jpeg|png|webp|avif)$/.test(mime)) continue;
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length < 20000) continue;
      const extension = { "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif" }[mime] || ".jpg";
      const filename = `${id}${extension}`;
      await writeFile(new URL(filename, OUTPUT_DIR), bytes);
      return filename;
    } catch {
      // Try the original image URL or the next licensed result.
    }
  }
  return null;
}

async function readExistingManifest() {
  try {
    return JSON.parse(await readFile(new URL("manifest.json", OUTPUT_DIR), "utf8"));
  } catch {
    return {};
  }
}

async function saveOutputs(manifest) {
  await writeFile(new URL("manifest.json", OUTPUT_DIR), `${JSON.stringify(manifest, null, 2)}\n`);
  const browserArtworkData = Object.fromEntries(Object.entries(manifest).map(([id, artwork]) => [id, { src: artwork.src }]));
  const browserData = `const ARTWORK_DATA = ${JSON.stringify(browserArtworkData, null, 2)};\n\nSTYLE_DATA.forEach((style) => {\n  style.artwork = ARTWORK_DATA[style.id] || null;\n});\n`;
  await writeFile(new URL("../../artworks.js", OUTPUT_DIR), browserData);
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const manifest = await readExistingManifest();
  const failures = [];
  for (const [id, query] of Object.entries(searches)) {
    if (manifest[id]?.src) {
      console.log(`${Object.keys(manifest).length}/${Object.keys(searches).length} ${id}: already downloaded`);
      continue;
    }
    try {
      let candidates = await searchCommons(query);
      if (!candidates.length) candidates = await searchCommons(query.split(" ").slice(0, 4).join(" "));
      let result = null;
      let filename = null;
      for (const candidate of candidates.slice(0, 10)) {
        filename = await downloadCandidate(id, candidate);
        if (filename) {
          result = candidate;
          break;
        }
      }
      if (!result || !filename) throw new Error("no usable licensed image result");
      const image = result.imageinfo[0];
      manifest[id] = {
        src: `assets/artworks/${filename}`,
        title: clean(result.title).replace(/^File:/i, "") || "未命名作品",
        creator: metadataValue(result, "Artist") || "创作者未注明",
        date: metadataValue(result, "DateTimeOriginal") || metadataValue(result, "DateTime") || "年代见来源页",
        institution: metadataValue(result, "Credit") || "Wikimedia Commons",
        license: metadataValue(result, "LicenseShortName"),
        licenseUrl: metadataValue(result, "LicenseUrl"),
        sourceUrl: image.descriptionurl,
        originalUrl: image.url,
        attribution: metadataValue(result, "Attribution") || metadataValue(result, "Credit"),
        commonsPageId: result.pageid,
        searchQuery: query
      };
      await saveOutputs(manifest);
      console.log(`${Object.keys(manifest).length}/${Object.keys(searches).length} ${id}: ${manifest[id].title}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ id, query, error: message });
      console.warn(`Failed ${id}: ${message}`);
    }
    await wait(1200);
  }
  await saveOutputs(manifest);
  await writeFile(new URL("failures.json", OUTPUT_DIR), `${JSON.stringify(failures, null, 2)}\n`);
  const count = Object.keys(manifest).length;
  console.log(`Saved ${count} artworks`);
  if (failures.length) console.warn(`See assets/artworks/failures.json for ${failures.length} failed styles`);
  if (count !== Object.keys(searches).length) process.exitCode = 2;
}

await main();
