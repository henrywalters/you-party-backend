import DataObject from '../Abstract/DataObject';
export default class Video extends DataObject {
    Schema: Object = {
        videoKey: "string", //Youtube Key for example but can be used generally
        title: "string",
        description: "string",
        thumbnail: "string"
    };

    Table: string = "Videos";
}