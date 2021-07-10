function bold(text) {
  return `*${text}*`;
}

function title(text, shouldBold) {
  const maxCharacters = 25;

  const rest = Array.from(
    { length: maxCharacters - text.length - 2 },
    () => "-"
  ).join("");

  let nextText = `--${text}${rest}`;

  if (shouldBold) {
    nextText = bold(nextText);
  }

  return nextText;
}

module.exports.bold = bold;
module.exports.title = title;
