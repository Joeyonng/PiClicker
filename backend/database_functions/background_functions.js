const backgroundColors = [
  "#ff1744",
  "#3d5afe",
  "#1de9b6",
  "#ffea00",
  "#651fff",
  "#00e5ff",
  "#c6ff00"
];

let backgroundColorIndex = 0;

module.exports.incrementBackgroundColorIndex = () => {
  backgroundColorIndex = (backgroundColorIndex + 1) % 7;
};

module.exports.getCurrentBackgroundColor = () => {
  return backgroundColors[backgroundColorIndex];
};
