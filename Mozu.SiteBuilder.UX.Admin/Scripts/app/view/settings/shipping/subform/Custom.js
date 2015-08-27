/**
 * @class Taco.view.settings.shipping.subform.MethodsAndRates
 *
 */

Ext.define('Taco.view.settings.shipping.subform.Custom', {
    extend: 'Taco.core.ux.form.Form',

    requires: [
        'Taco.view.settings.shipping.widget.RateList'
    ],
    
    title: 'Custom Rate',
    padding: '0 19 19 19',
    
    layout:"fit",
    
    modelName: 'Taco.model.CustomShippingRate',
    initComponent: function() {
        var me = this;

        this.rateList = Ext.create('Taco.view.settings.shipping.widget.RateList', {
            record: me.record
        });        

        me.items = [this.rateList];
        
        this.callParent(arguments);

        
    },
    beforeSave: function () {
        var me = this;
        var customRates = [];
        
        this.rateList.store.each(function(rec) {
            customRates.push(rec.getData());
        });
   
        this.record.set('customRates', customRates);

        return true;
    }
});