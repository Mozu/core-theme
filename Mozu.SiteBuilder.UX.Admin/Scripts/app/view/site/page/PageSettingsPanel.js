/**
 * @class Taco.view.site.page.PageSettingsPanel
 */
Ext.define('Taco.view.site.page.PageSettingsPanel', {
    extend: 'Taco.view.site.ToolboxPanel',
    requires: ['Taco.core.ux.form.Form'],
    cls: Taco.baseCSSPrefix + 'card-flex ' + Taco.baseCSSPrefix + 'navigation ' + Taco.baseCSSPrefix + 'pagesettings',
    initComponent: function () {
        if (!this.form || !this.record) return Ext.Error.raise('Instance of PageSettingsPanel requires a .form configuration. and a record.');
        if (this.form.loadRecord) {
            this.form.loadRecord(this.record);
        } else {
            this.form.record = this.record;
            this.form = Ext.widget('formform', this.form);
        }
        this.items = [this.form];
        this.callParent(arguments);
    }
});