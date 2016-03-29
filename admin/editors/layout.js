Ext.widget({
    xtype: 'mz-form-widget',
    itemId: 'layoutRuleForm',

    defaults: {
        xtype: 'combobox',
        editable: false,
        listeners: {
            change: function (cmp) {
               // cmp.up('#layoutRuleForm').updatePreview();
            }
        }
    },
    data: this.ownerCt.widgetData,
    initComponent: function() {
        this.items = [];

        this.superclass.initComponent.apply(this, arguments);
    },

    listeners: {
        afterrender: function (cmp) {
            // cmp.updatePreview();
        },

        boxready: function(cmp) {

            var widgetData = cmp.up('#widgetEditor').widgetData,
                isChecked,
                counter = 1,
                checkboxes = [],
                me = this;

            this.total = 100;

            cmp.add({
                name: 'title',
                xtype: 'textfield',
                fieldLabel: 'Title',
                value: widgetData.title,
                margin: '0 0 0 27',
                width: 700
            });

            Object.keys(widgetData).forEach(function(key) {

                if (key !== 'title') {

                    isChecked = counter === Object.keys(widgetData).length - 1;

                    checkboxes.push('layoutCheckBox'  + counter);

                    cmp.add({
                        xtype: 'radiogroup',
                        layout: 'hbox',
                        items: [
                            {
                                xtype: 'radio',
                                margin: '25 20',
                                checked: isChecked,
                                cls: 'taco-lock-radios',
                                itemId: 'layoutCheckBox' + counter,
                                name: 'mz-layout-radiofield',
                                submitValue: false,
                                listeners: {
                                    change: me.onRadioChange.bind(me)
                                }
                            },
                            {
                                name: 'mz-col' + counter,
                                xtype: 'numberfield',
                                fieldLabel: 'Column ' + counter,
                                value: widgetData[key],
                                itemId: 'layoutWidthValue' + counter,
                                listeners: {
                                    blur: me.onWidthValueChange.bind(me)
                                },
                                width: 700
                            }
                        ]
                    });

                    counter++;
                }
            });

            this.styleModal.call(this);
        }
    },

    styleModal: function() {
        var modal = this.up('taco-window');
        modal.setTitle('Mozu Layout Editor');
        modal.on('beforesave', this.beforeSave, this);
        modal.setWidth(100);
    },

    beforeSave: function() {

    },

    onRadioChange: function(cmp) {
        var containers = this.items.filterBy(function(cmp) { return cmp.xtype === 'radiogroup';}),
            buttonArr = [];

        containers.each(function(group){
            var button =  group.down('radio');
            button.suspendEvents(false);
            button.setValue(false);
            buttonArr.push(button);
        });

        cmp.setValue(true);

        buttonArr.forEach(function(btn){
            btn.resumeEvents();
        });
    },

    onWidthValueChange: function(cmp, value) {
        
        if (parseInt(cmp.getValue(), 10) < 10) {
            cmp.setValue(10);
        }

        var numberField = this.getAssociatedNumberField(),
            formValues = cmp.up('form').getValues(),
            newTotal,
            currentTotal = 0;

        Object.keys(formValues).forEach(function(key){
            if (parseInt(formValues[key], 10)) {
                currentTotal+= formValues[key];
            }
        });

        newTotal = numberField.getValue() + 100 - currentTotal;

        if (newTotal < 0 || newTotal > 100) {
            cmp.setValue(parseInt(cmp.originalValue, 10));
            return false;
        }

        numberField.setValue(numberField.getValue() + 100 - currentTotal);
    },

    getAssociatedNumberField: function() {
        var containers = this.items.filterBy(function(cmp) { return cmp.xtype === 'radiogroup';}),
            checked = containers.filterBy(function(cmp){ return cmp.items.items[0] && cmp.items.items[0].checked;});

        // return checked;
        return checked.items[0].items.items[1];
    }


});