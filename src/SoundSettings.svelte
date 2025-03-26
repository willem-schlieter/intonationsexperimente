<script lang="ts">
    import { Synth } from "./synth";
    import { type Sound, soundlib, synthOts as synthOtp } from "./sounds";

    let custom = false;
    let presetSound: Sound = soundlib[0];
    let ratiosInp: string = "";
    let volumesInp: string = "";

    export let synth: Synth = new Synth(presetSound);
    
    $: {
        console.log("SoundSettings updated");
        if (! custom) synth = new Synth(presetSound);
        else {
            const volumes = volumesInp.split("\n").map(str => parseFloat(str));
            let otp: [number, number][] = ratiosInp.split("\n").map((str, index) => {
                const ratio = parseFloat(str);
                return !isNaN(ratio) && !isNaN(volumes[index]) ? [ratio, volumes[index]] : null;
            }).filter((pair): pair is [number, number] => pair !== null);
            synth.kill();
            synth = new Synth(synthOtp({name: "Synth OTP"}, ...otp));
        }
    }

    function importOTP (otp: string | null) {
        if (otp) {
            otp.split(" // ").forEach(str => {
                const [ratio, volume] = str.split(" = ");
                ratiosInp += `${ratio}\n`;
                volumesInp += `${volume}\n`;
            });
        }
    }

    /**
     * Für Textareas. Kleine Buchstaben werden ignoriert, d.h. preventDefault(), andere Eingaben akzeptiert inkl. stopPropagation().
     * @param e Das KeyboardEvent.
     */
    // function ignoreLetters (e: KeyboardEvent) {
    //     if (/[a-z]/.test(e.key)) e.preventDefault();
    //     else e.stopPropagation();
    // }
    // Sollte als Event-Listener hinzugefügt werden zu Textareas,
    // damit nur Zahlen eingegeben werden können und man mit Buchstaben weiter Klavier spielen kann.
</script>

<h4>Wähle einen Sound aus:</h4>

<label><input type="radio" name="sound" bind:group={custom} value={false} checked>
    Preset Sound:
    <select bind:value={presetSound}>
        {#each soundlib as sound}
            <option value={sound}>{sound.name}</option>
        {/each}
    </select>
</label><br>

<label><input type="radio" name="sound" bind:group={custom} value={true}>
    Synthetisches Obertonprofil erzeugen <button on:click={() => alert("Trage im linken Feld die Schwingungsverhältniszahlen des jeweiligen Obertons zum Grundton und im rechten Feld die korrespondierende Lautstärke des Obertones (relativ zum Grundton, zB 1.0 für 100% der Lautstärke des Grundtons) ein. Unten wird angezeigt, wie das Programm deine Eingabe verstanden hat. Diesen Code kannst du kopieren und später mit dem Importieren-Button importieren.")}>?</button><br>
    <div id="__">
        <div>
            <textarea
            placeholder="Schwingungsverhältnisse der Obertöne zur Grundtonfrequenz eingeben…"
            title="Schwingungsverhältnisse zur Grundtonfrequenz" disabled={! custom}
            cols="30" rows="10"
            bind:value={ratiosInp}
            ></textarea>
            <textarea
            placeholder="Lautstärke des jeweiligen Grundtons eingeben…"
            title="Lautstärke der Obertöne" disabled={! custom}
            cols="30" rows="10"
            bind:value={volumesInp}
            ></textarea>
        </div>
        <br><span>
            {ratiosInp.split("\n").map((str, index) => {
                const volumes = volumesInp.split("\n").map(str => parseFloat(str));
                const ratio = parseFloat(str);
                return ratio && volumes[index] ? `${ratio} = ${volumes[index]}` : null;
            }).filter(Boolean).join(" // ")}
        </span><br>
        <button disabled={! custom} on:click={() => ratiosInp = volumesInp = ""}>Leeren</button>
        <button disabled={! custom} on:click={() => importOTP(prompt("Gibt ein Obertonprofil ein (Format: x = y // z = a), und klicke auf übernehmen."))}>Importieren…</button>
    </div>
</label><br>

<button on:click={() => console.log(synth.sound)}>Synth in Konsole inspizieren</button>

<style>
    #__ {
        margin-left: 50px;
    }
</style>