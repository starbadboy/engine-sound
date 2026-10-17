// check.js — drives every car through a scripted test drive, renders it through the real
// synthesizer, asserts the audio is sane, and writes renders/<car>.wav to listen to.
// Run: node check.js
const fs = require('fs'), path = require('path'), assert = require('assert');
const { CARS } = require('./cars.js');
const { Vehicle } = require('./vehicle.js');
const dspModule = new Function(fs.readFileSync(path.join(__dirname, 'dsp.js'), 'utf8') + '\nreturn dspModule;')();
const { create } = dspModule({});

const SR = 48000, TICK = 0.02, PER_TICK = SR * TICK;
// [seconds, gas, brake, rev]
const SCRIPT = [[1.5, 0, 0, 0], [1.5, 0, 0, 1], [1, 0, 0, 0], [7, 1, 0, 0], [2.5, 0, 0, 0], [5, 0, 0.6, 0], [2, 0, 0, 0]];

function writeWav(file, L, R) {
  const n = L.length, buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4);
  }
  fs.writeFileSync(file, buf);
}

fs.mkdirSync(path.join(__dirname, 'renders'), { recursive: true });
for (const car of CARS) {
  const veh = new Vehicle(car), dsp = create(SR, car.engine);
  const L = [], R = [], gears = new Set();
  let cuts = 0, clicks = 0, maxRpm = 0, maxKmh = 0, gasRms = 0, gasN = 0, wasMoving = false;
  for (const [secs, gas, brake, rev] of SCRIPT) {
    for (let t = 0; t < secs; t += TICK) {
      const o = veh.step(TICK, { source: 'test', gas, brake, rev, intensity: 0.5 });
      if (o.click) { clicks++; dsp.message({ click: o.click }); }
      if (car.engine.type === 'haunted' && wasMoving && o.speed < 1) dsp.message({ bell: 1 });
      wasMoving = o.speed > 5;
      dsp.message({ ...o, character: 0.5, crackle: 0.7 });
      cuts += o.cut; gears.add(o.gear); maxRpm = Math.max(maxRpm, o.rpm); maxKmh = Math.max(maxKmh, o.speed);
      const l = new Float32Array(PER_TICK), r = new Float32Array(PER_TICK);
      for (let i = 0; i < PER_TICK; i += 128) dsp.process(l.subarray(i, i + 128), r.subarray(i, i + 128), 128);
      for (let i = 0; i < PER_TICK; i++) {
        assert(Number.isFinite(l[i]) && Number.isFinite(r[i]), `${car.id}: non-finite sample`);
        if (gas) { gasRms += l[i] * l[i]; gasN++; }
      }
      L.push(...l); R.push(...r);
    }
  }
  const peak = L.reduce((m, x) => Math.max(m, Math.abs(x)), 0);
  const rms = Math.sqrt(gasRms / gasN);
  console.log(`${car.id.padEnd(10)} peak ${peak.toFixed(2)}  rms(gas) ${rms.toFixed(3)}  top ${Math.round(maxKmh)} km/h  max ${Math.round(maxRpm)} rpm  gears ${[...gears].join(',')}  cuts ${cuts}  clicks ${clicks}`);
  assert(peak <= 1.2, `${car.id}: clipping (peak ${peak})`);
  assert(rms > 0.01, `${car.id}: too quiet under throttle (rms ${rms})`);
  if (car.vehicle.type !== 'ev') assert(gears.size > 2, `${car.id}: never changed gear`);
  if (car.vehicle.type === 'manual') assert(clicks > 2, `${car.id}: no gear-lever clicks`);
  writeWav(path.join(__dirname, 'renders', `${car.id}.wav`), L, R);
}
// The thruster backflip must stay on screen (the hero sits at the top of the page) and land at rest.
const { flipPose, FLIP_S, PIVOT } = require('./fx.js');
let top = Infinity;
for (let t = 0; t <= FLIP_S; t += 0.01) {
  const p = flipPose(t), a = p.turn * Math.PI / 180;
  for (const [x, y] of [[20, 30], [390, 30], [20, 140], [390, 140]]) {
    const dx = (x - PIVOT[0]) * p.size, dy = (y - PIVOT[1]) * p.size;
    top = Math.min(top, PIVOT[1] + dx * Math.sin(a) + dy * Math.cos(a) - p.lift);
  }
}
const end = flipPose(FLIP_S - 1e-6);
console.log(`flip: highest point ${top.toFixed(0)} svg units (stage padding ≈ -12)`);
assert(top > -25, `backflip leaves the screen (top ${top})`);
assert(Math.abs(end.turn) < 1e-6 && Math.abs(end.lift) < 0.5 && end.size === 1, 'backflip does not land at rest');
console.log('all checks passed — listen to renders/*.wav');
