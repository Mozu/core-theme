/**
 * @class Taco.view.catalog.Index
 * @author Jimmy Sanford
 *
 * This is just a file for component testing. It should probably be located somewhere else.
 */

Ext.define('Taco.view.catalog.Index', {
    extend: 'Ext.panel.Panel',

    region: 'center',
    padding: 20,

    initComponent: function () {
        this.items = [{
            xtype: 'panel',
            layout: 'fit',
            ui: 'page',
            height: 400,
            width: 400,
            bodyPadding: '20 20 10',
            title: 'Test Bar',
            items: [{
                xtype: 'component',
                html: 'hello world'
            }]
        }];

        this.callParent(arguments);
    }
});
