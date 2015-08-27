/**
 * @class Taco.core.ux.ListGridToggle
 */
Ext.define('Taco.core.ux.ListGridToggle', {

    extend: 'Ext.container.Container',
    alias: 'widget.listgridtoggle',
    layout: 'hbox',
    handler: Ext.noop,
    currentState: 'list',
    items: [
        {
            xtype: 'button',
            itemId: 'grid',
            width: 22,
            margin: '0 5',
            cls: 'taco-action-gridview',
            enableToggle: true,
            handler: function () {
                if (this.pressed) {
                var lgt = this.findParentByType('listgridtoggle')
                lgt.handler('grid');
                lgt.getComponent('list').toggle();
                }
            },
            pressed: true
        },
        {
            xtype: 'button',
            itemId: 'list',
            width: 22,
            margin: '0 5',
            cls: 'taco-action-listview',
            enableToggle: true,
            handler: function () {
                if (this.pressed) {
                    var lgt = this.findParentByType('listgridtoggle')
                    lgt.handler('list');
                    lgt.getComponent('grid').toggle();
                }
            }
        }        
    ]

});