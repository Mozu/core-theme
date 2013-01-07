/**
* @class Taco.core.ux.form.TextFieldColumn
* @author James Zetlen
* Provides a column with a permanent text field in it. By default the field is read-only, but with Taco.core.CellEditing it becomes
* editable, using tricks of the light.
* @extends Ext.grid.column.Column
* @xtype textfieldcolumn
*/



    var typeconfig = {
        "text": {
            vtype: 'alphanum'
        },
        "number": {
            vtype: 'num',
            maskRe: /\d/,
            inputType: 'number'
        },
        "currency": {
            vtype: 'currency',
            maskRe: /\d|\./
        }
    }

Ext.define('Taco.core.ux.form.TextFieldColumn', {
    extend: 'Ext.grid.column.Column',
    alias: 'widget.textfieldcolumn',

    tdCls: Ext.baseCSSPrefix + 'grid-cell-textfieldcolumn',

    initComponent: function () {
        var preprocess = this.preprocess,
            cls = this.defaultCls,
            inputType = this.inputType;

        this.inputType = "text";

        switch (this.type) {
            case 'number':
                inputType = this.type;
                break;
            case 'currency':
                preprocess = this.formatCurrency;
                cls = this.defaultCls += ' ' + Ext.baseCSSPrefix + 'form-currency';
        }

        this.renderer = function (value) {
            value = preprocess(value);
            return Ext.String.format('<input readonly="readonly" type="{2}" class="{1}" value="{0}">', value, cls, inputType);
        };

        this.editor = Ext.Object.merge({

        },typeconfig[this.type]);

        this.callParent(arguments);

    },

    inputType: 'text',

    defaultCls: Ext.String.format('{0}form-field {0}form-text', Ext.baseCSSPrefix),

    // the default preprocessor does nothing, but it may be overridden in config
    preprocess: function (value) {
        return value;
    },

    formatCurrency: function (value) {
        return Ext.util.Format.usMoney(value).replace('$', '');
    }

});

