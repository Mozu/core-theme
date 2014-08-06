/**
 *  @class Taco.core.StateManager
 *  The StateManager is responsible for handling URL history management, deep linking, and global application state. It stores AppState objects in a stack and uses them to call Controllers to construct application states.
 *  It also fires navigation events.
 *  @extends Ext.util.Observable
 *  @requires Taco.core.AppState
 *  @singleton
 *  @author james_zetlen
 */

//this synchronous ajax call is currently the best way we have to load a non-Ext dependency into an Ext class. TODO: extend the Ext class manager so it can handle this a little better.


Ext.define('Taco.core.StateManager', {
    extend: 'Ext.util.Observable',
    requires: ['Taco.core.AppState'],

    singleton: true,

    constructor: function () {
        var me = this;

        me.statestack = [];
        me.stateindex = -1;

        me.callParent(arguments);
        me.addEvents(
            /**
             * @event
             * @preventable
             * Fires before the application state changes, whether by StateManager constructing a new State via {@link Taco.core.StateManager#attemptNavigate}, or by the {@link #navigate} event firing and being intercepted by a listening {@link Taco.core.util.Navigable} object.
             * Returning `false` to a handler will cancel the state change. *If you return false to this handler, you should cache the {@link Taco.core.AppState} the handler received, and then notify the user of the attempt to change state, perhaps via an "Are you sure?" dialog.
             * @param {Taco.core.AppState} state The state that is about to become active.
             */
            'beforenavigate',
            /**
             * @event
             * Fires when a navigation is occurring. Handlers can intercept the navigate event and handle it if they know how. If a handler has successfully handled a navigation event, it should return `false`, to prevent the controller from attempting to handle the event.
             * @param {Taco.core.AppState} state The state that is becoming active.
             */
            'navigate',
            /**
             * @event
             * Fires when the application state has changed. This event is not cancelable; it indicates that a state change has already taken place.
             * @param {Taco.core.AppState} state The state that is now active.
             */
            'statechange'
        );

    },

    // public methods up here

    /**
     * Load the state signified by this URI. Parses a URI, create a state from it, calls the appropriate controller, and fires the {@link #navigate} event.
     * This method always creates a *blank* state, that is, a state without metadata. This method should only be used to start a new workflow, e.g. on app load or on nav select.
     * @param {String} uriOrState URI to navigate to. Must be in the form `/controller[/action][/arguments/to/action][?query]`.
     * @param {Object} metadata If the first argument was a URI, this argument can be the metadata used to store an {@link Taco.core.AppState}.
     * @param {Object} useReplace
     * @return {Taco.core.AppState} The new AppState object that has been pushed.
     */
    attemptNavigate: function (uriOrState, metadata, useReplace) {
        var me = this,
            newState = uriOrState.isAppState ? uriOrState : this.createState(uriOrState, metadata),
            retryFn = function () {
                me.attemptNavigate(newState);
            },
            newMetadata,
            controller;
        if (this.fireEvent('beforenavigate', newState, retryFn) !== false) {
            this.suspendAllHandlers = true;
            this.addState(newState, metadata, useReplace);
            this.suspendAllHandlers = false;
            if (this.fireEvent('navigate', newState) !== false) {
                newMetadata = newState.getMetaData(true);
                this.initController(newMetadata);
                this.dispatchController(newMetadata);


            }
            this.fireEvent('statechange', newState);
        }
        return newState;
    },

    //allows for late loading of controller... speeds up dev mode
    initController: function (params) {
        var controller, idx, name;
        try {
            idx = Taco.app.controllers.findIndex('id', params.controller);
            if (idx) {
                controller = Taco.app.controllers.getAt(idx);
            }
            if (!controller) {
                controller = Taco.app.getController(Ext.String.capitalize(params.controller));
            }
        } catch (err) {
            name = Taco.app.getModuleClassName(Ext.String.capitalize(params.controller), 'controller');
            //Ext.require(name);
            name = Ext.ClassManager.getNameByAlias(name);
            if (name) {
                return Taco.app.getController(name.substring(name.lastIndexOf('.') + 1));
            }


            //   Taco.app.getController("Errors").Http404();
            //Taco.app.fireEvent('error', 'Error 404: No page or panel found.');
        }
        return controller;
    },

    /**
     * Adds the provided state to the history and makes it the active state. If provided a {@link Taco.core.AppState} object, will pass it through. If provided a URI and metadata hash, will create an AppState with that and pass it through.
     * This method does not fire the `beforenavigate` event, because it is meant to be used as part of a workflow. A class should only call addState if the class is constructing and displaying the new state itself. The method cannot be canceled; it will push the new state into history, so it can be reconstructed later.
     * @param {Taco.core.AppState/String} uriOrState Can be a string URI or an already-created {@link Taco.core.AppState}.
     * @param {Object} metadata If the first argument was a URI, this argument can be the metadata used to store an {@link Taco.core.AppState}.
     * @param {Boolean} useReplace **For internal use only**. Used in the initial setup so that the initial navigation event doesn't create a duplicate entry.
     * @return {Taco.core.AppState} The state provided or created.
     */
    addState: function (uriOrState, metadata, useReplace) {

        // get current state
        var currentState = this.getCurrentState();

        // create state if it isn't created yet
        var newState = uriOrState.isAppState ? uriOrState : this.createState(uriOrState, metadata);

        // notify current state it's about to die
        currentState && currentState.fireEvent('deactivate');

        // this wipes the "forward button" history, so we truncate our cache of that and push this state in.
        this.truncateAndPush(newState);

        // don't fire beforenavigate for what we're about to do
        this.suspendNavHandlers = true;
        // push the new state into browser history.
        window.History[useReplace ? 'replaceState' : 'pushState'](newState.getMetaData(), null, newState.getUri());
        // and unsuspend
        this.suspendNavHandlers = false;

        // notify new state it's now current state
        newState.fireEvent('activate');

    },

    // private methods under here

    /**
     * Initializes the manager: processes the initial state and binds a listener to history changes.
     */
    initialize: function () {
        var me = this;
        // initialize
        me.attemptNavigate(window.History.getState().url, {}, true);

        // register the main event
        window.History.Adapter.bind(window, 'statechange', function () {
            // wrapper function because window history can't scope callbacks
            me.onStateChange();
        });
    },

    /**
     * @ignore
     */
    onStateChange: function () {
        var me = this,
            currentState = me.getCurrentState(),
            browserState = window.History.getState(),
            newState,
            newIndex,
            retryFn = function () {
                me.attemptNavigate(newState);
            },
            stateId = browserState.data ? browserState.data._stateid : null,
            isExisting = false;

        if (me.suspendNavHandlers || me.suspendAllHandlers) {
            // a state is being added via .addState, so the currentState is already updated. shortcut the rest of this process and simply fire the nav event.
            me.suspendNavHandlers = false;

            if (!me.suspendAllHandlers) {
                // if me.suspendAllHandlers is true, a state is being added via attemptNavigate, so we'll let that function fire the statechange event.
                me.fireEvent('statechange', currentState);
            }
            me.suspendAllHandlers = false;
            return;
        }

        // the presence of a stateId param indicates that this is a state we pushed, so the user is navigating using back or fwd buttons
        if (stateId) {
            Ext.Array.each(me.statestack, function (s, i) {
                if (s.getMetaData()._stateid === stateId) {
                    // we have a cache of the state we were navigating to
                    newState = s;
                    newIndex = i;
                    isExisting = true;
                    return false;
                }
            }, me, true); // reverse through array, since the back button is the more common use case.
        }

        // create a new state and get ready for a new index
        if (!isExisting) {
            newState = me.createState(browserState);
            newIndex = me.statestack.length;
        }

        // we're prepared to navigate. fire beforenavigate!
        if (me.fireEvent('beforenavigate', newState, retryFn) === false) {
            // someone didn't like it, and, we assume, dealt with it. replace old state in html5 history.
            me.suspendAllHandlers = true;
            window.History.go(me.stateindex - newIndex);
            // replaceState was causing unexpected behavior by popping the real stack while not popping our fake stack
            //window.History.replaceState(currentState.getMetaData(), null, currentState.getUri());
            return;
            // it's like it never happened.
        }

        //notify old state it's deactivating
        currentState.fireEvent('deactivate');

        // set current state!
        if (isExisting) {
            // setting the pointer should be enough for the StateManager.
            me.stateindex = newIndex;
            // since this state is old, there might be listeners. notify them
            newState.fireEvent('activate');
        } else {
            // with a brand new state, we have to truncate the state stack and then push this on.
            me.truncateAndPush(newState);
        }

        // at long last, run the navigate and statechange events.
        if (me.fireEvent('navigate', newState) !== false) {
            me.dispatchController(newState.getMetaData());
        }

        return me.fireEvent('statechange', newState);
    },

    attemptNavigateBack: function () {
        if (Taco.core.StateManager.stateindex == 0) {
            return false;
        }
        //todo remove this from the stack?
        return this.attemptNavigate(Taco.core.StateManager.statestack[Taco.core.StateManager.stateindex - 1]);
    },


    /**
     * @private
     * Returns the currently active state.
     * @return {Taco.core.AppState} The currently active state.
     */
    getCurrentState: function () {
        // the active state is the *last* element in the array, unless the back button has been pressed, in which case the stateindex is decremented.
        return this.statestack[this.stateindex];
    },

    /**
     * @private
     * Dispatches a controller, which creates a new ContentView.
     * @param {Object} params An object containing at least a controller and action property, corresponding to a real controller and action.
     * This will attempt to call the controller and action, with the arguments list as parameters.
     */
    dispatchController: function (params) {
        var controller, idx, ret;
        try {
            idx = Taco.app.controllers.findIndex('id', params.controller);
            if (idx) {
                controller = Taco.app.controllers.getAt(idx);
            }
            if (!controller) {
                controller = Taco.app.getController(Ext.String.capitalize(params.controller));
            }
        } catch (err) {
            Taco.app.getController("Errors").Http404();
            //Taco.app.fireEvent('error', 'Error 404: No page or panel found.');
        }

        if (!controller) {
            return Taco.app.getController("Errors").Http404();
        }

        if (controller.performAction) {
            ret = controller.performAction(params.action, params.args, [params]);
            if (ret !== false) {
                return ret;
            }
        } else {


            for (var mem in controller) {
                if (mem.toLowerCase() === params.action.toLowerCase()) {
                    params.action = mem;
                    break;
                }
            }
            if (controller[params.action]) {

                return controller[params.action].apply(controller, Ext.Array.union(params.args, [params]));
            } else {
                return Taco.app.getController("Errors").Http404();
                //Taco.app.fireEvent('error', 'Error 404: No page or panel found.');
            }
        }

    },

    /**
     * @private
     * Creates a new {@link Taco.core.State} object and returns it (does not add state)
     * @param {String/Object}uri The uri associated with the state **or** a normalized HTML5 History state with data, title, and url parameters
     * @param {Object} metadata A **simple** JSON object, using only primitive key values, to serve as state metadata.
     */
    createState: function (uri, metaData) {
        if (typeof uri !== "string" && uri.url) {
            metaData = uri.data;
            uri = uri.url;
        }
        return Ext.create('Taco.core.AppState', {
            uri: uri,
            metaData: metaData
        });
    },

    /**
     * @private
     */
    truncateAndPush: function (appState) {
        this.statestack.length = ++this.stateindex; // truncate at current index
        this.statestack.push(appState); // now that length is incremented by one, index points at last entry
    }

});
// Copyright (c) 2012 Volusion, Inc.