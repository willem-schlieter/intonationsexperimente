<script lang="ts">
    import { Synth } from "./synth";
    import { soundlib } from "./sounds";
    // import * as int from "./intonations"; // Wird nicht mehr benötigt, weil jetzt aus WASM geladen
    import SoundSettings from "./SoundSettings.svelte";
    import Intonation from "./Intonation.svelte";
    import Keyboard from "./Keyboard.svelte";

    // Die Frequenzen des Intonationssystems
    let freqs: number[] = []; // wird initial in Intonation.svelte berechnet (Default: wohltemperiert 12-stufig)
    // Die MIDI-Taste, der freqs[0] zugewiesen wird.
    let baseKey: number = 60;
    // Der Synthesizer mit dem jeweils eingestellten Sound
    let synth: Synth = new Synth(soundlib[0]);
    
    // Oktaven-Shifter – aktuell konstant bei 2, weil der Shifter entfernt.
    let octavePitch = 0;

    let midiTracker: boolean | null = null;
    let latestKey = -1;

    /** Ermittelt die Frequenz aus einem MIDIKey.
     * @param midiKey - MIDI-Nummer des Tons.
     * @returns Frequenz des Tons. Wenn die MIDI-Nummer mit keinem Ton belegt ist,
     * wird 0 zurückgegeben (die von `synth.play` und `synth.stop` ignoriert wird).
    */
    const getFreq = (midiKey: number) => (freqs[midiKey - baseKey] || 0);

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
    /** Bekommt ein Array mit den MIDI-Daten und reagiert darauf.
     * Für manuelle Ansteuerung: [144, key, 40] für Anschlag, [144, key, 0] für Loslassen.
    */
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

    let middleC = 72;
    let virtualKeyboard = true;
</script>

<!-- Titel und MIDI-Tracker -->
<div id="tracker" class:a={midiTracker === true} class:b={midiTracker === false}>{latestKey !== -1 ? latestKey : ""}</div>
<h4>&nbsp;&nbsp;&nbsp;Synthesizer für Intonationsexperimente</h4>

<!-- Keyboard – Im Moment ohne Tabbar Feld und immer über den anderen Tabs, kann man ggf. mal noch schöner machen. -->
<div id="tab3">
    Schließe ein MIDI-Keyboard an, verwende die Tasten a, w, s, e usw. oder
    <label style="text-decoration: underline"><input type="checkbox" bind:checked={virtualKeyboard}> nutze das virtuelle Keyboard.</label><br>
    Oktaven-Shifter: 
    <button on:click={_ => middleC -= 12}>&lt;</button>
    <button on:click={_ => middleC += 12}>&gt;</button>
    <Keyboard
        octaves={2}
        {middleC}
        hidden={!virtualKeyboard}
        on:noteon={ e => { onMidiMsg(new Uint8Array([144, e.detail, 40])) } }
        on:noteoff={ e => { onMidiMsg(new Uint8Array([144, e.detail, 0])) } }
    />
</div>

<!-- Tableiste -->
<input type="radio" name="tab" id="tab1cb" class="tabcb">
<label for="tab1cb" id="tab1_label" class="tab_label">Intonationssystem</label>

<input type="radio" name="tab" id="tab2cb" class="tabcb" checked>
<label for="tab2cb" id="tab2_label" class="tab_label">Sound Design</label>

<!-- <input type="radio" name="tab" id="tab3cb" class="tabcb">
<label for="tab3cb" id="tab3_label" class="tab_label">Keyboard</label> -->

<!-- Tab 1: Intonationssystem -->
<div id="tab1">
    <Intonation bind:freqs bind:baseKey/><br><br><br>
</div>

<!-- Tab 2: SoundSettings -->
<div id="tab2">
    <SoundSettings bind:synth/><br><br><br>
</div>

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
        position: fixed;
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