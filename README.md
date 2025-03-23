# SvelteWASM
Diese Template enthält:
- Svelte (gebündelt mit Webpack)
- Typescript-Support
- Ein WASM-Modul (das mit TS-Support importiert wird)
- Das WASM-Modul kann auch Canvas!

Am Anfang: ``npm install``
DevServer: ``npm run dev`` (Auch WASM wird im watchmode kompiliert!)
Build: ``npm run build``

Wenn Änderungen in Rust vorgenommen werden, werden diese in der TS-Schnittstelle erst mit Build wirksam. Dafür kann auch ``npm wasm``benutzt werden (= ``wasm-pack ./wasm``);