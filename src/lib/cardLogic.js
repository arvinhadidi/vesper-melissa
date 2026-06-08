export function getDailyCardIndex(userId, dateString) {
    const str = `${userId}${dateString}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) % 78;
}

// Hash a string to a number so LCG gets a valid numeric seed
function hashStringToInt(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

// Returns a generator function — call rng() each time you need a new number
export function makeSeededLCG(numericSeed) {
    let state = numericSeed >>> 0;
    return function () {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 0x100000000;
    };
}

export function getSpreadCards(userId, sessionTimestamp, cardCount) {
    const seedString = `${userId}${sessionTimestamp}`;
    const numericSeed = hashStringToInt(seedString);
    const rng = makeSeededLCG(numericSeed); // rng is now a function

    const deck = [...Array(78).keys()];

    // Fisher-Yates — rng() produces a new number each call
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck.slice(0, cardCount).map((cardIndex) => ({
        cardIndex,
        isReversed: rng() < 0.3  // seeded — same result every time for same seed
    }));
}