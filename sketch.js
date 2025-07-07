let bodies = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  generateBodies();
  textAlign(CENTER, CENTER);
  textSize(14);
}

function draw() {
  clear(); // 透明背景

  // 鼠标控制第一个 body 的位置和静止速度
  bodies[0].pos.set(mouseX, mouseY);
  bodies[0].vel.set(0, 0);

  // 计算引力（从其他 body 出发，感受来自鼠标 body 和其他 body 的力）
  for (let i = 1; i < bodies.length; i++) {
    let totalForce = createVector(0, 0);
    for (let j = 0; j < bodies.length; j++) {
      if (i !== j) {
        let force = calculateAttraction(bodies[j], bodies[i]);
        totalForce.add(force);
      }
    }
    applyForce(bodies[i], totalForce);
  }

  // 更新位置（跳过鼠标 body）
  for (let i = 1; i < bodies.length; i++) {
    updateBody(bodies[i]);
  }

  // 绘制除鼠标以外的 body
  for (let i = 1; i < bodies.length; i++) {
    drawBody(bodies[i]);
  }

  // UI 提示
  fill(255, 100);
  noStroke();
  text('Mouse = 2x Gravity • Press "R" to regenerate', width / 2, 20);
}

// 重新生成3个 body
function keyPressed() {
  if (key === 'r' || key === 'R') {
    generateBodies();
  }
}

function generateBodies() {
  bodies = [];

  // 鼠标控制的 body：质量 = 100，位置初始为鼠标位置
  bodies.push({
    pos: createVector(mouseX, mouseY),
    vel: createVector(0, 0),
    mass: 200,
    size: 15,
    color: color('#B8ACAC'),
    trail: []
  });

  // 其他两个 body：质量 = 50
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
  let fillColor = color('#B8ACAC');
  noStroke();
  fill(fillColor);
  ellipse(body.pos.x, body.pos.y, body.size, body.size);

  // 轨迹
  noFill();
  stroke(fillColor);
  beginShape();
  for (let p of body.trail) {
    vertex(p.x, p.y);
  }
  endShape();
}
