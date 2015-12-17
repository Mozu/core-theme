/**
 * @class Taco.view.SubNavLinkContainer
 * @author Ben Cripps
 * 
 */

Ext.define('Taco.view.navigation.SubNavLinkContainer', {
    extend: 'Ext.container.Container',
    alias: 'taco.subnavlinkcontainer',
    store: 'Taco.store.SubnavLinks',

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

        console.log(this.store);

        this.callParent(arguments);
    },

    createLinks: function() {
    	var me = this;
    	var links = this.formatData(this.store);
        var components = this.getLinkComponents(links);
        
    	this.add(components);
    },

    buildLink: function (link, items) {
        var normalizeBadgeId = this.normalizeBadgeId(link);

        if (!normalizeBadgeId) {
            return false;
        }

        var item = Ext.Array.findBy(items, function (item) {
            return item.key === 'no-' + normalizeBadgeId;
        });

        if (!item) {
            item = {
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

    formatData: function(store) {
        var formattedData = [];

        this.store.each(function(item) {
            this.buildLink(item, formattedData);
        }, this);

        return formattedData;
    },

    getLinkComponents: function(items) {

    	var me = this;
        var components = [];

        Ext.Array.each(items, function(item) {
            components.push(this.getIconCmp(item)); 
        }, this);

        return components;
    },

    buildNode: function(config) {
        var items = [];
        var menu = {};
        var subMenu = {};
        var handler;

        Ext.Object.each(config, function(key, value) {

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

    buildMenu: function(config) {

        if (Object.keys(config).join('').indexOf('path_') === -1) {
            return false;
        }     

        var menu = Ext.create('Ext.menu.Menu', {
            items: this.buildNode(config),
            cls: 'taco-menu-item'
        });

        return menu;
    },

    getIconCmp: function(config) {
        var me = this;
        var data = {
            view: config.view,
            extension: config.extension,
            menu: me.buildMenu(config)
        };

        return Ext.create('Ext.Component', {
            tpl: [
                '<span>',
                    '<tpl>{[this.getIcon(values)]}</tpl>',
                '</span>',
                {
                    getIcon: function(record) {
                        
                        if (record.view.length > 2) {
                            return '<span><img src="' + record.view + '" /><span>';
                        }

                        else if (record.view) {
                            return '<span style="padding-top: 10px">' + record.view + '</span>';
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

    onMouseOver: function(config, cmp, el) {
        if (config && config.menu) {
            config.menu.showBy(el);
        }
    },

    normalizeBadgeId: function(link) {

        var formatted;
        var string;

        if (link.get('badgeImage')) {
            // formatted = 'bimage-' + link.get('path') && link.get('path').length > 0 ? link.get('path')[0] : link.get('badgeImage');
            formatted = link.get('badgeImage');
        }

        else if (link.get('badgeInitials')) {
            formatted = 'bi-' + link.get('path') && link.get('path').length > 0 ? link.get('path')[0] : link.get('badgeInitials');
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

    onClick: function(record) {

        if (!record.extension) return false;

    	var displayMode = record.extension.get('displayMode');

    	if (displayMode === 'navigate' || !displayMode) {
    		window.open(record.extension.get('href'));
    	}

    	else if (displayMode === 'modal') {

    	}
    }

});