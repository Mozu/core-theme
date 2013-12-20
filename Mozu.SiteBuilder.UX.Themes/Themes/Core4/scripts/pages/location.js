require(['modules/jquery-mozu', 'hyprlive', 'modules/backbone-mozu', 'modules/models-location'],
    function($, Hypr, Backbone, LocationModels) {

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
        
        var locationsModel = new Backbone.Model(data);

        var LocationView = Backbone.MozuView.extend({
            templateName: 'modules/location/location',
            events: {
                'click a': 'onClickStoreInfo'
            },

            onClickStoreInfo: function(e) {
                var code = $(e.currentTarget).data('mz-loc-code'),
                    $container = $('<div>').appendTo('body'),
                    view,
                    loc;

                e.preventDefault();
                console.log('Store Details', e, locationsModel);

                loc = _.find(locationsModel.get('items'), function(item) {
                    return code.toString() === item.code.toString();
                });

                if (!loc) return;

                view = new StoreInfoView({
                    model: new Backbone.Model(loc),
                    el: $container
                })

                view.render();
            }
        });

        var StoreInfoView = Backbone.MozuView.extend({
            templateName: 'modules/location/store-info',
            events: {
                'click .mz-loc-dialog-cover': 'onClickCover'
            },

            onClickCover: function(e) {
                if (!$(e.target).is('.mz-loc-dialog-cover')) return;
                this.remove();
                this.render();
            }
        });

        $(document).ready(function() {
            

            var view = new LocationView({
                model: locationsModel,
                el: $('.mz-loc .mz-loc-table')
            });

            view.render();

            window.lm = LocationModels;
        })
    }
);