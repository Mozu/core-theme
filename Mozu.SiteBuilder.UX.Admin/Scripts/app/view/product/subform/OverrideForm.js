/**
 * @class Taco.view.product.subform.OverrideForm
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.OverrideForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [        
        'Ext.container.Container',
        'Ext.form.field.Checkbox'
    ],
    alias: 'widget.productoverride',

    componentCls: Taco.baseCSSPrefix + 'override-form',
    bodyStyle: {
        overflow: 'visible'
    },
    header: false, // *** Prevents header of parent form from being automatically generated
    allowModal: false, // *** Toggles whether a modal can be created; used for unchecking an "Override global" box programmatically without triggering the modal

    width: '100%',
    overrideFieldName: '',
    persistChangesToModel: true,
    overrideChangeDisabled: false,
    /**
     * @cfg
     */
    hideOverride: false,

    initComponent: function () {

        // *** Extend the defaults with any configured in; otherwise, use the presets defined in the target object
        // *** NOTE: this.defaults is passed on to the subitems for convenience.
        this.defaults = Ext.apply({
            xtype: 'textfield',
            labelAlign: 'top',
            labelSeparator: '',
            width: '100%'
        }, this.defaults || {});

        // *** 'subitems' are items of child Containerthis.product.on
        this.subitems = this.items;

        this.isOverridden = this.productInCatalogInfo && this.productInCatalogInfo.get(this.overrideFieldName);

        if (this.productInCatalogInfo) {
            if ( (this.overrideFieldName == 'isContentOverridden' || this.overrideFieldName=='isSEOContentOverridden')&&
                this.productInCatalogInfo.getCatalog().localeCode != this.product.getMasterCatalog().localeCode) {
                this.isOverridden = true;
                this.overrideChangeDisabled = true;
            }
            else  if ( this.overrideFieldName == 'isPriceOverridden'&&
                this.productInCatalogInfo.getCatalog().currencyCode != this.product.getMasterCatalog().currencyCode) {
                this.isOverridden = true;
                this.overrideChangeDisabled = true;
            } 


        }

        this.formContainer = Ext.widget({
            xtype: 'container',
            cls: Taco.baseCSSPrefix + 'override-form-inner',
            width: "100%",
            items: this.subitems,
            defaults: this.defaults
        });

        this.items = [
            {
                xtype: 'checkbox',
                width: 'auto',
                boxLabel: 'Override global',
                labelAlign: 'right',
                allowModal: true,
                disabled: this.overrideChangeDisabled,
                cls: Taco.baseCSSPrefix + 'override-checkbox',
                scope: this,
                checked: this.isOverridden,
                handler: function (checkbox, isChecked) {
                    var overrideForm = this;
                    if (checkbox.allowModal) {

                        
                        var title = isChecked ? 'Override Global Values' : 'Remove Global Override',
                            msg = isChecked ? 'You are about to override this section, are you sure you want to do that?' : 'You are about to remove the global override for this section, are you sure you want to do that?';

                        Ext.MessageBox.show({
                            title: title,
                            // pushes the buttons to the right to be consistant with our dialog ux.
                            rightJustifyButtons: true,
                            // reverses the order of the buttons
                            reverseOrder: true,
                            msg: msg,
                            closable: false,
                            buttons: Ext.Msg.YESNO,
                            fn: function (val) {
                                if (val === 'yes') {                                    
                                    overrideForm.setOverride(isChecked, true, checkbox);
                                } else {                                    
                                    checkbox.allowModal = false;
                                    checkbox.setValue(!isChecked);
                                    checkbox.allowModal = true;
                                }
                            }
                        });
                    }
                }
            },
            this.formContainer
        ];

        this.enableBubble('overrideChange');

        this.callParent(arguments);

        if (this.productInCatalogInfo && !this.hideOverride) {
            // *** SiteForm Multisite Mode
            this.addCls('active');
            this.setOverride(this.isOverridden, false );

            this.mon(this.product, {
                afteredit: this.onProductChange,
                scope: this
            });
        
        }
        else if (this.isOverridden) {
            this.setOverride(this.isOverridden, false);
        } else {
            // *** GlobalForm and SiteForm Single Site Mode
            this.record = this.product;
            this.loadForm();
        } 
    },

    onProductChange: function ( record, modifiedFieldNames ) {
        // Check to see if global product record is being used on the form
        if (record !== this.record) {
            return;
        }

        this.loadForm();
    },

    /**
     * @override Ext.container.Container.disable
     *
     * Call disable method of child container to prevent checkbox of OverrideForm from being disabled.
     */
    disable: function ( silently ) {
        this.formContainer.disable( silently );
    },

    /**
     * @override Ext.container.Container.enable
     *
     * Call enable method of child container, since OverrideForm should not be disabled in any circumstance.
     */
    enable: function ( silently ) {
        this.formContainer.enable( silently );
    },

    setOverride: function (val, shouldCopy, overrideCheckbox) {
        var overrideCountDelta;
        this.productInCatalogInfo.set( this.overrideFieldName, val );
        
        if (val) {
            this.record = this.productInCatalogInfo;
            if (shouldCopy) {
                this.getForm().getFields().each(
                    function (field) {
                        this.productInCatalogInfo.set( field.name, this.product.get(field.name) );
                    },
                    this
                );
            }

            overrideCountDelta = 1;
            this.enable();
        } else {
            this.record = this.product;
            overrideCountDelta = -1;
            this.disable();
        }

        this.fireEvent('overrideChange', overrideCountDelta);

        if( overrideCheckbox ) {
            // *** The loadForm() call triggers the checkbox handler function (which spawns a modal) unless disabled here
            overrideCheckbox.allowModal = false;

            this.loadForm();

            // *** When the form loads, it can unset the value of the override checkbox
            overrideCheckbox.setValue(val ? true : false);

            overrideCheckbox.allowModal = true;
        } else {
            this.loadForm();
        }
    },

    addSaveTasks: function (tasks) {
        return this.callParent(arguments);
    }
});