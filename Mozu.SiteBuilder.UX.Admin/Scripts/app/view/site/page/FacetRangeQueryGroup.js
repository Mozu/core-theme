/**
 * @class Taco.view.site.page.FacetRangeQueryGroup
 */
Ext.define('Taco.view.site.page.FacetRangeQueryGroup', {
    extend: 'Ext.form.FieldContainer',
    layout: 'vbox',
    requires: ['Taco.view.site.page.FacetRangeQuery'],
    xtype: 'taco.rangequerygroup',
    defaultType: 'taco.rangequery',

    initComponent: function () {
        this.callParent(arguments);
        var itemsToShowOrHide = this.items.getRange(2, 5); // the four middle ones.
        this.on('select', function (numRanges) {
            var val = numRanges.getValue() - 3;
            Ext.Array.forEach(itemsToShowOrHide, function (item, index) {
                item[val - index < 1 ? 'hide' : 'show']();
            });
        });
    },
    items: [
        {first: true},
        {},
        {},
        {},
        {},
        {},
        {last: true}
    ]
});