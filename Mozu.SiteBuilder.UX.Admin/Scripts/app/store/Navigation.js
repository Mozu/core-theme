/**
 * @class Taco.store.Navigation
 */
Ext.define('Taco.store.Navigation', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.NavigationItem',
    hasLocalizationLinks: false,
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
                isMultiCurrency,
                isMultiLang,
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
                    // if item has localization as an id, it is the top-level parent element 
                    if (item.id === 'localization' && this.hasLocalizationLinks) {
                        // top level element and it contains localization links, so we need to display it
                        return true;
                    }

                    if (item.locAtts) {
                        if (item.locAtts.length === 2 && !(isMultiLang || isMultiCurrency)) {
                            return false;
                        } else if (Ext.Array.indexOf(item.locAtts, 'multiLang') > -1 && !isMultiLang) {
                            return false;
                        } else if (Ext.Array.indexOf(item.locAtts, 'multCurrency') > -1 && !isMultiCurrency) {
                            return false;
                        }
                        // if we make it here, then at least one of the items has a localization link that needs to be displayed
                        this.hasLocalizationLinks = true;
                    }
                    return true;
                },
                mergeSubnavLinks = function (subNavStore) {

                    var navStore = this;
                    if (Taco.store.Navigation.getSubNavLinksMerged()) {
                        return;
                    }

                    subNavStore.each(function (item) {
                        var parent = navStore.getById(item.get('parentId'));

                        if (item.get('location') && item.get('location').indexOf('menu') !== -1) {
                            parent = navStore.getById(item.get('location').replace('menu', ''));
                        }

                        if (!parent) {
                            return;
                        }

                        var subNavObject = Ext.apply({
                            id: 'subNav' + item.get('badgeInitials'),
                            label: item.get('modalWindowTitle') || item.get('windowTitle') || 'Mozu Admin Extension',
                            address: item.get('href'),
                            isSubNavLink: true
                        }, item.data);

                        parent.get('items').push(subNavObject);

                    });
                    Taco.store.Navigation.setSubNavLinksMerged();
                };

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
                    function (item) {

                        if (!item.get('location') && !item.get('parentId')) {
                            return false;
                        }

                        else if (item.get('location').toLowerCase().indexOf('menu') !== -1) {
                            item.set('parentId', item.get('location').toLowerCase().replace('menu', ''));
                            return item;
                        }

                        else if (item.get('parentId')) {
                            return item;
                        }
                    }
                ],
                listeners: {
                    load: function () {
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
                if (record.raw.id === 'orderRoutingParent' && !Taco.user.taContext.omsEnabled)
                    return false;

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
        data: [{
            'id': 'home',
            'navParent': 'main',
            'label': 'Home',
            'icon': 'fa-home',
            'menucolor': 'purple',
            'behaviorIds': [4],
        },
        {
            'id': 'products',
            'navParent': 'main',
            'label': 'Catalog',
            'icon': 'fa-book',
            'menucolor': 'green',
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
            }, {
                'id': 'priceLists',
                'behaviorIds': [239],
                'label': 'Price Lists',
                'address': 'priceLists'
            }
            ]
        },
        {
            'id': 'marketing',
            'navParent': 'main',
            'menucolor': 'blue',
            'label': 'Marketing',
            'icon': 'fa-megaphone',
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
                    'behaviorIds': [235],
                    'label': 'Product Ranking',
                    'address': 'ProductRankings'
                }, {
                    'id': 'searchSynonyms',
                    'behaviorIds': [24],
                    'label': 'Search Synonyms',
                    'address': 'synonyms'
                }
            ]
        },
        {
            'id': 'content',
            'navParent': 'main',
            'label': 'Site Builder',
            'icon': 'fa-paint-roller',
            'menucolor': 'orange',
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
            'icon': 'fa-calendar-star',
            'menucolor': 'purple',
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
            'label': 'Orders',
            'icon': 'fa-home',
            'menucolor': 'green',
            'behaviorIds': [73],
            'items': [
                {
                    'id': 'orders',
                    'label': 'Orders',
                    'address': 'orders',
                    'behaviorIds': [73]
                }, {
                    'id': 'returns',
                    'label': 'Returns',
                    'address': 'returns',
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
                },
                {
                    "id": "locations-group",
                    "label": "Location Groups",
                    "address": "/admin?locationGroups",
                    //'visible': Taco.user.taContext.omsEnabled === false ? true : false,
                }
            ]
        },
        {
            'id': 'fulfillment',
            'navParent': 'main',
            'label': 'Fulfiller',
            'icon': 'fa-warehouse-alt',
            'menucolor': 'blue',
            'behaviorIds': [187]
        },
        {
            'id': 'orderRoutingParent',
            'navParent': 'main',
            'label': 'Order Routing',
            'icon': 'fa-map-signs',
            'menucolor': 'orange',
            'behaviorIds': [251]
        },
        {
            'id': 'customer',
            'navParent': 'main',
            'label': 'Customers',
            'icon': 'fa-user-crown',
            'menucolor': 'purple',
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
            'id': 'b2baccount',
            'navParent': 'main',
            'label': 'B2B',
            'icon': 'fa-building',
            'menucolor': 'green',
            'behaviorIds': [188],
            'items': [{
                'id': 'b2b-accounts',
                'label': 'B2B Accounts',
                'address': 'b2baccounts'
            }
            ]
        },
        {
            'id': 'report',
            'navParent': 'main',
            'label': 'Reports',
            'menucolor': 'blue',
            'icon': 'fa-file-chart-line',
            'behaviorIds': [188],
            'address': 'reports'
        },
        {
            'id': 'help-main',
            'navParent': 'main',
            'label': 'Help',
            'icon': 'fal fa-question-circle',
            'menucolor': 'orange',
            'behaviorIds': [188],
        },
        {
            'id': 'settings',
            'navParent': 'sys',
            'label': 'Settings',
            'icon': 'fa-cog',
            'menucolor': 'purple',
            //'visible': false,
            'items': [
                {
                    'id': 'generalsettings',
                    'label': 'General',
                    'address': 'generalsettings'
                },
                {
                    'id': 'paymentgateways',
                    'label': 'Payment Gateways',
                    'address': 'settings/paymentGateways'
                },
                {
                    'id': 'paymenttypes',
                    'label': 'Payment Types',
                    'address': 'settings/paymentTypes'
                },
                {
                    'id': 'inventoryexportjob',
                    'label': 'Inventory Settings',
                    'address': 'settings/inventoryExportJob'
                },
                {
                    'id': 'discountsettings',
                    'label': 'Discount Settings',
                    'address': 'settings/discounts'
                },
                {
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
            'icon': 'fa-project-diagram',
            'menucolor': 'green',
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
                'id': 'b2bAttributes',
                'label': 'B2B Attributes',
                'address': 'b2battributes'
            }, {
                'id': 'locationTypes',
                'label': 'Location Types',
                'address': 'locationTypes'
            }, {
                'id': 'locationAttributes',
                'label': 'Location Attributes',
                'address': 'locationattributes'
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
            'icon': 'fa-tools',
            'menucolor': 'blue',
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
            'menucolor': 'blue',
            'label': 'Structure',
            'icon': 'fa-sitemap',
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
            },
            {
                'id': 'customersets',
                'label': 'Customer Sets',
                'address': 'customersets'
            }
            ]
        },
        {
            'id': 'permissions',
            'navParent': 'sys',
            'menucolor': 'orange',
            'icon': 'fa-unlock',
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
            'menucolor': 'blue',
            'icon': 'fa-home',
            'label': 'Localization',
            'items': [
                {
                    'id': 'localizationAttr',
                    'label': 'Attributes',
                    'address': 'Localization/attributes',
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
            'id': 'help-system',
            'navParent': 'sys',
            'label': 'Help',
            'icon': 'fal fa-question-circle',
            'menucolor': 'orange'
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