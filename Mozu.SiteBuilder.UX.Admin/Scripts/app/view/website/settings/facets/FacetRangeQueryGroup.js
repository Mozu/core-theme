/**
 * @class Taco.view.website.settings.facets.FacetRangeQueryGroup
 */
Ext.define('Taco.view.website.settings.facets.FacetRangeQueryGroup', {
    extend: 'Ext.form.FieldContainer',
    layout: 'vbox',
    requires: ['Taco.view.website.settings.facets.FacetRangeQuery'],
    xtype: 'taco.rangequerygroup',
    defaultType: 'taco.rangequery',
    mixins: ['Ext.form.field.Field'],

    isDescending: function(rqs) {
        return false;
    },

    isAscending: function(rqs) {
        rqs = rqs || this.getValue(),
        allNull = true,
        isAsc = Ext.Array.every(rqs, function(rq, ix) {
            if (rq.start === null && rq.end === null) return true;
            allNull = false;
            var nextrq = rqs[ix+1], prevrq = rqs[ix-1];
            if (!nextrq) return rq.end === null || rq.start < rq.end;
            if (!prevrq) return rq.start === null || rq.start < rq.end;
            return rq.start < rq.end && rq.end <= nextrq.start;
        });
        return !allNull && isAsc;
    },

    isValid: function() {
        var rqs = this.getValue(),
            lastIndex = rqs.length - 1;
        return Ext.Array.every(rqs, function (rq, ix) {
            return (ix === 0 || !isNaN(rq.start))
                && (ix === lastIndex || !isNaN(rq.end));
        }) && (this.isDescending(rqs) || this.isAscending(rqs))
    },

    getValue: function() {
        var ret = [];
        this.getVisibleFields().each(function (rq, i) {
            ret[i] = rq.getValue();
        });
        return Ext.Array.clean(ret);
    },
    setValue: function(rawRq) {
        var rqList;
        if (!rawRq || !('length' in rawRq)) return;
        rqList = Ext.clone(rawRq);
        if (rqList.length !== this.numRanges) this.setNumRanges(rqList.length);
        this.items.each(function (rq) {
            if (!rq.isHidden()) {
                rq.setValue(rqList.shift());
                rq.resetOriginalValue();
            }
        });
        this.fireEvent('change', this, rqList, this.getValue());
    },

    setNumRanges: function (numRanges) {
        var val = (numRanges && numRanges > 2 && numRanges < 8 ? numRanges : 5) - 3;
        Ext.Array.forEach(this.itemsToShowOrHide, function (item, index) {
            item[val - index < 1 ? 'hide' : 'show']();
        });
        this.numRanges = numRanges;
        this.fireEvent('heightchange');
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
        this.on({
            'select': function (numRangesPicker) {
                var newNum = numRangesPicker.getValue();
                if (newNum != this.numRanges)
                    this.setNumRanges(newNum);
            },
            //'change': function () {
            //    if (this.isDescending()) {
            //        this.firstField.setEmptyText("startField", "Above");
            //        this.lastField.setEmptyText("endField", "Below");
            //    } else {
            //        this.firstField.setEmptyText("startField", "Below");
            //        this.lastField.setEmptyText("endField", "Above");
            //    }
            //},
            scope: this
        });
        this.items.each(function (item) {
            me.relayEvents(item, ['change']);
        });
        this.enableBubble('heightchange');
        this.firstField = this.items.first();
        this.lastField = this.items.last();
        this.firstField.setEmptyText("startField", "Below");
        this.lastField.setEmptyText("endField", "Above");
    },
    items: [
        {},
        {},
        {hidden: true},
        {hidden: true},
        {},
        {},
        {}
    ]
});