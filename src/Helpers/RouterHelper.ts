export default class RouterHelper {
    public static matchBody(required: Array<string>, body: Object): boolean {
        console.log(required, body);
        for (let i = 0; i < required.length; i++) {
            console.log(required[i], body);
            if (!body.hasOwnProperty(required[i])) {
                return false;
            }
        }

        return true;
    }

    public static matchBodyError(required: Array<string>, body: Object): string {
        return "Expected Parameters: " + required.join(", ") + " but instead got: " + Object.keys(body).join(", ");
    }
}