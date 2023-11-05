import { getLetterHtml } from './lib/letterCanister';
import { Spring } from './lib/spring';
import './style.css';

const springPrimary = new Spring(20, 1.0, 1.0, 5.0); // main movement
const springSecondary = new Spring(1, 1.0, 5.0, 1.0); // small infinite pulse
springSecondary.setTarget(2.5);

const canvas = document.querySelector('canvas')!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  dotScale[dotScale.length - 1] = (Math.max(innerWidth, innerHeight) / 24) * 2;
});

let html = fetchLetter();

const dotScale = [
  1.0,
  2.0,
  5.0,
  10.0,
  (Math.max(innerWidth, innerHeight) / 24) * 2,
];
let dotScaleIndex = 0;
let revertHandle: ReturnType<typeof setTimeout>;
canvas.addEventListener('click', () => {
  dotScaleIndex = Math.min(dotScaleIndex + 1, dotScale.length - 1);
  springPrimary.setTarget(20 * dotScale[dotScaleIndex]);
  if (dotScaleIndex < dotScale.length - 1) {
    springPrimary.setFriction(1.35);
    springPrimary.setTension(15.0);
  } else {
    springPrimary.setFriction(1.35);
    springPrimary.setTension(2.0);
    document
      .querySelector('meta[name="theme-color"]')!
      .setAttribute('content', '#000000');
  }
  if (revertHandle) {
    clearTimeout(revertHandle);
  }
  if (dotScaleIndex < dotScale.length - 1) {
    revertHandle = setTimeout(() => {
      springPrimary.setTarget(20 * dotScale[dotScaleIndex] * 1.05);
      setTimeout(() => {
        dotScaleIndex = 0;
        springPrimary.setTarget(20 * dotScale[dotScaleIndex]);
        springPrimary.setFriction(1.25);
        springPrimary.setTension(1.2);
      }, 100);
    }, 1500);
  } else {
    setTimeout(async () => {
      html.then((html) => {
        document.open();
        document.write(html);
        document.close();
      });
    }, 250);
  }
});

let lastPaint = Date.now();
function paint() {
  requestAnimationFrame(paint);

  const now = Date.now(),
    delta = Math.min(now - lastPaint, 20);
  springPrimary.update(delta);
  springSecondary.update(delta);
  lastPaint = now;

  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(
    canvas.width / 2,
    canvas.height / 2,
    (springPrimary.x + springSecondary.x) / 2,
    0,
    2 * Math.PI,
    false
  );
  ctx.fill();
}

requestAnimationFrame(paint);

async function fetchLetter(): Promise<string> {
  while (true) {
    try {
      return await getLetterHtml();
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}
