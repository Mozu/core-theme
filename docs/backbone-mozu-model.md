# backbone-mozu-model
Extends the BackboneJS Model object to create a Backbone.MozuModel with extra features for model nesting, error handling, validation, and connection to the JavaScript SDK

### Helpers
Array of the names of methods whose return values should be added to the JSON serialization of this model that is sent to the view, when MozuModel#toJSON is called with ``{ helpers: true }``, which it is in the default implementation of getRenderContext.
The base MozuModel has helpers `['isLoading', 'isValid']`. When you subclass a MozuModel, any helpers you specify will be added to this array, rather than replacing it.
``var someBackboneModel = Backbone.MozuModel.extend({
    helpers: ['someFunctionName'],
    someFunctionName: function(){
        return 'Some text';
    }
});
``


### Handle massages
If `true`, then this MozuModel will gain a `messages` property that is a Messages.MessageCollection. It will also subscribe to the `error` event on its `apiModel` and update the `messages` collection as error messages come in from the service.

 If `false`, this MozuModel will traverse up any existing tree of relations to find a parent or ancestor model that does handle messages, and use its `messages` collection instead.

``
    var someModel = Backbone.MozuModel.extend({
            handlesMessages: true
    })

    var someView = new SomeView({
        el: $('#element'),
        model: someModel,
        messagesEl: $('[data-mz-message-bar]')
    })
``

### Model Relations### 
Dictionary of related models or collections.

Get the value of an attribute. Unlike the `get()` method on the plain `Backbone.Model`, this method accepts a dot-separated path to a property on a child model (child models are defined on relations).

Set the value of an attribute or a hash of attributes. Unlike the `set()` method on he plain `Backbone.Model`, this method accepts a dot-separated path to a property on a child model (child models are defined on relations}).
``
var Product = Backbone.MozuModel.extend({
    relations: {
        someChild: SomeChildModal,
        options: Backbone.Collection.extend(
            model: ProductOption
        })
    }
});
``


### snycApiModel

 Ensure that the underlying SDK object has exactly the same data as the live Backbone model. In conflicts, Backbone always wins.
The underlying SDK object has event hooks into changes to the Backbone model, but under some circumstances a change may be unnoticed and they'll get out of sync.For instance, if models are nested several layers deep, or if you changed a model attribute with `{ silent: true }` set. Run this method prior to doing any API action to ensure that the SDK object is up to date.


``this.model.syncApiModel()``




