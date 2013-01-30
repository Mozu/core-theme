/**
 * @class Taco.view.product.subform.OverrideContainer
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.OverrideForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Ext.form.field.Checkbox'
    ],
    alias: 'widget.productoverride',

    componentCls: Taco.baseCSSPrefix + 'override-form',
    header: false,

    width: '100%',
    overrideFieldName: '',

    initComponent: function () {

        // *** Extend the defaults with any configured in; otherwise, use the presets defined in the target object
        // *** NOTE: this.defaults is passed on to the subitems for convenience.
        this.defaults = Ext.apply({
            xtype: 'textfield',
            labelAlign: 'top',
            labelSeparator: '',
            width: '100%'
        }, this.defaults || {});

        // *** 'subitems' are items of child Container
        this.subitems = this.items;

        this.formContainer = Ext.widget({
            xtype: 'container',
            width: "100%",
            items: this.subitems,
            defaults: this.defaults
        });

        this.items = [{
            xtype: 'checkbox',
            width: 'auto',
            boxLabel: 'Override global',
            labelAlign: 'right',
            cls: Taco.baseCSSPrefix + 'override-checkbox',
            handler: function (checkbox, isChecked) {
                this.setOverride(isChecked, true);
            },
            scope: this
        }, this.formContainer];

        this.callParent(arguments);

        if (this.productInSiteInfo) {
            // site form
            this.addCls('active');
            this.setOverride(this.productInSiteInfo.get(this.overrideFieldName), false);

            this.product.on({
                afteredit: this.onProductChange,
                scope: this
            });
        } else {
            //global form
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
     * Call disable method of child container to prevent checkbox of Override Container from being disabled.
     */
    disable: function ( silently ) {
        this.formContainer.disable( silently );
        
    },

    /**
     * @override Ext.container.Container.enable
     *
     * Call enable method of child container, since Override Container should not be disabled in any circumstance.
     */
    enable: function ( silently ) {
        this.formContainer.enable( silently );
    },

    setOverride: function (val, shouldCopy) {
        this.productInSiteInfo.set(this.overrideFieldName, val);
        
        if (val) {
            this.record = this.productInSiteInfo;
            if (shouldCopy) {
                this.getForm().getFields().each(function (field) {
                    this.productInSiteInfo.set(field.name, this.product.get(field.name));
                }, this);
            }

            this.enable();
        } else {
            this.record = this.product;
            this.disable();
        }

        this.loadForm();
    }
});