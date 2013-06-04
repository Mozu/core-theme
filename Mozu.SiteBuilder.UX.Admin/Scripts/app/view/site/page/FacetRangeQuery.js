/**
 * @class Taco.view.site.page.FacetRangeQuery
 */
Ext.define('Taco.view.site.page.FacetRangeQuery', {
    extend: 'Ext.form.FieldContainer',
    xtype: 'taco.rangequery',
    layout: 'hbox',
    getValue: function() {
        return {
            rangeQueryStart: this.startField.getValue(),
            rangeQueryEnd: this.endField.getValue()
        };
    },
    setValue: function(rq) {
        if (!rq) {
            this.startField.setValue(null);
            this.endField.setValue(null);
        } else {
            if (rq.rangeQueryStart !== null) this.startField.setValue(rq.rangeQueryStart)
            if (rq.rangeQueryEnd !== null) this.endField.setValue(rq.rangeQueryEnd)
        }
    },
    getNextField: function() {
        return this.parentQueryGroup.items.filterBy(function (q) { return !q.isHidden(); }).getAt(this.parentQueryGroup.items.indexOf(this) + 1);
    },
    getPreviousField: function () {
        return this.parentQueryGroup.items.filterBy(function (q) { return !q.isHidden(); }).getAt(this.parentQueryGroup.items.indexOf(this) - 1);
    },
    initComponent: function () {
        var me = this;
        me.startField = Ext.widget('textfield', {
            width: 90,
            flex: 0,
            defaultValue: null,
            initComponent: function () {
                if (me.first) this.emptyText = "Below";
                this.callParent(arguments);
                this.on('blur', function () {
                    if (me.first) return;
                    var val = this.getValue();
                    var prevField = me.getPreviousField();
                    if (!prevField) return;
                    var prevVal = prevField.endField.getValue();
                    if ((!prevVal && prevVal !== 0) && prevField.endField.inputEl.dom == document.activeElement) {
                        prevField.endField.setValue(val);
                    }
                }, this, {
                    delay: 200
                });
            }
        });
        me.endField = Ext.widget('textfield', {
            width: 90,
            flex: 0,
            defaultValue: null,
            initComponent: function () {
                if (me.last) this.emptyText = "Above";
                this.callParent(arguments);
                this.on('blur', function () {
                    if (me.last) return;
                    var val = this.getValue();
                    var nextField = me.getNextField();
                    if (!nextField) return;
                    var nextVal = nextField.startField.getValue();
                    if ((!nextVal && nextVal !== 0) && nextField.startField.inputEl.dom == document.activeElement) {
                        nextField.startField.setValue(val);
                    }
                }, this, {
                    delay: 200
                });
            }
        });
        this.items = [
            me.startField,
            {
                html: 'to',
                margin: '0 10px',
                flex: 1
            },
            me.endField
        ];
        this.callParent(arguments);
    }
});