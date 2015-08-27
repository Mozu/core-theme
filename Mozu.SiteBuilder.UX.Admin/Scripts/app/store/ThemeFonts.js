/**
* @class Taco.store.ThemeFonts
* @author Thomas Phipps
* The ThemeFonts store
* ??ORPHAN??
*/


    
    Ext.define('Taco.store.ThemeFonts', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.ThemeFont',
        pageSize: 25,
        remoteSort: true,
        remoteFilter: true,
        autoLoad: true
    });
