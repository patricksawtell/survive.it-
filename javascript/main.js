$(document).ready(function() {
  $('button').on('click', function(){
    $(this).toggleClass('filter')
  });

  var $sidebar   = $("#side-nav"),
        $window    = $(window),
        offset     = $sidebar.offset(),
        topPadding = 15;

    $window.scroll(function() {
        if ($window.scrollTop() > offset.top) {
            $sidebar.stop().animate({
                marginTop: $window.scrollTop() - offset.top + topPadding
            });
        } else {
            $sidebar.stop().animate({
                marginTop: 5
            });
        }
    });
});
