/**
 * @class  Taco.core.ux.tab.Picker
 * @author Travis Johnson
 */

Ext.define('Taco.core.ux.tab.Picker', {
    extend: 'Ext.container.Container',
    requires: [
        'Ext.form.field.Checkbox',
        'Ext.form.CheckboxGroup'
    ],
    componentCls: Taco.baseCSSPrefix + 'tab-picker',
    floating: true,
    shadow: false,
    idTpl: '{id}',
    displayTpl: '{name}',
    hidden: true,
    alignment: 'tr-br?',
    alignmentOffsets: [-1, -1],

    initComponent: function () {
        var me = this;
        this.addEvents([
            /**
             * @event selectionchange
             */
            'selectionchange'
        ]);

        this.idTpl = new Ext.Template(this.idTpl);
        this.displayTpl = new Ext.Template(this.displayTpl);

        this.checkboxGroup = Ext.widget({
            xtype: 'checkboxgroup',
            columns: 1,
            vertical: true,
            listeners: {
                change: {
                    scope: me,
                    fn: function() {
                        me.checkForChanges();
                    }
                }
            }
        });

        this.items = [this.checkboxGroup];

        this.callParent(arguments);

        this.buildCheckBoxes();
    },

    buildCheckBoxes: function (checkedItems) {
        var checkboxes = []; 

        if (!checkedItems) {
            checkedItems = this.checkedItems;
        }

        Ext.suspendLayouts();
        
        this.checkboxGroup.removeAll();

        Ext.each(this.data, function (record) {
            var recordId = this.idTpl.apply(record);
            var isChecked = Ext.Array.contains(checkedItems, recordId);
            var cb = Ext.widget({
                xtype: 'checkbox',
                value: isChecked,
                boxLabel: this.displayTpl.apply(record),  
                data: record
            });
            checkboxes.push(cb);
        }, this);

        this.checkboxGroup.add(checkboxes);

        Ext.resumeLayouts();
    },

    getCheckedRecords: function () {
        return Ext.Array.pluck(this.checkboxGroup.getChecked(), 'data');
    },

    show: function () {
        var el = this.el || this.protoEl;
        el.addCls('list-open');
        this.currentItems = this.getCheckedRecords();
        this.callParent(arguments);

        this.alignTo(this.positionNextTo.getEl(), this.alignment, this.alignmentOffsets);
    },

    hide: function () {
        this.getEl().removeCls('list-open');
        this.callParent(arguments);
    },

    checkForChanges: function () {
        var newValues = this.getCheckedRecords(),
            oldValues = this.currentItems,
            noChange = true;

        if (newValues.length === oldValues.length) {
            Ext.each(newValues, function (newValue, index) {
                if (newValue !== oldValues[index]) {
                    noChange = false;
                    return false;
                }
            });
        } else {
            noChange = false;
        }

        if (noChange) {
            return;
        }

        this.fireEvent('selectionchange', this, newValues, oldValues);
    },

    toggle: function () {
        if (this.isHidden()) {
            this.show();
        } else {
            this.hide();
        }
    }
});