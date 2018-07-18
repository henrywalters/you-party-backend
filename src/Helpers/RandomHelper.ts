export default class Random {
    static key(length: number = 5): string {
        let alpha = ['a','b','c','d','e','f','g','h','j','k','m','n','p','q','r','s','t','u','v','x','y','z'];
        let key = "";

        for (let i = 0 ; i < length; i++) {
            let r1 = Random.int(0, 2);
            if (r1 === 0) {
                key += alpha[this.int(0, alpha.length)]
            } else {
                key += this.int(1,10);
            }
        }

        return key;
    }
    // min included max excluded
    static int(min, max) {
        return Math.floor(Math.random() * (max - min) ) + min;
    }
}