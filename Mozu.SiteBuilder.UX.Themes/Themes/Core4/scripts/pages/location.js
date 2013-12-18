require(["modules/jquery-mozu", "hyprlive", "modules/backbone-mozu"],
    function($, Hypr, Backbone) {

        var data = {
            "startIndex": 0,
            "pageSize": 100,
            "pageCount": 1,
            "totalCount": 2,
            "items": [{
                "code": "1002",
                "locationTypes": [{
                    "code": "newStore",
                    "name": "Scotts Store"
                }],
                "name": "Scotts Store",
                "description": "12323",
                "address": {
                    "address1": "1308 HORSEBACK HOLWw",
                    "address2": "",
                    "address3": "",
                    "address4": "",
                    "cityOrTown": "AUSTIN",
                    "stateOrProvince": "TX",
                    "countryCode": "US"
                },
                "geo": {
                    "lat": 0,
                    "lng": 0
                },
                "phone": "",
                "fax": "",
                "supportsInventory": true,
                "fulfillmentTypes": [{
                    "code": "SP",
                    "name": "In Store Pickup"
                }],
                "regularHours": {
                    "sunday": {
                        "label": "10:00-10:00"
                    },
                    "monday": {
                        "label": "09:00-11:00"
                    },
                    "tuesday": {
                        "label": "09:00-11:00"
                    },
                    "wednesday": {
                        "label": "09:00-11:00"
                    },
                    "thursday": {
                        "label": "09:00-11:00"
                    },
                    "friday": {
                        "label": "09:00-11:00"
                    },
                    "saturday": {
                        "label": "08:00-11:00"
                    }
                },
                "shippingOriginContact": {
                    "firstName": "asdf",
                    "middleNameOrInitial": "asdf",
                    "lastNameOrSurname": "asdf",
                    "companyOrOrganization": "Volusion",
                    "phoneNumber": "1231231233"
                },
                "note": "",
                "tags": []
            }, {
                "code": "homebase",
                "locationTypes": [{
                    "code": "newStore",
                    "name": "Scotts Store"
                }],
                "name": "My Location",
                "description": "where my stuff iss",
                "address": {
                    "address1": "1 W 72nd St",
                    "address2": "",
                    "cityOrTown": "New York",
                    "stateOrProvince": "NY",
                    "postalOrZipCode": "10023",
                    "countryCode": "US"
                },
                "geo": {
                    "lat": 40.78,
                    "lng": -73.98
                },
                "phone": "",
                "fax": "",
                "supportsInventory": true,
                "fulfillmentTypes": [{
                    "code": "DS",
                    "name": "Direct Ship"
                }, {
                    "code": "SP",
                    "name": "In Store Pickup"
                }],
                "regularHours": {
                    "sunday": {
                        "label": ""
                    },
                    "monday": {
                        "label": ""
                    },
                    "tuesday": {
                        "label": ""
                    },
                    "wednesday": {
                        "label": ""
                    },
                    "thursday": {
                        "label": ""
                    },
                    "friday": {
                        "label": ""
                    },
                    "saturday": {
                        "label": ""
                    }
                },
                "shippingOriginContact": {
                    "firstName": "asdf",
                    "middleNameOrInitial": "asdfa",
                    "lastNameOrSurname": "zsdfasdf",
                    "companyOrOrganization": "A Compnay",
                    "phoneNumber": "8008008000"
                },
                "note": "",
                "tags": []
            }]
        };

        var LocationView = Backbone.MozuView.extend({
            templateName: 'modules/location'
        });

        var view = new LocationView({
            model: new Backbone.Model(data),
            el: $('.mz-loc .mz-loc-table')
        });

        view.render();
    }
);