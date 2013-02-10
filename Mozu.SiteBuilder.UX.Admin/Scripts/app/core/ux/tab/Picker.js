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
    componentCls: Taco.baseCSSPrefix + 'available-site-list',
    floating: true,
    shadow: false,
    idTpl: '{id}',
    displayTpl: '{name}',
    hidden: true,

    initComponent: function () {
        this.checkboxes = [];

        this.addEvents([
            /**
             * @event selectionchange
             */
            'selectionchange'
        ]);

        this.idTpl = new Ext.Template(this.idTpl);
        this.displayTpl = new Ext.Template(this.displayTpl);

        Ext.each(this.data, function (record) {
            var id = this.idTpl.apply(record);
            this.checkboxes.push({
                id: id,
                boxLabel: this.displayTpl.apply(record),
                checked: Ext.Array.contains(this.checkedItems, id),
                data: record
            });
        }, this);

        this.checkboxGroup = Ext.widget({
            xtype: 'checkboxgroup',
            columns: 1,
            vertical: true,
            items: this.checkboxes
        });

        this.items = [this.checkboxGroup];

        this.callParent(arguments);
    },

    getCheckedRecords: function () {
        return Ext.Array.pluck(this.checkboxGroup.getChecked(), 'data');
    },

    show: function () {
        this.currentItems = this.getCheckedRecords()
        this.getEl().addCls('list-open');
        this.callParent(arguments);
    },

    hide: function () {
        this.getEl().removeCls('list-open');
        this.callParent(arguments);
        this.fireEvent('selectionchange', this, this.getCheckedRecords(), this.currentItems);
    },

    toggle: function () {
        if (this.isHidden()) {
            this.show();
        } else {
            this.hide();
        }
    }
});