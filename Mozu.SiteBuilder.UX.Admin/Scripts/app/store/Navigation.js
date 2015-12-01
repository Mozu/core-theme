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
            {
                'id': 'catalog',
                'navPage': 'home',
                'label': 'Catalog',
                'behaviorIds': [4],
                'items': [{
                        'id': 'products',
                        'label': 'Products',
                        'address': 'products',
                        'behaviorIds': [4]
                    }, {
                        'id': 'categories',
                        'label': 'Categories',
                        'address': 'categories',
                        'behaviorIds': [16]
                    }
                ]
            }, {
                'id': 'marketing',
                'navPage': 'home',
                'label': 'Marketing',
                'behaviorIds': [24],
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
                        'id': 'productRanking',
                        'behaviorIds': [16],
                        'label': 'Product Ranking',
                        'address': 'ProductRankings'
                    }
                ]
            }, {
                'id': 'content',
                'navPage': 'home',
                'label': 'Content',
                'showBreadCrumbs': true,
                'items': [
                    {
                        'id': 'webedit',
                        'label': 'Site Editor',
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
                    }, {
                        'id': 'fileManager',
                        'label': 'Files',
                        'address': 'fileManager'
                    }
                ]
            }, {
                'id': 'publishing',
                'navPage': 'home',
                'label': 'Publishing ',
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
                    }
                ]
            }, {
                'id': 'order',
                'navPage': 'home',
                'label': 'Fulfillment',
                'behaviorIds': [73],
                'items': [
                    {
                        'id': 'orders',
                        'label': 'Orders',
                        'address': 'orders',
                        'behaviorIds': [73]
                    }, {
                        'id': 'inventory',
                        'label': 'Inventory',
                        'address': 'inventory',
                        'behaviorIds': [4]
                    }, {
                        'id': 'locations',
                        'label': 'Locations',
                        'address': 'locations',
                        'behaviorIds': [186]
                    }, {
                        'id': 'locations-inventory',
                        'label': 'Inventory',
                        'address': 'locationInventory'
                    }
                ]
            }, {
                'id': 'customer',
                'navPage': 'home',
                'label': 'Customers',
                'items': [{
                        'id': 'customers',
                        'label': 'Customers',
                        'address': 'customers',
                        'behaviorIds': [41]
                    }, {
                        'id': 'customerSegments',
                        'label': 'Segments',
                        'address': 'customer/segments'
                    }, {
                        'id': 'storecredit',
                        'label': 'Store Credit',
                        'address': 'StoreCredits'
                    }
                ]
            }, {
                'id': 'settings',
                'navPage': 'sysAdm',
                'label': 'Settings',
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
                        'navPage': 'sysAdm',
                        'locAtts': ['multiLang', 'multCurrency'],
                        'label': 'Localization',
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
                        'navPage': 'sysAdm',
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
                        'navPage': 'sysAdm',
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
                'id': 'report',
                'label': 'Reporting',
                'behaviorIds': [188],
                'items': [{
                    'id': 'report-sales',
                    'label': 'Sales',
                    'address': 'reports'
                }]
            }, {
                'id': 'typesAndAttributes',
                'label': 'Types & Attributes',
                'navPage': 'sysAdm',
                'behaviorIds': [4],
                'items': [{
                        'id': 'productTypes',
                        'label': 'Product Types',
                        'address': 'producttypes'
                    }, {
                        'id': 'productAttributes',
                        'label': 'Product Attributes',
                        'address': 'attributes'
                    }, {
                        'id': 'orderAttributes',
                        'label': 'Attributes',
                        'address': 'orderattributes'
                    }, {
                        'id': 'customerAttributes',
                        'label': 'Attributes',
                        'address': 'CustomerAttributes'
                    }, {
                        'id': 'locationTypes',
                        'label': 'Location Types',
                        'address': 'locationTypes'
                    }
                ]
            }, {
                'id': 'settingsEnvironment',
                'label': 'Environment',
                'navPage': 'sysAdm',
                'behaviorIds': [4],
                'items': [{
                        'id': 'publishing',
                        'label': 'Settings',
                        'address': 'settings/publishing'
                    }
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