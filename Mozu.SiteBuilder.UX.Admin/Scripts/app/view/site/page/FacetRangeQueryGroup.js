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
        if (!rawRq || !(length in rawRq)) return;
        if (rawRq.length !== this.numRanges) this.setNumRanges(rawRq.length);
        this.items.each(function (rq) {
            if (!rq.isHidden()) rq.setValue(rawRq.shift());
        });
        this.fireEvent('change', this, rawRq, this.getValue());
    },

    setNumRanges: function (numRanges) {
        var val = (numRanges && numRanges > 2 && numRanges < 8 ? numRanges : 5) - 3;
        Ext.Array.forEach(this.itemsToShowOrHide, function (item, index) {
            item[val - index < 1 ? 'hide' : 'show']();
        });
        this.numRanges = numRanges;
    },

    initComponent: function () {
        this.defaults = { parentQueryGroup: this };
        this.callParent(arguments);
        this.numRanges = 5;
        this.itemsToShowOrHide = this.items.getRange(2, 5); // the four middle ones.
        this.on('select', function (numRangesPicker) {
            var newNum = numRangesPicker.getValue();
            if (newNum != this.numRanges)
                this.setNumRanges(newNum);
        }, this);
    },
    items: [
        {first: true},
        {},
        {hidden: true},
        {hidden: true},
        {},
        {},
        {last: true}
    ]
});