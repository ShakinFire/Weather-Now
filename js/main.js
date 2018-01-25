$(document).ready(function () {
    (function boot() {

        this.loadQuiz = function () {
            $('.panel_one h1').show('drop', 500, function() {
                $('.start_quiz').addClass('started', 500);
            });

            $('.start_quiz').on('click', function() {
                showPanel(1);
                console.log('clicked')
            })
        }

        this.showPanel = function(position) {
            // console.log('show')
            var current = $('div[data-panel="' + (position - 1) + '"]');
            var next = $('div[data-panel="' + position + '"]');

            current.find('.wrapper').animate({
                left: "-=100px",
                opacity:0
            }, 500, function() {
                 current.addClass('hidden');
                 next.removeClass('hidden');
                 showNext(next);
            })
        };

        this.showNext = function(nextElement) {
            var wrapper = nextElement.find('.wrapper');
            wrapper.fadeIn('500', function(){

            })

        }

        loadQuiz();
    })();

});