let bodies = [];
let mouseInsideCanvas = false;
let mousePos = null;

function setup() {
  const container = document.getElementById('p5-container');
  const w = container.offsetWidth;
  const h = container.offsetHeight;

  canvas = createCanvas(w, h);
canvas.parent(container);
canvas.style('background', 'transparent'); // ✅ 设置 canvas 背景透明

  // DOM 原生鼠标事件监听（适配 iframe）
  canvas.elt.addEventListener('mouseenter', () => {
    mouseInsideCanvas = true;
  });

  canvas.elt.addEventListener('mouseleave', () => {
    mouseInsideCanvas = false;
  });

  canvas.elt.addEventListener('mousemove', (e) => {
    const rect = canvas.elt.getBoundingClientRect();
    mousePos = createVector(e.clientX - rect.left, e.clientY - rect.top);
  });

  generateBodies();
  textAlign(CENTER, CENTER);
  textSize(14);
}

function draw() {
  clear();

  // 鼠标控制隐藏引力体
  if (mouseInsideCanvas && mousePos && bodies[0]) {
    let x = constrain(mousePos.x, 0, width);
    let y = constrain(mousePos.y, 0, height);
    bodies[0].pos.set(x, y);
    bodies[0].vel.set(0, 0);
  }

  // 小球受力逻辑
  for (let i = 1; i < bodies.length; i++) {
    let totalForce = createVector(0, 0);

    if (mouseInsideCanvas && mousePos) {
      for (let j = 0; j < bodies.length; j++) {
        if (i !== j) {
          let force = calculateAttraction(bodies[j], bodies[i]);
          totalForce.add(force);
        }
      }
    } else {
      let centerPos = createVector(width / 2, height / 2);
      let toCenter = p5.Vector.sub(centerPos, bodies[i].pos);
      let d = constrain(toCenter.mag(), 10, 100);
      toCenter.normalize();
      let strength = (bodies[i].mass * 50) / (d * d);
      let force = toCenter.mult(strength);
      totalForce.add(force);
    }

    applyForce(bodies[i], totalForce);
  }

  // 更新和绘制可见 body
  for (let i = 1; i < bodies.length; i++) {
    updateBody(bodies[i]);
    drawBody(bodies[i]);
  }

  /*// 文本提示
  fill(0, 150);
  noStroke();
  text(
    mouseInsideCanvas
      ? 'Mouse = Gravity Source • Press "R" to regenerate'
      : 'Mouse left → Returning to center...',
    width / 2,
    20
  );

  // 左上角鼠标坐标调试信息
  fill(0);
  textSize(14);
  if (mousePos) {
    text(`mouseX: ${mousePos.x.toFixed(1)}\nmouseY: ${mousePos.y.toFixed(1)}`, width / 2, 30);
  } else {
    text(`No mousePos yet`, width / 2, 30);
  }*/
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    generateBodies();
  }
}

function generateBodies() {
  bodies = [];

  // 鼠标控制的 body（隐藏）
  bodies.push({
    pos: createVector(width / 2, height / 2),
    vel: createVector(0, 0),
    mass: 200,
    size: 15,
    color: color('#B8ACAC'),
    trail: []
  });

  // 两个可见的 body
  for (let i = 0; i < 2; i++) {
    bodies.push({
      pos: createVector(random(100, width - 100), random(100, height - 100)),
      vel: createVector(random(-1, 1), random(-1, 1)),
      mass: 50,
      size: 15,
      color: color('#B8ACAC'),
      trail: []
    });
  }
}

function calculateAttraction(bodyA, bodyB) {
  let G = 1;
  let dir = p5.Vector.sub(bodyA.pos, bodyB.pos);
  let d = constrain(dir.mag(), 5, 50);
  dir.normalize();
  let forceMag = (G * bodyA.mass * bodyB.mass) / (d * d);
  return dir.mult(forceMag);
}

function applyForce(body, force) {
  let acc = p5.Vector.div(force, body.mass);
  body.vel.add(acc);
}

function updateBody(body) {
  body.pos.add(body.vel);
  body.trail.push(body.pos.copy());
  if (body.trail.length > 200) body.trail.shift();
}

function drawBody(body) {
  noStroke();
  fill(body.color);
  ellipse(body.pos.x, body.pos.y, body.size, body.size);

  noFill();
  stroke(body.color);
  beginShape();
  for (let p of body.trail) {
    vertex(p.x, p.y);
  }
  endShape();
}

function windowResized() {
  const container = document.getElementById('p5-container');
  resizeCanvas(container.offsetWidth, container.offsetHeight);
}
