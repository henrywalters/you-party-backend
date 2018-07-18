import IPartyController from "../Interface/IPartyController";
import Random from '../../Helpers/RandomHelper';
import IQueryable from '../../DataLayer/Interface/IQueryable';
import Party from '../../DataLayer/Domain/Party';

export default class PartyController implements IPartyController {

    DataSource: IQueryable;
    _Party: Party;

    constructor(ds: IQueryable) {
        this.DataSource = ds;
        this._Party = new Party();
        this._Party.setDataSource(ds);
    }

    newParty(partyName: string, cb: {(error, party): void}) {
        let key = Random.key(5);
        this._Party.create({
            name: partyName,
            key: key
        }, (error, party) => {
            cb(error, party);
        })
    }
}