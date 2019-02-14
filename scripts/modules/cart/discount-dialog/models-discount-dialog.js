define(["backbone", 'underscore', 'hyprlive', 'modules/api', 'modules/models-product', 'modules/models-dialog', 'modules/models-discount' ], function(Backbone, _, Hypr, Api, ProductModels, Dialog, DiscountModel) {

    var modalDialog = Dialog.extend({
        handlesMessages: true,
        relations : {
            product: ProductModels.Product,
            discounts: Backbone.Collection.extend({
                model: DiscountModel
            }),
            discount: DiscountModel
        },
        hasNextDiscount: function() {
            return this.get('discounts').find(function (discount) {
                return !discount.get('complete') && ((discount.get('autoAdd') || (discount.get('hasOptions') || discount.get('hasMultipleProducts'))));
                //return !discount.get('complete');
            });
        },
        loadNextDiscount: function(){
            // var nextDiscount = this.get('discounts').find(function(discount){
            //     return !discount.get('complete');
            // });
            // if (nextDiscount) {
            //     this.setNewDiscount(nextDiscount);
            // }
            var self = this;
            var nextDiscount = this.get('discounts').find(function (discount) {
                return !discount.get('complete');
            });
            if (nextDiscount) {
                this.setNewDiscount(nextDiscount);
                if( this.get('discount').get('hasMultipleProducts') ){
                    return this.get('discount').getDiscountDetails().then(function(discount){
                        self.get('discount').set('productCodes', discount.includedProductCodes);
                    });
                } else {
                    return this.get('discount').getProductDetails().then(function(data){
                        if (self.get('discount').get('hasOptions')) {
                            data = self.get('discount').tagVariationOptions(self.get('discount').get('productCode'), data);
                        }
                        self.get('discount').get('products').reset([data]);
                    });
                }
            }
        },
        completeDiscount:function(){
            var self = this;
            if (self.hasDiscount()) {
                var discount = this.get('discounts').findWhere({ discountId: self.get('discount').get('discountId') });
                discount.set('complete', true);
            }
        },
        addDiscounts: function(discounts){
            this.set('discounts', discounts);
            this.setNewDiscount(discounts[0]);
        },
        setNewDiscount: function(discount){
            if (!discount.complete) {
                this.set('discount', discount);
                //this.trigger('newDiscountSet');
            }
        },
        initialize: function () {
            //this.set('order', new OrderModels.Order({})); 
        },
        hasDiscount: function(){
            return !(_.isEmpty(this.get('discount')));
        },
        hasMultipleProducts: function () {
            return this.get('discount').get('hasMultipleProducts');
        },
        // getProductDetails: function(productCode){
        //     var self = this;
        //     var productCode = productCode || this.get('discount').productCode

        //     if( !productCode || productCode === "" ){
        //         this.trigger('error', 'No Product Code Found');
        //         throw 'No Product Code Found';
        //     }
            
        //     var productModel = new ProductModels.Product({productCode: productCode});
        //     return productModel.apiGet().then(function(data){
        //         self.set('product', data.data);
        //         return data.data;
        //     })   
        // },
        isProductConfigurable: function(){
            return this.get('discount').get('products').at(0).get('productUsage') === "Configurable";
        },
        productHasOptions: function () {
            return this.get('discount').get('hasOptions');
        },
        isDiscountAutoAdd: function(){
            return this.get('discount').get('autoAdd');
        },
        autoAddProduct: function() {
            var self = this;
            var process = [];

            var bogaProduct = new ProductModels.Product({ productCode: self.get('discount').get('products').at(0).get('productCode')});
            process.push(function () {
                return bogaProduct.fetch();
            });
            process.push(function () {
                return bogaProduct.apiAddToCart({ autoAddDiscountId: self.get('discount').get('discountId') }).then(function (cartItem) {
                    return cartItem;
                });
            });
            return Api.steps(process);
        }
        // getDiscount: function(){
        //     var temp = new Promise(function (resolve, reject) {
        //         setTimeout(function () {
        //             testData = {
        //                     name: "Discount 1",
        //                     productCodes: ['4101', '4104', 'config-1', 'config-1-2']
        //                 };
        //             resolve(testData);
        //         }, 300);
        //     });
        //     return temp
        // }
    });

    return modalDialog;
});
