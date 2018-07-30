import IPartyController from "../Interface/IPartyController";
import Random from '../../Helpers/RandomHelper';
import IQueryable from '../../DataLayer/Interface/IQueryable';
import Party from '../../DataLayer/Domain/Party';
import IResourcePool from "../../IOLayer/interface/IResourcePool";
import PartyGuest from "../../DataLayer/Domain/PartyGuest";

export default class PartyController implements IPartyController {

    DataSource: IQueryable;
    _Party: Party;
    _Guest: PartyGuest;

    constructor(ds: IQueryable, pool: IResourcePool) {
        this.DataSource = ds;
        this._Party = new Party();
        this._Guest = new PartyGuest();
        this._Party.setDataSource(ds);
        this._Guest.setDataSource(ds);
        this._Party.setResourcePool(pool, "Party");
    }

    newParty(partyName: string, userId: string, cb: {(error, party): void}) {
        let key = Random.key(5);
        this._Party.create({
            name: partyName,
            host: userId,
            partyKey: key
        }, (error, party) => {
            cb(error, party);
            if (!error) {
                this._Party.ResourcePool.createSubPool("Party", key);
            }
        })
    }

    joinParty(partyId: string, userId: string, cb: {(error, party): void}) {
        this.getParty(partyId, (error, party) => {
            console.log(party);
            if (!error && party != null) {
                this._Guest.getWhere({guestId: userId, partyId: partyId}, (error, guest) => {
                    console.log(error, guest.length);
                    if (!error && guest.length === 0) {
                        this._Guest.create({partyId: partyId, guestId: userId}, (err, guest) => {
                            console.log("Created:" , err, guest);
                            if (guest !== null) {
                                cb(false, guest);
                            } else {
                                cb("Guest failed to create", null);
                            }
                        })
                    } else {
                        cb("Guest already in party", null);
                    }
                });
            } else {
                cb("Party does not exist", null);
            }
        });
    }

    leaveParty(partyId: string, userId: string, cb: {(error): void}) {
        this._Guest.getWhere({partyId: partyId, guestId: userId}, (error, guests) => {
            if (!error && guests.length > 0) {
                this._Guest.destroy(guests[0]['id'], (error) => {
                    cb(error);
                })
            } else {
                cb(false);
            }
        })
    }

    deleteParty(partyId: string, userId: string, cb: {(success):void}) {
        this._Party.get(partyId, (error, party) => {
            if (!error && party !== null) {
                if (party['host'] === userId) {
                    this._Party.destroy(partyId, (success) => {
                        cb(success);
                    })
                } else {
                    cb(false);
                }
            } else {
                cb(false);
            }
        })
    }

    getParty(id, cb: {(error, party): void}) {
        this._Party.get(id, (error, party) => {
            console.log(error, party);
            cb(error, party);
        });
    }

    getParties(cb: {(error, parties): void}) {
        this._Party.getAll(cb);
    }
}