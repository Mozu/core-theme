# Mozu Core Theme: *Customization Layers*

The Mozu core theme supports a huge range of customizations of various depths, from tweaking theme settings in a visual UI all the way down to writing your own single-page JavaScript app for checkout. The theme and theme engine support these widely disparate levels of implementation by providing a deep stack of customizable layers. Theme developers can choose which layers to modify, bearing in mind that as they choose to modify deeper layers, the time and cost of an implementation will increase.

## The layers presented logically

<div align="center">
  <img src="logical_view.png">
</div>

The layers here are in logical order based on dependency. Some technologies, like client-side Hypr and the JavaScript SDK, are fundamental to the Core theme, but it's technically possible (though there would have to be a very good reason) to eschew them.

## The layers by depth

<div align="center">
  <img src="layers_description.png">
</div>

The layers are here not in logical order, but in order of the ease and cost of customization. Most visual concepts can be achieved using the top few layers; behavioral and workflow changes may involve the top half of the stack or more.

## The layers by cost

<div align="center">
  <img src="layers_cost.png">
</div>

As you travel down through the stack, customizations get more costly in terms of maintenance. Changing deeper layers means taking on the responsibility for merging in new features as they appear in Core. Thus, you should only go down a layer (and, e.g., begin editing a particular template file) when it proves to be absolutely necessary to achieve your visual style.

## How to evaluate a proposed UI change

<div align="center">
  <img src="cost_heatmap.png">
</div>

The rule of thumb is that, for any page in the core theme, **changes are more costly and time-consuming the closer they appear to the middle of the page**. This is because on most catalog, commerce, and system pages, the innermost part of the page contains the most complex and optimized components involving the most layers. That entails workflow, statefulness, template re-rendering, and JavaScript behaviors. These are the parts of the system that other e-commerce platforms simply don't let you modify: the workflow of the checkout and account pages, the option configurator. Modifying these inner components is possible in Mozu, and the Core theme gives you many different layers at which to choose to customize, but because of the complexity of those dependencies, the number of possible code paths and configuration states that must be accounted for and tested, and the risk to future upgradeability, such modifications are more time-consuming and expensive.	

Complex behaviors can be *added* to a page much more easily in the form of widgets! Whenever you want to add bit of UI, with or without JavaScript behavior, it's best to make it a widget. This allows merchants to drag and drop your UI into your theme's dropzones (that you've specified using the `{% dropzone %}` tag. Packaging your new UI controls and features into widgets means you get the best of both worlds: powerful JavaScript-driven behavior, plus easy extension of the Core theme without interfering with basic behavior.