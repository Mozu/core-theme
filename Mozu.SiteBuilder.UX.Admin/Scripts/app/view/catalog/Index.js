/**
 * @class Taco.view.catalog.Index
 * @author Jimmy Sanford
 *
 * This is just a file for component testing. It should probably be located somewhere else.
 */

Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [],

    header: {
        title: 'Component Testing'
    },

    initComponent: function () {
        var store, items;

        store = Ext.create('Ext.data.ArrayStore', {
            fields: [
                { name: 'item', type: 'string' },
                { name: 'isMeal', type: 'boolean' },
                { name: 'price', type: 'number' },
                { name: 'size', type: 'string' }
            ],
            data: [
                ['Big Mac', true, 3.99],
                ['Chicken McNuggets, 20 pieces', false, 5],
                ['Chocolate Shake, large', false, 2.89, 'large'],
                ['French Fries, small', false, 0.99, 'small']
            ]
        });

        items = [{
            xtype: 'container',
            layout: 'hbox',
            items: [{
                xtype: 'textfield',
                itemId: 'textFilter',
                margin: '0 10 20 0',
                width: 400,
                listeners: {
                    specialkey: {
                        scope: this,
                        fn: this.handleFieldSubmit
                    }
                }
            }, {
                xtype: 'button',
                itemId: 'advancedFilter',
                ui: 'action',
                scale: 'medium',
                glyph: 'XE010@mozicons',
                width: 57,
                enableToggle: true,
                scope: this,
                toggleHandler: this.handleButtonToggle
            }]
        }, {
            xtype: 'dataview',
            itemId: 'list',
            store: store,
            itemSelector: 'li.mcds',
            height: 400,
            width: 400,
            tpl: '<tpl for="."><li class="mcds">{item} {price:usMoney} {isMeal} {size}</li></tpl>'
        }];

        Ext.apply(this.body, {
            cls: Taco.baseCSSPrefix + 'catalog',
            layout: 'auto',
            items: items
        });

        this.callParent(arguments);
    },

    /**
     * Send a filter request to the server.
     * @param  {Object} value An object containing field keys and values.
     */
    doFilter: function (value) {
        console.log(value);
    },

    /**
     * Instantiate and return the advanced filters form, which will be inserted into the dialog.
     * @template
     * @return {Ext.form.Panel} The instantiated form.
     */
    getAdvancedForm: function () {
        var sizes;

        sizes = Ext.create('Ext.data.ArrayStore', {
            fields: [
                { name: 'id', type: 'string' },
                { name: 'name', type: 'string' }
            ],
            data: [
                ['S', 'Small'],
                ['M', 'Medium'],
                ['L', 'Large']
            ]
        });

        return Ext.create('Taco.core.ux.form.Form', {
            items: [{
                xtype: 'textfield',
                name: 'item',
                fieldLabel: 'Item'
            }, {
                xtype: 'checkbox',
                name: 'isMeal',
                fieldLabel: 'Other Filters',
                boxLabel: 'Limit search to value meals'
            }, {
                xtype: 'combobox',
                name: 'size',
                fieldLabel: 'Size',
                valueField: 'id',
                displayField: 'name',
                queryMode: 'local',
                valueNotFoundText: 'not found',
                editable: false,
                forceSelection: true,
                store: sizes
            }, {
                xtype: 'fieldcontainer',
                fieldLabel: 'Price Range',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [{
                    xtype: 'numberfield',
                    name: 'minPrice',
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false,
                    width: 200
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '0 10'
                }, {
                    xtype: 'numberfield',
                    name: 'maxPrice',
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false,
                    width: 200
                }]
            }]
        });
    },

    /**
     * Respond to the advanced filters button by opening or closing a dialog containing a form.
     * This method will also instantiate the dialog, if necessary.
     * @param  {Ext.button.Button} button The button.
     * @param  {Boolean} state The next state of the button; true means pressed.
     */
    handleButtonToggle: function (button, state) {
        if (state) {
            if (!this.modal) {
                this.modal = Ext.create('Taco.core.ux.window.Modal', {
                    title: 'Advanced Filter',
                    primaryText: 'Filter',
                    ui: 'dialog',
                    modal: false,
                    items: this.getAdvancedForm(),
                    listeners: {
                        show: {
                            scope: this,
                            fn: 'handleDialogShow'
                        },
                        close: {
                            scope: this,
                            fn: 'handleDialogClose'
                        },
                        save: {
                            scope: this,
                            fn: 'handleDialogSave'
                        }
                    }
                });
            }

            this.modal.showBy(this.down('#textFilter'), 'tl-bl?', [0, 10]);
        } else {
            if (this.modal) {
                this.modal.close();
            }
        }
    },

    /**
     * Respond to the closing of the dialog, regardless of what action triggered the close.
     * This method is responsible for depressing the advanced filters button.
     * @param  {Taco.core.ux.window.Modal} dialog The dialog that fired the event.
     */
    handleDialogClose: function (dialog) {
        this.down('#advancedFilter').toggle(false);
    },

    /**
     * Respond to a `save` event fired by the dialog.
     * This method triggers an update to the value of the textfield filter, then triggers a filter
     * request to the server.
     * @param  {Taco.core.ux.window.Modal} dialog The dialog that fired the event.
     */
    handleDialogSave: function (dialog) {
        var simple = this.down('#textFilter'),
            complexValue = dialog.getForm().getForm().getValues();

        this.setTextFilterValue(simple, complexValue);

        this.doFilter(complexValue);
    },

    /**
     * Respond to the opening of the dialog.
     * This method triggers an update to the values of the dialog's form fields.
     * @param  {Taco.core.ux.window.Modal} dialog The dialog that fired the event.
     * @return {[type]}        [description]
     */
    handleDialogShow: function (dialog) {
        var simple = this.down('#textFilter'),
            complexValue = this.parseTextFilterValue(simple);

        this.setAdvancedFilterValues(complexValue);
    },

    /**
     * Respond to an attempt to submit the textfield filter.
     * This method triggers a filter request to the server.
     * @param  {Ext.form.field.Text} field The textfield filter.
     * @param  {Event} e The specialkey event.
     */
    handleFieldSubmit: function (field, e) {
        var complexValue;

        if (e.getKey() === e.ENTER) {
            complexValue = this.parseTextFilterValue(field);

            if (this.modal) {
                this.modal.close();
            }

            this.doFilter(complexValue);
        }
    },

    /**
     * Transform filter data from the textfield filter's raw value, which is a string, into an object.
     * @param  {Ext.form.field.Text} field The textfield with string data.
     * @return {Object} The object containing field keys and values.
     */
    parseTextFilterValue: function (field) {
        var value = field.getValue(),
            values,
            pairs,
            lastKey;

        if (!Ext.isEmpty(value)) {
            pairs = {};
            values = value.split(' ');

            Ext.Array.each(values, function (item, index, all) {
                var colonIndex = item.indexOf(':'),
                    key, val;

                if (colonIndex !== -1) {
                    key = Ext.String.createVarName(item.substr(0, colonIndex));
                    val = item.substr(colonIndex + 1);
                    lastKey = key;

                    pairs[key] = val;
                } else {
                    if (!Ext.isEmpty(lastKey)) {
                        pairs[lastKey] = Ext.String.trim([pairs[lastKey], item].join(' '));
                    }
                }
            }, this);
        }

        return pairs || {};
    },

    /**
     * Set the values in the advanced filters dialog's form fields.
     * @param {Object} values The object containing field keys and values.
     */
    setAdvancedFilterValues: function (values) {
        var form,
            comboFields;

        if (this.modal) {
            form = this.modal.getForm();
            comboFields = form.query('combo');

            form.getForm().setValues(values);

            if (!Ext.isEmpty(comboFields)) {
                Ext.Array.each(comboFields, function (field) {
                    var potentialValue = values[field.getName()],
                        value = field.getStore().findRecord(field.displayField, potentialValue, 0, false, false, false);

                    field.setValue(value);
                }, this);
            }
        }
    },

    /**
     * Set the value of the textfield filter.
     * @param {Ext.form.field.Text} field The textfield filter.
     * @param {Object} values The object containing field keys and values.
     */
    setTextFilterValue: function (field, values) {
        var simpleValue = [];

        Ext.Object.each(values, function (key, value) {
            if (!Ext.isEmpty(value)) {
                simpleValue.push([key, value].join(':'));
            }
        }, this);

        field.setValue(Ext.String.trim(simpleValue.join(' ')));
    }
});
