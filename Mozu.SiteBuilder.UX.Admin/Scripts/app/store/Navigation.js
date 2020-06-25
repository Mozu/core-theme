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

                        if (item.get('modalWindowTitle') == "Import/Export") {
                            item.set('modalWindowTitle', Localizer.langResources.IMPORT_EXPORT.ImportExport)
                            var localizerKey = item.get('windowTitle').replace(/[^0-9a-z]/gi, ''),
                                localizerValue = eval('Localizer.langResources.IMPORT_EXPORT.' + localizerKey);
                            item.set('windowTitle', localizerValue)
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
            'label': Localizer.langResources.DASHBOARD.MAIN.home,
            'icon': 'fa-home',
            'menucolor': 'purple',
            'behaviorIds': [4],
        },
        {
            'id': 'products',
            'navParent': 'main',
            'label': Localizer.langResources.DASHBOARD.MAIN.catalog,
            'icon': 'fa-book',
            'menucolor': 'green',
            'behaviorIds': [4],
            'items': [{
                'id': 'catalogProducts',
                'label': Localizer.langResources.DASHBOARD.MAIN.products,
                'address': 'products',
                'behaviorIds': [4]
            }, {
                'id': 'categories',
                'label': Localizer.langResources.DASHBOARD.MAIN.categories,
                'address': 'categories',
                'behaviorIds': [16]
            }, {
                'id': 'inventory',
                'label': Localizer.langResources.DASHBOARD.MAIN.inventory,
                'address': 'inventory',
                'behaviorIds': [4]
            }, {
                'id': 'priceLists',
                'behaviorIds': [239],
                'label': Localizer.langResources.DASHBOARD.MAIN.price_lists,
                'address': 'priceLists'
            }
            ]
        },
        {
            'id': 'marketing',
            'navParent': 'main',
            'menucolor': 'blue',
            'label': Localizer.langResources.DASHBOARD.MAIN.marketing,
            'icon': 'fa-megaphone',
            'behaviorIds': [24],
            'items': [
                {
                    'id': 'discounts',
                    'behaviorIds': [24],
                    'label': Localizer.langResources.DASHBOARD.MAIN.discounts,
                    'address': 'discounts'
                }, {
                    'id': 'couponset',
                    'behaviorIds': [24],
                    'label': Localizer.langResources.DASHBOARD.MAIN.coupon_sets,
                    'address': 'CouponSets'
                }, {
                    'id': 'productRanking',
                    'behaviorIds': [235],
                    'label': Localizer.langResources.DASHBOARD.MAIN.product_ranking,
                    'address': 'ProductRankings'
                }, {
                    'id': 'searchSynonyms',
                    'behaviorIds': [24],
                    'label': Localizer.langResources.DASHBOARD.MAIN.search_synonyms,
                    'address': 'synonyms'
                }
            ]
        },
        {
            'id': 'content',
            'navParent': 'main',
            'label': Localizer.langResources.DASHBOARD.MAIN.site_builder,
            'icon': 'fa-paint-roller',
            'menucolor': 'orange',
            'showBreadCrumbs': true,
            'items': [
                {
                    'id': 'webedit',
                    'label': Localizer.langResources.DASHBOARD.MAIN.editor,
                    'address': 'website'
                }, {
                    'id': 'themes',
                    'label': Localizer.langResources.DASHBOARD.MAIN.themes,
                    'address': 'themes'
                },
                {
                    'id': 'redirects',
                    'label': Localizer.langResources.DASHBOARD.MAIN.redirects,
                    'address': 'redirects'
                }, {
                    'id': 'fileManager',
                    'label': Localizer.langResources.DASHBOARD.MAIN.files,
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
            'label': Localizer.langResources.DASHBOARD.MAIN.publishing,
            'icon': 'fa-calendar-star',
            'menucolor': 'purple',
            'behaviorIds': [8],
            'items': [
                {
                    'id': 'drafts',
                    'label': Localizer.langResources.DASHBOARD.MAIN.drafts,
                    'address': 'publishing/drafts'
                },
                {
                    'id': 'publishSets',
                    'label': Localizer.langResources.DASHBOARD.MAIN.publish_sets,
                    'address': 'publishing/publishsets'
                }
            ]
        },
        {
            'id': 'order',
            'navParent': 'main',
            'label': Localizer.langResources.DASHBOARD.MAIN.orders,
            'icon': 'fa-home',
            'menucolor': 'green',
            'behaviorIds': [73],
            'items': [
                {
                    'id': 'orders',
                    'label': Localizer.langResources.DASHBOARD.MAIN.orders,
                    'address': 'orders',
                    'behaviorIds': [73]
                }, {
                    'id': 'returns',
                    'label': Localizer.langResources.DASHBOARD.MAIN.returns,
                    'address': 'returns',
                    'behaviorIds': [73]
                }, {
                    'id': 'locations-inventory',
                    'label': Localizer.langResources.DASHBOARD.MAIN.inventory,
                    'address': 'locationInventory'
                }, {
                    'id': 'locations',
                    'label': Localizer.langResources.DASHBOARD.MAIN.locations,
                    'address': 'locations',
                    'behaviorIds': [186]
                },
                {
                    "id": "locations-group",
                    "label": Localizer.langResources.DASHBOARD.MAIN.location_groups,
                    "address": "/admin?locationGroups",
                    //'visible': Taco.user.taContext.omsEnabled === false ? true : false,
                }
            ]
        },
        {
            'id': 'fulfillment',
            'navParent': 'main',
            'label': Localizer.langResources.DASHBOARD.MAIN.fulfiller,
            'icon': 'fa-warehouse-alt',
            'menucolor': 'blue',
            'behaviorIds': [187]
        },
        {
            'id': 'orderRoutingParent',
            'navParent': 'main',
            'label': Localizer.langResources.DASHBOARD.MAIN.order_routing,
            'icon': 'fa-map-signs',
            'menucolor': 'orange',
            'behaviorIds': [251]
        },
        {
            'id': 'customer',
            'navParent': 'main',
            'label': Localizer.langResources.DASHBOARD.MAIN.customers,
            'icon': 'fa-user-crown',
            'menucolor': 'purple',
            'items': [{
                'id': 'customers',
                'label': Localizer.langResources.DASHBOARD.MAIN.customers,
                'address': 'customers',
                'behaviorIds': [41]
            }, {
                'id': 'customerSegments',
                'label': Localizer.langResources.DASHBOARD.MAIN.customer_segments,
                'address': 'customer/segments'
            }, {
                'id': 'storecredit',
                'label': Localizer.langResources.DASHBOARD.MAIN.store_credit,
                'address': 'StoreCredits'
            }
            ]
        },
        {
            'id': 'b2baccount',
            'navParent': 'main',
            'label': Localizer.langResources.DASHBOARD.MAIN.B2B,
            'icon': 'fa-building',
            'menucolor': 'green',
            'behaviorIds': [188],
            'items': [{
                'id': 'b2b-accounts',
                'label': Localizer.langResources.DASHBOARD.MAIN.B2B_accounts,
                'address': 'b2baccounts'
            }
            ]
        },
        {
            'id': 'report',
            'navParent': 'main',
            'label': Localizer.langResources.DASHBOARD.MAIN.reports,
            'menucolor': 'blue',
            'icon': 'fa-file-chart-line',
            'behaviorIds': [188],
            'address': 'reports'
        },
        {
            'id': 'help-main',
            'navParent': 'main',
            'label': Localizer.langResources.DASHBOARD.MAIN.help,
            'icon': 'fal fa-question-circle',
            'menucolor': 'orange',
            'behaviorIds': [188],
        },
        {
            'id': 'settings',
            'navParent': 'sys',
            'label': Localizer.langResources.DASHBOARD.SYSTEM.settings,
            'icon': 'fa-cog',
            'menucolor': 'purple',
            //'visible': false,
            'items': [
                {
                    'id': 'generalsettings',
                    'label': Localizer.langResources.DASHBOARD.SYSTEM.general,
                    'address': 'generalsettings'
                },
                {
                    'id': 'paymentgateways',
                    'label': Localizer.langResources.DASHBOARD.SYSTEM.payment_gateways,
                    'address': 'settings/paymentGateways'
                },
                {
                    'id': 'paymenttypes',
                    'label': Localizer.langResources.DASHBOARD.SYSTEM.payment_types,
                    'address': 'settings/paymentTypes'
                },
                {
                    'id': 'inventoryexportjob',
                    'label': Localizer.langResources.DASHBOARD.SYSTEM.inventory_settings,
                    'address': 'settings/inventoryExportJob'
                },
                {
                    'id': 'discountsettings',
                    'label': Localizer.langResources.DASHBOARD.SYSTEM.discount_settings,
                    'address': 'settings/discounts'
                },
                {
                    'id': 'tax',
                    'label': Localizer.langResources.DASHBOARD.SYSTEM.tax,
                    'address': 'settings/tax'
                }, {
                    'id': 'shippingMain',
                    'label': Localizer.langResources.DASHBOARD.SYSTEM.shipping,
                    'address': 'shipping'
                }, {
                    'id': 'publishing',
                    'label': Localizer.langResources.DASHBOARD.SYSTEM.publishing,
                    'address': 'settings/publishing'
                }
            ]
        },
        {
            'id': 'schema',
            'navParent': 'sys',
            'label': Localizer.langResources.DASHBOARD.SYSTEM.schema,
            'icon': 'fa-project-diagram',
            'menucolor': 'green',
            'behaviorIds': [4],
            'items': [{
                'id': 'productTypes',
                'label': Localizer.langResources.DASHBOARD.SYSTEM.product_types,
                'address': 'producttypes'
            }, {
                'id': 'productAttributes',
                'label': Localizer.langResources.DASHBOARD.SYSTEM.product_attributes,
                'address': 'attributes'
            }, {
                'id': 'orderAttributes',
                'label': Localizer.langResources.DASHBOARD.SYSTEM.order_attributes,
                'address': 'orderattributes'
            }, {
                'id': 'customerAttributes',
                'label': Localizer.langResources.DASHBOARD.SYSTEM.customer_attributes,
                'address': 'CustomerAttributes'
            }, {
                'id': 'b2bAttributes',
                'label': Localizer.langResources.DASHBOARD.SYSTEM.B2B_attributes,
                'address': 'b2battributes'
            }, {
                'id': 'locationTypes',
                'label': Localizer.langResources.DASHBOARD.SYSTEM.location_types,
                'address': 'locationTypes'
            }, {
                'id': 'locationAttributes',
                'label': Localizer.langResources.DASHBOARD.SYSTEM.location_attributes,
                'address': 'locationattributes'
            }, {
                'id': 'customSchema',
                'label': Localizer.langResources.DASHBOARD.SYSTEM.custom_schema,
                'address': 'customSchema'
            }
            ]
        }, {
            'id': 'customization',
            'navParent': 'sys',
            'label': Localizer.langResources.DASHBOARD.SYSTEM.customization,
            'icon': 'fa-tools',
            'menucolor': 'blue',
            'behaviorIds': [4],
            'items': [{
                'id': 'applications-manage',
                'label': Localizer.langResources.DASHBOARD.SYSTEM.applications,
                'address': 'capability'
            }, {
                'id': 'actionmanagement',
                'label': Localizer.langResources.DASHBOARD.SYSTEM.arc_js,
                'address': 'actionmanagement'
            }, {
                'id': 'customroutes',
                'label': Localizer.langResources.DASHBOARD.SYSTEM.custom_routes,
                'address': 'customroutes'
            }
            ]
        },
        {
            'id': 'structure',
            'navParent': 'sys',
            'menucolor': 'blue',
            'label': Localizer.langResources.DASHBOARD.SYSTEM.structure,
            'icon': 'fa-sitemap',
            'behaviorIds': [4],
            'items': [{
                'id': 'siteprovisioning',
                'label': Localizer.langResources.DASHBOARD.SYSTEM.sites,
                'address': 'provisioning/sites'
            }, {
                'id': 'catalogprovisioning',
                'label': Localizer.langResources.DASHBOARD.SYSTEM.catalogs,
                'address': 'provisioning/catalogs'
            }, {
                'id': 'channels',
                'label': Localizer.langResources.DASHBOARD.SYSTEM.channels,
                'address': 'channels'
            },
            {
                'id': 'customersets',
                'label': Localizer.langResources.DASHBOARD.SYSTEM.customer_sets,
                'address': 'customersets'
            }
            ]
        },
        {
            'id': 'permissions',
            'navParent': 'sys',
            'menucolor': 'orange',
            'icon': 'fa-unlock',
            'label': Localizer.langResources.DASHBOARD.SYSTEM.permissions,
            'items': [
                {
                    'id': 'users',
                    'label': Localizer.langResources.DASHBOARD.SYSTEM.users,
                    'address': 'account/users'
                }, {
                    'id': 'roles',
                    'label': Localizer.langResources.DASHBOARD.SYSTEM.roles,
                    'address': 'roles'
                }, {
                    'id': 'ipblocking',
                    'label': Localizer.langResources.DASHBOARD.SYSTEM.ip_restrictions,
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
            'label': Localizer.langResources.DASHBOARD.SYSTEM.localization,
            'items': [
                {
                    'id': 'localizationAttr',
                    'label': Localizer.langResources.DASHBOARD.SYSTEM.attributes,
                    'address': 'Localization/attributes',
                    'locAtts': ['multiLang']
                },
                {
                    'id': 'localizationAttrVal',
                    'label': Localizer.langResources.DASHBOARD.SYSTEM.attribute_values,
                    'address': 'Localization/attributeValues',
                    'locAtts': ['multiLang']
                },
                {
                    'id': 'localizationProp',
                    'label': Localizer.langResources.DASHBOARD.SYSTEM.product_properties,
                    'address': 'Localization/productProperties',
                    'locAtts': ['multiLang']
                },
                {
                    'id': 'localizationExtra',
                    'label': Localizer.langResources.DASHBOARD.SYSTEM.product_extras,
                    'address': 'Localization/productExtras',
                    'locAtts': ['multCurrency']
                },
                {
                    'id': 'localizationVar',
                    'label': Localizer.langResources.DASHBOARD.SYSTEM.product_variants,
                    'address': 'Localization/productVariants',
                    'locAtts': ['multCurrency']
                }
            ]
        },
        {
            'id': 'help-system',
            'navParent': 'sys',
            'label': Localizer.langResources.DASHBOARD.MAIN.help,
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