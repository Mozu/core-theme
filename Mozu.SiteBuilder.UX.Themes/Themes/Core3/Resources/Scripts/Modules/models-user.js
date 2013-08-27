define(
    ["modules/knockout-viewmodel"],
    function (ViewModelPrototype) {

        var User = ViewModelPrototype.extend({
            mozuType: 'user',
            hasMessages: true,
            observables: {
                "EmailAddress": {
                    required: {
                        pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i,
                    }
                },
                "LocaleCode": {},
                "FirstName": {},
                "LastName": {},
                "Password": {
                    required: true
                },
                "Id": {}
            }
        });

        return {
            User: User
        }
    }
);
