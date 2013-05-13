/**
 * @class Taco.view.Viewport
 */
Ext.define('Taco.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: ['Taco.core.ContentView'],

    id: 'primaryViewPort',
    layout: { type: 'border' },

    initComponent: function () {
        this.contentView = Ext.create('Taco.core.ContentView', { id: 'contentView', region: 'center' });
        this.header = Ext.create('Taco.view.Header', { region: 'north' });

        this.items = [this.header, this.contentView];
        
        this.callParent(arguments);
    },

    getContentView: function () {
        return this.contentView;
    },

    getHeader: function () {
        return this.header;
    }
});