"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
class Config {
    static get(index) {
        let config = fs.readFileSync("./ypconfig.json", 'utf8');
        config = JSON.parse(config);
        if (typeof config[index] !== 'undefined') {
            return config[index];
        }
        else {
            console.log("Config Param does not exist");
        }
    }
    static getCert(fileName) {
        let key = fs.readFileSync("./" + fileName + ".cert");
        if (typeof key !== 'undefined') {
            return key.toString();
        }
    }
}
exports.default = Config;
//# sourceMappingURL=ConfigHelper.js.map