import DataObject from "../Abstract/DataObject";

export default class Playlist extends DataObject {
    Table: string = "Playlists";
    Schema: Object = {
        partyId: "string",
        videoId: "string",
        guestId: "string",
        status: "string"
    }
}