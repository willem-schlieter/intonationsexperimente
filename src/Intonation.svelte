<script lang="ts">
    import { wohltemp, from_ratios, from_stepsize, test_wasm } from "../wasm/pkg";

    try {
        if (test_wasm() !== 1) throw new Error("WASM-Modul konnte nicht geladen werden.");
    } catch (e) {
        alert("WASM-Modul (zwingend erforderlich für präzise Berechnungen) konnte nicht geladen werden. Bitte überprüfe, ob dein Browser WASM unterstützt und lade die Seite neu.");
        throw e;
    }

    export let baseKey: number = 60;
    let base: number = 220.0;
    
    enum Mode { Wohltemp, Stepsize, Ratios };
    let mode: Mode = Mode.Wohltemp;
    let baseInterval = 2;
    let n = 12;
    let stepsize = 1.0594630943592953;
    $: stepsize = baseInterval ** (1 / n);
    let input: string = "";
    let ratios: number[] = [];
    $: ratios = input.split("\n").map(parseFloat).filter(Boolean);

    // export let freqs: number[] = [];

    // export function updateIntonation() {
    //     if (mode == Mode.Wohltemp) freqs = [...wohltemp(base, baseInterval, n, 60)];
    //     else if (mode == Mode.Stepsize) freqs = [...from_stepsize(base, stepsize, 60)];
    //     else freqs = [...from_ratios(base, Float32Array.from(ratios))];
        
    //     // SO WAR ES VORHER:
    //     // if (! custom) freqs = [...wohltemp(base, baseInterval, n, baseKey)];
    //     // else {
    //     //     freqs = new Array(baseKey - 33).fill(440.0).concat([...from_ratios(base, Float32Array.from(ratios))])
    //     // };
    // }
    // updateIntonation();

    export let freqs: number[] = [];
    $: {
        console.log("updateIntonation");
        if (mode == Mode.Wohltemp) freqs = [...wohltemp(base, baseInterval, n, baseKey)];
        else if (mode == Mode.Stepsize) freqs = [...from_stepsize(base, stepsize, baseKey)];
        else freqs = [...from_ratios(base, Float32Array.from(ratios))];
    }
    
    function importIntonation (inp: string | null) {
        if (inp) input = inp.split(" // ").join("\n");
    }
</script>


<h4>Wähle eine Stimmung aus:</h4>

Starttaste: <input type="number" bind:value={baseKey}><br>
Startfrequenz: <input type="number" bind:value={base}><br>
<small>Die Starttaste wird mit der Startfrequenz belegt,
    alle Tasten darüber entsprechend des unten gewählten
    Intonationssystems. Die Tasten unterhalb der Starttaste werden nicht belegt.</small><br><br>
    
<label><input type="radio" name="int" bind:group={mode} value={Mode.Wohltemp} checked>
    <!-- Wohltemperiert mit <input type="range" min={3} max={24} step={1} bind:value={n}> {n} Tönen <br> -->
    Gleichstufig mit <input type="number" min={2} max={24} step={1} bind:value={n} disabled={mode != Mode.Wohltemp}> Tönen
    im Interval <input type="number" bind:value={baseInterval} max={10.0} step={0.1} disabled={mode != Mode.Wohltemp}>
    <button on:click={() => alert("Stelle ein gleichstufiges Intonationssystem ein, in dem das angegebene Interval in die angegebene Anzahl von Tönen unterteilt wird. zB: 12 und 2 wäre Unterteilung der Oktave in 12 Töne, also unsere gewohnte wohltemperierte Stimmung.")}>?</button>
</label><br>

<label><input type="radio" name="int" bind:group={mode} value={Mode.Stepsize}>
    Gleichstufig mit Schrittgröße
    {#if mode == Mode.Wohltemp}
        <input type="number" value={baseInterval ** (1 / n)} step={0.0000000000000001} disabled>
    {:else}
        <input type="number" bind:value={stepsize} step={0.0000000000000001} disabled={mode != Mode.Stepsize}>
    {/if}

    <button on:click={() => alert("Stelle ein Intonationssystem ein, in dem die Frequenz jedes folgenden Tons um den angegebenen Faktor von der vorherigen abweicht. zB: 1.0594630943592953 wäre die Schrittgröße unserer gewohnten 12-Ton-Stimmung.")}>?</button>

</label><br>

<label><input type="radio" name="int" bind:group={mode} value={Mode.Ratios}>
    Frei definiert <button on:click={() => alert("Erstelle ein eigenes, nicht zwingend gleichstufiges Intonationssystem, indem du im Textfeld Schwingungsverhältnisse einträgst. So viele Zahlen wie du einträgst, so viele Tasten werden belegt. Das rechte Textfeld dient für Notizen und wird nicht ausgelesen. Unten wird angezeigt, wie das Programm deine Eingabe verstanden hat. Diesen Code kannst du kopieren und später mit dem Importieren-Button importieren.")}>?</button><br>
    <div id="__">
        <div>
            <textarea
            placeholder="Schwingungsverhältnisse zur Startfrequenz eingeben…"
            title="Schwingungsverhältnisse" disabled={mode !== Mode.Ratios}
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
        <button disabled={mode !== Mode.Ratios} on:click={() => importIntonation(prompt("Gibt ein Intonationsprofil (Format: x // y // z) ein und klicke Übernehmen."))}>Importieren…</button>
    </div>
</label><br>

<button on:click={() => console.log(freqs)}>Intonationssystem in der Konsole inspizieren</button>

<style>
    #__ {
        margin-left: 50px;
    }
</style>