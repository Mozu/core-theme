/**
 * @class Taco.store.ThemeListing
 * @author Michael Speed Elder
 * Date: 8/20/12
 * Time: 3:59 PM
 *
 * The ThemeListing store
 */

Ext.define('Taco.store.ThemeListingsApplied', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.ThemeListingApplied',
    requires: ['Taco.model.ThemeListingApplied']
  
});

