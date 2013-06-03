/**
 * @class Taco.view.site.page.FacetRangeQuery
 */
Ext.define('Taco.view.site.page.FacetRangeQuery', {
    extend: 'Ext.form.FieldContainer',
    xtype: 'taco.rangequery',
    layout: 'hbox',

    initComponent: function () {
        var me = this;
        this.items = [
            {
                xtype: 'textfield',
                width: 60,
                flex: 0,
                initComponent: function() {
                    if (me.first) this.emptyText = "Below"; 
                    this.callParent(arguments);
                }
            }, {
                html: 'to',
                margin: '0 10px',
                flex: 1
            },
            {
                xtype: 'textfield',
                width: 60,
                flex: 0,
                initComponent: function() {
                    if (me.last) this.emptyText = "Above"; 
                    this.callParent(arguments);
                }
            }
        ];
        this.callParent(arguments);
    }
});