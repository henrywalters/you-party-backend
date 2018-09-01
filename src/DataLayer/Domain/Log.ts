import DataObject from '../Abstract/DataObject';

export interface ILog {
    id: string;
    time: string;
    message: string;
    sender: string;
}

export default class Log extends DataObject {
    Schema: Object = {
        time: "string",
        message: "string",
        sender: "string"
    };

    Table: string = "Logs";
}