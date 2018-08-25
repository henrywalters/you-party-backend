import * as fs from 'fs';

export default class Config {
    public static get(index: string): string  {
        let config = fs.readFileSync("./ypconfig.json", 'utf8');
        config = JSON.parse(config);
        
        if (typeof config[index] !== 'undefined') {
            return config[index];
        } else {
            console.log("Config Param does not exist");
        }
    }

    public static getCert(fileName: string): string {
        let key = fs.readFileSync("./" + fileName + ".cert");
        if (typeof key !== 'undefined') {
            return key.toString();
        }
    }
}
