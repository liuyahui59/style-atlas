const ARTWORK_DATA = {};

STYLE_DATA.forEach((style) => {
  style.artwork = ARTWORK_DATA[style.id] || null;
});
