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

  d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };
//setting default svg status
  $('g').not("#main").attr("style","display: none");

  $('.tgl.tgl-flat').on('click', function(){
    var self = $(this).data("toggle");
    $(".tgl.tgl-flat").not(this).prop("checked", false);

    //calling d3 method from above to move selected canvas to front
    var sel = d3.select(self);
    sel.moveToFront();

    $(self).toggle(1000, function(){
      $(self).siblings().not("#main").attr("style","display: none");
    });
  });

});
