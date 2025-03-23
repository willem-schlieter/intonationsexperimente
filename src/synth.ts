import { intoHard, type HardSound, type Sound } from "./sounds";

class Tone {
    master: GainNode;
    private osc: OscillatorNode;
    private mod: OscillatorNode;
    velocity: number;
    constructor (public ctx: AudioContext, public sound: HardSound, public freq: number, velo: number) {
        this.osc = ctx.createOscillator();
        this.mod = ctx.createOscillator();
        this.master = ctx.createGain();
        this.master.gain.value = 0;
        this.velocity = sound.volume * velo / 40;

        this.osc.frequency.value = freq * sound.transpose;
        this.mod.frequency.value = freq * sound.transpose + sound.modDif;
        this.osc.type = this.mod.type = sound.wave;

        this.osc.connect(this.master);

        let modGain = ctx.createGain();
        modGain.gain.value = sound.modVol;
        this.mod.connect(modGain);
        modGain.connect(this.master);

        this.osc.start();
        this.mod.start();
    }
    start () {
        // Attack
        this.master.gain.setValueAtTime(this.master.gain.value || 0.00001, this.ctx.currentTime);
        this.master.gain.exponentialRampToValueAtTime(this.velocity || 0.00001, this.ctx.currentTime + this.sound.attack);
        // Decay
        this.master.gain.setValueAtTime(this.velocity, this.ctx.currentTime + this.sound.attack);
        this.master.gain.exponentialRampToValueAtTime(this.sound.sustain * this.velocity || 0.00001, this.ctx.currentTime + this.sound.attack + this.sound.decay);
    }
    stop () {
        // this.output.gain.cancelAndHoldAtTime(this.ctx.currentTime); // nicht in Firefox.
        this.master.gain.setValueAtTime(this.master.gain.value, this.ctx.currentTime);
        this.master.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + this.sound.release);
        window.setTimeout(() => {
            // Cleanup
            this.osc.stop();
            this.mod.stop();
        }, this.sound.release * 1100);
    }
}
export class Synth {
    private tones: Tone[] = [];
    private ctx: AudioContext;
    master: GainNode;
    constructor (public sound: Sound) {
        if (! AudioContext) throw new Error("Web Audio API not supported by this browser.");
        this.ctx = new AudioContext();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.1;
        this.master.connect(this.ctx.destination);
    }
    /** Spielt einen Ton ab.
     * @param freq Frequenz des Tons. (0 ist Stille)
     */
    play (freq: number, velo: number) {
        if (freq == 0) return;
        for (const sound of this.sound.sounds) {
            const tone = new Tone(this.ctx, intoHard(sound, freq, velo), freq, velo);
            tone.master.connect(this.master);
            this.tones.push(tone);
            tone.start();
        }
    }

    /** Stoppt den Ton mit der gegebenen Frequenz und löscht ihn aus `this.tones`.
     * @param freq Frequenz, die released werden soll. (0 wird ignoriert.)
     * @returns `void`, auch, wenn kein Ton gelöscht wurde.
     */
    stop (freq: number) {
        if (freq == 0) return;
        const res: Tone[] = [];
        for (let t of this.tones) {
            if (t.freq == freq) t.stop();
            else res.push(t);
        }
        this.tones = res;
    }
}