export type SoundParam<T> = T | ((freq: number, velo: number) => T);

/** Die Parameter für den Sound.
 * 
 * Die einzelnen Felder sind alle vom Typ `(freq: number, velo: number) => T`.
 * 
 * `freq` ist die Frequenz des gespielten Tons, vor der im `Sound` bestimmten Transposition.
 * 
 * `velo` ist die Velocity, wobei 1 ein moderater Anschlag, nicht der Maximale ist.
 */
export interface SingleSound {
    /** Ein beliebiger Name */
    name?: string
    /**Zeit, bis volle Lautstärke erreicht ist */
    attack?: SoundParam<number>
    /**Zeit vom Erreichen des vollen Attacks bis zum Erreichen von sustain */
    decay?: SoundParam<number>
    /**Lautstärke beim Sustain, relativ zu volume (1.0 = 100% von volume) */
    sustain?: SoundParam<number>
    /**Zeit bis zum vollständigen Verklingen */
    release?: SoundParam<number>
    /**Waveform, default: sine */
    wave?: SoundParam<"sine" | "sawtooth" | "triangle" | "square">
    /**Frequenz-Differenz des Modulators - je geringer, desto langsamer.*/
    modDif?: SoundParam<number>
    /**Volume des Modulators (1 = Genauso laut wie der Hauptton.) - Dies beeinflusst, wie stark die Modulation zu hören ist. */
    modVol?: SoundParam<number>
    /**Volume (zB 1.0) */
    volume?: SoundParam<number>
    /**Transpositionsfaktor (1: nicht transponiert. 0.5: eine Oktave tiefer.) */
    transpose?: number
}
/** Wie SingleSound, nur, dass Frequenz und Velocity schon feststehen und alle Werte zwingend sind.
 * Es sind folglich keine Funktionen als Werte möglich.
 * `Sound`s werden intern für jeden `Tone` in `HardSound` umgewandelt. */
export interface HardSound extends SingleSound {
    /**Zeit, bis volle Lautstärke erreicht ist */
    attack: number
    /**Zeit vom Erreichen des vollen Attacks bis zum Erreichen von sustain */
    decay: number
    /**Lautstärke beim Sustain, relativ zu volume (1.0 = 100% von volume) */
    sustain: number
    /**Zeit bis zum vollständigen Verklingen */
    release: number
    /**Waveform, default: sine */
    wave: "sine" | "sawtooth" | "triangle" | "square"
    /**Frequenz-Differenz des Modulators - je geringer, desto langsamer.*/
    modDif: number
    /**Volume des Modulators (1 = Genauso laut wie der Hauptton.) - Dies beeinflusst, wie stark die Modulation zu hören ist. */
    modVol: number
    /**Transpositionsfaktor (1: nicht transponiert. 0.5: eine Oktave tiefer.) */
    transpose: number
    volume: number
}
export interface Sound {
    name?: string
    sounds: SingleSound[]
};

function hardDef (): HardSound {
    return {
        attack:     0.01,
        decay:      0.01,
        sustain:    1,
        release:    0.4,
        wave:       "sine",
        modDif:     0,
        modVol:     0,
        transpose:  1,
        volume:     1
    };
}
export function intoHard (s: SingleSound, freq: number, velo: number): HardSound {
    let res = hardDef();
    for (let key in s) {
        if (key === "name") continue;
        if (typeof s[key] === "function") res[key] = s[key](freq, velo);
        else res[key] = s[key];
    }
    return res;
}
/** Erweitert den linken mit den Eigenschaften des rechten SingleSounds.
 * (= Kopiert lhs und überschreibt, soweit vorhanden, die Eigenschaften mit denen aus rhs.*/
export function extend (lhs: SingleSound, rhs: SingleSound): SingleSound {
    let res: SingleSound = {};
    for (let key in lhs) res[key] = lhs[key];
    for (let key in rhs) res[key] = rhs[key];
    return res;
}
/** Gruppiert SingleSounds zu einem Sound.*/
export function group (...sounds: Array<SingleSound | Sound>): Sound {
    let all: SingleSound[] = [];
    for (const s of sounds) {
        if (s.hasOwnProperty("sounds")) for (const the_s of (<Sound>s).sounds) all.push(the_s);
        else all.push(<SingleSound>s);
    };
    return {
        name: sounds[0].name + (sounds.length > 1 ? ` +${sounds.length - 1}` : ""),
        sounds: all
    };
}
/** Transponiert alle SingleSounds im Sound um transpose (Transposition des SingleSounds bleibt erhalten)*/
export function transpose (sound: Sound, transpose: number): Sound {
    for (let s of sound.sounds) {
        s.transpose = (s.transpose || 1) * transpose;
    }
    return sound;
}
/**
 * Erzeugt einen Sound mit dem angegebenen Obertonprofil (natürliche Obertonreihe).
 * @param baseSound Der zugrundeliegende `SingleSound`.
 * @param obertoene Zahlen geben die Lautstärke (relativ zur Velocity, also 1 = OT so
 * laut wie Grundton) der Obertöne an, `SingleSound`s können
 * die Obertöne individuell anpassen (Transposition anhand der natürlichen Obertonreihe
 * ist aber vorgegeben, nur der Klang einzelner Obertöne kann verändert werden).
 * @returns `Sound` mit angegebenem Obertonprofil.
 */
