/**
 * @class Taco.view.website.settings.facets.FacetRangeQuery
 */
Ext.define('Taco.view.website.settings.facets.FacetRangeQuery', {
    extend: 'Ext.form.FieldContainer',
    xtype: 'taco.rangequery',
    layout: 'hbox',
    resetOriginalValue: function() {
        this.startField.resetOriginalValue();
        this.endField.resetOriginalValue();
    },
    setEmptyText: function (field, newText) {
        this[field].emptyText = newText;
        if (this[field].inputEl) {
            this[field].inputEl.set({ 'placeholder': newText });
            if (document.activeElement !== this[field].inputEl.dom) this[field].blur();
        }
    },
    getValue: function () {
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
                xtype: 'label',
                text: 'to',
                margin: '8px 10px',
                flex: 1
            },
            me.endField
        ];
        this.callParent(arguments);
        this.relayEvents(this.startField, ['change']);
        this.relayEvents(this.endField, ['change']);
    }
});