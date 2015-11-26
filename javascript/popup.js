$(document).ready(function() {
  showDialogue();

  var id = '#dialog';

  //Get the screen height and width
  var maskHeight = $(document).height();
  var maskWidth = $(window).width();

  //Set heigth and width to mask to fill up the whole screen
  $('#mask').css({'width':maskWidth,'height':maskHeight});

  //transition effect
  $('#mask').fadeIn(500);
  $('#mask').fadeTo("slow",1);

  //Get the window height and width
  var winH = $(window).height();
  var winW = $(window).width();

  //Set the popup window to center
  $(id).css('top',  winH/2-$(id).height()/2);
  $(id).css('left', winW/2-$(id).width()/2);

  //transition effect
  $(id).fadeIn(2000);

  //if close button is clicked
  $('.window .close').click(function (e) {
    //Cancel the link behavior
    e.preventDefault();

    $('#mask').hide();
    $('.window').hide();
  });

  //if mask is clicked
  $('#pop').click(function () {
    $('#mask').hide();
    $('.window').hide();
  });

  function showDialogue(){
    $('#popupfoot').hide()
    $('.typist').typist({ speed: 12 })
    .typistPause(1000) // 2 sec
    .typistAdd('Hello?\n')
    .typistPause(1000) // 2 sec
    .typistAdd('Are you there?\n')
    .typistPause(1000) // 2 sec
    .typistAdd('Something is wrong!!!!\n')
    .typistPause(1000) // 2 sec
    .typistAdd('The dead...are alive again!\n')
    .typistPause(1000) // 2 sec
    .typistAdd('They\'re after us!\n',
    function() {
    $('#popupfoot').fadeIn("slow");
  })
    .typistStop()
  }

});
