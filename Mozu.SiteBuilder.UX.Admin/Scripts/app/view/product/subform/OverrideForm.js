/**
 * @class Taco.view.product.subform.OverrideForm
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.OverrideForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.modal.Confirmation',
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

        this.formContainer = Ext.widget({
            xtype: 'container',
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
                cls: Taco.baseCSSPrefix + 'override-checkbox',
                scope: this,
                checked: this.isOverridden,
                handler: function (checkbox, isChecked) {
                    var overrideForm = this;
                    if( checkbox.allowModal ) {
                        Ext.create('Taco.core.ux.modal.Confirmation', {
                            autoShow: true,
                            text: isChecked ? '<h3 style="font-size: 20px">Override Global Values</h3><p style="margin: 1pc 0">You are about to override this section, are you sure you want to do that?</p>'
                                            : '<h3 style="font-size: 20px">Remove Global Override</h3><p style="margin: 1pc 0">You are about to remove the global override for this section, are you sure you want to do that?</p>',
                            listeners: {
                                // *** If confirmed, enable/disable the underlying OverrideForm
                                confirm: function () {
                                    overrideForm.setOverride(isChecked, true, checkbox);
                                },

                                // *** If cancelled, restore checkbox to previous stateOrProvince
                                cancel: function () {
                                    checkbox.allowModal = false;
                                    checkbox.setValue( !isChecked );
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