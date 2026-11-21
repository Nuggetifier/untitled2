// Canvas, input, and frame-loop setup.
const element = document.getElementById('game');
if (!(element instanceof HTMLCanvasElement)) throw new Error('Canvas not found');
export const canvas = element;
const context = canvas.getContext('2d');
if (!context) throw new Error('Could not create the 2D canvas context');
export const ctx = context;

// Match the drawing area to the visible window: one canvas pixel per CSS pixel.
function resizeCanvas(): void {
  const bounds = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(bounds.width));
  const height = Math.max(1, Math.round(bounds.height));
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
}
resizeCanvas();
new ResizeObserver(resizeCanvas).observe(canvas);
window.addEventListener('resize', resizeCanvas);

// Key names are lowercase: 'w', 'arrowleft', 'shift', 'control', 'escape'.
export const keys = new Set<string>();
window.addEventListener('keydown', (event: KeyboardEvent) => {
  keys.add(event.key.toLowerCase());
  if (event.key.startsWith('Arrow') || event.key === ' ') event.preventDefault();
});
window.addEventListener('keyup', (event: KeyboardEvent) => {
  keys.delete(event.key.toLowerCase());
});

// deltaX / deltaY are total relative movement this frame while locked.
// x / y remain available for menus when the cursor is unlocked.
export const mouse = {
  x: 0, y: 0, deltaX: 0, deltaY: 0, locked: false,
  leftDown: false, middleDown: false, rightDown: false, scroll: 0,
};

// Browsers require a click before they can hide and capture the cursor.
export async function lockMouse(): Promise<void> {
  if (document.pointerLockElement === canvas) return;
  try {
    await canvas.requestPointerLock();
  } catch (error) {
    console.error('Could not capture the mouse. Click the canvas to try again.', error);
  }
}
canvas.addEventListener('click', () => { void lockMouse(); });
document.addEventListener('pointerlockchange', () => {
  mouse.locked = document.pointerLockElement === canvas;
  mouse.deltaX = mouse.deltaY = mouse.scroll = 0;
  mouse.leftDown = mouse.middleDown = mouse.rightDown = false;
  if (!mouse.locked) keys.clear();
});
function updateMouse(event: MouseEvent): void {
  if (document.pointerLockElement === canvas) return;
  const bounds = canvas.getBoundingClientRect();
  mouse.x = (event.clientX - bounds.left) * canvas.width / bounds.width;
  mouse.y = (event.clientY - bounds.top) * canvas.height / bounds.height;
}
document.addEventListener('mousemove', (event: MouseEvent) => {
  if (document.pointerLockElement !== canvas) return;
  mouse.deltaX += event.movementX;
  mouse.deltaY += event.movementY;
});
canvas.addEventListener('mousemove', updateMouse);
canvas.addEventListener('mousedown', (event: MouseEvent) => {
  updateMouse(event);
  if (event.button === 0) mouse.leftDown = true;
  if (event.button === 1) mouse.middleDown = true;
  if (event.button === 2) mouse.rightDown = true;
  event.preventDefault();
});
window.addEventListener('mouseup', (event: MouseEvent) => {
  if (event.button === 0) mouse.leftDown = false;
  if (event.button === 1) mouse.middleDown = false;
  if (event.button === 2) mouse.rightDown = false;
});
canvas.addEventListener('wheel', (event: WheelEvent) => {
  updateMouse(event);
  const unit = event.deltaMode === 1 ? 40 : event.deltaMode === 2 ? canvas.height : 1;
  mouse.scroll += event.deltaY * unit;
  event.preventDefault();
}, { passive: false });
canvas.addEventListener('contextmenu', event => event.preventDefault());
window.addEventListener('blur', () => {
  keys.clear();
  mouse.leftDown = mouse.middleDown = mouse.rightDown = false;
  mouse.scroll = mouse.deltaX = mouse.deltaY = 0;
  if (document.pointerLockElement === canvas) document.exitPointerLock();
});

// deltaTime is seconds since the previous frame. Movement and wheel reset after frame().
export function startLoop(frame: (deltaTime: number) => void): void {
  let previousTime: number | undefined;
  function tick(time: number): void {
    const deltaTime = previousTime === undefined ? 0 : Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;
    frame(deltaTime);
    mouse.scroll = mouse.deltaX = mouse.deltaY = 0;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
