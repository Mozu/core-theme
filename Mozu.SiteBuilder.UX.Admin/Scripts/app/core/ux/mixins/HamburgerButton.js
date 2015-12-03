Ext.define('Taco.core.ux.mixins.HamburgerButton', {
	extend: 'Taco.core.ux.action.Action',
    requires: [
        'Taco.view.navigation.PrimaryMenuPanel'
    ],
    xtype: 'action',
    text: '',
    width: 60,
    height: 60,
    cls: Taco.baseCSSPrefix + 'primary-menu-trigger',
    itemId: 'taco-hamburgerbutton',
    click: function () {

        if (Taco.app.PrimaryMenu.isHidden() || !Taco.app.PrimaryMenu.isRendered()) {
            Taco.app.PrimaryMenu.showMenu();
        } else {
            Taco.app.PrimaryMenu.hideMenu();
        }
    },

    initComponent: function() {
        var me = this;

        if (!Taco.app.PrimaryMenu) {
           this.createPrimaryMenu();
        } else {
            Taco.app.PrimaryMenu.setTrigger(this);
        }

    	this.callParent(arguments);
    },

    createPrimaryMenu: function() {
        var breadcrumb = Ext.create('Ext.Component', {
            flex: 1,
            cls: Taco.baseCSSPrefix + 'breadcrumb',
            tpl: [
                '<ul>',
                '<a href="{address}" class="taco-icon taco-icon-{icon}">{label}</a>',
                '<tpl for="items">',
                    '<tpl if="visible !== false">',
                    '<li class="taco-breadcrumb-item{[ values.selected ?"-selected": ""]}"> <a class="{[values.items.length ? "taco-breadcrumb-menubutton" : ""]}" href="{address}" data-nav-id="{id}"><span>{label}</span></a></li>',
                    '</tpl>',
                '</tpl></ul>'
            ]
        });

        // set this to a global variable so we dont have to reinit the menu on each navigate
        Taco.app.PrimaryMenu = Ext.create('Taco.view.navigation.PrimaryMenuPanel', {
            trigger: this,
            breadcrumb: breadcrumb
        });
        Taco.app.PrimaryMenu.bindStore();
    }

});