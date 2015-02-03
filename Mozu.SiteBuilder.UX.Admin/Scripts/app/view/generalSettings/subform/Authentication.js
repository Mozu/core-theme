/**
 * @class Taco.view.generalSettings.subform.Authentication
 * @author Ben Cripps
 * @date 02/05/2015
 *
 */

Ext.define('Taco.view.generalSettings.subform.Authentication', {
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    title: 'Authentication',
    margin: "0 0 20 0",
    ui: "subform",
    width:"100%",
    //bodyCls: Taco.baseCSSPrefix + 'product-admin-subform',
    //cls: Taco.baseCSSPrefix + 'form-section',
    initComponent: function() {

        this.defaults = {
            labelAlign: 'top',
            labelSeparator: ''
        };

        this.items = [
            {
                xtype: 'checkbox',
                name: 'isRequiredLoginForStagingEnabled',
                boxLabel: 'Require Login to View Staging Site',
                boxLabelAlign: 'after',
                inputValue: true,
                uncheckedValue: false
            },
            {
                xtype: 'checkbox',
                name: 'isRequiredLoginForLiveEnabled',
                boxLabel: 'Require Login to View Live Site',
                boxLabelAlign: 'after',
                inputValue: true,
                uncheckedValue: false
            },
        ];

        this.callParent(arguments);
    }
});