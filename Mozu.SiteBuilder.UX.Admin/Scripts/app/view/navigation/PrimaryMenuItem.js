/**
 * @class Taco.view.navigation.PrimaryMenuItem
 */
Ext.define('Taco.view.navigation.PrimaryMenuItem', {
    extend: 'Ext.Component',

    autoEl: {
        tag: 'li',
        cls: 'taco-menu-item'
    },
    overCls: 'taco-menu-item-hover',
    tpl: [
        '<a href="{address}" class="taco-menu-item-link taco-icon taco-icon-{icon}">{label}</a>',
        '<tpl if="items"><ul class="taco-primary-menu-submenu">',
            '<tpl for="items"><li class="taco-submenu-item">',
                '<a href="{address}" class="taco-submenu-item-link">{label}</a>',
            '</li></tpl>',
        '</ul></tpl>'
    ],

    selectedCls: 'taco-menu-item-active',

    initComponent: function () {
        this.address = this.data.address || Taco.adminRelPath;
        this.label = this.data.label || '';

        this.callParent(arguments);

        this.on({
            click: {
                fn: this.onClick,
                element: 'el'
            },
            scope: this
        });
    },

    onClick: function (e) {
        var linkEl = e.getTarget('a'),
            menu = this.up('#primaryMenu'),
            dest = linkEl ? linkEl.href : this.address;

        e.preventDefault();
        Taco.core.StateManager.attemptNavigate(dest);
        menu.hideMenu();
    },

    select: function () {
        this.addCls(this.selectedCls);
    },

    deselect: function () {
        this.removeCls(this.selectedCls);
    },

    parseUri: function (uri) {
        var appPath = new RegExp(Taco.adminAppPath),
            relPath = new RegExp(Taco.adminRelPath);

        uri = uri || this.address;

        if (uri.indexOf(Taco.adminAppPath) === 0) {
            uri = uri.replace(appPath, '');
        } else if (uri.indexOf(Taco.adminRelPath) === 0) {
            uri = uri.replace(relPath, '');
        }

        uri = uri.split('/').shift();
        return uri;
    }
});