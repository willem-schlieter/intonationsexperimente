use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    pub fn alert(message: &str);
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(message: &str);
}

/// Erzeugt eine wohltemperierte Leiter, wo die Oktave in `n` Töne unterteilt ist.
#[wasm_bindgen]
pub fn wohltemp (base: f32, n: f32, len: u8) -> Vec<f32> {
    let root = 2_f32.powf(1.0 / n);
    let mut res = vec![base];
    for _ in 1..len {
        res.push(res.last().unwrap_or(&base) * root);
    }
    res
}

#[wasm_bindgen]
pub fn from_relations (base: f32, relations: Vec<f32>) -> Vec<f32> {
    let mut res = vec![base];
    for rel in relations {
        res.push(base * rel);
    }
    res
}
