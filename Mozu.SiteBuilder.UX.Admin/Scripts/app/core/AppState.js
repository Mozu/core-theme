/**
 * @author james_zetlen
 * An AppState is a little old place where a URI token, a controller/action/id/query hash, and any metadata can get together!
 *     
 * # Usage
 *
 * An AppState represents a current UI state in the administrative app. This state isn't particularly high-fidelity; you couldn't, for instance, reconstruct a particular form validation state from it (unless you jammed one into it, as a JSON representation). But it should be used to create certain pages in their initial states, usually based on the URI alone.
 * They are created by {@link Taco.core.StateManager} and they are passed as arguments to event handlers on StateManager.
 * 
 *     Taco.core.StateManager.on('statechange', function(newState) {
 *        newState.isAppState; // true
 *        newState.metaData; // e.g. { controller: 'sites', action: 'edit' }
 *     });
 */

Ext.define('Taco.core.AppState', {
    extend: 'Ext.util.Observable',
    statics: {
        baseUriRE: (function (baseTag) {            
            return new RegExp('^' + Taco.adminAppPath.replace('.', '\\.').replace(/\/$/, '') +'|^' +Taco.adminRelPath +'|^' + Taco.adminRelPath.substring(1) , 'i');
        })(),
        
       
        
        beginSlashRE: /^\//,
        endSlashRE: /\/$/,
        defaultParams: {
            controller: 'dashboard',
            action: 'index'
        },
        /**
        * @private
        * @static
        * Parses a URI into controller, action, ID and query.
        * @param {String} uri URI to parse. Can be absolute or relative.
        * @return {Object} An object containing controller and view instantiation properties.
        * This may contain any of the following properties:
        * *    controller: String <div class="sub-desc">The bare classname of a controller.</div>
        * *    action: String <div class="sub-desc">The controller action to run.</div>
        * *    args: String[] <div class="sub-desc">An array of arguments to the action. The last argument is always a key-value parse of the query string. Usually just two args: the ID of the model to bind to the action view, and the query parameters.</div>
        *
        */
        parseUri: function (uri) {
            var query, sections, controller, action;

            
            uri = uri.split('?');
            sections = Ext.Array.clean(uri[0].split('/'));
            controller = sections.shift() || this.defaultParams.controller;
            action = sections.shift() || this.defaultParams.action;
            sections.push(Ext.Object.fromQueryString(uri[1] || '', true));

            return {
                controller: controller,
                action: action, 
                args: sections
            };
        }
    },

    /**
    * Helpful in function overloads, because many handlers may or may not receive AppStates.
    * @readonly
    */
    isAppState: true,

    config: {
        /**
        * @cfg {String} uri
        * The URI that will represent the state in the browser.
        */
        uri: '',
        /**
        * @cfg {Object} metaData
        * A hash of metadata provided by the creator of the state, that is meant to be readable by that creator if the state becomes active again. 
        */
        metaData: {}
    },

    constructor: function () {
        this.callParent(arguments);
        this.addEvents(
        /**
        * @event
        * Fires when this state becomes active.
        */
        'activate',
        /**
        * @event
        * Fires when this state becomes inactive (the user has backed out of this state or initiated a new one.)
        */
        'deactivate'
        );
        this.uri = this.uri.replace(this.self.baseUriRE, '').replace(this.self.beginSlashRE, '').replace(this.self.endSlashRE, '');
        this.metaData = Ext.apply(this.self.parseUri(this.uri), this.metaData || {});

        // set a sequential-ish state ID.
        this.metaData._stateid = Number((new Date().getTime().toString()) + Math.round(Math.random() * 100000));

    }
});
// Copyright (c) 2012 Volusion, Inc.