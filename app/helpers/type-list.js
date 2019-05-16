/**
 * A class with static methods that allows the user to get a certain value from
 * a Batsman Type list.
 */
class BatsmanTypes {
    static _types = [
        {
            "value": 0,
            "display_name": "Unset"
        },
        {
            "value": 1,
            "display_name": "Right Handed"
        },
        {
            "value": 2,
            "display_name": "Left Handed"
        }
    ];
    static getNameFromValue(value) {
        for (var item in BatsmanTypes._types) {
            if (BatsmanTypes._types[item].value === value) {
                return BatsmanTypes._types[item].display_name;
            }
        }
        return null;
    }
    static getValueFromName(name) {
        for (var item in BatsmanTypes._types) {
            if (BatsmanTypes._types[item].display_name == name) {
                return BatsmanTypes._types[item].value;
            }
        }
        return null;
    }
    static getFullList() {
        return BatsmanTypes._types;
    }
}
module.exports.BatsmanTypes = BatsmanTypes;

/**
 * A class with static methods that allows the user to get a certain value from
 * a Bowler Type list.
 */
class BowlerTypes {
    static _types = [
        {
            "value": 0,
            "display_name": "Unset"
        },
        {
            "value": 1,
            "display_name": "Right Hand Leg Spin"
        },
        {
            "value": 2,
            "display_name": "Right Hand Off Spin"
        },
        {
            "value": 3,
            "display_name": "Right Hand Pace Bowler"
        },
        {
            "value": 4,
            "display_name": "Right Hand Chinaman"
        },
        {
            "value": 5,
            "display_name": "Left Hand Leg Spin"
        },
        {
            "value": 6,
            "display_name": "Left Hand Off Spin"
        },
        {
            "value": 7,
            "display_name": "Left Hand Pace Bowler"
        },
        {
            "value": 8,
            "display_name": "Left Hand Chinaman"
        }
    ];
    static getNameFromValue(value) {
        for (var item in BowlerTypes._types) {
            if (BowlerTypes._types[item].value === value) {
                return BowlerTypes._types[item].display_name;
            }
        }
        return null;
    }
    static getValueFromName(name) {
        for (var item in BowlerTypes._types) {
            if (BowlerTypes._types[item].display_name == name) {
                return BowlerTypes._types[item].value;
            }
        }
        return null;
    }
    static getFullList() {
        return BowlerTypes._types;
    }
}
module.exports.BowlerTypes = BowlerTypes;