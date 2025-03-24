<script lang="ts">
    import Key from "./Key.svelte";

    export let octaves = 2;
    export let middleC = 60;
    export let keysPressed: number[] = [];
    export let hidden = false;

    let keys: [number, string][];
    $: keys = [...Array(octaves * 12 + 1).keys()].map(
        (i) => [i + (middleC - Math.floor(octaves / 2) * 12), shortcuts[i] || ""]
    );
    let shortcuts = ["a", "w", "s", "e", "d", "r", "f", "t", "g", "z", "h", "u", "j", "i", "k", "o", "l", "p", "ö", "ü", "ä", "+", "#"];
</script>

<div class="keyboard" class:hidden id="virtualKeyboard">
    <div class:hidden>
        {#each keys as keyTuple}
            <Key noteNum={keyTuple[0]} shortcut={keyTuple[1]} on:noteon on:noteoff pressed={keysPressed.includes(keyTuple[0])}/>
        {/each}
    </div>
</div>

<style>
    .keyboard {
        display: flex;
        justify-content: center;
        z-index: 3;
        transition: 0.5s;
    }
    .hidden {
        height: 0;
        opacity: 0;
    }
    .keyboard > div {
        display: flex;
        overflow: auto;
        padding: 8px;
        height: 192px;
    }
</style>