"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RandomHelper_1 = require("../../Helpers/RandomHelper");
const Party_1 = require("../../DataLayer/Domain/Party");
const PartyGuest_1 = require("../../DataLayer/Domain/PartyGuest");
class PartyController {
    constructor(ds, pool) {
        this.DataSource = ds;
        this._Party = new Party_1.default();
        this._Guest = new PartyGuest_1.default();
        this._Party.setDataSource(ds);
        this._Guest.setDataSource(ds);
        this._Party.setResourcePool(pool, "Party");
    }
    newParty(partyName, userId, cb) {
        let key = RandomHelper_1.default.key(5);
        this._Party.create({
            name: partyName,
            host: userId,
            partyKey: key
        }, (error, party) => {
            cb(error, party);
            if (!error) {
                this._Party.ResourcePool.createSubPool("Party", key);
            }
        });
    }
    joinParty(partyId, userId, cb) {
        this.getParty(partyId, (error, party) => {
            console.log(party);
            if (!error && party != null) {
                this._Guest.getWhere({ guestId: userId, partyId: partyId }, (error, guest) => {
                    console.log(error, guest.length);
                    if (!error && guest.length === 0) {
                        this._Guest.create({ partyId: partyId, guestId: userId }, (err, guest) => {
                            console.log("Created:", err, guest);
                            if (guest !== null) {
                                cb(false, guest);
                            }
                            else {
                                cb("Guest failed to create", null);
                            }
                        });
                    }
                    else {
                        cb("Guest already in party", null);
                    }
                });
            }
            else {
                cb("Party does not exist", null);
            }
        });
    }
    leaveParty(partyId, userId, cb) {
        this._Guest.getWhere({ partyId: partyId, guestId: userId }, (error, guests) => {
            if (!error && guests.length > 0) {
                this._Guest.destroy(guests[0]['id'], (error) => {
                    cb(error);
                });
            }
            else {
                cb(false);
            }
        });
    }
    deleteParty(partyId, userId, cb) {
        this._Party.get(partyId, (error, party) => {
            if (!error && party !== null) {
                if (party['host'] === userId) {
                    this._Party.destroy(partyId, (success) => {
                        cb(success);
                    });
                }
                else {
                    cb(false);
                }
            }
            else {
                cb(false);
            }
        });
    }
    getParty(id, cb) {
        this._Party.get(id, (error, party) => {
            console.log(error, party);
            cb(error, party);
        });
    }
    getParties(cb) {
        this._Party.getAll(cb);
    }
}
exports.default = PartyController;
//# sourceMappingURL=PartyController.js.map