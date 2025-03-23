export function wohltemp (startTon: number = 440.0, n: number = 12, laenge: number = 64): number[] {
    const res = [startTon];
    const faktor = 2 ** (1 / n);
    for (let i = 1; i < laenge; i ++) res.push(res[res.length - 1] * faktor);
    return res;
}

// let freqs: number[] = [];
    // for (let i = 0; i < 23; i++) freqs.push(oberton(300, i));
    // function oberton(grundton: number, index: number): number {
    //     let ton = grundton * (index + 1);
    //     while (ton > grundton * 2) {
    //         ton = ton / 2;
    //     }
    //     return ton;
    // }
    // for (let i = 0; i < 8; i++) freqs = freqs.concat(freqs);
    // console.log(freqs);