import DataObject from '../Abstract/DataObject';

export default class Log extends DataObject {
    Schema: Object = {
        time: "string",
        message: "string",
        sender: "string"
    };

    Table: string = "Logs";
}