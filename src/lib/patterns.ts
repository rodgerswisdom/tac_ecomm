export const patternAssets = {
  kubaGrid: "/patterns/kuba-grid.svg",
  adinkraGlyph: "/patterns/adinkra-glyph.svg",
  beadCircles: "/patterns/bead-circles.svg",
  mudclothWeave: "/patterns/mudcloth-weave.svg",
};

export const regionPalettes: Record<
  string,
  { background: string; text: string }
> = {
  kenya: { background: "rgba(75, 146, 134, 0.22)", text: "#4B9286" },
  ghana: { background: "rgba(223, 160, 83, 0.22)", text: "#DFA053" },
  mali: { background: "rgba(74, 43, 40, 0.22)", text: "#4A2B28" },
  nigeria: { background: "rgba(171, 205, 193, 0.24)", text: "#4B9286" },
  southAfrica: { background: "rgba(221, 76, 58, 0.2)", text: "#DD4C3A" },
  morocco: { background: "rgba(223, 160, 83, 0.2)", text: "#DD4C3A" },
  zimbabwe: { background: "rgba(75, 146, 134, 0.2)", text: "#4B9286" },
};

export const patternDividerIcon = patternAssets.adinkraGlyph;
