/**
 * @class Taco.view.navigation.PrimaryMenuNavGroup
 * 
 */
Ext.define('Taco.view.navigation.PrimaryMenuNavGroup', {
    extend: 'Ext.container.Container',
    alias: 'widget.primary-menu-nav-group',
    requires: ['Taco.view.navigation.PrimarySubMenu'],
    cls: 'taco-menu-item',
    record: null,
    collapsible: true,
    padding: '8 0 6 0',
    
    initComponent: function () {
        var me = this,
            subItemStore = Ext.create('Ext.data.Store', {
                model: 'Taco.model.NavigationItem',
                data: this.record.get('items')
            });
        this.subMenuItems = Ext.create('Taco.view.navigation.PrimarySubMenu', {
            store: subItemStore,
            margin: '0 0 0 10'
        });
        this.items = [
            {
                xtype: 'label',
                text:this.record.get('label'),
                cls: this.cls,
                listeners: {
                    element: 'el',
                    click: function(e) {
                        if (!me.subMenuItems) {
                            return;
                        }
                        e.preventDefault();
                        e.stopPropagation();
                        if (me.subMenuItems.isVisible()) {
                            me.subMenuItems.hide();
                            this.addCls('');
                        } else {
                            this.removeCls('');
                            me.subMenuItems.show();
                        }
                        return false;
                    }
                }
            },
            this.subMenuItems
        ];

        this.callParent(arguments);

    }

});