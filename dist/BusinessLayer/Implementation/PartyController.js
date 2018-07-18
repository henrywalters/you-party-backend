"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RandomHelper_1 = require("../../Helpers/RandomHelper");
const Party_1 = require("../../DataLayer/Domain/Party");
class PartyController {
    constructor(ds) {
        this.DataSource = ds;
        this._Party = new Party_1.default();
        this._Party.setDataSource(ds);
    }
    newParty(partyName, cb) {
        let key = RandomHelper_1.default.key(5);
        this._Party.create({
            name: partyName,
            key: key
        }, (error, party) => {
            cb(error, party);
        });
    }
}
exports.default = PartyController;
//# sourceMappingURL=PartyController.js.map