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
        let lb = (a - b) / c;
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
        let delta = bScore - aScore;
        //console.log(b, a, bScore, aScore, delta);
        if (delta === 0) {
            return Date.parse(a.timeAdded) - Date.parse(b.timeAdded);
        }
        else {
            return delta;
        }
    }
    static Sort(type, list) {
        return list.sort((a, b) => {
            return this.Rank(type, a, b);
        });
    }
    /**
     * @description Searches to find an exact item in a list. Returns -1 if not.
     * @param type The metric used determine the rank during search.
     * @param list
     * @param item
     */
    static BinaryExactSearch(type, list, item) {
        let high = list.length - 1;
        let low = 0;
        let midpoint = 0;
        while (high > low) {
            midpoint = ((high - low) % 2 === 0) ? (high + low) / 2.0 : ((high + low) - 1) / 2;
            if (list[midpoint].id === item.id) {
                return midpoint;
            }
            else {
                if (high - low === 1) {
                    if (list[low].id === item.id) {
                        return low;
                    }
                    if (list[high].id === item.id) {
                        return high;
                    }
                    return -1;
                }
                /*
                    rank(a, b) -> rank(b) - rank(a) so if r > 0 b > a.
                    HOWEVER, because the list is sorted in descending rank,
                    we will want to take the inverse to be true.

                    Example:

                    list = [9, 7, 5, 3, 1];
                    item = 3;

                    rank(5, 3) = -2; -> then the low becomes the midpoint.
                */
                let rank = this.Rank(type, list[midpoint], item);
                if (rank < 0) {
                    low = midpoint;
                }
                else {
                    high = midpoint;
                }
            }
        }
        return -1;
    }
    static BinarySearch(type, list, item) {
        var low = 0;
        var midpoint = 0;
        var high = list.length - 1;
        if (list.length === 0) {
            return 0;
        }
        if (list.length === 1) {
            let rank = this.Rank(type, list[0], item);
            if (rank < 0) {
                return 1;
            }
            else {
                return 0;
            }
        }
        while (low < high) {
            if (high - low === 1) {
                let rank = this.Rank(type, list[low], item);
                if (rank < 0) {
                    rank = this.Rank(type, list[high], item);
                    if (rank < 0) {
                        return low + 2;
                    }
                    else {
                        return low + 1;
                    }
                }
                else {
                    return low;
                }
            }
            midpoint = ((high - low) % 2 === 0) ? (high + low) / 2.0 : ((high + low) - 1) / 2;
            let rank = this.Rank(type, list[midpoint], item);
            if (rank < 0) {
                low = midpoint;
            }
            else if (rank > 0) {
                high = midpoint;
            }
            else {
                return midpoint;
            }
        }
        return midpoint;
    }
    static LinearExactSearch(type, list, item) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === item.id) {
                return i;
            }
        }
        return -1;
    }
    static LinearSearch(type, list, item) {
        if (list.length === 0) {
            return 0;
        }
        if (list.length === 1) {
            let rank = this.Rank(type, list[0], item);
            if (rank > 0) {
                return 1;
            }
            else {
                return 0;
            }
        }
        let count = 0;
        while (this.Rank(type, list[count], item) > 0) {
            count++;
        }
        return count;
    }
    static FindPosition(type, item, list) {
        return 0;
    }
}
exports.default = RankHelper;
//# sourceMappingURL=RankHelper.js.map