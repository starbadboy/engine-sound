# Engine Sound

Plays a synthesized engine sound through your car's speakers, following your GPS speed.
Open the page in the Tesla browser while parked, pick a car, press **Start engine**, allow location, drive.

All sound is generated live in the browser (AudioWorklet): firing order, exhaust pulses, pipe
resonance, gearbox, afterfire. No audio files, no account, nothing leaves the browser.

- `dsp.js` — synthesizers (combustion, electric, haunted, thrusters)
- `vehicle.js` — virtual gearbox and pedals
- `cars.js` — car profiles
- `node check.js` — renders every car to `renders/*.wav` and checks the audio

Car photos are from Wikimedia Commons; authors and licenses are linked in the page footer.
