/**
 * @class Taco.store.Navigation
 */
Ext.define('Taco.store.Navigation', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.NavigationItem',
    autoLoad: true,
    filters: [
        {
            filterFn: function (record) {
                var ret = true;
                if (record.raw.behaviorIds && record.raw.behaviorIds.length) {
                    Ext.each(record.raw.behaviorIds, function (behaviorId) {
                        if (Taco.user.behaviors && Ext.Array.indexOf(Taco.user.behaviors, behaviorId) === -1) {
                            return ret = false;
                        }
                        return true;
                    });
                }
                return ret;
            }
        }
    ],
    proxy: {
        type: 'memory',
        data: [
/*{
            "id": "dashboard",
            "label": "Dashboard",
            "address": "dashboard",
            "icon": "nav-dashboard",
            "items": [
                {
                    "id": "channels",
                    "label": "Channels",
                    "address": "channels"
                }, {
                    "id": "reports",
                    "label": "Reports",
                    "address": "reports"
                }
            ]
        },*/ {
                "id": "customers",
                "label": "Customers",
                "address": "customers",
                "icon": "nav-customers",
                "behaviorIds": [41],
                "items": [
/*{
                "id": "accounts",
                "label": "Accounts",
                "address": "customers"
            }, */{
                        "id": "customerAttributes",
                        "label": "Attributes",
                        "address": "CustomerAttributes"
                    }, {
                        "id": "customerSegments",
                        "label": "Segments",
                        "address": "customer/segments"
                    } /*, {
                "id": "contacts",
                "label": "Contacts",
                "address": "tbd/contacts"
            }*/
                ]
            }, {
                "id": "catalog",
                "label": "Catalog",
                "address": "products",
                "behaviorIds": [4],
                "icon": "nav-catalog",
                "items": [
/*{
                "id": "products",
                "label": "Products",
                "address": "products",
                "behaviorIds": [4]
            }, */{
                        "id": "inventory",
                        "label": "Inventory",
                        "address": "inventory",
                        "behaviorIds": [4]
                    }, {
                        "id": "categories",
                        "label": "Categories",
                        "address": "categories",
                        "behaviorIds": [16]
                    }, {
                        "id": "productTypes",
                        "label": "Product Types",
                        "address": "producttypes"
                    }, {
                        "id": "attributes",
                        "label": "Attributes",
                        "address": "attributes"
                    }
                ]
            }, {
                "id": "store",
                "label": "Orders",
                "address": "orders",
                "behaviorIds": [73],
                "icon": "nav-orders",
                "items": [
/*{
                "id": "orders",
                "behaviorIds": [16],
                "label": "Orders",
                "address": "orders"
            }, */{
                        "id": "orderAttributes",
                        "label": "Attributes",
                        "address": "orderattributes"
                    }, {
                        "id": "storecredit",
                        "label": "Store Credit",
                        "address": "StoreCredits"
                    }
                ]
            }, {
                "id": "marketing",
                "label": "Marketing",
                "address": "discounts",
                "behaviorIds": [24],
                "icon": "nav-marketing",
                "items": [
                    {
                        "id": "discounts",
                        "behaviorIds": [24],

                        "label": "Discounts",
                        "address": "discounts"
                    } /*, {
                "id": "promotions",
                "label": "Promotions",
                "address": "tbd/promotions"
            }, {
                "id": "targeting",
                "label": "Targeting",
                "address": "tbd/targeting"
            }*/
                ]
            }, {
                "id": "sitebuilder",
                "label": "Site Builder",
                "address": "siteSelection",
                "showBreadCrumbs": false,
                //"address": "sites/pages",
                "icon": "nav-sites",
                "items": [
                    {
                        "id": "webedit",
                        "visible": false,
                        "label": "Edit",
                        "address": "website"
                    }, {
                        "id": "themes",
                        "label": "Themes",
                        "visible": false,
                        "address": "themes"
                    },
                    {
                        "id": "redirects",
                        "label": "Redirects",
                        "visible": false,
                        "address": "redirects"
                    },
                    {
                        "id": "generalsettings",
                        "label": "Site Settings",
                        "visible": false,
                        "address": "generalsettings"
                    }
                    /*, {
                "id": "fileManager",
                "label": "File Manager",
                "address": "fileManager"
            }*/
                ]
            }, {
                "id": "settings",
                "label": "Settings",
                "icon": "nav-settings",
                "visible": false,
                "items": [
                    {
                        "id": "generalsettings",
                        "label": "General Settings",
                        "items": [
                            {
                                "id": "generalsettingsgeneral",
                                "label": "General",
                                "address": "generalsettings"
                            }
                        ]
                    },
                    {
                        "id": "paymentcheckout",
                        "label": "Payment & Checkout",
                        "address": "settings/paymentAndCheckout"
                    }, {
                        "id": "tax",
                        "label": "Tax",
                        "address": "settings/tax"
                    },
                    {
                        "id": "shipping",
                        "label": "Shipping",
                    
                        "items": [
                                 {
                                     "id": "shipping4",
                                     "label": "Rates and Fees",
                                     "address": "shipping"
                                 },
                            {
                                "id": "shipping1",
                                "label": "Carriers",
                                "address": "shipping/carriers"
                            },
                             {
                                 "id": "shipping2",
                                 "label": "Zones",
                                 "address": "shipping/zones"
                             },
                             {
                                 "id": "shipping3",
                                 "label": "Product Rules",
                                 "address": "shipping/productRules"
                             }
                   
                        ]

                    },
                    {
                        "id": "usersRoles",
                        "label": "Users and Roles",
                        "items": [
                            {
                                "id": "users",
                                "label": "Users",
                                "address": "account/users"
                            }, {
                                "id": "roles",
                                "label": "Roles",
                                "address": "roles"
                            }
                        ]

                    }, {
                        "id": "publishing",
                        "label": "Publishing",
                        "address": "settings/publishing"
                    }, {
                        "id": "applications-manage",
                        "label": "Applications",
                        "address": "capability"
                    }, {
                        "id": "channels",
                        "label": "Channels",
                        "address": "channel"
                    }, {
                        "id": "fileManager",
                        "label": "File Manager",
                        "address": "fileManager"
                    }, {
                        "id": "provisioning",
                        "label": "Structure",
                        "address": "provisioning"
                    }
                ]
            }, {
                "id": "publishing",
                "label": "Publish",
                "address": "pendingchanges",
                "icon": "nav-publishing",
                "behaviorIds": [8],
                "items": [
                    {
                        "id": "cmspublishing",
                        "label": "Content",
                        "address": "/pendingChanges/cms"
                    }, {
                        "id": "catlogpublishing",
                        "label": "Product",
                        "address": "/pendingChanges/product"
                    }
                ]
            }, {
                "id": "locations",
                "label": "Locations",
                "address": "locations",
                "icon": "nav-locations",
                "behaviorIds": [186],
                "items": [
/*{
                "id": "locations-manage",
                "label": "Locations",
                "address": "locations"
            },*/ {
                        "id": "locationTypes",
                        "label": "Location Types",
                        "address": "locationTypes"
                    }, /* {
                "id": "locations-orders",
                "label": "Orders",
                "address": "tbd/orders"
            },*/ {
                        "id": "locations-inventory",
                        "label": "Inventory",
                        "address": "locationInventory"
                    }
                ]
            } /*, {
            "id": "capability",
            "label": "Applications",
            "address": "capability",
            "icon": "nav-locations",
            "items": [{
                "id": "applications-manage",
                "label": "Applications",
                "address": "capability"
            }]
        }*/, {
                "id": "report",
                "label": "Reports",
                "address": "reports",
                "icon": "nav-dashboard",
                "behaviorIds": [188],
                "items": [
/*
                {
                    "id": "salesreport",
                    "label": "Sales",
                    "address": "tbd/sales"
                }, {
                    "id": "customerreport",
                    "label": "Customer",
                    "address": "tbd/customer"
                }, {
                    "id": "productsreport",
                    "label": "Products",
                    "address": "reptbd/product"
                }
            */
                ]
            }
        ],
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        }
    }
});