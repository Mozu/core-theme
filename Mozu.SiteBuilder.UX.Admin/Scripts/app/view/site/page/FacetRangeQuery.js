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
    getFieldAt: function(relativeIndex) {
        var visibleFields = this.parentQueryGroup.getVisibleFields();
        return visibleFields.getAt(visibleFields.indexOf(this) + relativeIndex);
    },
    initComponent: function () {

        var me = this,
        createTextFieldInit = function (prevOrNext, endOrBegin) {
            return function () {
                this.callParent(arguments);
                this.on('blur', function () {
                    var field = me.getFieldAt(prevOrNext);
                    if (!field) return;
                    field = field[endOrBegin];
                    var prevVal = field.getValue();
                    if ((!prevVal && prevVal !== 0) && field.inputEl.dom === document.activeElement) field.setValue(this.getValue());
                }, this, {
                    delay: 200
                });
            }
        };

        me.startField = Ext.widget('textfield', {
            emptyText: me.startFieldEmptyText,
            width: 90,
            flex: 0,
            defaultValue: null,
            initComponent: createTextFieldInit(-1,'endField')
        });
        me.endField = Ext.widget('textfield', {
            emptyText: me.endFieldEmptyText,
            width: 90,
            flex: 0,
            defaultValue: null,
            initComponent: createTextFieldInit(1, 'startField')
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