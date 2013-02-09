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

    initComponent: function () {
        var checkboxes = [];

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
            checkboxes.push({
                id: id,
                boxLabel: this.displayTpl.apply(record),
                checked: Ext.Array.contains(this.checkedItems, id),
                data: record
            });
        }, this);

        this.checkboxGroup = Ext.widget({
            xtype: 'checkboxgroup',
            columns: 1,
            vertical: true
        });

        this.items = [this.checkboxGroup];

        this.callParent(arguments);
    },

    show: function () {
        this.getEl().addCls('list-open');
        this.callParent(arguments);
    },

    hide: function () {
        this.getEl().removeCls('list-open');
        this.callParent(arguments);
    },

    toggle: function () {
        if (this.isHidden()) {
            this.show();
        } else {
            this.hide();
        }
    }
});