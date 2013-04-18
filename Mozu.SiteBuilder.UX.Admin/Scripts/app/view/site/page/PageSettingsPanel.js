/**
 * @class Taco.view.site.page.PageSettingsPanel
 */
Ext.define('Taco.view.site.page.PageSettingsPanel', {
    extend: 'Taco.view.site.ToolboxPanel',
    requires: ['Taco.core.ux.form.Form'],
    cls: Taco.baseCSSPrefix + 'card-flex ' + Taco.baseCSSPrefix + 'navigation ' + Taco.baseCSSPrefix + 'pagesettings',
    initComponent: function () {
        if (!this.form) return Ext.Error.raise('Instance of PageSettingsPanel requires a .form configuration.');
        this.form = Ext.widget('formform', this.form);
        this.callParent(arguments);
    }
});