export function ots (baseSound: SingleSound, ...obertoene: (number | SingleSound)[]): Sound {
    let sounds = [baseSound];
    let i = 1;
    for (let ot of obertoene) {
        i += 1;
        if (ot === 0) continue;
        if (typeof ot === "number") {
            sounds.push(extend(baseSound, {transpose: (baseSound.transpose || 1) * i, volume: ot}));
        } else {
            sounds.push(extend(baseSound, extend({transpose: (baseSound.transpose || 1) * i}, ot)));
        }
    }
    return group(...sounds);
}
/**
 * Erzeugt einen Sound mit dem angegebenen Obertonprofil (individuelle Frequenzen).
 * @param baseSound Der zugrundeliegende `SingleSound`.
 * @param obertoene Ein Array von Tupeln, wobei die erste Zahl die das Schwingungsverhältnis
 * des OT zur Grundfrequenz angibt (zB 2 = Oktave), die zweite die Lautstärke.
 * @returns `Sound` mit angegebenem Obertonprofil.
 */
export function synthOts (baseSound: SingleSound, ...obertoene: ([number, number])[]): Sound {
    let sounds = [baseSound];
    for (let ot of obertoene) sounds.push(extend(baseSound, {transpose: (baseSound.transpose || 1) * ot[0], volume: ot[1]}));
    return group(...sounds);
}

/** Erstellt eine Art virtuelles Split Keyboard, das je nach Tonhöhe den einen oder anderen Sound verwendet.
 * @param low Der Sound, der für Frequenzen bis inklusive des Schwellwertes verwendet wird.
 * @param threshold Der Schwellwert.
 * @param high Der Sound, der für Frequenzen oberhalb des Schwellwertes verwendet wird.
 * @returns Der kombinierte Split-`Sound`.
 */
export function split (low: SingleSound, threshold: number, high: SingleSound): SingleSound {
    let res: SingleSound = hardDef();
    for (const key in res) {
        if (key === "name") continue;
        res[key] = (f: number, v: number) => {
            let ideal = f <= threshold ? low : high;
            console.log(`Taking ${ideal.name} - ${key} = ${ideal[key]}`);
            return intoHard(ideal, f, v)[key];
        }
    }
    res.name = `${low.name} & ${high.name}`;
    return res;
}



// Das komische Banjo
const banjo: Sound = group({
    name:       "Banjo",
    attack:     0.01,
    decay:      3,
    sustain:    0.000001,
    release:    0.1,
    wave:       "sawtooth",
    modDif:     4,
    modVol:     1,
    transpose:  0.5
});

// Der Mysterious Waber Sond
const waber: Sound = group({
    name:       "Waber",
    attack:     0.01,
    decay:      (f, v) => v * 5,
    sustain:    0.000001,
    release:    (f, v) => v * 0.2,
    wave:       "sine",
    modDif:     8,
    modVol:     f => Math.min(1, f / 880),
    transpose:  0.5
});

// Die Orgel
const organBase: SingleSound = {
    name:       "organ",
    modDif:     4,
    modVol:     0.001,
    wave:       "sine"
}
const organ: Sound = group(organBase, extend(organBase, {transpose: 2}));

// Einige Bass-Experimente
export const bassBase: SingleSound = {
    decay: 3,
    name: "Bass",
    sustain: 0.0001,
    release: 1,
    wave: "sine"
}
export let bass = transpose(group(
    bassBase,
    extend(bassBase, {transpose: 2}),
    extend(bassBase, {transpose: 3}),
    extend(bassBase, {transpose: 4}),
    extend(bassBase, {transpose: 5}),
    extend(bassBase, {transpose: 6}),
    // extend(bassBase, {transpose: 7}),
    // extend(bassBase, {transpose: 8}),
), 0.25);

// Horn-Versuch
const hornBase: SingleSound = {
    // transpose: 0.5,
    name: "Horn",
    volume: 0.2
}
const horn = ots(hornBase, 0.25, 1.17, 0.33, 0.75, 0.33, 0.58, 0);

// Klavier Versuch
const klavierBase: SingleSound = group({
    name: "Klavier",
    decay: 4,
    sustain: 0.00001,
    modDif: 10,
    modVol: 0.005,
    volume: f => 1.39 * 0.1 ** (f / 1300)
})
// const klavier = ots(klavierBase, 0.5);

// Erster Versuch mit synthetischem Obertonprofil (SOP)
const sop7: Sound = synthOts({name: "Septimen-Obertonprofil"}, [1.75, 0.2], [3.5, 0.1], [5.25, 0.1]);

export const soundlib: Sound[] = [
    group(klavierBase),
    group(organBase),
    bass, horn, organ, banjo, waber, sop7
];

intoHard(banjo, 5, 6);
