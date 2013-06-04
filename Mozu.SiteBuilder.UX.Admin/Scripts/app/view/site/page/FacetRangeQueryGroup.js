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
        var ret = [];
        this.getVisibleFields().each(function (rq, i) {
            ret[i] = rq.getValue();
        });
        return ret;
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

    getVisibleFields: function() {
        return this.items.filterBy(function(q) { return !q.isHidden(); });
    },

    initComponent: function () {
        var me = this;
        this.defaults = { parentQueryGroup: this };
        this.callParent(arguments);
        this.numRanges = 5;
        this.itemsToShowOrHide = this.items.getRange(2, 5); // the four middle ones.
        this.on('select', function (numRangesPicker) {
            var newNum = numRangesPicker.getValue();
            if (newNum != this.numRanges)
                this.setNumRanges(newNum);
        }, this);
        this.items.each(function(i) {
            me.relayEvents(i, ['change']);
        });
    },
    items: [
        {startFieldEmptyText: 'Below', isEnd: true},
        {},
        {hidden: true},
        {hidden: true},
        {},
        {},
        {endFieldEmptyText: 'Above', isEnd: true}
    ]
});