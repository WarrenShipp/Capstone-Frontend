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

/**
 * A class with static methods that allows the user to get a certain value from
 * a Shot Type list.
 */
class ShotTypes {
    static _types = [
        {
            "value": 1,
            "display_name": "Straight Drive"
        },
        {
            "value": 2,
            "display_name": "Cover Drive"
        },
        {
            "value": 3,
            "display_name": "Square Cut"
        },
        {
            "value": 4,
            "display_name": "Square Drive"
        },
        {
            "value": 5,
            "display_name": "Late Cut"
        },
        {
            "value": 6,
            "display_name": "Leg Glance"
        },
        {
            "value": 7,
            "display_name": "Hook"
        },
        {
            "value": 8,
            "display_name": "Pull"
        },
        {
            "value": 9,
            "display_name": "Drive through Square Leg"
        },
        {
            "value": 10,
            "display_name": "Drive through Mid Wicket"
        },
        {
            "value": 11,
            "display_name": "On Drive"
        },
        {
            "value": 12,
            "display_name": "Off Drive"
        }
    ];
    static getNameFromValue(value) {
        for (var item in ShotTypes._types) {
            if (ShotTypes._types[item].value === value) {
                return ShotTypes._types[item].display_name;
            }
        }
        return null;
    }
    static getValueFromName(name) {
        for (var item in ShotTypes._types) {
            if (ShotTypes._types[item].display_name == name) {
                return ShotTypes._types[item].value;
            }
        }
        return null;
    }
    static getFullList() {
        return ShotTypes._types;
    }
}
module.exports.ShotTypes = ShotTypes;

/**
 * A class with static methods that allows the user to get a certain value from
 * a Rating Type list.
 */
class RatingTypes {
    static _types = [
        {
            "value": 1,
            "display_name": "Perfect"
        },
        {
            "value": 2,
            "display_name": "Good"
        },
        {
            "value": 3,
            "display_name": "Off Balance"
        },
        {
            "value": 4,
            "display_name": "Off Position"
        },
        {
            "value": 5,
            "display_name": "Played Late"
        },
        {
            "value": 6,
            "display_name": "Played Early"
        }
    ];
    static getNameFromValue(value) {
        for (var item in RatingTypes._types) {
            if (RatingTypes._types[item].value === value) {
                return RatingTypes._types[item].display_name;
            }
        }
        return null;
    }
    static getValueFromName(name) {
        for (var item in RatingTypes._types) {
            if (RatingTypes._types[item].display_name == name) {
                return RatingTypes._types[item].value;
            }
        }
        return null;
    }
    static getFullList() {
        return RatingTypes._types;
    }
}
module.exports.RatingTypes = RatingTypes;