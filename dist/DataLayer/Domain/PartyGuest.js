"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataObject_1 = require("../Abstract/DataObject");
class PartyGuest extends DataObject_1.default {
    constructor() {
        super(...arguments);
        this.Table = "PartyGuests";
        this.Schema = {
            partyId: 'string',
            guestId: 'string'
        };
    }
}
exports.default = PartyGuest;
//# sourceMappingURL=PartyGuest.js.map