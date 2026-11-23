import { canvas, ctx, keys, mouse, startLoop } from './backend';





export function startGame(): void {
  let player = { x: 0, y: 0, z: 0};
  let camera = { a: 0, b: 0 }
  type block = { x1: number, y1: number, z1: number, x2: number, y2: number, z2: number};
  type point2 = { x: number, y: number };
  type point3 = { x: number, y: number, z: number };
  type block7 = {
    x1: number, y1: number, b1: boolean,
    x2: number, y2: number, b2: boolean,
    x3: number, y3: number, b3: boolean,
    x4: number, y4: number, b4: boolean,
    x5: number, y5: number, b5: boolean,
    x6: number, y6: number, b6: boolean,
    x7: number, y7: number, b7: boolean,
    t: number, relX: number,
    relY: number, relZ: number
    drawX: boolean, drawY: boolean, drawZ: boolean
  };
  type point2B = { x: number, y: number, b: boolean };
  let currentDraw: block7 = {
    x1: 0, y1: 0, b1: false,
    x2: 0, y2: 0, b2: false,
    x3: 0, y3: 0, b3: false,
    x4: 0, y4: 0, b4: false,
    x5: 0, y5: 0, b5: false,
    x6: 0, y6: 0, b6: false,
    x7: 0, y7: 0, b7: false,
    t: 0,
    relX: 0,
    relY: 0,
    relZ: 0,
    drawX: false,
    drawY: false,
    drawZ: false
  };
  let blocks: block[] = [
    { x1: 100, y1: 100, z1: 100, x2: 10, y2: 10, z2: 10 },
    { x1: 250, y1: 100, z1: 100, x2: 160, y2: 10, z2: 10 },
    { x1: 100, y1: 250, z1: 100, x2: 10, y2: 160, z2: 10 },
    { x1: 250, y1: 250, z1: 180, x2: 160, y2: 160, z2: 10 },
    { x1: 400, y1: 180, z1: 60, x2: 310, y2: 40, z2: 10 }
  ];

  const pi = Math.PI;
  let sensitivity = 0.002;
  let focus, focusX, focusY: point3 = { x: 0, y: 0, z: 0 };
  let pointF: point3;
  let pointD: point3;
  let cameraDistance;
  let drawing: block7[] = [];
  const scale = 400;

  let renderWithDot = 0;
  let fixBehind = false;
  let currentPoint: point3;
  let temp: point3;
  let distance: number;

  function drawCubeFace(points: point2B[]): void {
    if(points.length < 3) return;
    let pointsBehind = 0;
    let pointsBefore = 0;
    let startedWithFront = false;
    let newPoints: point2[] = [];
    if(fixBehind) {

      for (let i = 0; i < points.length; i++) {
        if (pointsBefore > 0) {
          newPoints.splice(i - pointsBefore, 0, {x: points[i].x, y: points[i].y});
          if(points[i].b) {
            pointsBehind++;
          }
        }
        else {
          newPoints.push({x: points[i].x, y: points[i].y});
          pointsBefore--;
          if(points[i].b) {
            pointsBehind++;
            startedWithFront = false;
          }
          else {
            if(i == 0) startedWithFront = true;

          }
          if(points[i + 1]) if(points[i].b && !points[i + 1].b) pointsBefore = -pointsBefore;

        }
      }

    }
    if(pointsBehind === 4) return;
    if(pointsBehind === 3) {
      ctx.beginPath();
      const point0 = {x: canvas.width / 2 + newPoints[0].x * scale, y: canvas.height / 2 + newPoints[0].y * scale};
      const point1 = {x: canvas.width / 2 + newPoints[1].x * scale, y: canvas.height / 2 + newPoints[1].y * scale};
      const point2 = {x: canvas.width / 2 + newPoints[3].x * scale, y: canvas.height / 2 + newPoints[3].y * scale};
      ctx.moveTo(point0.x, point0.y);
      ctx.lineTo(2 * point0.x - point1.x, 2 * point0.y - point1.y);

      ctx.lineTo(2 * point0.x - point2.x, 2 * point0.y - point2.y);
      ctx.closePath();
      ctx.fill();
    }

    if(pointsBehind == 2) {
      ctx.beginPath();
      const point0 = {x: canvas.width / 2 + newPoints[0].x * scale, y: canvas.height / 2 + newPoints[0].y * scale};
      const point1 = {x: canvas.width / 2 + newPoints[1].x * scale, y: canvas.height / 2 + newPoints[1].y * scale};
      const point2 = {x: canvas.width / 2 + newPoints[2].x * scale, y: canvas.height / 2 + newPoints[2].y * scale};
      const point3 = {x: canvas.width / 2 + newPoints[3].x * scale, y: canvas.height / 2 + newPoints[3].y * scale};
      ctx.moveTo(point0.x, point0.y);
      ctx.lineTo(point1.x, point1.y);
      ctx.lineTo(2 * point1.x - point2.x, 2 * point1.y - point2.y);
      ctx.lineTo(2 * point0.x - point3.x, 2 * point0.y - point3.y);
      ctx.closePath();
      ctx.fill();
    }

    if(pointsBehind == 1) {
    ctx.beginPath();
    const point0 = {x: canvas.width / 2 + newPoints[0].x * scale, y: canvas.height / 2 + newPoints[0].y * scale};
    const point1 = {x: canvas.width / 2 + newPoints[1].x * scale, y: canvas.height / 2 + newPoints[1].y * scale};
    const point2 = {x: canvas.width / 2 + newPoints[2].x * scale, y: canvas.height / 2 + newPoints[2].y * scale};
    const point3 = {x: canvas.width / 2 + newPoints[3].x * scale, y: canvas.height / 2 + newPoints[3].y * scale};
    ctx.moveTo(point0.x, point0.y);
    ctx.lineTo(point1.x, point1.y);
    ctx.lineTo(point2.x, point2.y);
    ctx.lineTo(2 * point2.x - point3.x, 2 * point2.y - point3.y);
    ctx.lineTo(2 * point0.x - point3.x, 2 * point0.y - point3.y);
    ctx.closePath();
    ctx.fill();
    } if(pointsBehind == 0) {
      ctx.beginPath();

      if (!points[0].b) ctx.moveTo(canvas.width / 2 + points[0].x * scale, canvas.height / 2 + points[0].y * scale)
      for (let i = 0; i < points.length; i++) {
        const point = {
          x: canvas.width / 2 + points[i].x * scale,
          y: canvas.height / 2 + points[i].y * scale
        };
        ctx.lineTo(point.x, point.y);
      }
      ctx.closePath();
      ctx.fill();
    }
  }


  window.addEventListener('keydown', (event) => {
    if (event.repeat) return; // Ignore repeats while held

    if (event.key === 'f') {
      if(keys.has('f')) fixBehind = !fixBehind;
    }
  });




  const frame = (deltaTime: number): void => {
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawing = [];
    drawing.length = 0;

    camera.a = Math.min(Math.max(camera.a + mouse.deltaY * sensitivity, -pi/2), pi/2)
    camera.b = ((camera.b + mouse.deltaX * sensitivity) % (2 * pi) + 2 * pi) % (2 * pi);

    if(keys.has('w')) {
      player.x += Math.cos(camera.b) * deltaTime * 100;
      player.y += Math.sin(camera.b) * deltaTime * 100;
    }
    if(keys.has('s')) {
      player.x -= Math.cos(camera.b) * deltaTime * 100;
      player.y -= Math.sin(camera.b) * deltaTime * 100;
    }
    if(keys.has('a')) {
      player.x += Math.sin(camera.b) * deltaTime * 100;
      player.y -= Math.cos(camera.b) * deltaTime * 100;
    }
    if(keys.has('d')) {
      player.x -= Math.sin(camera.b) * deltaTime * 100;
      player.y += Math.cos(camera.b) * deltaTime * 100;
    }
    if(keys.has('shift')) player.z += deltaTime * 100;
    if(keys.has(' ')) player.z -= deltaTime * 100;



    focus = {x: Math.cos(camera.b) * Math.cos(camera.a), y: Math.sin(camera.b) * Math.cos(camera.a), z: Math.sin(camera.a)};
    focusX = {x: -Math.sin(camera.b), y: Math.cos(camera.b), z: 0 }
    focusY = {x: Math.cos(camera.b) * -Math.sin(camera.a), y: Math.sin(camera.b) * -Math.sin(camera.a), z: Math.cos(camera.a)}

    for(let i = 0; i < blocks.length; i++) {
      pointF = {
        x: (Math.abs(focus.x - (blocks[i].x1 - player.x)) < Math.abs(focus.x - (blocks[i].x2 - player.x)) ? blocks[i].x1 - player.x : blocks[i].x2 - player.x),
        y: (Math.abs(focus.y - (blocks[i].y1 - player.y)) < Math.abs(focus.y - (blocks[i].y2 - player.y)) ? blocks[i].y1 - player.y : blocks[i].y2 - player.y),
        z: (Math.abs(focus.z - (blocks[i].z1 - player.z)) < Math.abs(focus.z - (blocks[i].z2 - player.z)) ? blocks[i].z1 - player.z : blocks[i].z2 - player.z)
      };
      pointD = {
        x: (Math.abs(focus.x - (blocks[i].x1 - player.x)) < Math.abs(focus.x - (blocks[i].x2 - player.x)) ? blocks[i].x2 - player.x : blocks[i].x1 - player.x),
        y: (Math.abs(focus.y - (blocks[i].y1 - player.y)) < Math.abs(focus.y - (blocks[i].y2 - player.y)) ? blocks[i].y2 - player.y : blocks[i].y1 - player.y),
        z: (Math.abs(focus.z - (blocks[i].z1 - player.z)) < Math.abs(focus.z - (blocks[i].z2 - player.z)) ? blocks[i].z2 - player.z : blocks[i].z1 - player.z)
      };
      if(renderWithDot == 0) {
        // Per-axis products. Index 0 = pointF, index 1 = pointD.
        const dX = [pointF.x * focus.x, pointD.x * focus.x];
        const dY = [pointF.y * focus.y, pointD.y * focus.y];
        const dZ = [pointF.z * focus.z, pointD.z * focus.z];
        const hX = [pointF.x * focusX.x, pointD.x * focusX.x];
        const hY = [pointF.y * focusX.y, pointD.y * focusX.y];
        const hZ = [pointF.z * focusX.z, pointD.z * focusX.z];
        const vX = [pointF.x * focusY.x, pointD.x * focusY.x];
        const vY = [pointF.y * focusY.y, pointD.y * focusY.y];
        const vZ = [pointF.z * focusY.z, pointD.z * focusY.z];

        cameraDistance = dX[0] + dY[0] + dZ[0];
        currentDraw.t = pointF.x * pointF.x + pointF.y * pointF.y + pointF.z * pointF.z;
        let behind = false;

        for (let i = 0; i < 7; i++) {
          behind = false;
          // The bits of i pick F or D per axis. This matches your x1..x7 order, and x8 = DDD.
          const a = (i >> 2) & 1, b = (i >> 1) & 1, c = i & 1;
          const depth = dX[a] + dY[b] + dZ[c];
          if (depth <= 0) {
            behind = true;
          }
          const inv = 1 / depth;
          const xKey = `x${i + 1}` as
              'x1' | 'x2' | 'x3' | 'x4' | 'x5' | 'x6' | 'x7';

          const yKey = `y${i + 1}` as
              'y1' | 'y2' | 'y3' | 'y4' | 'y5' | 'y6' | 'y7';

          const bKey = `b${i + 1}` as
              'b1' | 'b2' | 'b3' | 'b4' | 'b5' | 'b6' | 'b7';


          currentDraw[xKey] = (hX[a] + hY[b] + hZ[c]) * inv;
          currentDraw[yKey] = (vX[a] + vY[b] + vZ[c]) * inv;
          currentDraw[bKey] = behind;



        }
      } if(renderWithDot == 1) {
        for (let i = 0; i < 7; i++) {
          const a = (i >> 2) & 1, b = (i >> 1) & 1, c = i & 1;
          const xKey = `x${i + 1}` as
              'x1' | 'x2' | 'x3' | 'x4' | 'x5' | 'x6' | 'x7';

          const yKey = `y${i + 1}` as
              'y1' | 'y2' | 'y3' | 'y4' | 'y5' | 'y6' | 'y7'
          currentPoint = {x: (a == 0) ? pointF.x : pointD.x, y: (b == 0) ? pointF.y : pointD.y, z: (c == 0) ? pointF.z : pointD.z};
          distance = Math.sqrt(currentPoint.x * currentPoint.x + currentPoint.y * currentPoint.y + currentPoint.z * currentPoint.z);
          currentPoint.x /= distance;
          currentPoint.y /= distance;
          currentPoint.z /= distance;
          currentDraw[yKey] = Math.asin(currentPoint.z) - camera.a;
          currentDraw[xKey] = Math.atan2(currentPoint.y, currentPoint.x) - camera.b;
        }
      } if(renderWithDot == 2) {
        for (let i = 0; i < 7; i++) {
          // The bits of i pick F or D per axis. This matches your x1..x7 order, and x8 = DDD.
          const a = (i >> 2) & 1, b = (i >> 1) & 1, c = i & 1;
          const xKey = `x${i + 1}` as
              'x1' | 'x2' | 'x3' | 'x4' | 'x5' | 'x6' | 'x7';

          const yKey = `y${i + 1}` as
              'y1' | 'y2' | 'y3' | 'y4' | 'y5' | 'y6' | 'y7'
          currentPoint = {
            x: (a == 1) ? pointF.x : pointD.x,
            y: (b == 1) ? pointF.y : pointD.y,
            z: (c == 1) ? pointF.z : pointD.z
          };
          if(currentPoint) {
          temp = {
            x: currentPoint.x * Math.sin(camera.a) / Math.sin(camera.b),
            y: currentPoint.y * Math.sin(camera.a) / Math.cos(camera.b),
            z: currentPoint.z * Math.cos(camera.a)
          }
          }

          distance = Math.sqrt(temp.x * temp.x + temp.y * temp.y + temp.z * temp.z);
          currentPoint.x /= distance;
          currentPoint.y /= distance;
          currentPoint.z /= distance;
          currentDraw[yKey] = currentPoint.z;
          currentDraw[xKey] = Math.asin(temp.x);
        }
      }
      currentDraw.relX = pointF.x;
      currentDraw.relY = pointF.y;
      currentDraw.relZ = pointF.z;
      currentDraw.drawX = (0 > pointF.x && 0 < pointD.x) || (0 < pointF.x && 0 > pointD.x);
      currentDraw.drawY = (0 > pointF.y && 0 < pointD.y) || (0 < pointF.y && 0 > pointD.y);
      currentDraw.drawZ = (0 > pointF.z && 0 < pointD.z) || (0 < pointF.z && 0 > pointD.z);


         for(let j = 0; j <= drawing.length; j++) {
           if(drawing[j]) {
             if (drawing[j].t < currentDraw.t) continue;
           }
           drawing.splice(j, 0, {...currentDraw})
           break;
         }
    }
    for(let i = drawing.length - 1; i >= 0; i--) {
      const draw = drawing[i]
      const cx = Math.min(draw.relX / Math.sqrt(draw.relX * draw.relX + draw.relY * draw.relY + draw.relZ * draw.relZ), 1)
      const cy = Math.min(draw.relY / Math.sqrt(draw.relX * draw.relX + draw.relY * draw.relY + draw.relZ * draw.relZ), 1)
      const cz = Math.min(draw.relZ / Math.sqrt(draw.relX * draw.relX + draw.relY * draw.relY + draw.relZ * draw.relZ), 1)
      // X face: all four points use pointF.x
      if (!draw.drawX) {
        ctx.fillStyle = `rgb(0, 0, ${Math.abs(cx) * 255})`;
        drawCubeFace([
          {x: draw.x1, y: draw.y1, b: draw.b1},
          {x: draw.x2, y: draw.y2, b: draw.b2},
          {x: draw.x4, y: draw.y4, b: draw.b4},
          {x: draw.x3, y: draw.y3, b: draw.b3}
        ]);
      }

// Y face: all four points use pointF.y
      if (!draw.drawY) {
        ctx.fillStyle = `rgb(0, 0, ${Math.abs(cy) * 255})`;
        drawCubeFace([
          {x: draw.x1, y: draw.y1, b: draw.b1},
          {x: draw.x2, y: draw.y2, b: draw.b2},
          {x: draw.x6, y: draw.y6, b: draw.b6},
          {x: draw.x5, y: draw.y5, b: draw.b5}
        ]);
      }

// Z face: all four points use pointF.z
      if (!draw.drawZ) {
        ctx.fillStyle = `rgb(0, 0, ${Math.abs(cz) * 255})`;
        drawCubeFace([
          {x: draw.x1, y: draw.y1, b: draw.b1},
          {x: draw.x3, y: draw.y3, b: draw.b3},
          {x: draw.x7, y: draw.y7, b: draw.b7},
          {x: draw.x5, y: draw.y5, b: draw.b5}
        ]);
      }

    }
    const fps = 1 / deltaTime;
    ctx.fillStyle = 'black';
    ctx.font = '16px sans-serif';
    ctx.fillText(`FPS: ${fps.toFixed(1)}`, 10, 20);
  }


  startLoop(frame);
}
