/**
 * @class Taco.store.Navigation
 */
Ext.define('Taco.store.Navigation', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.NavigationItem',
    autoLoad: true,
    requires: [
        'Taco.store.SubnavLinks'
    ],
    statics: {
        subNavLinksLoaded: false,
        getSubNavLinksLoaded: function () { return this.subNavLinksLoaded; },
        setSubNavLinksLoaded: function (val) { this.subNavLinksLoaded = val; },

        subNavLinksMerged: false,
        getSubNavLinksMerged: function () { return this.subNavLinksMerged; },
        setSubNavLinksMerged: function (val) { this.subNavLinksMerged = val; }
    },
    listeners: {
        beforeload: function (store) {
            if (!Taco.app || !Taco.app.context) {
                return;
            }
            var me = this,
                data = store.getProxy().data,
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
                mergeSubnavLinks = function(subNavStore) {
                    var navStore = this;
                    if (Taco.store.Navigation.getSubNavLinksMerged()) {
                        return;
                    }
                    subNavStore.each(function (item) {
                        var parent = navStore.getById(item.get('parentId'));
                        if (!parent) {
                            console.log('could not find parent ');
                            console.log(item);
                            return;
                        }

                        var subNavObject = Ext.apply({
                            id: 'subNav' + item.get('badgeInitials'),
                            label: item.get('modalWindowTitle'),
                            address: item.get('href'),
                            isSubNavLink: true
                        }, item.data);

                        parent.get('items').push(subNavObject);

                    });
                    Taco.store.Navigation.setSubNavLinksMerged();
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

            store.getProxy().data = Ext.Array.filter(data, pruneInvalidLocLinks, this);

            if (Taco.store.Navigation.getSubNavLinksLoaded() || !Taco.extensiblity || !Taco.extensiblity.subNavLinks) {
                return;
            }
            this.mon(Taco.app, 'subnavlinksloaded', mergeSubnavLinks, me);

            this.subNavLinksStore = Ext.create('Taco.store.SubnavLinks', {
                filterOnLoad: true,
                filters: [ 
                    function(item) {

                        if (!item.get('location')) {
                            return false;
                        }

                        else if (item.get('location').toLowerCase().indexOf('menu') !== -1) {
                            item.set('parentId', item.get('location').toLowerCase().replace('menu', ''));
                            return item;
                        }
                    }
                ],
                listeners: {
                    load: function() {
                        Taco.app.fireEvent('subnavlinksloaded', this);
                        Taco.store.Navigation.setSubNavLinksLoaded(true);
                    }
                }
            });


            // Ext.Array.each(Taco.extensiblity.subNavLinks, function (link) {
            //     //todo check security.
            //     //todo handle escaping of delimiter
            //     var parts = ['Extensions'].concat(link.path),
            //         parentNode = recursiveFind('id', link.parentId, data);

            //     if (!parentNode) {
            //         return;
            //     }

            //     Ext.Array.each(parts, function (nodePart, nodeIndex) {
            //         var node = recursiveFind('label', nodePart, parentNode.items),
            //             isLeaf = nodeIndex === parts.length - 1;
            //         parentNode.items = parentNode.items || [];


            //         if (!node || isLeaf || node.address) {

            //             node = {
            //                 id: 'ext_sub_link_' + seed++,
            //                 label: nodePart,
            //                 address: isLeaf ? link.href : null,
            //                 metaData: link,
            //                 breadCrumbOnly: true
            //             };
            //             parentNode.items.push(node);
            //             parentNode = node;
            //             return;
            //         }

            //         parentNode = node;
            //         return;


            //     });

            // });
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
                'id': 'products',
                'navParent': 'main',
                'label': 'Catalog',
                'icon': 'nav-catalog',
                'behaviorIds': [4],
                'items': [{
                    'id': 'catalogProducts',
                    'label': 'Products',
                    'address': 'products',
                    'behaviorIds': [4]
                }, {
                    'id': 'categories',
                    'label': 'Categories',
                    'address': 'categories',
                    'behaviorIds': [16]
                }, {
                    'id': 'inventory',
                    'label': 'Inventory',
                    'address': 'inventory',
                    'behaviorIds': [4]
                }
                ]
            },
            {
                'id': 'marketing',
                'navParent': 'main',
                'label': 'Marketing',
                'icon': 'nav-marketing',
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
            },
            {
                'id': 'content',
                'navParent': 'main',
                'label': 'Site Builder',
                'icon': 'nav-sites',
                'showBreadCrumbs': true,
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
                    }, {
                        'id': 'fileManager',
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
                'navParent': 'main',
                'label': 'Publishing ',
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
                    }
                ]
            },
            {
                'id': 'order',
                'navParent': 'main',
                'label': 'Fulfillment',
                'icon': 'nav-orders',
                'behaviorIds': [73],
                'items': [
                    {
                        'id': 'orders',
                        'label': 'Orders',
                        'address': 'orders',
                        'behaviorIds': [73]
                    }, {
                        'id': 'locations-inventory',
                        'label': 'Inventory',
                        'address': 'locationInventory'
                    }, {
                        'id': 'locations',
                        'label': 'Locations',
                        'address': 'locations',
                        'behaviorIds': [186]
                    }
                ]
            },
            {
                'id': 'customer',
                'navParent': 'main',
                'label': 'Customers',
                'icon': 'nav-customers',
                'items': [{
                    'id': 'customers',
                    'label': 'Customers',
                    'address': 'customers',
                    'behaviorIds': [41]
                }, {
                    'id': 'customerSegments',
                    'label': 'Customer Segments',
                    'address': 'customer/segments'
                }, {
                    'id': 'storecredit',
                    'label': 'Store Credit',
                    'address': 'StoreCredits'
                }
                ]
            },
            {
                'id': 'report',
                'navParent': 'main',
                'label': 'Reporting',
                'behaviorIds': [188],
                'items': [{
                    'id': 'report-sales',
                    'label': 'Reports',
                    'address': 'reports'
                }]
            },
            {
                'id': 'settings',
                'navParent': 'sys',
                'label': 'Settings',
                'icon': 'nav-settings',
                //'visible': false,
                'items': [
                    {
                        'id': 'generalsettings',
                        'label': 'General',
                        'address': 'generalsettings'
                    },
                    {
                        'id': 'paymentcheckout',
                        'label': 'Payments',
                        'address': 'settings/paymentAndCheckout'
                    }, {
                        'id': 'tax',
                        'label': 'Tax',
                        'address': 'settings/tax'
                    }, {
                        'id': 'shippingMain',
                        'label': 'Shipping',
                        'address': 'shipping'
                    }, {
                        'id': 'publishing',
                        'label': 'Publishing',
                        'address': 'settings/publishing'
                    }
                ]
            },
            {
                'id': 'schema',
                'navParent': 'sys',
                'label': 'Schema',
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
                }, {
                    'id': 'customSchema',
                    'label': 'Custom Schema',
                    'address': 'customSchema'
                }
                ]
            }, {
                'id': 'customization',
                'navParent': 'sys',
                'label': 'Customization',
                'behaviorIds': [4],
                'items': [{
                        'id': 'applications-manage',
                        'label': 'Applications',
                        'address': 'capability'
                    }, {
                        'id': 'actionmanagement',
                        'label': 'Arc.js',
                        'address': 'actionmanagement'
                    }, {
                        'id': 'customroutes',
                        'label': 'Custom Routes',
                        'address': 'customroutes'
                    }
                ]
            },
            {
                'id': 'structure',
                'navParent': 'sys',
                'label': 'Structure',
                'behaviorIds': [4],
                'items': [{
                    'id': 'siteprovisioning',
                    'label': 'Sites',
                    'address': 'provisioning/sites'
                }, {
                    'id': 'catalogprovisioning',
                    'label': 'Catalogs',
                    'address': 'provisioning/catalogs'
                }, {
                    'id': 'channels',
                    'label': 'Channels',
                    'address': 'channels'
                }
                ]
            },
            {
                'id': 'permissions',
                'navParent': 'sys',
                'label': 'Permissions',
                'items': [
                    {
                        'id': 'users',
                        'label': 'Users',
                        'address': 'account/users'
                    }, {
                        'id': 'roles',
                        'label': 'Roles',
                        'address': 'roles'
                    }, {
                        'id': 'ipblocking',
                        'label': 'IP Restrictions',
                        'address': 'ipblocking'
                    }
                ]
            },
            {
                'id': 'localization',
                'navParent': 'sys',
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
            }
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