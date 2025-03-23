<script lang="ts">
    export let disabled: boolean;
    export let relations: number[] = [];
    export let base = 220.0;
    export let baseKey = 33;
    let input: string = "";
    $: relations = input.split("\n").map(str => parseFloat(str));
</script>

Frei definiert <button on:click={() => alert("Lege eine Starttaste fest, die mit der Startfrequenz belegt wird. Im Textfeld werden die Schwingungsverhältnisse der folgenden Tasten zur Startfrequenz angegeben. Das rechte Textfeld dient für Notizen und wird nicht ausgelesen. Nicht belegte Tasten erzeugen keinen Ton. WICHTIG: Klicke nach der Eingabe 'Stimmung setzen', damit deine Eingabe ausgelesen wird.")}>?</button><br>
<div id="__">
    Starttaste: <input {disabled} type="number" bind:value={baseKey}><br>
    Startfrequenz: <input {disabled} type="number" bind:value={base}><br>
    <div>
        <textarea
            placeholder="Schwingungsverhältnisse zur Startfrequenz eingeben…"
            title="Schwingungsverhältnisse" {disabled}
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
        {relations.join("  -  ")}
    </span>
</div>

<style>
    #__ {
        margin-left: 50px;
    }
</style>