/**
 * @class Taco.view.catalog.Index
 */
Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.core.ux.window.WindowWithActions'
    ],

    header: {
        title: 'Catalog Testing'
    },

    initComponent: function () {
        var me = this;

        var uibtns = Ext.create('Ext.Container', {
            layout: {
                type: 'hbox',
                defaultMargins: '5'
            },
            items: [{
                xtype: 'button',
                frame: false,
                scale: 'medium',
                ui: 'action',
                text: 'Cancel'
            }, {
                xtype: 'button',
                frame: false,
                scale: 'medium',
                ui: 'action-primary',
                text: 'Save'
            }, {
                xtype: 'button',
                frame: false,
                scale: 'medium',
                ui: 'action',
                text: 'More',
                menuAlign: 'tr-br?',
                menu: {
                    plain: true,
                    shadow: false,
                    items: [{
                        text: 'Preview'
                    }, {
                        text: 'Delete'
                    }]
                }
            }, {
                xtype: 'splitbutton',
                frame: false,
                scale: 'medium',
                ui: 'action-primary',
                text: 'Select',
                menuAlign: 'tr-br?',
                menu: {
                    plain: true,
                    shadow: false,
                    items: [{
                        text: 'Select all'
                    }, {
                        text: 'Select all but this'
                    }]
                }
            }]
        });

        var store = Ext.create('Ext.data.Store', {
            autoLoad: true,
            fields: [{ name: 'productCode', type: 'string' }],
            data: [
                { productCode: '123' },
                { productCode: 'thom' },
                { productCode: 'travis' },
                { productCode: 'asdf' },
                { productCode: 'food' },
                { productCode: 'pickles' }
            ]
        });

        var view = Ext.create('Ext.view.View', {
            flex: 1,
            itemSelector: 'li.product',
            autoEl: 'ul',
            store: store,
            tpl: [
                '<tpl for="."><li class="product">{productCode}</li></tpl>'
            ]
        });

        var reactorShim = Ext.create('Ext.Component', {
            html: 'failure'
        });

        var Reactor = React.createClass({
            getInitialState: function () {
                return {
                    bubbles: [],
                    inputValue: ''
                };
            },

            render: function () {
                var bubbles = this.getBubbles();

                bubbles.push(React.DOM.input({
                    ref: 'inputEl',
                    className: 'bubbleselect-input',
                    type: 'text',
                    value: this.state.inputValue,
                    onChange: this.handleChange,
                    onKeyUp: this.handleKeyUp
                }));

                return this.transferPropsTo(React.DOM.div({
                    className: 'reactor',
                    onClick: this.handleClick,
                    children: [
                        React.DOM.div({
                            className: 'bubbleselect',
                            children: bubbles
                        })
                    ]
                }));
            },

            componentDidUpdate: function (prevProps, prevState) {
                var prevBubbles = prevState.bubbles,
                    nextBubbles = this.state.bubbles,
                    unchanged = (prevBubbles.length === nextBubbles.length);
                
                store.clearFilter();
                store.filter(this.getFilters(nextBubbles));

                this.refs.inputEl.getDOMNode().focus();

                me.body.doComponentLayout();
            },

            getBubbles: function () {
                var bubbles = this.state.bubbles,
                    bubbleItems = [];

                bubbleItems = bubbles.map(function (bubble) {
                    return React.DOM.div({
                        className: 'bubble',
                        'data-text': bubble,
                        onClick: this.handleBubbleClick,
                        children: bubble
                    })
                }, this);

                return bubbleItems;
            },

            getFilters: function (bubbles) {
                var filters;

                filters = bubbles.map(function (bubble) {
                    var key = 'productCode-' + bubble,
                        existingFilters = store.filters,
                        filter = existingFilters ? existingFilters.getByKey(key) : null;

                    if (!filter) {
                        filter = Ext.create('Ext.util.Filter', {
                            id: key,
                            root: 'data',
                            property: 'productCode',
                            value: bubble
                        });
                    }

                    return filter;
                }, this);

                return filters;
            },

            handleBubbleClick: function (event) {
                var bubbles = this.state.bubbles,
                    bubbleIndex = bubbles.indexOf(event.target['data-text']),
                    nextBubbles = Ext.Array.erase(bubbles, bubbleIndex, 1);

                this.setState({
                    bubbles: nextBubbles
                });
            },

            handleChange: function (event) {
                this.setState({
                    inputValue: event.target.value
                });
            },

            handleClick: function (event) {
                this.refs.inputEl.getDOMNode().focus();
            },

            handleKeyUp: function (event) {
                var bubbles = this.state.bubbles,
                    nextBubbles;

                if (event.keyCode === 13 && !Ext.isEmpty(event.target.value)) {
                    nextBubbles = bubbles.concat(event.target.value);

                    this.setState({
                        bubbles: nextBubbles,
                        inputValue: ''
                    });
                }
            }
        });

        // put it all together
        Ext.apply(this.body, {
            cls: Taco.baseCSSPrefix + 'catalog',
            // layout: { type: 'vbox', align: 'stretch' },
            layout: 'auto',
            items: [uibtns, reactorShim, view]
        });

        this.callParent(arguments);

        reactorShim.on({
            afterrender: function (cmp) {
                React.renderComponent(Reactor(), Ext.getDom(cmp.getId()));
            }
        });
    },

    launchModal: function () {
        var modal;

        modal = Ext.create('Taco.core.ux.window.WindowWithActions', {
            autoShow: true,
            height: 400,
            width: 400,
            title: 'More Actions',
            primaryText: 'Go',
            secondaryText: 'Don\'t Go',
            items: [{
                xtype: 'component',
                html: 'This is where more text would go.'
            }]
        });
    }
});