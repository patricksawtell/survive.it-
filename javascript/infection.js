/**
 * Created by TOTO on 11/25/15.
 */
$(function() {


  //Slider hide on load
  $('#slider').hide();
  $("h4").text("Infection Day" + " 0");
  var day = 0;

  //Start Game
  $("#info-box").on("click","#select-btn", function() {

    canSelectRegion = false;
    $("#selectSection").hide();

    $("#side-nav").slideUp("fast");
    var board = $("<div>").css({
      "border": "solid 2px white",
      "border-radius": "10px",
      "width": "95%",
      "height": "500px",
      "margin": "10px auto",
      "overflow-y": "scroll"
    }).attr("id", "board")
    $("#side").append(board);


    //randomizer for starting location
    var array = $.map(regionsData, function (value, index) {
      return index
    });
    var ind = Math.floor(Math.random() * (29) + 1);
    var startRegion = array[ind];
    regionsData[startRegion].infectStatus = true;
    regionsData[startRegion].direction = "center";

    //When outbreak spread, you need to find the neighbours without being infected yet
    function getCurrentNeighbors(region) {
      var neighbours = neighborNames[region];
      return neighbours.filter(function (name) {
        return !regionsData[name].infectStatus;
      });
    }

    //Make sure the game could stop looping when there is no more survivor
    function survivorsLeft() {
      return Object.keys(regionsData).some(function (key) {
        return this[key].infectDegree < 100;
      }, regionsData);
    }

    // Add infectDegree to infectStatus true regions + Spread outbreak to neighbours
    function propagate(infectedRegionKey) {
      var infectedRegion = this[infectedRegionKey];

      if (infectedRegion.infectDegree < maxDegree) {
        infectedRegion.infectDegree += infectionIncrement(infectedRegion);
        console.log(infectionIncrement(infectedRegion));
        //debugger
      }
      if (infectedRegion.infectDegree > infectionThreshold) {
        var neighbourList = getCurrentNeighbors(infectedRegionKey);

        function notInfectedNeighbourFilter(neighbour) {
          return !this[neighbour].infectStatus;
        }

        function infectNeighbour(neighbour) {
          this[neighbour].infectStatus = true;
          this[neighbour].direction = neighborDirection[infectedRegionKey][neighbour];
        }

        neighbourList.filter(notInfectedNeighbourFilter, this).forEach(infectNeighbour, this);
      }
    }

    // User survival related logic
    var userAlive = true;
    var deathDate;

    function checkSurvival(region, day) {

      var infectLevel = region.infectDegree; //always increasing
      var survivalRate = parseFloat(region.survivalrate); //always decreasing
      var maxSurvive = 100;
      var minSurvive = infectLevel;// + day*1.5; //gets harder to survive as time passes

      if (randomSurvival(survivalRate, maxSurvive) > minSurvive) { //rolls to check to see if user is alive
        return true;
      } else {
        deathDate = day;
        //debugger
        return false;
      }
    }

    function randomSurvival(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    //provide ending
    function selectEnding(userAlive, deathDate) {
      if (userAlive) {
        $("#board").append("<p> simulation ends, user is alive! </p>");
      } else {
        $("#board").append("<p>simulation ends, unfortunately user was dead on day " + deathDate + "</p>");
      }
    }

    //infection increment function
    function infectionIncrement(region) {
      return Math.log(region.population) + Math.log(region.density) + region.infectDegree * 0.02//-region.hospitals
    }

    //Animate color
    function animate(record) {
      Object.keys(regionsData).forEach(
        function (region) {
          var infectedRegion = this[region];
          if (infectedRegion.infectStatus) {
            var degree = infectedRegion.infectDegree;
            var colorBA = 255 / 100;
            var colorNum = Math.round(255 - colorBA * degree);
            var rgb = "rgb(255," + colorNum + "," + colorNum + ")";
            $("#" + region).css({"fill": rgb});
          } else {
            $("#" + region).css({"fill": "#FFFFFF"});
          }
        }, record)
    }

    function displayMessage(day) {
      var infectedRegions = Object.keys(infectionHistory[day]).filter(function (region) {
        return this[region].infectStatus;
      }, infectionHistory[day]);

      $("#board").append("<p><strong>Day: " + day + "</strong></p>");

      if (day > 0) {
        function isNewInfected(region) {
          return !infectionHistory[day - 1][region].infectStatus;
        }

        infectedRegions.forEach(function (region) {

          if (isNewInfected(region)){
            var regionName = region.split("_").join(" ");
          var degree = Math.round(infectionHistory[day][region].infectDegree);
          $("#board").append("<p> <font color='#7CCC63'>" + regionName + " is infected!</p>");
          }});
      }
      $("#board").animate({scrollTop: $("#board")[0].scrollHeight}, 1000);
    }

    //Take snapshot of 0 day
    infectionHistory[0] = {};
    Object.keys(regionsData).forEach(function (region) {
      infectionHistory[0][region] = {};
      infectionHistory[0][region]["infecStatus"] = regionsData[region]["infectStatus"];
      infectionHistory[0][region]["infectDegree"] = regionsData[region]["infectDegree"];
      infectionHistory[0][region]["direction"] = regionsData[region]["direction"];
    });


    //initialize the game properties
    var infectionThreshold = 40;
    var maxDegree = 100;

    displayMessage(0);

    //Game Logic
    function infect() {

      //Slider DAY update
      var def = d3.select("svg")
      .append("defs")
      .attr("class","animate");


      //Slider output current day position of slider
      $('body').on('input', '#slider', function () {
        console.log('current value: ', $(this).val());
      });

      //1. Start a new day
      ++day;
      $("h4").text("Infection Day" + " " + day);
      $('#slider').attr('max', day);
      infectionHistory[day] = {};
      console.log("day ", day);
      //2. Run propagation to the regions with true infectStatus
      Object.keys(regionsData).filter(function (region) {
        return this[region].infectStatus;
      }, regionsData).forEach(propagate, regionsData);
      //3. Save snapshot of today's records of all the history
      //debugger
      Object.keys(regionsData).forEach(function (regionKey) {
        var region = this[regionKey];
        infectionHistory[day][regionKey] = {
          infectStatus: region.infectStatus,
          infectDegree: region.infectDegree,
          direction: region.direction
        };
      }, regionsData);

      console.log("Day", day, " - infectHistory: ", infectionHistory);
      //4. Animation
      animate(infectionHistory[day]);

      //4.5 check user survival
      if (userAlive === true) {
        userAlive = checkSurvival(regionsData[currentRegion], day)
      }


      //6. Display game message
      displayMessage(day);

      //5. if every regions is been infected, to 100 then game stop
      if (!survivorsLeft() || day === 28) {
        console.log('Finish');
        selectEnding(userAlive, deathDate);
        $("#info-box").append("<div id='restartButton'>Restart?" +
          "<br>" +
          "<button class='btn' id='restart-btn'>Restart</button>" +
          "</div>");

        //$("#main").attr('disabled', 'disabled');
        //var event = $(document).click(function(e) {
        //  e.stopPropagation();
        //  e.preventDefault();
        //  e.stopImmediatePropagation();
        //  return false;
        //});



        $('#restart-btn').on('click',function(){
          //debugger
          //$("#main").removeAttr('disabled');
          $("h4").text("Infection Day" + " 0");
          canSelectRegion = true;
          $(".tgl.tgl-flat").prop("checked", false);
          $('#slider-box').hide();
          $('#restartButton').remove();
          for (key in regionsData) {
            regionsData[key].infectStatus = false;
            regionsData[key].infectDegree = 0;
          }
          day = 0;
          infectionHistory = [];
          mapJ.selectAll("path").style("fill", "white");
          $("#board").remove();
          $("#selectSection").show();
          $("#side-nav").slideDown("fast");
        });

        //Slider Show on Completion
        $('#slider-box').show();
        $('#slider').show();
        $('#slider').val(28);
        return;
      }



      //7. Run next day
      setTimeout(function () {
        infect();
      }, 500);
    }


    //Slider change animation of day
    $('body').on('input', '#slider', function () {
      animate(infectionHistory[$(this).val()]);
      console.log(infectionHistory);
    });

    //Slider dynamic Day
    $("input").on("input", function () {
      $("h4").text("Infection Day" + " " + $(this).val());
    });

    //Run the game!!
    infect();
  });
});
