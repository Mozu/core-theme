/**
 * @class Taco.view.site.page.FacetRangeQueryGroup
 */
Ext.define('Taco.view.site.page.FacetRangeQueryGroup', {
    extend: 'Ext.form.FieldContainer',
    layout: 'vbox',
    requires: ['Taco.view.site.page.FacetRangeQuery'],
    xtype: 'taco.rangequerygroup',
    defaultType: 'taco.rangequery',
    mixins: ['Ext.form.field.Field'],
    getValue: function() {
        return this.items.collect(function (rq) {
            return rq.isHidden() ? null : rq.getValue();
        });
    },
    setValue: function(rawRq) {
        this.fireEvent('change', this, rawRq, this.getValue());
        Ext.defer(function () {
            this.items.each(function (rq) {
                if (!rq.isHidden()) rq.setValue(rawRq.shift());
            });
        }, 200, this);
    },

    initComponent: function () {
        this.defaults = { parentQueryGroup: this };
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