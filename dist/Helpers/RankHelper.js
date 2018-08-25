"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RankTypes;
(function (RankTypes) {
    RankTypes[RankTypes["Wilson Lower Bound"] = 0] = "Wilson Lower Bound";
    RankTypes[RankTypes["Delta"] = 1] = "Delta";
})(RankTypes = exports.RankTypes || (exports.RankTypes = {}));
;
class RankHelper {
    static WilsonLowerBound(upvotes, downvotes) {
        // Z (alpha/2) = 1.96 where alpha = 95%
        let n = upvotes + downvotes;
        if (n === 0) {
            return 0;
        }
        let phat = upvotes / (upvotes + downvotes);
        let z = 1.96;
        let a = phat + ((z * z) / (2 * n));
        let b = z * Math.sqrt(((phat * (1 - phat)) + (z * z) / (4 * n)) / n);
        let c = (1 + (z * z) / n);
        console.log(a);
        console.log(b);
        let lb = (a - b) / c;
        console.log("WILSON LOWER BOUND: " + lb);
        return lb;
    }
    static Delta(upvotes, downvotes) {
        return upvotes - downvotes;
    }
    static Rank(type, a, b) {
        let aScore = 0;
        let bScore = 0;
        if (type === RankTypes["Wilson Lower Bound"]) {
            aScore = this.WilsonLowerBound(a.upvotes, a.downvotes);
            bScore = this.WilsonLowerBound(b.upvotes, b.downvotes);
        }
        if (type === RankTypes.Delta) {
            aScore = this.Delta(a.upvotes, a.downvotes);
            bScore = this.Delta(b.upvotes, b.downvotes);
        }
        return bScore - aScore;
    }
    static Sort(type, list) {
        return list.sort((a, b) => {
            console.log(a, b);
            return this.Rank(type, a, b);
        });
    }
}
exports.default = RankHelper;
//# sourceMappingURL=RankHelper.js.map