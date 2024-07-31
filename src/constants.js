import HanziWriter from "hanzi-writer";

const source =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTzOh48B6TCcx3ExlqzXs9Dcf7Z4792Q8IhJzE_uAd3hCx_-VF-o9DWwdJVcOaNqeE4hHlvSO9l4MOt/pub?gid=0&single=true&output=csv";

const size = 250;
// https://hanziwriter.org/docs.html#api-link
const hanziConfig = {
  showOutline: false,
  showCharacter: false,
  width: size,
  height: size,
  padding: 5,
  strokeAnimationSpeed: 100,
  strokeHighlightSpeed: 2,
  delayBetweenStrokes: 0,
  delayBetweenLoops: 200,
  radicalColor: "#178f16",
  drawingWidth: 10,
  showHintAfterMisses: 1,
  highlightOnComplete: true,
};

const createSvgBackground = () => {
  const svgNS = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);

  const lines = [
    { x1: "0", y1: "0", x2: size, y2: size },
    { x1: size, y1: "0", x2: "0", y2: size },
    { x1: size / 2, y1: "0", x2: size / 2, y2: size },
    { x1: "0", y1: size / 2, x2: size, y2: size / 2 },
  ];

  lines.forEach(({ x1, y1, x2, y2 }) => {
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "#DDD");
    svg.appendChild(line);
  });

  return svg;
};

const generateHanziWriter = (
  ref,
  hanzis,
  onComplete,
  shouldAnimate,
  isFastMode
) => {
  if (!ref?.current || !hanzis) return;

  ref.current.innerHTML = "";
  let completed = 0;
  const total = hanzis.length;
  for (let i = 0; i < total; i++) {
    const hanziContainer = document.createElement("div");
    hanziContainer.style.display = "inline-block";
    hanziContainer.style.position = "relative";
    hanziContainer.style.width = `${hanziConfig.width}px`;
    hanziContainer.style.height = `${hanziConfig.height}px`;
    hanziContainer.style.border = "1px solid #DDD";

    const svgBackground = createSvgBackground();
    hanziContainer.appendChild(svgBackground);

    const charDiv = document.createElement("div");
    charDiv.style.position = "absolute";
    charDiv.style.top = "0";
    charDiv.style.left = "0";
    charDiv.style.width = "100%";
    charDiv.style.height = "100%";

    hanziContainer.appendChild(charDiv);
    ref.current.appendChild(hanziContainer);

    const writer = HanziWriter.create(charDiv, hanzis[i], hanziConfig);

    if (shouldAnimate) {
      if (isFastMode) {
        writer.showCharacter();
      } else {
        writer.loopCharacterAnimation();
      }
    } else {
      writer.quiz({
        onComplete: () => {
          completed++;
          if (completed === total) {
            onComplete();
          }
        },
      });
    }
  }
};

export { generateHanziWriter, source };
