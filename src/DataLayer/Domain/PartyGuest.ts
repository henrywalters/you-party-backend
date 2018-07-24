import DataObject from '../Abstract/DataObject';
export default class PartyGuest extends DataObject {
    Table: string = "PartyGuests";
    Schema: Object = {
        partyId: 'string',
        guestId: 'string'
    }
}