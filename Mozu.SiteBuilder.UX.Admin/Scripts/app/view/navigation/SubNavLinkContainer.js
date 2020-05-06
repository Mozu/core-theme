/**
 * @class Taco.view.SubNavLinkContainer
 * @author Ben Cripps
 *
 */

Ext.define('Taco.view.navigation.SubNavLinkContainer', {
    extend: 'Ext.container.Container',
    alias: 'taco.subnavlinkcontainer',
    store: 'Taco.store.SubnavLinks',

    statics: {
        launchExtensionWindow: function (extensionLink, ctx, secureForm) {

            var removeComplexDataTypes = function (json) {
                var returnOb = {};
                Object.keys(json).forEach(function (k) {
                    if (k && json[k]) {
                        var val = json[k];

                        if (Ext.isString(val) || Ext.isBoolean(val) || Ext.isNumber(val)) {
                            returnOb[k] = val.toString()
                        }
                        if (Ext.isDate(val)) {
                            returnOb[k] = Ext.Date.format(val, 'c');
                        }
                    }
                });

                return returnOb;
            };

            var me = this,
                jsonData = {'x-vol-return-url': window.location.href};

            if (ctx) jsonData = ctx;

            var returnUrl = window.location.href.replace(window.location.search, ''),
                queryString = Ext.Object.fromQueryString(window.location.search);
            queryString._mz_extlnk = extensionLink.data._id;
            returnUrl += '?' + Ext.Object.toQueryString(queryString);


            jsonData['x-vol-return-url'] = returnUrl;

            jsonData = removeComplexDataTypes(jsonData);

            if (extensionLink.data.appId) {

                if (!secureForm) {

                    Ext.Ajax.request({
                        url: '/admin/app/capabilities/createSecureForm?appId=' + extensionLink.data.appId,
                        method: 'POST',
                        jsonData: jsonData,
                        success: function (response) {
                            // success handling here
                            var json = Ext.decode(response.responseText, true);
                            if (!json || !json.success) {
                                // service didnt' return data properly
                                return;
                            }
                            me.launchExtensionWindow(extensionLink, ctx, json.items);
                        }
                    });
                    return;
                }

            }


            var configIframe = Ext.create('Ext.ux.IFrame', {
                height: '100%',
                src: 'about:blank'
            });

            var configForm = {
                xtype: 'form',
                url: extensionLink.data.href,
                action: 'POST',
                items: [],
                hidden: true,
                listeners: {
                    render: function (cmp) {
                        cmp.submit({
                            standardSubmit: true,
                            target: configIframe.frameName
                        });
                    }
                }
            };

            if (secureForm) {
                Ext.Array.each(secureForm.body, function (kvp) {
                    configForm.items.push({
                        xtype: 'hiddenfield',
                        name: kvp.key,
                        value: kvp.value
                    });
                });
                configForm.url = Ext.String.urlAppend(configForm.url, 'dt=' + encodeURIComponent(secureForm.dateStamp));
                configForm.url = Ext.String.urlAppend(configForm.url, 'messageHash=' + encodeURIComponent(secureForm.messageHash));
            }


            var modalConfigWindow = Ext.create('Taco.core.ux.window.Drawer', {
                autoShow: true,
                resizable: true,
                draggable: true,
                layout: 'fit',
                autoScroll: false,
                height: '90%',
                scale: 'large',
                actions: [],
                width: '90%',
                shadow: true,
                title: extensionLink.data.windowTitle || extensionLink.data.modalWindowTitle || 'Mozu App Extension',
                items: [
                    configIframe,
                    configForm
                ]
            });

            modalConfigWindow.center();
        },
        getContextHash: function (record, type) {
            if (record === undefined) {
                record = (Taco.app.viewPort.down('[record]') || {}).record;
            }
            if (!record || !record.data) {
                return {};
            }
            if (!type) {
                var arr = record.$className.split('.');
                type = Ext.util.Inflector.pluralize(arr[arr.length - 1].toLowerCase());
            }
            switch (type) {
                case 'orders':
                    return {
                        orderId: record.data.id,
                        orderNumber: record.data.orderNumber,
                        extOrderNumber: record.data.externalId,
                        customerEmail: record.customer ? record.customer.data.emailAddress : undefined,
                        customerName: record.customer ? [record.customer.data.firstName, ' ', record.customer.data.lastName].join('') : undefined,
                        customerId: record.customer ? record.customer.data.id : undefined
                    };
                case 'products':
                    return {
                        productCode: record.data.productCode,
                        catalogId: record.id,
                        productType: record.productType,
                        productUsage: record.data.productUsage
                    };
                case 'customers':
                    return {
                        customerId: record.data.id,
                        customerAccntEmail: record.data.customerOrOrganization,
                        shopperAccntEmail: record.data.contacts ? record.data.contacts.map(function (n) {
                            return n.email;
                        }) : undefined,
                        customerSegName: record.data.segments
                    };

                case 'discounts':
                    return {
                        discountId: record.data.id,
                        couponCode: record.data.couponCode
                    };
                case 'locations':
                    return {
                        locationCode: record.data.code,
                        locationType: record.data.locationTypes
                    };
                case 'storecredits':
                    return {
                        customerId: record.data.customerId,
                        creditCode: record.data.code
                    };

                default:
                    var ret = {};
                    ret[Ext.util.Inflector.singularize(type) + 'Id'] = record.getId();
                    return ret;

            }
        },
        doClick: function (linkData) {
            var configData;

            if (linkData.get('requiredContext')) {
                configData = Taco.view.navigation.SubNavLinkContainer.getContextHash();
            }

            var displayMode = linkData.get('displayMode');
            var href = linkData.get('href');

            if (displayMode === 'navigate' || !displayMode) {
                if (href.indexOf('http') !== -1) {
                    Taco.view.navigation.SubNavLinkContainer.launchExtensionWindow(linkData, configData);
                }
                else {
                    Taco.core.StateManager.attemptNavigate(href);
                }
            }

            else if (displayMode === 'modal') {
                Taco.view.navigation.SubNavLinkContainer.launchExtensionWindow(linkData, configData);
            }
            return true;
        }
    },

    initComponent: function () {

        this.store = Ext.create('Taco.store.SubnavLinks', {
            listeners: {
                load: {
                    scope: this,
                    fn: this.createLinks
                }
            }
        });

        this.items = [];

        this.callParent(arguments);
    },

    createLinks: function () {
        var me = this;
        var links = this.formatData(this.store);
        var components = this.getLinkComponents(links);

        this.add(components);
    },

    buildLink: function (link, items) {
        var normalizeBadgeId = this.normalizeBadgeId(link);
        var title;

        if (!normalizeBadgeId) {
            return false;
        }

        var item = Ext.Array.findBy(items, function (item) {
            return item.key === 'no-' + normalizeBadgeId;
        });

        if (!item) {
            title = link && link.get ? link.get('windowTitle') || link.get('modalWindowTitle') : null;

            title = title ? title : 'Mozu Extension';

            item = {
                title: title,
                key: 'no-' + normalizeBadgeId,
                view: normalizeBadgeId
            };

            items.push(item);
        }

        var path = Ext.clone(link.get('path'));

        if (!link.get('badgeInitials') || !link.get('badgeImage')) {
            path.unshift();
        }

        var temp = item;

        while (path.length) {
            var pathItem = path.shift();
            var pathKey = 'path_' + pathItem;

            if (!temp[pathKey]) temp[pathKey] = {};
            temp = temp[pathKey];
        }

        temp.extension = link;

    },

    formatData: function (store) {
        var formattedData = [];

        this.store.each(function (item) {
            this.buildLink(item, formattedData);
        }, this);

        return formattedData;
    },

    getLinkComponents: function (items) {

        var me = this;
        var components = [];

        Ext.Array.each(items, function (item) {
            components.push(this.getIconCmp(item));
        }, this);

        return components;
    },

    buildNode: function (config, callToAction) {
        var items = [];
        var menu = {};
        var subMenu = {};
        var handler;

        if (callToAction) {
            items.push({
                cls: 'call-to-action override',
                text: callToAction
            });
        }

        Ext.Object.each(config, function (key, value) {

            if (key.indexOf('path_') !== -1) {

                subMenu = this.buildNode(value);

                menu = {
                    text: key.replace('path_', ''),
                    handler: this.onClick.bind(this, value),
                    cls: 'taco-subnavlink-menu'
                };

                if (Object.keys(subMenu).length > 0) {
                    menu.menu = subMenu;
                }

                items.push(menu);
            }

        }, this);

        return items;
    },

    buildMenu: function (config) {

        if (Object.keys(config).join('').indexOf('path_') === -1) {
            return false;
        }

        var menu = Ext.create('Ext.menu.Menu', {
            items: this.buildNode(config, config.title),
            cls: 'taco-menu-item taco-header-split-button'
        });

        return menu;
    },

    getIconCmp: function (config) {
        var me = this;
        var data = {
            view: config.view,
            extension: config.extension,
            menu: me.buildMenu(config)
        };

        return Ext.create('Ext.Component', {
            tpl: [
                '<span class="subnavlink-container">',
                '<tpl>{[this.getIcon(values)]}</tpl>',
                '</span>',
                {
                    getIcon: function (record) {

                        if (record.view.length > 2) {
                            return '<span><img src="' + record.view + '" /><span>';
                        }

                        else if (record.view) {
                            return '<span class="text-only">' + record.view + '</span>';
                        }

                    }
                }
            ],
            cls: 'taco-subnavlink',
            data: data,
            listeners: {
                click: me.onClick.bind(me, config),
                mouseover: me.onMouseOver.bind(me, data),
                element: 'el'
            }
        });
    },

    onMouseOver: function (config, cmp, el) {

        var showEl = el;

        // to prevent menu jumping on different hover events
        // we figure out which element we want to run showby on

        if (!showEl || !showEl.querySelector) {
            return false;
        }

        if (showEl.querySelector('img')) {
            showEl = showEl.querySelector('img');
        }

        else if (showEl.querySelector('.text-only')) {
            showEl = showEl.querySelector('.text-only');
        }

        if (config && config.menu) {
            config.menu.showBy(showEl, 'tr-br', [0, 10]);
        }

    },

    normalizeBadgeId: function (link) {

        var formatted;
        var string;

        if (link.get('badgeImage')) {
            formatted = link.get('badgeImage');
        }

        else if (link.get('badgeInitials')) {
            string = link.get('badgeInitials').length !== 1 ? link.get('badgeInitials').toLowerCase().slice(0, 2) : link.get('badgeInitials');
            formatted = string.charAt(0).toUpperCase() + string.slice(1);
        }

        else {
            if (!link.get('path')) {
                return false;
            }

            string = link.get('path')[0].toLowerCase().slice(0, 2);
            formatted = string.charAt(0).toUpperCase() + string.slice(1);
        }

        return formatted;
    },

    onClick: function (record) {
        if (!record.extension) return false;

        return Taco.view.navigation.SubNavLinkContainer.doClick(record.extension);
    }

});