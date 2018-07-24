import DataObject from '../Abstract/DataObject';

export default class Party extends DataObject {
    Schema: Object = {
        name: 'string',
        host: 'string',
        partyKey: 'string'
    };

    Table: string = "Parties";
}