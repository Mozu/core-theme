
/**
 * @class Taco.shared.view.field.Address
 * Display field that shows an address; Also will show a button to open address editor modal;
 * Supports adding additional components to the buttonContainer
 */

Ext.define('Taco.shared.view.field.ArrayField', {
    extend: 'Ext.ux.form.field.BoxSelect',
    alias: 'widget.taco-arrayField',
    store: [],
    "queryMode": 'local',
    "forceSelection": false,
    "createNewOnEnter": true,
    "createNewOnBlur": true,
});
