/**
 * @class Taco.view.navigation.PrimaryMenuNavGroup
 * 
 */
Ext.define('Taco.view.navigation.PrimaryMenuNavGroup', {
    extend: 'Ext.container.Container',
    alias: 'widget.primary-menu-nav-group',
    requires: ['Taco.view.navigation.PrimarySubMenu'],
    record: null,
    collapsible: true,
    padding: '8 0 6 10',
    width: '100%',

    initComponent: function () {
        var me = this,
            subItemStore = Ext.create('Ext.data.Store', {
                model: 'Taco.model.NavigationItem',
                data: this.record.get('items')
            });

        this.collapsedStateKey = 'primary-nav-collapsed-' + me.record.get('id');

        this.subMenuItems = Ext.create('Taco.view.navigation.PrimarySubMenu', {
            hidden: (Ext.util.Cookies.get('isUnified') == false && Ext.util.Cookies.get('isUnifiedState') == true) ? false : Ext.state.Manager.get(this.collapsedStateKey),
            store: subItemStore
        });

        this.items = [
            {
                xtype: 'label',
                text:this.record.get('label'),
                width: '100%',
                cls: 'taco-primary-menu-heading ' + (Ext.state.Manager.get(this.collapsedStateKey) ? 'taco-collapsed-icon' : ''),
                listeners: {
                    element: 'el',
                    click: function (e) {
                        Ext.util.Cookies.get('isUnifiedState') ? Ext.util.Cookies.clear('isUnifiedState'): '';
                        if (!me.subMenuItems) {
                            return;
                        }
                        e.preventDefault();
                        e.stopPropagation();
                        if (me.subMenuItems.isVisible()) {
                            me.subMenuItems.hide();
                            this.addCls('taco-collapsed-icon');
                            Ext.state.Manager.set(me.collapsedStateKey, true);
                        } else {
                            this.removeCls('taco-collapsed-icon');
                            me.subMenuItems.show();
                            Ext.state.Manager.set(me.collapsedStateKey, false);
                        }
                        return false;
                    }
                }
            },
            this.subMenuItems
        ];

        this.callParent(arguments);

    },

    updateCurrentPage: function () {
        Ext.each(this.subMenuItems, function (item) {
            item.updateCurrentPage();
        });
    }

});