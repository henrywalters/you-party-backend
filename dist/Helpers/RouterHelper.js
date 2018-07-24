"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RouterHelper {
    static matchBody(required, body) {
        for (let i = 0; i < required.length; i++) {
            if (!body.hasOwnProperty(required[i])) {
                return false;
            }
        }
        return true;
    }
    static matchBodyError(required, body) {
        return "Expected Parameters: " + required.join(", ") + " but instead got: " + Object.keys(body).join(", ");
    }
}
exports.default = RouterHelper;
//# sourceMappingURL=RouterHelper.js.map