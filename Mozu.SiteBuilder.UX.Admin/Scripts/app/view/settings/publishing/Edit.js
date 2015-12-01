Ext.define('Taco.view.settings.publishing.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.settings.publishing.Form'
    ],
    formCls: 'Taco.view.settings.publishing.Form',
    cancelButtonEnabled: false,
    saveButtonEnabled: false,
    enableSearchBar: false,
    contextConfig: {
        supportedLevels: ['s', 'c'],
        requiresContextOfType: ['s', 'c']
    }
});