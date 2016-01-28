/**
 * @class Taco.view.navigation.PrimarySubMenu
 */
Ext.define('Taco.view.navigation.PrimarySubMenu', {
    extend: 'Ext.view.View',
    requires: [
        'Taco.view.navigation.SubNavLinkContainer'
    ],

    autoEl: {
        tag: 'ul',
        cls: 'taco-primary-menu'
    },
    itemSelector: 'li.taco-primary-menu-item',
    selectedItemCls: 'taco-primay-menu-item-active',

    initComponent: function () {
        var me = this,
            selModel;

        this.tpl = [
            '<tpl for=".">',
                '<li class="taco-menu-item {[this.checkActive(values.address)]}" style="{[(values.visible && !values.breadCrumbOnly) ? "" : "display:none" ]}">',
                    '<a href="{address}" class="taco-primary-menu-item-link">{label}</a>',
                '</li>',
            '</tpl>',
            {
                checkActive: function (address) {
                    return me.compareState(address)
                        ? 'active'
                        : '';
                }
            }
        ];

        this.callParent(arguments);

        this.listeners = {
            click: {
                element: 'el',
                fn: me.navigate,
                scope: this
            }
        };

        selModel = this.getSelectionModel();
        selModel.setSelectionMode('SINGLE');
        selModel.allowDeselect = true;
    },

    /**
     * Navigates to the link's destination via {@link Taco.core.StateManager}'s
     * attemptNavigate method.
     * @param  {Ext.EventObject} e The raw event object
     */
    navigate: function (e) {

        var menu = Ext.ComponentQuery.query('#primaryMenuContainer').shift(),
            subNavLinks = Ext.Array.filter(this.store.data.items, function(item) { return item.get('isSubNavLink'); }),
            subNavLinksHrefs = Ext.Array.map(subNavLinks, function(rec) { return rec.get('href'); }),
            subNavIndex,
            href;

        e.preventDefault();

        if (!e.target.hasAttribute('href')) {
            console.log('missing href');
            return;
        }

        href = e.target.getAttribute('href');
        subNavIndex = subNavLinksHrefs.indexOf(href);

        if (subNavIndex !== -1 && href.indexOf('http') !== -1) {
            Taco.view.navigation.SubNavLinkContainer.launchExtensionWindow(subNavLinks[subNavIndex], subNavLinks[subNavIndex].data);
            return false;
        }

        if (href.indexOf('http') === -1) {
            Taco.core.StateManager.attemptNavigate(href);
        } 

        else {
            window.open(href, '_new');
        }

        if (menu) {
            menu.hideMenu();
        }
    },

    compareState: function (address) {
        var data = Taco.app.StateManager.getCurrentState().complexMetaData;

        return address === data.controller || address === data.controller + '/' + data.action;
    },

    updateCurrentPage: function () {
        if (!this.getEl()) {
            return;
        }
        Ext.each(this.getEl().query('li.taco-menu-item.active'), function (dom) {
            Ext.fly(dom).removeCls('active');
        });

        var index = this.store.findBy(function (rec) {
            return this.compareState(rec.get('address'));
        }, this);

        if (index === -1) {
            return;
        }

        var dom = this.getEl().query('li.taco-menu-item')[index];

        if (!dom) {
            return;
        }

        Ext.fly(dom).addCls('active');
        console.log('updateCurrentPage', this);
    }
});