/**
 * @class Taco.view.navigation.PrimarySubMenu
 */

//function testClass() {
//    alert("test");
//    document.getElementsByClassName('main-menu-order').addCls('set-font-bold');
//}

Ext.define('Taco.view.navigation.PrimarySubMenu', {
    extend: 'Ext.view.View',
    requires: [
        'Taco.view.navigation.SubNavLinkContainer'
    ],

    autoEl: {
        tag: 'div',
        cls: 'taco-primary-menu '
    },
    itemSelector: 'li.taco-primary-menu-item',
    selectedItemCls: 'taco-primay-menu-item-active',

    initComponent: function () {

        var me = this,
            selModel;
        this.tpl = [
            '<ul>',
            '<tpl for=".">',
            '<tpl if="values.id == \'launchPad\'">',
            '<li class="tenant-name-container taco-menu-item color-kibo-' + this.record.get('menucolor') + ' {[this.checkActive(values.address)]}" style="{[(values.visible && !values.breadCrumbOnly) ? "" : "display:none" ]}">',
            '<tpl else>',
            '<li class="taco-menu-item color-kibo-' + this.record.get('menucolor') + ' {[this.checkActive(values.address)]}" style="{[(values.visible && !values.breadCrumbOnly) ? "" : "display:none" ]}">',
            '</tpl>',
            '<tpl if="values.address == \'/admin?quotes\' || values.address == \'/admin?locationGroups\'">',
            '<a class="taco-primary-menu-item-link" onClick="window.location.href=\'{address}\'">{label}</a>',
            '<tpl else>',
            '<a href="{address}" class="taco-primary-menu-item-link">{[values.label]}</a>',
            '</tpl>',
            '</li>',
            '<tpl if="values.id == \'launchPad\'"><div style = "width:320px;height:4px;background-image:linear-gradient(to bottom,rgba(0, 0, 0, 0),rgba(0, 0, 0, 0.08)99%);"></div ></tpl> ',
            '</tpl>',
            '</ul>',
            {
                checkActive: function (address) {
                    if (me.compareState(address)) {
                        me.selectParent(me.record.data.id);
                    }
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
            subNavLinks = Ext.Array.filter(this.store.data.items, function (item) { return item.get('isSubNavLink'); }),
            subNavLinksHrefs = Ext.Array.map(subNavLinks, function (rec) { return rec.get('href'); }),
            subNavIndex,
            href;

        e.preventDefault();

        if (!e.target.hasAttribute('href')) {
            console.log('missing href');
            return;
        }

        href = e.target.getAttribute('href');

        if (e.target.innerText == 'Launchpad' || e.target.innerText == 'Logout') {
            window.location.href = href;
            return;
        }

        subNavIndex = subNavLinksHrefs.indexOf(href);

        if (subNavIndex !== -1 && href.indexOf('http') !== -1) {
            Taco.view.navigation.SubNavLinkContainer.doClick(subNavLinks[subNavIndex]);
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

        this.selectParent(this.record.get('id'));
    },

    selectParent: function (parentId) {
        Ext.each(Ext.fly(document).query('.taco-primary-menu-heading'), function (dom) {
            Ext.fly(dom).removeCls('main-menu-active');
            Ext.each(Ext.fly(dom).query('.menuicon'), function (domIcon) {
                Ext.fly(domIcon).removeCls('fa');
                Ext.fly(domIcon).addCls('fal');
            });
        });
        Ext.each(Ext.fly(document).query('.main-menu-' + parentId), function (dom) {
            Ext.fly(dom).addCls('main-menu-active');
            Ext.each(Ext.fly(dom).query('.menuicon'), function (domIcon) {
                Ext.fly(domIcon).removeCls('fal');
                Ext.fly(domIcon).addCls('fa');
            });
        });
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