### backbone-mozu-view

### Auto Update Helpers

Autoupdate handlers can be created follow the naming convention `updatePropName` for a property `propName`. They're designed to be attached to an input element using the `events` or `additionalEvents` hash; they expect a jQuery Event from which they determine the original target element, then they try to get that target element's value and set the model property.


Adding an ``autoUpdate: ['propertyName']`` Array of properties of the model to autogenerate update handlers for.
``
var FullNameView = Backbone.MozuView.extend({
    autoUpdate: ['firstName','lastNameOrSurname']
    });

``


#### From Hyprlive
Using ``data-mz-value={property} `` will attach the update event when the view is constructed. This will add update events for 'change', 'blur', and 'keyup' to the element
``
<input type="text" id="firstNameID" name="first-name" data-mz-value="model.firstName" value="{{ model.firstname }}" maxlength="200">

``


### Action handler Helper

For click events the ``data-mz-action="{someActionName}"`` create a click event for the element, which will trigger the corresponding function within the model.

``
<button class="mz-button" data-mz-action="{someActionName}">{{ labels.btnLabel }}</button>
``

### Render Context Override
The context that will be sent to the template by the MozuView#render method. In the base implementation, this returns an object with a single property, `model`, whose value is the JSON representation of the `model` property of this view. This object is sent to Hypr, which extends it on to the global context object always present in every template, which includes `siteContext`, `labels`, etc. 


``
    var ViewWithExtraRootVariable = new MozuView.extend({
    model: someModel,
    templateName: "path/to/template",
    el: $('some-selector')
    getRenderContext: function() {
        // first get the parent method's output
        var context = MozuView.prototype.getRenderContext.apply(this, arguments);
        context.foo = "bar";
        return context;
    }
    });

    anotherView.getRenderContext(); // --> { model: { [...model data] }, foo: "bar" }
``
