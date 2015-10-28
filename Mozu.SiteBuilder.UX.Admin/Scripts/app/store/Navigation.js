/**
 * @class Taco.store.Navigation
 */
Ext.define('Taco.store.Navigation', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.NavigationItem',
    autoLoad: true,
    statics: {
        subNavLinksLoaded: false,
        getSubNavLinksLoaded: function () { return this.subNavLinksLoaded; },
        setSubNavLinksLoaded: function (val) { this.subNavLinksLoaded = val; }
    },
    listeners: {
        beforeload: function (store) {
            if (!Taco.app || !Taco.app.context) {
                return;
            }
            var data = store.getProxy().data,
                seed = 0,
                recursiveFind = function (key, val, items) {
                    var res;
                    Ext.Array.each(items, function (item) {
                        if (Ext.isFunction(key)) {
                            if (key(item)) {
                                res = item;
                                return;
                            }
                        } else if (item[key] === val) {
                            res = item;
                            return;
                        }
                        if (!res && item.items) {
                            res = recursiveFind(key, val, item.items);
                        }
                    });

                    return res;
                },
                pruneInvalidLocLinks = function (item) {
                    if (item.items) {
                        item.items = Ext.Array.filter(item.items, pruneInvalidLocLinks, this);
                    }

                    if (item.locAtts) {
                        if (item.locAtts.length === 2 && !(isMultiLang || isMultiCurrency)) {
                            return false;
                        } else if (  Ext.Array.indexOf( item.locAtts,'multiLang') > -1 && !isMultiLang) {
                            return false;
                        } else if (Ext.Array.indexOf( item.locAtts,'multCurrency') > -1 && !isMultiCurrency) {
                            return false;
                        }
                    }
                    return true;
                },
                isMultiCurrency,
                isMultiLang;
            
            Ext.Array.each(Taco.app.context.masterCatalogs, function (mc) {
                if (mc.getSupportedCurrencies().length > 1) {
                    isMultiCurrency = true;
                }
                if (mc.getSupportedLocales().length > 1) {
                    isMultiLang = true;
                }
            });


            data = Ext.Array.filter(data, pruneInvalidLocLinks, this);




            if (Taco.store.Navigation.getSubNavLinksLoaded() || !Taco.extensiblity || !Taco.extensiblity.subNavLinks) {
                return;
            }


            Ext.Array.each(Taco.extensiblity.subNavLinks, function (link) {
                //todo check security.
                //todo handle escaping of delimiter
                var parts = ['Extensions'].concat(link.path),
                    parentNode = recursiveFind('id', link.parentId, data);

                if (!parentNode) {
                    return;
                }

                Ext.Array.each(parts, function (nodePart, nodeIndex) {
                    var node = recursiveFind('label', nodePart, parentNode.items),
                        isLeaf = nodeIndex === parts.length - 1;
                    parentNode.items = parentNode.items || [];


                    if (!node || isLeaf || node.address) {

                        node = {
                            id: 'ext_sub_link_' + seed++,
                            label: nodePart,
                            address: isLeaf ? link.href : null,
                            metaData: link,
                            breadCrumbOnly: true
                        };
                        parentNode.items.push(node);
                        parentNode = node;
                        return;
                    }

                    parentNode = node;
                    return;


                });

            });
            Taco.store.Navigation.setSubNavLinksLoaded(true);
        }
    },

    filters: [
        {
            filterFn: function (record) {
                var ret = true;

                if (record.raw.behaviorIds && record.raw.behaviorIds.length) {
                    Ext.each(record.raw.behaviorIds, function (behaviorId) {
                        if (Taco.user.behaviors && Ext.Array.indexOf(Taco.user.behaviors, behaviorId) === -1) {
                            ret = false;
                            return ret;
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
            'id': 'dashboard',
            'label': 'Dashboard',
            'address': 'dashboard',
            'icon': 'nav-dashboard',
            'items': [
                {
                    'id': 'channels',
                    'label': 'Channels',
                    'address': 'channels'
                }, {
                    'id': 'reports',
                    'label': 'Reports',
                    'address': 'reports'
                }
            ]
        },*/ {
                'id': 'customers',
                'label': 'Customers',
                'address': 'customers',
                'icon': 'nav-customers',
                'behaviorIds': [41],
                'items': [
/*{
                'id': 'accounts',
                'label': 'Accounts',
                'address': 'customers'
            }, */{
                        'id': 'customerAttributes',
                        'label': 'Attributes',
                        'address': 'CustomerAttributes'
                    }, {
                        'id': 'customerSegments',
                        'label': 'Segments',
                        'address': 'customer/segments'
                    } /*, {
                'id': 'contacts',
                'label': 'Contacts',
                'address': 'tbd/contacts'
            }*/
                ]
            }, {
                'id': 'catalog',
                'label': 'Catalog',
                'address': 'products',
                'behaviorIds': [4],
                'icon': 'nav-catalog',
                'items': [
/*{
                'id': 'products',
                'label': 'Products',
                'address': 'products',
                'behaviorIds': [4]
            }, */{
                        'id': 'inventory',
                        'label': 'Inventory',
                        'address': 'inventory',
                        'behaviorIds': [4]
                    }, {
                        'id': 'categories',
                        'label': 'Categories',
                        'address': 'categories',
                        'behaviorIds': [16]
                    }, {
                        'id': 'productTypes',
                        'label': 'Product Types',
                        'address': 'producttypes'
                    }, {
                        'id': 'attributes',
                        'label': 'Attributes',
                        'address': 'attributes'
                    }
                ]
            }, {
                'id': 'orders',
                'label': 'Orders',
                'address': 'orders',
                'behaviorIds': [73],
                'icon': 'nav-orders',
                'items': [
/*{
                'id': 'orders',
                'behaviorIds': [16],
                'label': 'Orders',
                'address': 'orders'
            }, */{
                        'id': 'orderAttributes',
                        'label': 'Attributes',
                        'address': 'orderattributes'
                    }, {
                        'id': 'storecredit',
                        'label': 'Store Credit',
                        'address': 'StoreCredits'
                    }
                ]
            }, {
                'id': 'marketing',
                'label': 'Marketing',
                'address': 'discounts',
                'behaviorIds': [24],
                'icon': 'nav-marketing',
                'items': [
                    {
                        'id': 'discounts',
                        'behaviorIds': [24],

                        'label': 'Discounts',
                        'address': 'discounts'
                    }, {
                        'id': 'couponset',
                        'behaviorIds': [24],

                        'label': 'Coupon Sets',
                        'address': 'CouponSets'
                    }, {
                        'id': 'searchtuningrule',
                        'behaviorIds': [16],

                        'label': 'Search Results Tuning',
                        'address': 'SearchTuningRules'
                    } /*, {
                'id': 'promotions',
                'label': 'Promotions',
                'address': 'tbd/promotions'
            }, {
                'id': 'targeting',
                'label': 'Targeting',
                'address': 'tbd/targeting'
            }*/
                ]
            }, {
                'id': 'sitebuilder',
                'label': 'Site Builder',
                'address': 'website',
                'showBreadCrumbs': true,
                'icon': 'nav-sites',
                'items': [
                    {
                        'id': 'webedit',
                        'label': 'Editor',
                        'address': 'website'
                    }, {
                        'id': 'themes',
                        'label': 'Themes',
                        'address': 'themes'
                    },
                    {
                        'id': 'redirects',
                        'label': 'Redirects',
                        'address': 'redirects'
                    },
                    {
                        'id': 'viewLive',
                        'label': 'View Live',
                        'address': ''
                    },
                    {
                        'id': 'viewStaged',
                        'label': 'View Staged',
                        'address': ''
                    }
                    /*, {
                'id': 'fileManager',
                'label': 'File Manager',
                'address': 'fileManager'
            }*/
                ]
            }, {
                'id': 'settings',
                'label': 'Settings',
                'icon': 'nav-settings',
                'visible': false,
                'items': [
                    {
                        'id': 'generalsettings',
                        'label': 'General Settings',
                        'address': 'generalsettings'

                    },
                    {
                        'id': 'paymentcheckout',
                        'label': 'Payment & Checkout',
                        'address': 'settings/paymentAndCheckout'
                    }, {
                        'id': 'tax',
                        'label': 'Tax',
                        'address': 'settings/tax'
                    },
                    {
                        'id': 'shipping',
                        'label': 'Shipping',
                        'address': 'shipping',
                        'items': [
                            {
                                'id': 'shipping4',
                                'label': 'Methods and Fees',
                                'address': 'shipping'
                            },
                            {
                                'id': 'shipping1',
                                'label': 'Carriers and Settings',
                                'address': 'shipping/carriers'
                            },
                            {
                                'id': 'shipping2',
                                'label': 'Zones',
                                'address': 'shipping/zones'
                            },
                            {
                                'id': 'shipping3',
                                'label': 'Product Rules',
                                'address': 'shipping/productRules'
                            }
                        ]

                    }, {
                        'id': 'localization',
                        'locAtts': ['multiLang', 'multCurrency'],
                        'label': 'Localization',
                        'address': 'Localization',
                        'items': [
                            {
                                'id': 'localizationAttr',
                                'label': 'Attributes',
                                'address': 'Localization',
                                'locAtts': ['multiLang']
                            },
                            {
                                'id': 'localizationAttrVal',
                                'label': 'Attribute Values',
                                'address': 'Localization/attributeValues',
                                'locAtts': ['multiLang']
                            },
                            {
                                'id': 'localizationProp',
                                'label': 'Product Properties',
                                'address': 'Localization/productProperties',
                                'locAtts': ['multiLang']
                            },
                            {
                                'id': 'localizationExtra',
                                'label': 'Product Extras',
                                'address': 'Localization/productExtras',
                                'locAtts': ['multCurrency']
                            },
                            {
                                'id': 'localizationVar',
                                'label': 'Product Variants',
                                'address': 'Localization/productVariants',
                                'locAtts': ['multCurrency']
                            }
                        ]
                    },
                    {
                        'id': 'usersRoles',
                        'label': 'Users &amp; Roles',
                        'items': [
                            {
                                'id': 'users',
                                'label': 'Users',
                                'address': 'account/users'
                            }, {
                                'id': 'roles',
                                'label': 'Roles',
                                'address': 'roles'
                            }
                        ]

                    }, {
                        'id': 'publishing',
                        'label': 'Publishing',
                        'address': 'settings/publishing'
                    }, {
                        'id': 'applications-manage',
                        'label': 'Applications',
                        'address': 'capability'
                    }, {
                        'id': 'channels',
                        'label': 'Channels',
                        'address': 'channels'
                    }, {
                        'id': 'fileManager',
                        'label': 'File Manager',
                        'address': 'fileManager'
                    }, {
                        'id': 'entities',
                        'label': 'Content/Entity',
                        'address': 'entities',
                        'visible': !!(Taco.tenantSettings && Taco.tenantSettings.entityManagerVisible)
                    }, {
                        'id': 'sysAdmin',
                        'label': 'System Administration',
                        'items': [
                            {
                                'id': 'provisioning',
                                'label': 'Catalog And Site Structure',
                                'address': 'provisioning'
                            }, 
                            {
                                'id': 'actionmanagement',
                                'label': 'Action Management',
                                'address': 'actionmanagement'
                            },
                            {
                                'id': 'customroutes',
                                'label': 'Custom Routes',
                                'address': 'customroutes'
                            },
                            {
                                 'id': 'ipblocking',
                                 'label': 'IP Blocking',
                                 'address': 'ipblocking'
                            }
                        ]
                    }
                ]
            }, {
                'id': 'publishing',
                'label': 'Publishing ',
                'address': 'publishing/drafts',
                'icon': 'nav-publishing',
                'behaviorIds': [8],
                'items': [
                    {
                        'id': 'drafts',
                        'label': 'Drafts',
                        'address': 'publishing/drafts'
                    },
                    {
                        'id': 'publishSets',
                        'label': 'Publish Sets',
                        'address': 'publishing/publishsets'
                    },
                    {
                        'id': 'publishing',
                        'label': 'Settings',
                        'address': 'settings/publishing'
                    }
                ]
            }, {
                'id': 'locations',
                'label': 'Locations',
                'address': 'locations',
                'icon': 'nav-locations',
                'behaviorIds': [186],
                'items': [
/*{
                'id': 'locations-manage',
                'label': 'Locations',
                'address': 'locations'
            },*/ {
                        'id': 'locationTypes',
                        'label': 'Location Types',
                        'address': 'locationTypes'
                    }, /* {
                'id': 'locations-orders',
                'label': 'Orders',
                'address': 'tbd/orders'
            },*/ {
                        'id': 'locations-inventory',
                        'label': 'Inventory',
                        'address': 'locationInventory'
                    }
                ]
            }, {
                'id': 'reports',
                'label': 'Reporting',
                'address': 'reports',
                'icon': 'nav-dashboard',
                'behaviorIds': [188],
                'items': [{
                    'id': 'report-sales',
                    'label': 'Sales',
                    'address': '/reports/index'
                }]
                //    {
                //        'id': 'reports',
                //        'label': 'Reports',
                //        'address': 'reports'
                //    }
                //,
                //{
                //    'id': 'bizIntel',
                //    'label': 'Dashboard',
                //    'address': 'businessIntelligence'
                //}
                //]

            }
        ],
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        }
    }
});