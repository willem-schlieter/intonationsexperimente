<script lang="ts">
    import { Synth } from "./synth";
    import { type Sound, soundlib } from "./sounds";
    // import * as int from "./intonations"; // Wird nicht mehr benötigt, weil jetzt aus WASM geladen
    import { wohltemp, from_relations } from "../wasm/pkg";
    import Intonation from "./Intonation.svelte";
    
    const keys = ["a", "w", "s", "e", "d", "r", "f", "t", "g", "z", "h", "u", "j", "i", "k", "o", "l", "p", "ö", "ü", "ä", "+", "#"];
    // Wird auf den Index des Tastatur-Keys addiert, um die MIDI-Nummer zu bekommen
    // 33 bedeutet, dass die erste Frequenz im Array der Taste A entspricht
    const KEYMIDITRANSLATE = 33;
    // Wohltemperierte Leiter
    let freqs = [
        55.0,
        58.27047018976124,
        61.735412657015516,
        65.40639132514967,
        69.29565774421803,
        73.41619197935191,
        77.78174593052024,
        82.40688922821751,
        87.307057858251,
        92.49860567790863,
        97.99885899543737,
        103.82617439498634,
        110.00000000000004,
        116.54094037952254,
        123.4708253140311,
        130.8127826502994,
        138.59131548843615,
        146.83238395870387,
        155.56349186104057,
        164.8137784564351,
        174.6141157165021,
        184.99721135581737,
        195.99771799087483,
        207.65234878997276,
        220.00000000000026,
        233.08188075904522,
        246.94165062806232,
        261.6255653005989,
        277.1826309768724,
        293.6647679174079,
        311.1269837220813,
        329.6275569128704,
        349.22823143300434,
        369.9944227116349,
        391.9954359817499,
        415.30469757994575,
        440.0000000000007,
        466.1637615180906,
        493.8833012561249,
        523.2511306011982,
        554.3652619537452,
        587.3295358348162,
        622.253967444163,
        659.2551138257411,
        698.4564628660091,
        739.9888454232703,
        783.9908719635001,
        830.609395159892,
        880.0000000000017,
        932.3275230361818,
        987.7666025122504,
        1046.5022612023968,
        1108.7305239074908,
        1174.659071669633,
        1244.5079348883264,
        1318.5102276514829,
        1396.912925732019,
        1479.9776908465412,
        1567.981743927001,
        1661.2187903197846,
        1760.0000000000048,
        1864.6550460723645,
        1975.5332050245015,
        2093.004522404795,
        2217.4610478149825,
        2349.318143339267,
        2489.0158697766547,
        2637.020455302967,
        2793.8258514640393,
        2959.955381693084,
    ];

    /**Leitet Tatsatur-Keydown an MIDI (onMidiMsg) weiter.*/
    function onKeydown (key: string) {
        // Keine MIDI-Weiterleitung, wenn gerade ins Textfeld getippt wird.
        if (document.activeElement?.tagName != "TEXTAREA") {
            const ix = keys.indexOf(key);
            if (ix !== -1) onMidiMsg(new Uint8Array([144, ix + KEYMIDITRANSLATE, 40]));
        }
    }
    /**Leitet Tatsatur-Keyup an MIDI (onMidiMsg) weiter.*/
    function onKeyup (key: string) {
        // Keine MIDI-Weiterleitung, wenn gerade ins Textfeld getippt wird.
        if (document.activeElement?.tagName != "TEXTAREA") {
            const ix = keys.indexOf(key);
            if (ix !== -1) onMidiMsg(new Uint8Array([144, ix + KEYMIDITRANSLATE, 0]));
        }
    }

    let octavePitch = 2;
    let n = 12;

    function setFreqs () {
        if (! customInt) freqs = [...wohltemp(55.0, n, 64)];
        else freqs = new Array(customBaseKey - 33).fill(440.0).concat([...from_relations(customBase, Float32Array.from(customRelations))]);
    }

    /**Ermittelt die Frequenz aus einem MIDIKey.
     * @param midiKey - MIDI-Nummer des Tons.
     * @returns Frequenz des Tons. Wenn die MIDI-Nummer mit keinem Ton belegt ist,
     * wird 0 zurückgegeben (die von `synth.play` und `synth.stop` ignoriert wird).
    */
    const getFreq = (midiKey: number) => (freqs[midiKey - 33] || 0) * (2 ** octavePitch);

    let midiTracker: boolean | null = null;
    let latestKey = -1;

    /**Initialisiert MIDI.*/
    function midiInit () {
        try {
            navigator.requestMIDIAccess().then(access => {
                access.inputs.forEach((entry) => {
                    // @ts-ignore
                    entry.onmidimessage = ev => onMidiMsg(ev.data);
                });
                midiTracker = true;
            }, msg => {
                console.error("Midi failure: " + msg);
                // alert("MIDI konnte nicht verbunden werden. Du kannst aber dennoch über die Computer-Tastatur spielen.");
            });
        } catch (err) {
            alert("Dein Browser scheint die MIDI Web API nicht zu unterstützen. Um ein MIDI-Keyboard anzuschließen brauchst du wahrscheinlich eine neue Version von Google Chrome. Alternativ kannst du auch mit der Computer-Tastatur spielen.");
            console.error("Your browser seems not to support WebMIDI API: ", err);
        }
    }

    /**Bekommt ein Array mit den MIDI-Daten und reagiert darauf.*/
    function onMidiMsg (data: Uint8Array) {
        if (data[0] === 144) {
            midiTracker = midiTracker ? false : true;
            if (data[2] === 0) {
                synth.stop(getFreq(data[1]));
                latestKey = -1;
            } else {
                synth.play(getFreq(data[1]), data[2]);
                latestKey = data[1];
            }
        } else if (data[0] === 128) {
            midiTracker = midiTracker ? false : true;
            synth.stop(getFreq(data[1]));
            latestKey = -1;
        } else if (data[0] !== 254)
            console.warn("Unbekanntes MIDI Event: " + data);
    }

    midiInit();

    let sound: Sound = soundlib[0];
    $: synth = new Synth(sound);

    let customInt = false;
    let customBase: number;
    let customBaseKey: number;
    let customRelations: number[] = [];

