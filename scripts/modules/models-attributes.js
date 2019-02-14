define(["underscore", "modules/backbone-mozu"], function (_, Backbone) {

    var customerAttritube = Backbone.MozuModel.extend({
        mozuType: 'customerattribute'
    });

    var customerAttributes = Backbone.MozuModel.extend({
        mozuType: 'customerattributes',
        relations: {
            items: Backbone.Collection.extend({
                model: customerAttritube
            })
        }
    });

    var b2bAccountAttritube = Backbone.MozuModel.extend({
        mozuType: 'accountattribute'
    });

    var b2bAccountAttributes = Backbone.MozuModel.extend({
        mozuType: 'accountattributes',
        relations: {
            items: Backbone.Collection.extend({
                model: b2bAccountAttritube
            })
        }
    });

    var customerAttributeDefinition = Backbone.MozuModel.extend({
        mozuType: 'attributedefinition'
    }); 

    var customerAttributeDefinitions = Backbone.MozuModel.extend({
        mozuType: 'customerAttributeDefinitions',
        relations: {
            items: Backbone.Collection.extend({
                model: customerAttributeDefinition
            })
        }
    });

    var b2bAccountAttributeDefinition = Backbone.MozuModel.extend({
        mozuType: 'accountattributedefinition'
    }); 

    var b2bAccountAttributeDefinitions = Backbone.MozuModel.extend({
        mozuType: 'b2bAccountAttributeDefinitions',
        relations: {
            items: Backbone.Collection.extend({
                model: b2bAccountAttributeDefinition
            })
        }
    });

    return {
        'customerAttritube': customerAttritube,
        'customerAttributes': customerAttributes,
        'b2bAccountAttritube': b2bAccountAttritube,
        'b2bAccountAttributes': b2bAccountAttributes,
        'customerAttributeDefinition': customerAttributeDefinition,
        'customerAttributeDefinitions': customerAttributeDefinitions,
        'b2bAccountAttributeDefinition': b2bAccountAttributeDefinition,
        'b2bAccountAttributeDefinitions': b2bAccountAttributeDefinitions
    };
});
