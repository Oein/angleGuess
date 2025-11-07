import Leaderboard from "./leaderboardSystem";
import notifier from "./notifier";

import "./style.css";

const LDBoard = Leaderboard({
  getGameRunning() {
    return false;
  },
  kvAPIKey: "mfgcdevp",
  notifier: notifier,
});

(window as any).lb = LDBoard;

import Two from "two.js";

const container = document.getElementById("container")!;

const two = new Two({
  fullscreen: false,
  height: 200,
  width: 200,
  autostart: true,
  smoothing: true,
  type: "SVGRenderer",
});

// Attach renderer to DOM
container.style.width = "200px";
container.style.height = "200px";
container.style.display = "block";

two.appendTo(container);

function drawAngle(degree: number) {
  // Normalize degree and convert to radians
  const deg = ((degree % 360) + 360) % 360;
  const rad = (deg * Math.PI) / 180;

  two.clear();

  const cx = 100;
  const cy = 100;
  const length = 100; // length of the rays

  // baseline (0°) to the right
  const line1 = two.makeLine(cx, cy, cx + length, cy);
  line1.stroke = "#333";
  line1.linewidth = 3;

  // second line at `degree`
  const x2 = cx + length * Math.cos(rad);
  const y2 = cy + length * Math.sin(rad);
  const line2 = two.makeLine(cx, cy, x2, y2);
  line2.stroke = "#e84a5f";
  line2.linewidth = 3;

  // center marker
  const centerDot = two.makeCircle(cx, cy, 3);
  centerDot.fill = "#111";
  centerDot.noStroke();

  // Draw an arc between 0 and rad using small segments
  const arcRadius = 40;
  const steps = Math.max(6, Math.min(64, Math.floor(Math.abs(deg) / 2) + 6));
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * rad;
    const px = cx + arcRadius * Math.cos(t);
    const py = cy + arcRadius * Math.sin(t);
    points.push({ x: px, y: py });
  }

  // Create small connected lines to represent the arc
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const seg = two.makeLine(p1.x, p1.y, p2.x, p2.y);
    seg.stroke = "#5555ff";
    seg.linewidth = 2;
  }
}

let plname: string | null = null;

let score = 0;
let ans = -1;

function newGame() {
  ans = Math.floor((Math.random() * 359) / 10) * 10;
  drawAngle(ans);
}

function setTitle() {
  let t = document.getElementById("title");
  if (!t) return;
  t.textContent = `지금 까지 ${score}개!` + (plname ? " (" + plname + ")" : "");
}

document.getElementById("setname")?.addEventListener("click", () => {
  const namePrompt = () => {
    // allow only english in lowercase, numbers, _, -
    const name = prompt(
      "이름을 입력하세요 (영어 소문자, 숫자, _, - 만 가능, 최대 10자)"
    );
    if (!name) return null;
    if (name.length > 10) {
      alert("이름이 너무 깁니다. 최대 10자까지 가능합니다.");
      return namePrompt();
    }
    if (!/^[a-z0-9_-]+$/.test(name)) {
      alert("이름에 허용되지 않는 문자가 포함되어 있습니다.");
      return namePrompt();
    }
    return name;
  };
  plname = namePrompt();
  setTitle();
});

newGame();

function ss() {
  console.log("Save score", plname, score);
  if (plname == null) return;
  console.log("Save score real", plname, score);
  LDBoard.saveScore(plname + "", score + 0, `${score}개`);
}

function onGuess() {
  const val = document.getElementById("ang") as HTMLInputElement;
  if (!val) return;
  if (val.value.trim() == "") return notifier.show("각을 입력해 주세요");
  const vv = parseInt(val.value.trim());
  if (isNaN(vv)) return notifier.show("각을 입력해 주세요");
  let isCorrect = vv == ans;
  if (!isCorrect) {
    notifier.show(`틀렸습니다. (정답: ${ans}')`);
    ss();
    score = 0;
    val.value = "";
    val.focus();
    newGame();
    setTitle();
    return;
  }

  score++;
  setTitle();
  newGame();
  val.value = "";
  val.focus();
}

document.getElementById("frm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  e.stopImmediatePropagation();
  e.stopPropagation();
  onGuess();
});
