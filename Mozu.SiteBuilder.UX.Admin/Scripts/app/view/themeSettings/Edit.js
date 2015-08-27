/**
 * @class Taco.view.productType.Edit
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.themesettings.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: ['Taco.view.themesettings.Form'],

    formCls: 'Taco.view.themesettings.Form',
    showIndexOnCancel: false,
    initComponent: function () {
        var me = this;

        

        this.formCfg = Ext.apply(this.formCfg || {}, { themeInfo: this.themeInfo });

        this.callParent(arguments);
        this.on('cancel', function () {
            if (!Taco.core.StateManager.attemptNavigateBack()) {
                Taco.core.StateManager.attemptNavigate('themes');
            }
        }, this, { single: true, scope: this });
    }

});