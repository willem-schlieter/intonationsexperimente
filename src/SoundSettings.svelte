<script lang="ts">
    import { Synth } from "./synth";
    import { type Sound, soundlib, synthOts as synthOtp } from "./sounds";

    let custom = false;
    let presetSound: Sound = soundlib[0];
    let ratiosInp: string = "";
    let volumesInp: string = "";

    export let synth: Synth = new Synth(presetSound);
    
    /** Aktualisiert den Sound des Synthesizers entsprechend der Eingabe (preset oder custom). */
    export function updateSound() {
        if (! custom) synth = new Synth(presetSound);
        else {
            const volumes = volumesInp.split("\n").map(str => parseFloat(str));
            let otp: [number, number][] = ratiosInp.split("\n").map((str, index) => {
                const ratio = parseFloat(str);
                return !isNaN(ratio) && !isNaN(volumes[index]) ? [ratio, volumes[index]] : null;
            }).filter((pair): pair is [number, number] => pair !== null);
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
    Synthetisches Obertonprofil erzeugen <button on:click={() => alert("Trage im linken Feld die Schwingungsverhältniszahlen des jeweiligen Obertons zum Grundton und im rechten Feld die korrespondierende Lautstärke des Obertones (relativ zum Grundton, zB 1.0 für 100% der Lautstärke des Grundtons) ein. Klicke anschließen auf 'Übernehmen', damit deine Einstellung wirksam wird!")}>?</button><br>
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

<button on:click={updateSound}>Sound-Einstellung so übernehmen</button>
<button on:click={() => console.log(synth.sound)}>Synth in Konsole inspizieren</button>

<svelte:window on:keydown={e => {if (e.metaKey && e.key == "s") {updateSound(); e.preventDefault()}}}></svelte:window>

<style>
    #__ {
        margin-left: 50px;
    }
</style>