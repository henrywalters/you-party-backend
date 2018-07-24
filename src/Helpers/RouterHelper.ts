export default class RouterHelper {
    public static matchBody(required: Array<string>, body: Object): boolean {
        for (let i = 0; i < required.length; i++) {
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