use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    pub fn alert(message: &str);
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(message: &str);
}

/**
 * Erzeugt eine wohltemperierte Leiter, wo die Oktave in `n` Töne unterteilt ist.
 * @param base Frequenz des tiefsten belegten Tons (`Element [0] der Ausgabe`).
 * @param base_interval Intervall, das in `n` Schritte unterteilt wird.
 * @param n Anzahl der Schritte, in die das Intervall unterteilt wird.
 * @param len Anzahl der Töne, die erzeugt werden sollen.
 * @returns Array mit den Frequenzen der Töne.
*/
#[wasm_bindgen]
pub fn wohltemp (base: f32, base_interval: f32, n: f32, len: u8) -> Vec<f32> {
    let root = base_interval.powf(1.0 / n);
    let mut res = vec![base];
    for _ in 1..len {
        res.push(res.last().unwrap_or(&base) * root);
    }
    res
}

/**
 * Erzeugt eine gleichstufige Leiter mit einer festgelegten Tonschrittgröße.
 * @param base Frequenz des tiefsten belegten Tons (`Element [0] der Ausgabe`).
 * @param stepsize Frequenzunterschied zwischen zwei benachbarten Tönen.
 * @param len Anzahl der Töne, die erzeugt werden sollen.
 * @returns Array mit den Frequenzen der Töne.
 */
#[wasm_bindgen]
pub fn from_stepsize (base: f32, stepsize: f32, len: u8) -> Vec<f32> {
    let mut res = vec![base];
    for _ in 1..len {
        res.push(res.last().unwrap_or(&base) * stepsize);
    }
    res
}

/**
 * Erzeugt eine Leiter entsprechend frei einstellbarer Tonschritte (damit nicht zwingend gleichstufig).
 * @param base Frequenz des tiefsten belegten Tons (`Element [0] der Ausgabe`).
 * @param ratios Einzelne Tonschritte.
 * @returns Array mit den Frequenzen der Töne (So viele Töne wie `relations` + 1).
 */
#[wasm_bindgen]
pub fn from_ratios (base: f32, ratios: Vec<f32>) -> Vec<f32> {
    let mut res = vec![base];
    for rel in ratios {
        res.push(base * rel);
    }
    res
}

/** Test-Funktion: Loggt in die Konsole und gibt `1` zurück. */
#[wasm_bindgen]
pub fn test_wasm () -> i32 {
    log("Hello from Rust-WASM!");
    return 1;
}
