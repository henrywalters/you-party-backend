import DataObject from "../Abstract/DataObject";

export default class User extends DataObject {
    Schema: Object = {
        username: 'string',
        email: 'string',
        password: 'string'
    };

    Table: string = "Users";
}