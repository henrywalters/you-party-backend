import DataObject from "../Abstract/DataObject";

export default class Vote extends DataObject {
    Table: string = "Votes";
    Schema: Object = {
        playlistId: "string",
        guestId: "string",
        type: "string"
    }
}