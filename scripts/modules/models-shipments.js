define([
    "modules/api",
    'underscore',
    "modules/backbone-mozu",
    "hyprlive",
    "modules/models-product",
    "modules/models-returns"
], function (api, _, Backbone, Hypr, ProductModels, ReturnModels) {

    var Shipment = Backbone.MozuModel.extend({
        mozuType: 'storefrontShipment',
        relations: {
            items: Backbone.Collection.extend({
                model: ProductModels.Product
            })
        },
        helpers: ['formatedFulfillmentDate', 'hasTrackingInfo'],
        formatedFulfillmentDate: function() {
            var shippedDate = this.get('fulfillmentDate'),
                options = {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                };

            if (shippedDate) {
                var date = new Date(shippedDate);
                return date.toLocaleDateString("en-us", options);
            }

            return "";
        },
        hasTrackingInfo: function(){
            var packages = this.get('packages');
            if(packages) {
                return _.find(packages, function(trackingPackage){
                    return _.findKey(trackingPackage, function(val, key){
                        return key === 'trackings';
                    });
                });
            }
            return false;
        }
    }),
    ShipmentCollection = Backbone.MozuPagedCollection.extend({
        mozuType: 'storefrontShipments',
        defaults: {
            pageSize: 3,
            pageCount: 0,
            startIndex: -1
        },
        relations: {
            items: Backbone.Collection.extend({
                model: Shipment
            })
        },
        helpers: ['getMoreShipmentItems'],
        mapEmbeddedShipments: function(obj){
            if(obj._embedded) {
               return{
                    items: obj._embedded.shipments,
                    pageSize: obj.page.totalElements.size,
                    total: obj.page.totalElements,
                    pageCount: obj.page.totalElements.totalPages,
                    startIndex: (obj.page.totalElements.number * obj.page.totalElements.size)
               };
            }
            return obj;
        },
        initialize:function(){
            var self = this;
            self.get('items').reset(_.map(self.mapEmbeddedShipments(self.toJSON()).items, function(rawShipmentObj){
                return new Shipment(rawShipmentObj);
            }));
        },
        set: function(rawData, options){

            rawData = this.mapEmbeddedShipments(rawData);

            if(rawData.items && this.items) {
                rawData.items = rawData.items.concat(this.items);
            }
            return Backbone.MozuModel.prototype.set.call(this, rawData, options);
        },
        getMoreShipmentItems: function() {
            return this.nextPage();    
        },
        backorderItems: function(){
            return this.get("items").where({shipmentStatus: "BACKORDER"});
        },
        initShipmentItems: function(){
            return this.firstPage();
        }
    });

    return {
        ShipmentCollection: ShipmentCollection,
        Shipment: Shipment
    };

});