import DataObject from '../Abstract/DataObject';

export default class Party extends DataObject {
    Schema: Object = {
        name: 'string',
        key: 'string'
    };

    Table: string = "Parties";
}