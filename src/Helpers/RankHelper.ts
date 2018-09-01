export enum RankTypes {
    "Wilson Lower Bound",
    "Delta"
};

export interface ISortable {
    upvotes: number;
    downvotes: number;
    timeAdded: string;
    id: string;
}

export default class RankHelper {
    static WilsonLowerBound(upvotes: number, downvotes: number) : number {
        // Z (alpha/2) = 1.96 where alpha = 95%

        let n = upvotes + downvotes;

        if (n === 0) {
            return 0;
        }

        let phat = upvotes / (upvotes + downvotes);

        let z = 1.96;

        let a = phat + ((z * z) / (2 * n));
        let b = z * Math.sqrt(((phat * (1 - phat)) + (z * z) / (4 * n))/n);
        let c = (1 + (z*z) / n);

        let lb = (a - b) / c;

        return lb;
    }

    static Delta(upvotes: number, downvotes: number): number {
        return upvotes - downvotes;
    }

    static Rank(type: RankTypes, a: ISortable, b: ISortable): number {
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
            return Date.parse(b.timeAdded) - Date.parse(a.timeAdded);
        } else {
            return delta;
        }
    }

    static Sort(type: RankTypes, list: Array<ISortable>): Array<ISortable> {
        return list.sort((a, b) => {
            return this.Rank(type, a, b);
        })
    }

    static BinarySearch(type: RankTypes, list: Array<ISortable>, item:ISortable): number {
        
        var low = 0; 
        var midpoint = 0;
        var high = list.length - 1;

        if (list.length === 0) {
            return 0;
        }

        if (list.length === 1) {

            if (list[0].id === item.id) {
                return 0;
            }

            let rank = this.Rank(type, list[0], item);
            if (rank < 0) {
                return 1;
            } else {
                return 0;
            }
        }

        while (low < high) {

            if (high - low === 1) {

                console.log(low, high, list[low], list[high]);

                if (list[low].id === item.id) {
                    return low;
                }

                if (list[high].id === item.id) {
                    return high;
                }

                let rank = this.Rank(type, list[low], item);
                if (rank < 0) {
                    rank = this.Rank(type, list[high], item);
                    if (rank < 0) {
                        return low + 2;
                    } else {
                        return low + 1;
                    }
                } else {
                    return low;
                }
            }

            midpoint = ((high - low) % 2 === 0) ? (high + low) / 2.0 : ((high + low) - 1) / 2;

            console.log("Midpoint: " + midpoint);
            
            console.log(list[midpoint].id + " vs " + item.id);
            
            if (list[midpoint].id === item.id) {
                return midpoint;
            }

            let rank = this.Rank(type, list[midpoint], item);

            console.log("Rank: " + rank);

            if (rank < 0) {
                low = midpoint;
            } else if (rank > 0) {
                high = midpoint;
            } else {
                return midpoint;
            }
        }
        
        return midpoint;
    }

    static LinearSearch(type: RankTypes, list: Array<ISortable>, item: ISortable): number {
        if (list.length === 0) {
            return 0;
        }

        if (list.length === 1) {
            let rank = this.Rank(type, list[0], item);
            if (rank > 0) {
                return 1;
            } else {
                return 0;
            }
        }

        let count = 0;

        while (this.Rank(type, list[count], item) > 0) {
            count++;
        }

        return count;
    }

    static FindPosition(type: RankTypes, item: ISortable, list: Array<ISortable>): number {
        return 0;
    }
}