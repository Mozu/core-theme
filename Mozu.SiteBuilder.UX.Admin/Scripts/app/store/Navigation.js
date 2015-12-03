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

    filterNavLinksByPage: function(navPg) {
        this.filter({
            filterFn: function(item){
                return item.get('navPage') === navPg;
            }
        })
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
                'icon': 'nav-catalog',
                'behaviorIds': [4],
                'items': [{
                    'id': 'products',
                    'navPage': 'home',
                    'label': 'Products',
                    'address': 'products',
                    'behaviorIds': [4]
                }, {
                    'id': 'categories',
                    'navPage': 'home',
                    'label': 'Categories',
                    'address': 'categories',
                    'behaviorIds': [16]
                }, {
                    'id': 'inventory',
                    'label': 'Product Inventory',
                    'address': 'inventory',
                    'behaviorIds': [4]
                }
                ]
            },
            {
                'id': 'marketing',
                'navPage': 'home',
                'label': 'Marketing',
                'icon': 'nav-marketing',
                'behaviorIds': [24],
                'items': [
                    {
                        'id': 'discounts',
                        'navPage': 'home',
                        'behaviorIds': [24],
                        'label': 'Discounts',
                        'address': 'discounts'
                    }, {
                        'id': 'couponset',
                        'navPage': 'home',
                        'behaviorIds': [24],
                        'label': 'Coupon Sets',
                        'address': 'CouponSets'
                    }, {
                        'id': 'productRanking',
                        'navPage': 'home',
                        'behaviorIds': [16],
                        'label': 'Product Ranking',
                        'address': 'ProductRankings'
                    }
                ]
            },
            {
                'id': 'content',
                'navPage': 'home',
                'label': 'Content',
                'icon': 'nav-sites',
                'showBreadCrumbs': true,
                'items': [
                    {
                        'id': 'webedit',
                        'navPage': 'home',
                        'label': 'Site Editor',
                        'address': 'website'
                    }, {
                        'id': 'themes',
                        'navPage': 'home',
                        'label': 'Themes',
                        'address': 'themes'
                    },
                    {
                        'id': 'redirects',
                        'navPage': 'home',
                        'label': 'Redirects',
                        'address': 'redirects'
                    }, {
                        'id': 'fileManager',
                        'navPage': 'home',
                        'label': 'Files',
                        'address': 'fileManager'
                    }
                    //todo: include with content? greg_murray on 12/1/2015
                    //,{
                    //    'id': 'entities',
                    //    'label': 'Content/Entity',
                    //    'address': 'entities',
                    //    'visible': !!(Taco.tenantSettings && Taco.tenantSettings.entityManagerVisible)
                    //}
                ]
            },
            {
                'id': 'publishing',
                'navPage': 'home',
                'label': 'Publishing ',
                'icon': 'nav-publishing',
                'behaviorIds': [8],
                'items': [
                    {
                        'id': 'drafts',
                        'navPage': 'home',
                        'label': 'Drafts',
                        'address': 'publishing/drafts'
                    },
                    {
                        'id': 'publishSets',
                        'navPage': 'home',
                        'label': 'Publish Sets',
                        'address': 'publishing/publishsets'
                    }
                ]
            },
            {
                'id': 'order',
                'navPage': 'home',
                'label': 'Fulfillment',
                'icon': 'nav-orders',
                'behaviorIds': [73],
                'items': [
                    {
                        'id': 'orders',
                        'navPage': 'home',
                        'label': 'Orders',
                        'address': 'orders',
                        'behaviorIds': [73]
                    }, {
                        'id': 'locations',
                        'navPage': 'home',
                        'label': 'Locations',
                        'address': 'locations',
                        'behaviorIds': [186]
                    }, {
                        'id': 'locations-inventory',
                        'navPage': 'home',
                        'label': 'Inventory',
                        'address': 'locationInventory'
                    }
                ]
            },
            {
                'id': 'customer',
                'navPage': 'home',
                'label': 'Customers',
                'icon': 'nav-customers',
                'items': [{
                    'id': 'customers',
                    'navPage': 'home',
                    'label': 'Customers',
                    'address': 'customers',
                    'behaviorIds': [41]
                }, {
                    'id': 'customerSegments',
                    'navPage': 'home',
                    'label': 'Segments',
                    'address': 'customer/segments'
                }, {
                    'id': 'storecredit',
                    'navPage': 'home',
                    'label': 'Store Credit',
                    'address': 'StoreCredits'
                }
                ]
            },
            {
                'id': 'report',
                'label': 'Reporting',
                'navPage': 'home',
                'behaviorIds': [188],
                'items': [{
                    'id': 'report-sales',
                    'navPage': 'home',
                    'label': 'Sales',
                    'address': 'reports'
                }]
            },
            {
                'id': 'settings',
                'navPage': 'sysAdm',
                'label': 'Site Configuration',
                'icon': 'nav-settings',
                'visible': false,
                'items': [
                    {
                        'id': 'generalsettings',
                        'navPage': 'sysAdm',
                        'label': 'General',
                        'address': 'generalsettings'
                    },
                    {
                        'id': 'paymentcheckout',
                        'navPage': 'sysAdm',
                        'label': 'Payments',
                        'address': 'settings/paymentAndCheckout'
                    }, {
                        'id': 'tax',
                        'navPage': 'sysAdm',
                        'label': 'Tax',
                        'address': 'settings/tax'
                    }, {
                        'id': 'shipping4',
                        'navPage': 'sysAdm',
                        'label': 'Methods and Fees',
                        'address': 'shipping'
                    }, {
                        'id': 'tax',
                        'navPage': 'sysAdm',
                        'label': 'Tax',
                        'address': 'settings/tax'
                    }, {
                        'id': 'customroutes',
                        'navPage': 'sysAdm',
                        'label': 'Custom Routes',
                        'address': 'customroutes'
                    }]
            },
            {
                'id': 'typesAndAttributes',
                'navPage': 'sysAdm',
                'label': 'Types & Attributes',
                'behaviorIds': [4],
                'items': [{
                    'id': 'productTypes',
                    'navPage': 'sysAdm',
                    'label': 'Product Types',
                    'address': 'producttypes'
                }, {
                    'id': 'productAttributes',
                    'label': 'Product Attributes',
                    'address': 'attributes'
                }, {
                    'id': 'orderAttributes',
                    'label': 'Order Attributes',
                    'address': 'orderattributes'
                }, {
                    'id': 'customerAttributes',
                    'label': 'Customer Attributes',
                    'address': 'CustomerAttributes'
                }, {
                    'id': 'locationTypes',
                    'label': 'Location Types',
                    'address': 'locationTypes'
                }
                ]
            },
            {
                'id': 'settingsEnvironment',
                'label': 'Environment',
                'navPage': 'sysAdm',
                'behaviorIds': [4],
                'items': [{
                    'id': 'catalogprovisioning',
                    'label': 'Catalogs',
                    'address': 'provisioning/catalogs'
                },{
                    'id': 'siteprovisioning',
                    'label': 'Sites',
                    'address': 'provisioning/sites'
                }, {
                    'id': 'channels',
                    'label': 'Channels',
                    'address': 'channels'
                }, {
                    'id': 'applications-manage',
                    'label': 'Applications',
                    'address': 'capability'
                }, {
                    'id': 'actionmanagement',
                    'label': 'Actions',
                    'address': 'actionmanagement'
                }, {
                    'id': 'publishing',
                    'label': 'Settings',
                    'address': 'settings/publishing'
                }, {
                    'id': 'ipblocking',
                    'label': 'IP Blocking',
                    'address': 'ipblocking'
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
            },
            {
                'id': 'sysAdminLink',
                'label': 'System Administration',
                'navPage': 'home',
                'navTarget': 'sysAdm',
                'items': []
            }


            //todo: include? greg_murray on 12/1/2015
            //{
            //    'id': 'localization',
            //    'navPage': 'sysAdm',
            //    'locAtts': ['multiLang', 'multCurrency'],
            //    'label': 'Localization',
            //    'items': [
            //        {
            //            'id': 'localizationAttr',
            //            'label': 'Attributes',
            //            'address': 'Localization',
            //            'locAtts': ['multiLang']
            //        },
            //        {
            //            'id': 'localizationAttrVal',
            //            'label': 'Attribute Values',
            //            'address': 'Localization/attributeValues',
            //            'locAtts': ['multiLang']
            //        },
            //        {
            //            'id': 'localizationProp',
            //            'label': 'Product Properties',
            //            'address': 'Localization/productProperties',
            //            'locAtts': ['multiLang']
            //        },
            //        {
            //            'id': 'localizationExtra',
            //            'label': 'Product Extras',
            //            'address': 'Localization/productExtras',
            //            'locAtts': ['multCurrency']
            //        },
            //        {
            //            'id': 'localizationVar',
            //            'label': 'Product Variants',
            //            'address': 'Localization/productVariants',
            //            'locAtts': ['multCurrency']
            //        }
            //    ]
            //},
            //todo: include shipping sublinks? greg_murray on 12/1/2015
            //{
            //    'id': 'shipping',
            //    'label': 'Shipping',
            //    'address': 'shipping',
            //    'items': [
            //        {
            //            'id': 'shipping1',
            //            'label': 'Carriers and Settings',
            //            'address': 'shipping/carriers'
            //        },
            //        {
            //            'id': 'shipping2',
            //            'label': 'Zones',
            //            'address': 'shipping/zones'
            //        },
            //        {
            //            'id': 'shipping3',
            //            'label': 'Product Rules',
            //            'address': 'shipping/productRules'
            //        }
            //    ]
            //}
        ],
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        }
    }
});