import { canvas, ctx, keys, mouse, startLoop } from './backend';





export function startGame(): void {
  let player = { x: 0, y: 0, z: 0, velX: 0, velY: 0, velZ: 0, width: 10, depth: 10, height: 30, speed: 70, jump: 100};
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
    { x1: 100, y1: 100, z1: 100, x2: -100, y2: -100, z2: 10 },
    { x1: 250, y1: 100, z1: 100, x2: 155, y2: 10, z2: 10 },
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

  const reflectionStrength = 50;

  let renderWithDot = 0;
  let fixBehind = true;
  let currentPoint: point3;
  let temp: point3 = {x: 0, y: 0, z: 0};
  let distance: number;
  let flying = false;
  let spaceWasDown = 0;
  let gravity = 300;
  let block: block;
  let ground = false;


  for(let i = 0; i < blocks.length; i++) {
    block = blocks[i];
    if(block.x1 > block.x2) {
      temp.x = block.x1;
      block.x1 = block.x2;
      block.x2 = temp.x;
    } if(block.y1 > block.y2) {
      temp.y = block.y1;
      block.y1 = block.y2;
      block.y2 = temp.y;
    } if(block.z1 > block.z2) {
      temp.z = block.z1;
      block.z1 = block.z2;
      block.z2 = temp.z;
    }
  }

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
      ctx.lineTo(reflectionStrength * point0.x - reflectionStrength * point1.x + point1.x, reflectionStrength * point0.y - reflectionStrength * point1.y + point1.y);

      ctx.lineTo(reflectionStrength * point0.x - reflectionStrength * point2.x + point2.x, reflectionStrength * point0.y - reflectionStrength * point2.y + point2.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    if(pointsBehind == 2) {
      ctx.beginPath();
      const point0 = {x: canvas.width / 2 + newPoints[0].x * scale, y: canvas.height / 2 + newPoints[0].y * scale};
      const point1 = {x: canvas.width / 2 + newPoints[1].x * scale, y: canvas.height / 2 + newPoints[1].y * scale};
      const point2 = {x: canvas.width / 2 + newPoints[2].x * scale, y: canvas.height / 2 + newPoints[2].y * scale};
      const point3 = {x: canvas.width / 2 + newPoints[3].x * scale, y: canvas.height / 2 + newPoints[3].y * scale};
      ctx.moveTo(point0.x, point0.y);
      ctx.lineTo(point1.x, point1.y);
      ctx.lineTo(reflectionStrength * point1.x - reflectionStrength * point2.x + point2.x, reflectionStrength * point1.y - reflectionStrength * point2.y + point2.y);
      ctx.lineTo(reflectionStrength * point0.x - reflectionStrength * point3.x + point3.x, reflectionStrength * point0.y - reflectionStrength * point3.y + point3.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
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
    ctx.lineTo(reflectionStrength * point2.x - reflectionStrength * point3.x + point3.x, reflectionStrength * point2.y - reflectionStrength * point3.y + point3.y);
    ctx.lineTo(reflectionStrength * point0.x - reflectionStrength * point3.x + point3.x, reflectionStrength * point0.y - reflectionStrength * point3.y + point3.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
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
      ctx.stroke();
    }
  }


  window.addEventListener('keydown', (event) => {
    if (event.repeat) return; // Ignore repeats while held
    if(event.key === ' ') {
      spaceWasDown += 30;
      if (spaceWasDown > 30) {
        flying = !flying;
        if (flying) player.velZ = 0;
        spaceWasDown = 0;
      }
    }
      if(event.key === 'r') {
        player.x = 0;
        player.y = 0;
        player.z = 0;
        ground = false;
        player.velX = 0;
        player.velY = 0;
        player.velZ = 0;
        camera.a = 0;
        camera.b = 0;
      }
  });


  function collideBlock(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) {
    const playerTop = z2 - (player.z - player.height / 2);
    const playerBottom = player.z + player.height / 2 - z1;
    const playerFront = y2 - (player.y - player.depth / 2);
    const playerBack = player.y + player.depth / 2 - y1;
    const playerLeft = x2 - (player.x - player.width / 2);
    const playerRight = player.x + player.width / 2 - x1;
    if(playerLeft > 0 && playerRight > 0  && playerBack > 0 && playerFront > 0 && playerBottom > 0 && playerTop > 0) {
      const min = Math.min(playerLeft, playerRight, playerBack, playerFront, playerBottom, playerTop);
      if(min == playerTop) return 1;
      if(min == playerFront) return 2;
      if(min == playerRight) return 3;
      if(min == playerLeft) return 4;
      if(min == playerBack) return 5;
      if(min == playerBottom) return 6;
    } else return 0;
  }



  const frame = (deltaTime: number): void => {
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    //--------------------------------------------PHYSICS--------------------------------------------------------------\

    player.x += player.velX * deltaTime;
    player.y += player.velY * deltaTime;
    player.z += player.velZ * deltaTime;
    if(!flying) player.velZ += gravity * deltaTime;


    camera.a = Math.min(Math.max(camera.a + mouse.deltaY * sensitivity, -pi/2), pi/2)
    camera.b = ((camera.b + mouse.deltaX * sensitivity) % (2 * pi) + 2 * pi) % (2 * pi);



    player.velX = 0;
    player.velY = 0;
    if(flying) {
      player.velZ = 0;
    }

    //COLLISION
    for(let i = 0; i < blocks.length; i++) {
      block = blocks[i];
    const collision = collideBlock(block.x1, block.y1, block.z1, block.x2, block.y2, block.z2);
    if (collision) {
      if (collision == 1)  {
        player.velZ = 0;
        player.z = block.z2 + player.height / 2

      }
      if (collision == 2) {
        player.y = block.y2 + player.width / 2
        player.velY = 0;
      }
      if (collision == 3) {
        player.x = block.x1 - player.width / 2
        player.velX = 0;
      }
      if (collision == 4) {
        player.x = block.x2 + player.width / 2
        player.velX = 0;
      }
      if (collision == 5) {
        player.y = block.y1 - player.depth / 2
        player.velY = 0;
      }
      if (collision == 6) {
        player.velZ = 0;
        player.z = block.z1 - player.height / 2
        ground = true;
      }
    }
  }

    if(keys.has('w')) {
      player.velX += Math.cos(camera.b) * player.speed;
      player.velY += Math.sin(camera.b) * player.speed;
    }
    if(keys.has('s')) {
      player.velX += -Math.cos(camera.b) * player.speed;
      player.velY += -Math.sin(camera.b) * player.speed;
    }
    if(keys.has('a')) {
      player.velX += Math.sin(camera.b) * player.speed;
      player.velY += -Math.cos(camera.b) * player.speed;
    }
    if(keys.has('d')) {
      player.velX += -Math.sin(camera.b) * player.speed;
      player.velY += Math.cos(camera.b) * player.speed;
    }
    if(flying) {
      if (keys.has('shift')) player.velZ += 100;
    }
    if(keys.has(' ')) {
      if(ground) {
        player.velZ -= player.jump;
        ground = false;
      } if(flying) {
        player.velZ -= 100;
      }
    }
    if(spaceWasDown > 0) {
      spaceWasDown -= deltaTime * 60;
    }





















    //------------------------------------------RENDERING--------------------------------------------------------------



    drawing = [];
    drawing.length = 0;

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
    if(ground) {
      ctx.fillText(`Grounded`, 10, 40);
    }
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.font = '50px sans-serif';
    ctx.fillText('+', canvas.width/2,canvas.height/2);
    ctx.restore();
  }


  startLoop(frame);
}