</script>

<!-- Titel und MIDI-Tracker -->
<div id="tracker" class:a={midiTracker === true} class:b={midiTracker === false}>{latestKey !== -1 ? latestKey : ""}</div>
<h1>&nbsp;&nbsp;&nbsp;Synthesizer für Intonationsexperimente</h1>
<h3>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Schließe ein MIDI-Keyboard an oder verwende die Tasten a, w, s, e, d, r...</h3>

<!-- Oktaven-Shifter -->
<div id="tab3">
    <h4>Oktaven-Shifter</h4>
    <input type="range" min={-4} max={4} step={1} bind:value={octavePitch}> <span>{octavePitch}</span>
</div>

<!-- Tableiste -->
<input type="radio" name="tab" id="tab1cb" class="tabcb">
<label for="tab1cb" id="tab1_label" class="tab_label">Intonationssystem</label>
<input type="radio" name="tab" id="tab2cb" class="tabcb" checked>
<label for="tab2cb" id="tab2_label" class="tab_label">Sound Design</label>

<!-- Die Tabs -->
<div id="tab1">
    <h4>Wähle eine Stimmung aus:</h4>
    <label><input type="radio" name="int" bind:group={customInt} value={false} checked>
        Wohltemperiert mit <input type="range" min={3} max={24} step={1} bind:value={n}> {n} Tönen
    </label><br>
    <label><input type="radio" name="int" bind:group={customInt} value={true}>
        <Intonation
            disabled={customInt === false}
            bind:relations={customRelations}
            bind:base={customBase}
            bind:baseKey={customBaseKey}
        /><br>
    </label>
    <br><button on:click={setFreqs}>Stimmung setzen.</button>
    <br><button on:click={() => console.log(freqs)}>Stimmung in der Konsole inspizieren</button>
</div>

<div id="tab2">
    <h4>Wähle einen Sound aus:</h4>
    <select bind:value={sound}>
        {#each soundlib as sound}
            <option value={sound}>{sound.name}</option>
        {/each}
    </select>
</div>

<svelte:window
    on:keydown={e => {if (e.metaKey) {if (e.key === "s") setFreqs(); e.preventDefault();} else if (! e.repeat) onKeydown(e.key)}}
    on:keyup={e => {if (! e.metaKey) onKeyup(e.key)}}
></svelte:window>

<style>
    .tab_label {
        float: left;
        width: 50%;
        border: 1px solid grey;
        box-sizing: border-box;
        text-align: center;
        padding: 5px;
        font-size: 16pt;
    }
    .tabcb:checked + .tab_label {
        background-color: grey;
    }
    .tabcb {
        display: none;
    }
    #tab1cb:checked ~ #tab2, #tab2cb:checked ~ #tab1 {
        display: none
    }
    #tab1, #tab2, #tab3 {
        float: left;
        width: 100%;
        padding: 10px;
        border-bottom: 1px solid grey;
    }
    #tracker {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 40px;
        height: 20px;
        text-align: center;
        background-color: #444;
        border-radius: 100%;
        border: 1px solid #444;
    }
    #tracker.a {
        background-color: orange;
    }
    #tracker.b {
        background-color: yellow;
    }
</style>