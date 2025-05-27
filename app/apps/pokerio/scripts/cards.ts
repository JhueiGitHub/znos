import { findAllMatchingValues, findLongestSequence, removeDuplicates } from "./functions";

const _CONST_SHAPE_STEP = 100;
const _CONST_VALUE_MAX = 13;
const _CONST_SHAPE_COUNT = 4;

export const cardsBrain = function (nSortedCards: number[], objDuplicates: Map<string, number[]>) {
    if (nSortedCards.length < 5 || nSortedCards.length > 7) throw Error(`cards isnt in fixed length ${nSortedCards.length}`);
    function listhasgetfalse(str: string) {
        const list = objDuplicates.get(str);
        if (list) return list;
        return false;
    }
    return {
        onePair() {
            return listhasgetfalse("2");
        },
        twoPair() {
            const best = findAllMatchingValues(nSortedCards, (a) => a % _CONST_SHAPE_STEP);

            if (best.length > 3) {
                best.sort((a, b) => (b % _CONST_SHAPE_STEP) - (a % _CONST_SHAPE_STEP));
                return best.slice(0, 4);
            }
            return false;
        },
        threeOfAKind() {
            return listhasgetfalse("3");
        },
        straight(arr: number[] = nSortedCards): false | number[] {
            const rmvDuplicates = removeDuplicates(arr, (v) => v % _CONST_SHAPE_STEP);
            let aceSpecialCase = [...rmvDuplicates].map((v) => {
                if (v % _CONST_SHAPE_STEP === 1) return Math.floor(v / _CONST_SHAPE_STEP) * _CONST_SHAPE_STEP + 14;
                else return v;
            });
            aceSpecialCase.sort((a, b) => (a % _CONST_SHAPE_STEP) - (b % _CONST_SHAPE_STEP));
            const compareFN = (a: number, b: number) => (a % _CONST_SHAPE_STEP) - 1 === b % _CONST_SHAPE_STEP;
            const best1 = findLongestSequence(rmvDuplicates, compareFN);
            const best2 = findLongestSequence(aceSpecialCase, compareFN);

            if (best2.length > 4) return best2;
            if (best1.length > 4) return best1;
            return false;
        },
        flush() {
            const arr = [...nSortedCards].sort((a, b) => {
                const valueDiffrent = (a % _CONST_SHAPE_STEP) - (b % _CONST_SHAPE_STEP);
                const shapeDiffrent = Math.round(a / _CONST_SHAPE_STEP) - Math.round(b / _CONST_SHAPE_STEP);
                return shapeDiffrent ? shapeDiffrent : valueDiffrent;
            });
            const best = findLongestSequence(arr, (a, b) => Math.round(a / _CONST_SHAPE_STEP) === Math.round(b / _CONST_SHAPE_STEP));

            if (best.length > 4) return best;
            return false;
        },
        fullHouse() {
            const two = this.twoPair();
            const three = this.threeOfAKind();
            if (typeof two == "boolean" || typeof three == "boolean") return false;
            return two.concat(...three);
        },
        fourOfaKind() {
            return listhasgetfalse("4");
        },
        straightFlush() {
            const straight = this.straight();
            const flush = this.flush();

            if (flush === false || straight === false) return false;
            let set = Array.from(new Set([...straight, ...flush]).values());
            if (set.filter((v) => v % _CONST_SHAPE_STEP == 14).length > 0) set = set.filter((v) => v % _CONST_SHAPE_STEP != 1);
            const newstraight = this.straight(set);
            if (newstraight === false) return false;
            else if (newstraight.length > 4) return newstraight;
            else return false;
        },
        royaleFlush() {
            const straightflush = this.straightFlush();
            if (straightflush === false) return false;
            straightflush.sort((a, b) => a - b);
            if (straightflush.filter((v) => v % _CONST_SHAPE_STEP === 10) && straightflush.filter((v) => v % _CONST_SHAPE_STEP === 14)) {
                return straightflush.filter((v) => {
                    const cv = v % _CONST_SHAPE_STEP;
                    return cv > 9 && cv < 15;
                });
            } else return false;
        },
    };
};

export default {
    packet: () => {
        let crdSet: Set<number> = new Set();

        for (let cshape = 0; cshape < _CONST_SHAPE_COUNT; cshape++) {
            for (let cvalue = 0; cvalue < _CONST_VALUE_MAX; cvalue++) {
                crdSet.add(cshape * _CONST_SHAPE_STEP + cvalue + 1);
            }
        }

        const shuffleArray = (array: number[]) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                if (i !== j) {
                    [array[i], array[j]] = [array[j], array[i]];
                }
            }
        };

        return {
            next() {
                const array = Array.from(crdSet.values());
                shuffleArray(array);
                const nxt = array.pop()!;
                crdSet = new Set(array);
                return nxt;
            },
            reset() {
                crdSet = new Set();
                for (let cshape = 0; cshape < _CONST_SHAPE_COUNT; cshape++) {
                    for (let cvalue = 0; cvalue < _CONST_VALUE_MAX; cvalue++) {
                        crdSet.add(cshape * _CONST_SHAPE_STEP + cvalue + 1);
                    }
                }
            },
            all: Array.from(crdSet),
        };
    },
    state: (nCards: number[]): { stateId: number; cards: number[]; stateScore: number } => {
        const cardsArr: number[] = [...nCards];
        cardsArr.sort((crdFirst, crdSecond) => {
            const valueDiffrent = (crdFirst % _CONST_SHAPE_STEP) - (crdSecond % _CONST_SHAPE_STEP);
            const shapeDiffrent = Math.round(crdFirst / _CONST_SHAPE_STEP) - Math.round(crdSecond / _CONST_SHAPE_STEP);
            return valueDiffrent ? valueDiffrent : shapeDiffrent;
        });

        const objDuplicates = new Map(
            cardsArr.map((v) => {
                const searchCardsArr = cardsArr.filter((vsearch) => vsearch % _CONST_SHAPE_STEP === v % _CONST_SHAPE_STEP);
                return [searchCardsArr.length.toString(), searchCardsArr];
            })
        );
        const brain = cardsBrain(cardsArr, objDuplicates);

        const statesArr = [
            [cardsArr[cardsArr.length - 1]],
            brain.onePair(),
            brain.twoPair(),
            brain.threeOfAKind(),
            brain.straight(),
            brain.flush(),
            brain.fullHouse(),
            brain.fourOfaKind(),
            brain.straightFlush(),
            brain.royaleFlush(),
        ];
        const stateId = statesArr.map((val) => !(typeof val == "boolean")).lastIndexOf(true);

        let retValue = 0;
        let retCards: number[] = [];

        const stateValue = statesArr[stateId];
        if (Array.isArray(stateValue)) retCards = retCards.concat(stateValue);
        switch (stateId) {
            case 0:
            case 1: {
                retValue = retCards[0] % _CONST_SHAPE_STEP;
                break;
            }
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8: {
                const arr = retCards.sort((a, b) => (a % _CONST_SHAPE_STEP) - (b % _CONST_SHAPE_STEP));
                retValue = arr[arr.length - 1];
                break;
            }
        }
        return {
            stateId: stateId,
            cards: retCards,
            stateScore: retValue,
        };
    },
};
