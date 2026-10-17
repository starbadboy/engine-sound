// cars.js — car profiles. `engine` is what the synthesizer (dsp.js) needs, `vehicle` drives the
// drivetrain simulation (vehicle.js). Photos are Wikimedia Commons thumbnails.
//
// engine.firing: [crank angle °, bank] per cylinder over one 720° cycle, built from the real
// firing order. Which bank each cylinder sits on is what gives a cross-plane V8 its burble.
// vehicle.gears: km/h per 1000 rpm in each gear, estimated from real first-gear and top speeds.

const evenFiring = (order, bankOf) => order.map((cyl, i) => [i * 720 / order.length, bankOf(cyl)]);
const IMG = 'https://upload.wikimedia.org/wikipedia/commons/thumb/';

const CARS = [
  {
    id: 'roadster', name: 'Tesla Roadster', spec: 'AC induction motor · 14,000 rpm · 1-speed',
    img: IMG + '0/0a/Roadster_San_Diego.jpg/330px-Roadster_San_Diego.jpg',
    engine: { type: 'electric', sound: { orders: [[24, 0.5], [48, 0.2], [8, 0.15]], inverter: 1800, inverterGain: 0.08, bright: 6000, gain: 0.8 } },
    vehicle: { type: 'ev', rpmPerKmh: 70, accel0: 8, vmax: 56 },
  },
  {
    id: 'model3', name: 'Tesla Model 3', spec: 'Permanent-magnet motor · 1-speed · ElectricZen',
    img: IMG + 'a/ab/Tesla_Model_3_%282023%29_Autofr%C3%BChling_Ulm_IMG_9282.jpg/330px-Tesla_Model_3_%282023%29_Autofr%C3%BChling_Ulm_IMG_9282.jpg',
    engine: { type: 'electric', sound: { orders: [[12, 0.3], [36, 0.08]], inverter: 1200, inverterGain: 0.04, bright: 1200, gain: 0.7 } },
    vehicle: { type: 'ev', rpmPerKmh: 69, accel0: 7, vmax: 72 },
  },
  {
    id: 'roadster2', name: 'Tesla Roadster (2nd gen)', spec: '3 motors · cold-gas thrusters',
    img: IMG + '8/89/NextGenTeslaRoadster_%28cropped%29.jpg/330px-NextGenTeslaRoadster_%28cropped%29.jpg',
    engine: { type: 'thruster', sound: { onset: 0.45, curve: 1.5, roarHz: 900, cracks: 18, gain: 0.9 } },
    vehicle: { type: 'ev', rpmPerKmh: 50, accel0: 12, vmax: 112 },
  },
  {
    id: 'typer', name: 'Honda Civic Type R', spec: '2.0 L turbo inline-4 · 7,000 rpm · 6-spd manual',
    img: IMG + '7/71/2024_Honda_Civic_Type_R%2C_front_right%2C_06-15-2024.jpg/330px-2024_Honda_Civic_Type_R%2C_front_right%2C_06-15-2024.jpg',
    engine: {
      type: 'combustion', idle: 800, redline: 7000, firing: evenFiring([1, 3, 4, 2], () => 0),
      sound: { pipeLen: 1.4, pipeFeedback: 0.55, pipeDamp: 0.4, pulseDeg: 45, formants: [[320, 1.5, 0.5], [1100, 2, 0.3]], muffler: 2200, intake: 0.15, pops: 5, lumpy: 0, drive: 2.5, gain: 1.6 },
    },
    vehicle: { type: 'manual', gears: [8.6, 14, 20, 26, 32, 39], shiftGentle: 3000, shiftFull: 6800, downRpm: 1300, shiftTime: 0.35, accel0: 6, vmax: 75 },
  },
  {
    id: 'gt3', name: 'Porsche 911 GT3', spec: '4.0 L flat-6 · 9,000 rpm · 7-spd PDK',
    img: IMG + 'c/c1/Porsche_992_GT3_1X7A0323.jpg/330px-Porsche_992_GT3_1X7A0323.jpg',
    engine: {
      type: 'combustion', idle: 1000, redline: 9000, firing: evenFiring([1, 6, 2, 4, 3, 5], c => (c <= 3 ? 0 : 1)),
      sound: { pipeLen: 1.0, pipeFeedback: 0.6, pipeDamp: 0.5, pulseDeg: 40, formants: [[420, 1.5, 0.5], [1500, 2, 0.4]], muffler: 3800, intake: 0.3, pops: 3, lumpy: 0, drive: 2.2, gain: 1.2 },
    },
    vehicle: { type: 'dct', gears: [7.8, 12, 16.5, 21, 26, 31, 37], shiftGentle: 3500, shiftFull: 8800, downRpm: 1800, shiftTime: 0.08, accel0: 9, vmax: 88 },
  },
  {
    id: 'camaro', name: 'Chevrolet Camaro SS', spec: '6.2 L pushrod V8 · 6,500 rpm · 6-spd manual',
    img: IMG + '5/5e/2019_Chevrolet_Camaro_2SS_6.2L_front_3.16.19.jpg/330px-2019_Chevrolet_Camaro_2SS_6.2L_front_3.16.19.jpg',
    engine: {
      type: 'combustion', idle: 700, redline: 6500, firing: evenFiring([1, 8, 7, 2, 6, 5, 4, 3], c => c % 2),
      sound: { pipeLen: 2.2, pipeFeedback: 0.65, pipeDamp: 0.35, pulseDeg: 55, formants: [[160, 1.5, 0.7], [600, 2, 0.3]], muffler: 1700, intake: 0.15, pops: 6, lumpy: 0.15, drive: 2, gain: 1.0 },
    },
    vehicle: { type: 'manual', gears: [12, 18, 26, 34, 42, 60], shiftGentle: 2500, shiftFull: 6300, downRpm: 1100, shiftTime: 0.4, accel0: 7, vmax: 80 },
  },
  {
    id: 'hellcat', name: 'Dodge Challenger Hellcat', spec: '6.2 L supercharged V8 · 6,200 rpm · 8-spd auto',
    img: IMG + 'd/d3/Dodge_Challenger_SRT8_%282015%29_Hirschaid-20220709-RM-120221_%28cropped%29.jpg/330px-Dodge_Challenger_SRT8_%282015%29_Hirschaid-20220709-RM-120221_%28cropped%29.jpg',
    engine: {
      type: 'combustion', idle: 750, redline: 6200, firing: evenFiring([1, 8, 4, 3, 6, 5, 7, 2], c => c % 2),
      sound: { pipeLen: 2.0, pipeFeedback: 0.65, pipeDamp: 0.35, pulseDeg: 55, formants: [[170, 1.5, 0.7], [650, 2, 0.35]], muffler: 1900, intake: 0.15, whine: { ratio: 35, gain: 0.07 }, pops: 8, lumpy: 0.1, drive: 2.5, gain: 1.0 },
    },
    vehicle: { type: 'auto', gears: [11, 17, 23, 30, 38, 48, 58, 75], shiftGentle: 2200, shiftFull: 6000, downRpm: 1100, shiftTime: 0.15, accel0: 8, vmax: 89 },
  },
  {
    id: 'urus', name: 'Lamborghini Urus', spec: '4.0 L twin-turbo V8 · 6,800 rpm · 8-spd auto',
    img: IMG + 'f/f1/Lamborghini_Urus_SE_DSC_8524.jpg/330px-Lamborghini_Urus_SE_DSC_8524.jpg',
    engine: {
      type: 'combustion', idle: 750, redline: 6800, firing: evenFiring([1, 5, 4, 8, 6, 3, 7, 2], c => (c <= 4 ? 0 : 1)),
      sound: { pipeLen: 1.8, pipeFeedback: 0.6, pipeDamp: 0.4, pulseDeg: 50, formants: [[200, 1.5, 0.6], [800, 2, 0.3]], muffler: 1400, intake: 0.1, pops: 5, lumpy: 0, drive: 2, gain: 1.0 },
    },
    vehicle: { type: 'auto', gears: [8.8, 14, 20, 27, 34, 42, 52, 65], shiftGentle: 2300, shiftFull: 6600, downRpm: 1100, shiftTime: 0.12, accel0: 8, vmax: 85 },
  },
  {
    id: 'f812', name: 'Ferrari 812 Superfast', spec: '6.5 L V12 · 8,900 rpm · 7-spd DCT',
    img: IMG + '2/28/2019_Ferrari_812_Superfast_S-A_6.5.jpg/330px-2019_Ferrari_812_Superfast_S-A_6.5.jpg',
    engine: {
      type: 'combustion', idle: 800, redline: 8900, firing: evenFiring([1, 7, 5, 11, 3, 9, 6, 12, 2, 8, 4, 10], c => (c <= 6 ? 0 : 1)),
      sound: { pipeLen: 0.9, pipeFeedback: 0.55, pipeDamp: 0.5, pulseDeg: 35, formants: [[600, 1.5, 0.4], [2200, 2, 0.4]], muffler: 5000, intake: 0.25, pops: 2, lumpy: 0, drive: 1.8, gain: 1.2 },
    },
    vehicle: { type: 'dct', gears: [9, 13, 18, 23, 28, 34, 40], shiftGentle: 3000, shiftFull: 8700, downRpm: 1500, shiftTime: 0.08, accel0: 9, vmax: 94 },
  },
  {
    id: 'enzo', name: 'Ferrari Enzo', spec: '6.0 L V12 · 8,200 rpm · 6-spd F1',
    img: IMG + 'c/ce/Orange_Enzo_Ferrari_%287191948164%29.jpg/330px-Orange_Enzo_Ferrari_%287191948164%29.jpg',
    engine: {
      type: 'combustion', idle: 900, redline: 8200, firing: evenFiring([1, 7, 5, 11, 3, 9, 6, 12, 2, 8, 4, 10], c => (c <= 6 ? 0 : 1)),
      sound: { pipeLen: 1.0, pipeFeedback: 0.6, pipeDamp: 0.55, pulseDeg: 35, formants: [[550, 1.5, 0.5], [2000, 2, 0.4]], muffler: 5500, intake: 0.3, pops: 5, lumpy: 0, drive: 2.4, gain: 1.2 },
    },
    vehicle: { type: 'dct', gears: [10, 15, 20, 26, 33, 42], shiftGentle: 3000, shiftFull: 8000, downRpm: 1600, shiftTime: 0.15, accel0: 9, vmax: 97 },
  },
  {
    id: 'veneno', name: 'Lamborghini Veneno', spec: '6.5 L V12 · 8,400 rpm · 7-spd ISR',
    img: IMG + '0/07/Geneva_MotorShow_2013_-_Lamborghini_Veneno_1.jpg/330px-Geneva_MotorShow_2013_-_Lamborghini_Veneno_1.jpg',
    engine: {
      type: 'combustion', idle: 900, redline: 8400, firing: evenFiring([1, 7, 4, 10, 2, 8, 6, 12, 3, 9, 5, 11], c => (c <= 6 ? 0 : 1)),
      sound: { pipeLen: 1.1, pipeFeedback: 0.62, pipeDamp: 0.45, pulseDeg: 38, formants: [[380, 1.5, 0.6], [1600, 2, 0.4]], muffler: 4500, intake: 0.3, pops: 10, lumpy: 0, drive: 3, gain: 1.2 },
    },
    vehicle: { type: 'dct', gears: [9, 14, 19, 25, 31, 37, 43], shiftGentle: 3000, shiftFull: 8200, downRpm: 1600, shiftTime: 0.12, accel0: 10, vmax: 98 },
  },
  {
    id: 'f1', name: 'Mercedes F1 W11', spec: '1.6 L turbo V6 hybrid · 15,000 rpm · 8-spd',
    img: IMG + '3/31/Lewis_Hamilton_2020_Tuscan_Grand_Prix_-_race_day_%28cropped%29.jpg/330px-Lewis_Hamilton_2020_Tuscan_Grand_Prix_-_race_day_%28cropped%29.jpg',
    engine: {
      type: 'combustion', idle: 4000, redline: 15000, firing: evenFiring([1, 4, 2, 5, 3, 6], c => (c <= 3 ? 0 : 1)),
      sound: { pipeLen: 0.5, pipeFeedback: 0.5, pipeDamp: 0.6, pulseDeg: 30, formants: [[1200, 1.5, 0.4], [3000, 2, 0.3]], muffler: 6000, intake: 0.1, pops: 1, lumpy: 0, drive: 1.6, gain: 1.6 },
    },
    // A high-revving race engine never drops below ~9,000 rpm on the move.
    vehicle: { type: 'dct', gears: [8.3, 11, 13.5, 16, 19, 22, 25, 28], shiftGentle: 10500, shiftFull: 12500, downRpm: 9000, shiftTime: 0.03, accel0: 14, vmax: 95 },
  },
  {
    id: 'hearse', name: 'Haunted Hearse', spec: '1959 Cadillac · no engine, only ghosts',
    img: IMG + '8/8c/1959_Cadillac_hearse_Janowiak_funeral_home_Ypsilanti_Michigan.JPG/330px-1959_Cadillac_hearse_Janowiak_funeral_home_Ypsilanti_Michigan.JPG',
    engine: { type: 'haunted', idle: 600, redline: 4800, sound: { rootHz: 110, gain: 0.6 } },
    vehicle: { type: 'auto', gears: [12, 20, 30, 42], shiftGentle: 2000, shiftFull: 4500, downRpm: 900, shiftTime: 0.3, accel0: 4, vmax: 50 },
  },
];

if (typeof module !== 'undefined') module.exports = { CARS };
