define(['jquery'], function ($) {

    /**
     * Animates a modal open and closed through fading and slight sliding.
     *
     * A .modal or .mini-modal element must be present anywhere in the same parent as
     * the clicked trigger, or else have a data-modal-container attribute with a valid
     * jQuery selector, so jQuery can correctly position the element for animation before
     * it actually has layout (see examples).
     *
     * <div>
     *   <div class='mini-modal'>...</div>
     *   <a href="javascript:;">Trigger</a>
     * </div>
     *
     * OR
     *
     * <div id='parent-box'>
     *   ...
     *   <div class='modal'>...</div>
     *   ...
     * </div>
     * ...
     * <a data-modal-container='#parent-box'>Trigger</a>
     *
     *
     * @param {Object} config - A configuration with the following properties:
     *                            > jqSelector: Any valid jQuery selector to use to listen to for trigger events
     *                            > delegatedSelector: (Optional) Any valid jQuery selector to make this listener
     *                                                 delegated from jqSelector
     *                            > eventType: (Optional) Event to use as trigger for modal
     */
    return function ( config ) {

        // *** 'arguments' is not an actual array, so arguments.join() won't work;
        // *** Array.prototype can handle anything with a length property, so use that instead.
        // nSelectors = Array.prototype.join.call( arguments );

        // *** Default arguments
        config = $.extend({
            jqSelector: false,
            delegatedSelector: false,
            eventType: 'click'
        }, config);

        if( config.jqSelector ) {
            if( config.delegatedSelector ) {
                $( config.jqSelector ).on(config.eventType, config.delegatedSelector, animateModalHandler);
            } else {
                $( config.jqSelector ).on(config.eventType, animateModalHandler);
            }
        } else {
            throw new Error("No jqSelector property found on animateModals argument.");
        }
    };

    function animateModalHandler() {

        var modalContainer        = $(this).data('modal-container') ? $( $(this).data('modal-container') ) : $(this).parent(),
            modal                 = modalContainer.find('.modal, .mini-modal').not('.is-open').addClass('is-open'),
            mask                  = modalContainer.find('.modal-mask'),
            ANIM_DURATION         = 350,
            SLIDE_DISTANCE        = 18,
            STARTING_POSITION_TOP,
            INLINE_CSS_TOP;

        if( modal.length ) {

            // *** Element must have layout (not display: none) to correctly get 'top' offset
            STARTING_POSITION_TOP = parseInt( modal.css('visibility', 'hidden').show().css('top') );
            modal.hide().css('visibility', '');

            // *** Remember if 'top' style was set inline or not
            INLINE_CSS_TOP = modal[0].style && modal[0].style.top;

            // *** Fade modal mask in, if one exists for this modal
            mask.fadeIn( ANIM_DURATION );

            modal.css('top', STARTING_POSITION_TOP - SLIDE_DISTANCE).fadeIn( ANIM_DURATION ).animate({top: STARTING_POSITION_TOP}, {
                duration: ANIM_DURATION,
                queue   : false,
                complete: function () {
                    $(document.body).on('click.close-animated-modal', function (e) {
                        var clickedOn = $(e.target);

                        // *** Close the display when something outside the modal is clicked on
                        if( clickedOn.is('.close-modal') || !( clickedOn.is('.modal, .mini-modal') || clickedOn.parents('.modal, .mini-modal').length ) ) {
                            mask.fadeOut( ANIM_DURATION );

                            modal.fadeOut( ANIM_DURATION ).animate({top: STARTING_POSITION_TOP + SLIDE_DISTANCE}, {
                                duration: ANIM_DURATION,
                                queue   : false,
                                complete: function () {
                                    // *** Reset modal so it can be triggered again from its original position
                                    modal.removeClass('is-open').css({
                                        // *** If the original 'top' value was inline, replace it, otherwise, remove the inline value
                                        'top': INLINE_CSS_TOP ? STARTING_POSITION_TOP : ''
                                    })
                                    // *** Trigger any callbacks hooked into onAnimatedModalClose event
                                    .trigger('onAnimatedModalClose');
                                }
                            });
                            // *** Stop listening for the close event while the modal is closed
                            $(document.body).off('.close-animated-modal');
                        }
                    });
                }
            });
        }
    }
});