import IPartyController from "../Interface/IPartyController";
import Random from '../../Helpers/RandomHelper';
import IQueryable from '../../DataLayer/Interface/IQueryable';
import Party from '../../DataLayer/Domain/Party';
import IResourcePool from "../../IOLayer/interface/IResourcePool";
import PartyGuest from "../../DataLayer/Domain/PartyGuest";
import { RankTypes } from "../../Helpers/RankHelper";

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
                this._Party.ResourcePool.createPool("Party-" + party['id']);
                this._Party.ResourcePool.createSubListPool("Party-" + party['id'], "Playlist", RankTypes["Wilson Lower Bound"], []);
                this._Party.ResourcePool.createSubPool("Party-" + party['id'], "Votes");
                this._Party.ResourcePool.createSubPool("Party-" + party['id'], "Video");
            }
        })
    }

    joinParty(partyId: string, userId: string, cb: {(error, party): void}) {
        this.getParty(partyId, (error, party) => {
            console.log(party);
            if (!error && party != null) {
                this._Guest.getWhere({guestId: userId}, (error, guest) => {
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
                        cb("Guest already in party - " + guest[0]['partyId'], null);
                    }
                });
            } else {
                cb("Party does not exist", null);
            }
        });
    }

    currentParty(userId: string, cb: {(error, party): void}) {
        this._Guest.getWhere({guestId: userId}, (error, guest) => {
            console.log(error, guest);
            if (!error && guest.length > 0) {
                this.getParty(guest[0]['partyId'], (error, party) => {
                    if (!error && party != null) {
                        cb(false, party);
                    } else {
                        cb(true, null);
                    }
                })
            } else {
                cb(true, null);
            }
        })
    }

    getSelfParties(userId: string, cb: {(error, parties): void}) {
        this._Party.getWhere({host: userId}, (error, parties) => {
            if (!error) {
                cb(false, parties);
            } else {
                cb(true, null);
            }
        })
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
            console.log(error, party);
            if (!error && party != undefined && party !== null ) { 
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

    getPartyByKey(key, cb: {(error, party): void}) {
        this._Party.getWhere({partyKey: key}, (error, party) => {
            if (!error && party.length > 0) {
                cb(false, party[0]);
            } else {
                cb(true, null);
            }
        })
    }

    getParties(cb: {(error, parties): void}) {
        this._Party.getAll(cb);
    }
}