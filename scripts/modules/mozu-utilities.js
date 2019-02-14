
define(['sdk'], function (Mozu) {
    var behaviorsUtil = Mozu.MozuUtilities.Behaviors;

    return {
        Behaviors: behaviorsUtil.USER_BEHAVIORS_BY_NAME,
        Utilities: Mozu.MozuUtilities
    };
});
