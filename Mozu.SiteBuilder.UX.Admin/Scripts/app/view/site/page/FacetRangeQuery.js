/**
 * @class Taco.view.site.page.FacetRangeQuery
 */
Ext.define('Taco.view.site.page.FacetRangeQuery', {
    extend: 'Ext.form.FieldContainer',
    xtype: 'taco.rangequery',
    layout: 'hbox',
    resetOriginalValue: function() {
        this.startField.resetOriginalValue();
        this.endField.resetOriginalValue();
    },
    getValue: function() {
        var rqS = parseInt(this.startField.getValue()),
            rqE = parseInt(this.endField.getValue());
        if (isNaN(rqS) && isNaN(rqE)) return null;
        if (isNaN(rqS)) rqS = null;
        if (isNaN(rqE)) rqE = null;
        return {
            start: rqS,
            end: rqE
        };
    },
    setValue: function(rq) {
        if (!rq) {
            this.startField.setValue(null);
            this.endField.setValue(null);
        } else {
            rq.start = parseInt(rq.start);
            if (isNaN(rq.start)) rq.start = null;
            rq.end = parseInt(rq.end);
            if (isNaN(rq.end)) rq.end = null;
            this.startField.setValue(rq.start);
            this.endField.setValue(rq.end);
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
            width: 91,
            flex: 0,
            defaultValue: null,
            vtype: 'nullableint',
            initComponent: createTextFieldInit(-1,'endField')
        });
        me.endField = Ext.widget('textfield', {
            emptyText: me.endFieldEmptyText,
            width: 91,
            flex: 0,
            defaultValue: null,
            vtype: 'nullableint',
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
        this.relayEvents(this.startField, ['change']);
        this.relayEvents(this.endField, ['change']);
    }
});