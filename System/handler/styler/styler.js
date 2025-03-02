module.exports = function styler(type, title, content, footer, styles = {}) {
  const fonts = require("./createFonts");

  function applyFont(text, style) {
    if (!style) return text;
    if (Array.isArray(style)) {
      return style.reduce((formattedText, font) => fonts[font]?.(formattedText) || formattedText, text);
    }
    return fonts[style]?.(text) || text;
  }

  title = applyFont(title, styles.title);
  content = content
    .split("\n")
    .map(line => `│ ${applyFont(line, styles.content)}`)
    .join("\n");
  footer = applyFont(footer, styles.footer);

  switch (type) {
    case "design2":
      return `
╭─────────────❍
│ ${title}
│────────────────
${content}
├────────⬤
│ ${footer}
╰─────────────❍
      `.trim();

    default:
      return `${title}\n\n${content}\n\n${footer}`;
  }
};