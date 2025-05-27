export function clamp(x: number, min: number, max: number) {
    return Math.min(max, Math.max(min, x));
}

export function findLongestSequence<T>(arr: T[], compareFn: (a: T, b: T) => boolean): T[] {
    let longestSequence: T[] = [];
    let currentSequence: T[] = [];

    for (let i = 0; i < arr.length; i++) {
        if (i === 0 || compareFn(arr[i], arr[i - 1])) {
            currentSequence.push(arr[i]);
        } else {
            currentSequence = [arr[i]];
        }

        if (currentSequence.length > longestSequence.length) {
            longestSequence = currentSequence;
        }
    }

    return longestSequence;
}

export function findAllMatchingValues<T>(arr: T[], manipulationFn: (a: T) => T): T[] {
    return arr.filter((value) => {
        const searchArray = arr.filter((second) => manipulationFn(second) === manipulationFn(value));
        return searchArray.length > 1;
    });
}

export function removeDuplicates<T>(arr: T[], manipulationFn: (a: T) => T): T[] {
    const uniqueElements: T[] = [];

    for (const currentElement of arr) {
        const mappedManipulatedValues = uniqueElements.map((uniqueElement) => manipulationFn(uniqueElement));
        if (!mappedManipulatedValues.includes(manipulationFn(currentElement))) {
            uniqueElements.push(currentElement);
        }
    }

    return uniqueElements;
}
