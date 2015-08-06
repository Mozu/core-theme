/**
* @class Taco.store.ThemeListsingsTree
* @author Travis Johnson
* The Theme Listing store
*/
Ext.define('Taco.store.ThemeListingsTree', {
    extend: 'Ext.data.TreeStore',
    model: 'Taco.model.ThemeListing',
    requires: ['Taco.model.ThemeListing'],
    root: {
     //   expanded: true,
        isLoaded: false,
       // id:-1
    },
});