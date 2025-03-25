<script lang="ts">
    import { wohltemp, from_relations, test_wasm } from "../wasm/pkg";

    try {
        if (test_wasm() !== 1) throw new Error("WASM-Modul konnte nicht geladen werden.");
    } catch (e) {
        alert("WASM-Modul (zwingend erforderlich für präzise Berechnungen) konnte nicht geladen werden. Bitte überprüfe, ob dein Browser WASM unterstützt und lade die Seite neu.");
        throw e;
    }

    let custom = false;
    let n = 12;
    let baseInterval = 2;
    let base: number = 220.0;
    export let baseKey: number = 60;
    let input: string = "";

    let ratios: number[] = [];
    $: ratios = input.split("\n").map(str => parseFloat(str)).filter(Boolean);

    export let freqs: number[] = [];

    export function updateIntonation() {
        if (! custom) freqs = [...wohltemp(base, baseInterval, n, baseKey)];
        else {
            freqs = new Array(baseKey - 33).fill(440.0).concat([...from_relations(base, Float32Array.from(ratios))])
        };
    }
    updateIntonation();

    function importInt (inp: string | null) {
        if (inp) input = inp.split(" // ").join("\n");
    }
</script>


<h4>Wähle eine Stimmung aus:</h4>

Starttaste: <input type="number" bind:value={baseKey}><br>
Startfrequenz: <input type="number" bind:value={base}><br>
<small>Die Starttaste wird mit der Startfrequenz belegt,
    alle Tasten darüber entsprechend des unten gewählten
    Intonationssystems. Die Tasten unterhalb der Starttaste werden nicht belegt.</small><br>
    
<label><input type="radio" name="int" bind:group={custom} value={false} checked>
    <!-- Wohltemperiert mit <input type="range" min={3} max={24} step={1} bind:value={n}> {n} Tönen <br> -->
    Gleichstufig mit <input type="number" min={2} max={24} step={1} bind:value={n}> Tönen im Interval
    <input type="number" bind:value={baseInterval} max={10.0} step={0.1}>
    <button on:click={() => alert("Stelle ein gleichstufiges Intonationssystem ein, in dem das angegebene Interval in die angegebene Anzahl von Tönen unterteilt wird. zB: 12 und 2 wäre Unterteilung der Oktave in 12 Töne, also unsere gewohnte wohltemperierte Stimmung.")}>?</button>
</label><br>

<label><input type="radio" name="int" bind:group={custom} value={true}>
    Frei definiert <button on:click={() => alert("Lege eine Starttaste fest, die mit der Startfrequenz belegt wird. Im Textfeld werden die Schwingungsverhältnisse der folgenden Tasten zur Startfrequenz angegeben. Das rechte Textfeld dient für Notizen und wird nicht ausgelesen. Nicht belegte Tasten erzeugen keinen Ton. WICHTIG: Klicke nach der Eingabe 'Stimmung setzen', damit deine Eingabe ausgelesen wird.")}>?</button><br>
    <div id="__">
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
        </span><br>
        <button disabled={! custom} on:click={() => importInt(prompt("Gibt ein Intonationsprofil (Format: x // y // z) ein und klicke Übernehmen."))}>Importieren…</button>
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