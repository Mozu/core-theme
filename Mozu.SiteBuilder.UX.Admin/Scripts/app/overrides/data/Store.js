/**
 * @class  Taco.overrides.data.Store
  * @description Overrides Ext.data.Store
 */
Ext.define('Taco.overrides.data.Store', {

    override: 'Ext.data.Store',
    // set to true and the getById call will always convert your id to lowercase.
    makeIdCaseInsensitive : false,

    getById: function (id) {
        if (this.makeIdCaseInsensitive) {
            id = id.toLowerCase();
        }
        return this.callParent(arguments);
    }
});