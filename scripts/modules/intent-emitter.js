/**
 * A bit like an RxJS observable stream, but using Backbone
 * (a preexisting dependency), aggregates user input into
 * a stream of intents, based on the mapping function
 * that you supply to turn an event into an intent.
 */

define(['underscore', 'backbone'], function(_, Backbone) {

	return function(element, subscriptions, processor, eventName) {
		var emitter = _.extend({}, Backbone.Events);
		var handler = function(e) {
			emitter.trigger(eventName || 'data', processor.apply(this, arguments), e);
		};
		var View = Backbone.View.extend({
			events: _.reduce(subscriptions, function(memo, subscription) {
				memo[subscription] = handler;
				return memo;
			}, {})
		});
		var view = new View({
			el: element
		});
		emitter.view = view;
		return emitter;
	};

});