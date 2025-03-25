<script lang="ts">
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let noteNum: number;
    export let shortcut: string;
    export let keyWidth = 56;
    export let pressed = false;
    
    let isNatural = ![1, 3, 6, 8, 10].includes(noteNum % 12);
    let cf = [0, 5].includes(noteNum % 12);
    let he = [4, 11].includes(noteNum % 12);
    let bias = 0;
    // the accidental keys are not perfectly in center
    if (!isNatural) {
        if ([1, 6].includes(noteNum % 12)) bias = -keyWidth / 12;
        else if ([3, 10].includes(noteNum % 12)) bias = keyWidth / 12;
    }
    function keyPressed() {
        if (pressed) return;
        dispatch("noteon", noteNum);
        pressed = true;
    }
    function keyReleased() {
        if (!pressed) return;
        dispatch("noteoff", noteNum);
        pressed = false;
    }
</script>

<div
    class:accidental={!isNatural}
    class:natural={isNatural}
    class:pressed
    class:cf
    class:he
    style="--width: {keyWidth - keyWidth * 0.47 * Number(!isNatural)}px; transform: translate({bias}px);"
    draggable="false"
    on:mousedown|preventDefault={keyPressed}
    on:mouseup|preventDefault={keyReleased}
    on:mouseenter={(e) => {
        if (e.buttons) keyPressed();
    }}
    on:mouseleave={(e) => {
        if (e.buttons) keyReleased();
    }}
    on:touchstart|preventDefault={keyPressed}
    on:touchend|preventDefault={keyReleased}
>{shortcut}<br><small>{noteNum}</small></div>

<svelte:window
    on:keydown={(e) => {
        if (e.key === shortcut && ! e.metaKey && document.activeElement?.tagName !== "TEXTAREA") keyPressed();
    }}
    on:keyup={(e) => {
        if (e.key === shortcut && ! e.metaKey && document.activeElement?.tagName !== "TEXTAREA") keyReleased();
    }}
></svelte:window>

<style>
    div {
        flex-shrink: 0;
        width: var(--width);
        min-width: min-content;
        border-radius: 0px 0px calc(var(--width) / 8) calc(var(--width) / 8);
        -webkit-user-drag: none;
        font-size: 14px;
        font-family: Verdana, Geneva, Tahoma, sans-serif;
        text-align: center;
        padding-top: 5px;
        box-sizing: border-box;
    }
    small {
        font-size: 8px;
    }
    .accidental {
        margin: 0px calc(var(--width) / -2) 0px calc(var(--width) / -2);
        z-index: 2;
        height: 60%;
        background: black;
        box-shadow: inset white 0px 0px 2px 0px;
        color: white;
    }
    .natural {
        height: 100%;
        box-shadow: inset black 0px 0px 2px 0px;
    }
    .cf {
        /* text-align: left; */
        padding-right: 8px;
    }
    .he {
        /* text-align: right; */
        padding-left: 8px;
    }
    .accidental.pressed {
        background: hsl(0 0% 30%);
    }
    .natural.pressed {
        background: hsl(0 0% 90%);
    }
</style>
