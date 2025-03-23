<script lang="ts">
    import { wohltemp, from_relations } from "../wasm/pkg";

    let custom = false;
    let n = 12;
    let base: number;
    let baseKey: number;
    let input: string = "";

    let ratios: number[] = [];
    $: ratios = input.split("\n").map(str => parseFloat(str)).filter(Boolean);

    export let freqs: number[] = [];

    export function updateIntonation() {
        if (! custom) freqs = [...wohltemp(55.0, n, 64)];
        else {
            freqs = new Array(baseKey - 33).fill(440.0).concat([...from_relations(base, Float32Array.from(ratios))])
        };
    }
    updateIntonation();

</script>


<h4>Wähle eine Stimmung aus:</h4>
    
<label><input type="radio" name="int" bind:group={custom} value={false} checked>
    Wohltemperiert mit <input type="range" min={3} max={24} step={1} bind:value={n}> {n} Tönen
</label><br>

<label><input type="radio" name="int" bind:group={custom} value={true}>
    Frei definiert <button on:click={() => alert("Lege eine Starttaste fest, die mit der Startfrequenz belegt wird. Im Textfeld werden die Schwingungsverhältnisse der folgenden Tasten zur Startfrequenz angegeben. Das rechte Textfeld dient für Notizen und wird nicht ausgelesen. Nicht belegte Tasten erzeugen keinen Ton. WICHTIG: Klicke nach der Eingabe 'Stimmung setzen', damit deine Eingabe ausgelesen wird.")}>?</button><br>
    <div id="__">
        Starttaste: <input disabled={! custom} type="number" bind:value={baseKey}><br>
        Startfrequenz: <input disabled={! custom} type="number" bind:value={base}><br>
        <div>
            <textarea
            placeholder="Schwingungsverhältnisse zur Startfrequenz eingeben…"
            title="Schwingungsverhältnisse" disabled={! custom}
            cols="30" rows="10"
            bind:value={input}
            ></textarea>
            <textarea
            placeholder="Kommentare (werden nicht ausgelesen)"
            title="Kommentar"
            cols="30" rows="10"
            ></textarea>
        </div>
        <br><span>
            {ratios.join("  //  ")}
        </span>
    </div>
</label>

<br><button on:click={updateIntonation}>Intonationseinstellungen übernehmen.</button>
<button on:click={() => console.log(freqs)}>Intonationssystem in der Konsole inspizieren</button>

<svelte:window on:keydown={e => {if (e.metaKey && e.key == "s") {updateIntonation(); e.preventDefault()}}}></svelte:window>
    
<style>
    #__ {
        margin-left: 50px;
    }
</style>