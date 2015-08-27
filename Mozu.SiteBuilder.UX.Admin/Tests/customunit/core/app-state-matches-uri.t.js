// Function.prototype.bind = Function.prototype.bind || function (scope) {
//     var self = this;
//     return function () {
//         return self.apply(scope, arguments);
//     }
// };

StartTest(function (test) {
    test.ok(Taco, "Taco is ready");
    test.setOnlyMocks();
    var getCurrentStateAbsoluteUri = function () {
        var uri = Taco.adminAppPath + Taco.core.StateManager.getCurrentState().uri;
        return uri.replace("/?", "?");
    };

    test.diag("getCurrentState().uri: " + getCurrentStateAbsoluteUri());
    test.diag("window.location.href: "+ window.location.href);
    test.ok(getCurrentStateAbsoluteUri() === window.location.href, "On load: currentState's URI matches URI of browser window");

    Taco.core.StateManager.attemptNavigate('products'); // *** "products" is arbitrary

    test.diag("getCurrentState().uri: " + getCurrentStateAbsoluteUri());
    test.diag("window.location.href: "+ window.location.href);
    test.ok(getCurrentStateAbsoluteUri() === window.location.href, "After redirect: currentState's URI matches URI of browser window");
});