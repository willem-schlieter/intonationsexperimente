<script lang="ts">
    import { Synth } from "./synth";
    import { soundlib } from "./sounds";
    // import * as int from "./intonations"; // Wird nicht mehr benötigt, weil jetzt aus WASM geladen
    import SoundSettings from "./SoundSettings.svelte";
    import Intonation from "./Intonation.svelte";

    // Die Frequenzen des Intonationssystems
    let freqs: number[] = []; // wird initial in Intonation.svelte berechnet (Default: wohltemperiert 12-stufig)
    // Der Synthesizer mit dem jeweils eingestellten Sound
    let synth: Synth = new Synth(soundlib[0]);
    
    // Oktaven-Shifter
    let octavePitch = 2;
    
    const keys = ["a", "w", "s", "e", "d", "r", "f", "t", "g", "z", "h", "u", "j", "i", "k", "o", "l", "p", "ö", "ü", "ä", "+", "#"];
    // Wird auf den Index des Tastatur-Keys addiert, um die MIDI-Nummer zu bekommen
    // 33 bedeutet, dass die erste Frequenz im Array der Taste A entspricht
    const KEYMIDITRANSLATE = 33;
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

    let midiTracker: boolean | null = null;
    let latestKey = -1;

    /** Ermittelt die Frequenz aus einem MIDIKey.
     * @param midiKey - MIDI-Nummer des Tons.
     * @returns Frequenz des Tons. Wenn die MIDI-Nummer mit keinem Ton belegt ist,
     * wird 0 zurückgegeben (die von `synth.play` und `synth.stop` ignoriert wird).
    */
    const getFreq = (midiKey: number) => (freqs[midiKey - 33] || 0) * (2 ** octavePitch);

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

</script>

<!-- Titel und MIDI-Tracker -->
<div id="tracker" class:a={midiTracker === true} class:b={midiTracker === false}>{latestKey !== -1 ? latestKey : ""}</div>
<h1>&nbsp;&nbsp;&nbsp;Synthesizer für Intonationsexperimente</h1>
<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Schließe ein MIDI-Keyboard an oder verwende die Tasten a, w, s, e, d, r...</span>

<!-- Oktaven-Shifter -->
<div id="tab3">
    <span>Oktaven-Shifter: </span>
    <input type="range" min={-4} max={4} step={1} bind:value={octavePitch}> <span>{octavePitch}</span>
</div>

<!-- Tableiste -->
<input type="radio" name="tab" id="tab1cb" class="tabcb">
<label for="tab1cb" id="tab1_label" class="tab_label">Intonationssystem</label>
<input type="radio" name="tab" id="tab2cb" class="tabcb" checked>
<label for="tab2cb" id="tab2_label" class="tab_label">Sound Design</label>

<!-- Tab 1: Intonationssystem -->
<div id="tab1">
    <Intonation bind:freqs/>
</div>

<!-- Tab 2: SoundSettings -->
<div id="tab2">
    <SoundSettings bind:synth/>
</div>

<svelte:window
    on:keydown={e => {if (! e.repeat && ! e.metaKey) onKeydown(e.key)}}
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