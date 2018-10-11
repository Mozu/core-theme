function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

var behaviors = {
    USER_BEHAVIORS_BY_ID: {
        1000: "Manage Account Information",
        1001: "Manage Users",
        1002: "Manage Contacts",
        1003: "Manage Saved Payments",
        1004: "Manage Account Attributes",
        1005: "Use Purchase Order",
        1006: "View Purchase Order Transaction History",
        1007: "View Purchase Order Credit Limit",
        1008: "Place Orders",
        1009: "Initiate Returns",
        1010: "View Lists of Child Accounts",
        1011: "View Quotes of Child Accounts",
        1012: "View Orders of Child Accounts",
        1013: "View Returns of Child Accounts",
        1014: "User Has Full Access to Their Account"
    },
    USER_BEHAVIORS_BY_NAME: {
        "Manage_Account_Information": 1000,
        "Manage_Users": 1001,
        "Manage_Contacts": 1002,
        "Manage_Saved_Payments": 1003,
        "Manage_Account_Attributes": 1004,
        "Use_Purchase_Order": 1005,
        "View_Purchase_Order_Transaction_History": 1006,
        "View_Purchase_Order_Credit_Limit": 1007,
        "Place_Orders": 1008,
        "Initiate_Returns": 1009,
        "View_Lists_Of_Child_Accounts": 1010,
        "View_Quotes_Of_Child_Accounts": 1011,
        "View_Orders_Of_Child_Accounts": 1012,
        "View_Returns_Of_Child_Accounts": 1013,
        "User_Has_Full_Access_To_Their_Account": 1014
    },
    behaviors: this.USER_BEHAVIORS_BY_NAME,
    getBehaviorByName: function (behaviorId) {
        var behavior = null;
        var parsedID = parseInt(behaviorId, 10);
        if (!behaviorId) {
            throw new TypeError('Behavior Name Required');
        }

        if (!behavior) {
            var behaviorName = toTitleCase(behaviorId);
            behaviorName = behaviorId.repalce(" ", "_");

            behavior = this.USER_BEHAVIORS_BY_NAME[behaviorName];
        }

        return behavior;
    },
    getBehaviorById: function (behaviorId) {
        var behavior = null;
        var parsedID = parseInt(behaviorId, 10);
        if (!behaviorId) {
            throw new TypeError('Behavior Id or Name Required');
        }

        if (typeof behaviorId === 'int') {
            behavior = this.USER_BEHAVIORS_BY_ID[behaviorId];
        }

        if (!behavior && parsedID !== "NAN") {
            behavior = this.USER_BEHAVIORS_BY_ID[parsedID];
        }

        return behavior;
    }
}

module.exports = behaviors;