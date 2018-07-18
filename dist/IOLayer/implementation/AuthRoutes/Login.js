"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Login {
    constructor() {
        this.Method = "post";
        this.Route = "/login";
    }
    callback(req, res) {
        res.json({
            "Its workin!": "Yup"
        });
    }
}
exports.default = Login;
//# sourceMappingURL=Login.js.map