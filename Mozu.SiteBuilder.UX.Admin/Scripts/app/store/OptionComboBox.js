/**
* @class Taco.store.OptionComboBox
* @author Jason Cochran
* The OptionComboBox store
*/

    Ext.define('Taco.store.OptionComboBox', {
        extend: 'Ext.data.Store',
        requires: ['Taco.model.OptionComboBox'],
        model: 'Taco.model.OptionComboBox',
        alias: 'widget.optioncomboboxstore',
        remoteFilter:false,
        pageSize: 500
    });
