/**
 * The Image Group form
 */
Ext.define('Taco.view.product.images.ImageGroupForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.card.Tab',
        'Taco.core.ux.card.Toolbar',
        'Taco.shared.view.field.Image'
    ],
    autoDestroy: true,
    itemId: 'taco-imagegroup-form',
    isCatalogLevel: false,
    categoryCode: null,
    isCreate: false,
    showTitle: false,
    requireDirty: false,

    initComponent: function () {
        var me = this;
        // Note: the record will act as an event bus for the subForms.
        // User interactions in a subform that cause changes in other forms will communicate via events on the record.
        // Each subform will listen for and react to these changes.

        me.sectionNavTopOffset = me.isPopUp ? -12 : 9;
        var product = (me.isGlobal || typeof me.isGlobal === "undefined") ? me.product : me.productInCatalogInfo;

        this.selectOptionValues = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'optionValues',
            grow: true,
            growToLongestValue: false,
            fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.option_values,
            displayField: 'value',
            valueField: 'id',
            value: [],
            layout: 'fit',
            minHeight: 70,
            flex: 1,
            margin: '20 25 0 0',
            store: this.attributes,
            hideTrigger: false,
            triggerOnClick: false,
            forceSelection: false,
            disableKeyFilter: true,
            typeAhead: true,
            disabled: !this.isGlobal,
            allowBlank: false
        });

        if (this.record.data.groupName === 'default') {
            this.selectOptionValues.setDisabled(true);
            this.selectOptionValues.setVisible(false);
        }

        me.groupNameInput = Ext.widget({
            name: 'groupName',
            fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.group_code,
            itemId: 'groupNameField',
            xtype: 'textfield',
            width: '50%',
            margin: '0 0 0 0',
            allowBlank: false,
            minLength: 3,
            maxLength: 50,
            enforceMaxLength: true,
            readOnly: this.record.data.groupName === 'default',
            required: true,
            disabled: !this.isGlobal,
            valueField: 'groupName',
            regex: /^[a-z0-9_\-]+$/i,
            regexText: Localizer.langResources.CATALOG.Products.ProductEdit.invalid_character_msg,
            validator: function(val) {
                if (val.length < 3) {
                    return null;
                }

                if (!me.isCreate) {
                    return true;
                }

                // check if same group code already exists
                if(me.product.data.productImageGroups) {
                    var existingGroup = me.product.data.productImageGroups.find(function(item) {
                        return item.productImageGroupId === val;
                    });
    
                    if (existingGroup) {
                        return Localizer.langResources.CATALOG.Products.ProductEdit.group_code_in_use;
                    }
                }
                
                return true;
            }
        });

        me.imagePicker = Ext.widget({
            fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.Product_Images,
            name: 'imageGroupImages',
            xtype: 'taco.imagefield',
            width: '100%',
            minHeight: 250,
            margin: '20 0 0 15',
            imageMetadata: product.get('productImages')
        });

        var groupImages = product.get('productImages').filter(function(image) {
            return image.productImageGroupId === me.record.data.groupName
        });

        me.imagePicker.setValue(groupImages);

        me.items = [{
            xtype: 'container',
            layout: 'auto',
            overflowY: 'scroll',
            items: [
                {
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        align: 'top'
                    },
                    width: '100%',
                    items: [
                        me.groupNameInput
                    ]
                },
                {
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        align: 'top'
                    },
                    width: '100%',
                    items: [me.selectOptionValues]
                },
                {
                    xtype: 'container',
                    layout: 'fit',
                    width: '100%',
                    items: me.imagePicker
                }
            ]
        }];

        me.callParent(arguments);
    },

    /**
     * Preprocess form before the built in form processing. Persist field values with not matching field name in the record. Reset values no longer applicable based on current state of the form;
     * @private
     */
    beforeSave: function() {
        Ext.Object.merge(this.record.data, this.form.getValues());
        return true;
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});
