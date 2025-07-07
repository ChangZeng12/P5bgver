// sketch.js (to be deployed on GitHub Pages inside iframe)

let bodies = [];
let mouseInside = false;
let mousePos = null;

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('position', 'absolute');
  canvas.style('top', '0');
  canvas.style('left', '0');
  canvas.style('z-index', '-1');
  canvas.style('background', 'transparent');
  canvas.elt.style.pointerEvents = 'none';

  generateBodies();
  textAlign(LEFT, TOP);
  textSize(14);

  // Receive mouse position from parent
  window.addEventListener('message', (e) => {
    const data = e.data;
    if (typeof data === 'object' && 'inside' in data) {
      mouseInside = data.inside;
      if (mouseInside && 'x' in data && 'y' in data) {
        mousePos = createVector(data.x, data.y);
      } else {
        mousePos = null;
      }
    }
  });
}

function draw() {
  clear();

  if (mouseInside && mousePos && bodies[0]) {
    bodies[0].pos.set(mousePos.x, mousePos.y);
    bodies[0].vel.set(0, 0);
  }

  for (let i = 1; i < bodies.length; i++) {
    let totalForce = createVector(0, 0);
    if (mouseInside && mousePos) {
      for (let j = 0; j < bodies.length; j++) {
        if (i !== j) {
          let force = calculateAttraction(bodies[j], bodies[i]);
          totalForce.add(force);
        }
      }
    } else {
      let center = createVector(width / 2, height / 2);
      let toCenter = p5.Vector.sub(center, bodies[i].pos);
      let d = constrain(toCenter.mag(), 10, 100);
      toCenter.normalize();
      let strength = (bodies[i].mass * 50) / (d * d);
      let force = toCenter.mult(strength);
      totalForce.add(force);
    }
    applyForce(bodies[i], totalForce);
  }

  for (let i = 1; i < bodies.length; i++) {
    updateBody(bodies[i]);
    drawBody(bodies[i]);
  }
}

function generateBodies() {
  bodies = [];
  bodies.push({
    pos: createVector(width / 2, height / 2),
    vel: createVector(0, 0),
    mass: 100,
    size: 15,
    color: color('#B8ACAC'),
    trail: []
  });

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
  resizeCanvas(windowWidth, windowHeight);
}
