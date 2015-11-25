/**
 * Created by TOTO on 11/25/15.
 */
$(function() {
  //Start Game
  $("#info-box").on("click", "#select-btn", function () {
    $("#side-nav").slideUp("fast");
    $('g').not("#main").attr("style", "display: none");
    var board = $("<div>").css({
      "border": "solid 2px white",
      "border-radius": "10px",
      "width": "95%",
      "height": "500px",
      "margin": "10px auto"
    }).attr("id", "board");
    $("#side").append(board)

    var day = 0;
    var startRegion = currentRegion;
    regionsData[startRegion].infectStatus = true;
    regionsData[startRegion].direction = "center";

    //When outbreak spread, you need to find the neighbours without being infected yet
    function getCurrentNeighbors(currentRegion) {
      var neighbours = neighborNames[currentRegion];
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
        infectedRegion.infectDegree += infectionIncrement;
      }
      if (infectedRegion.infectDegree === infectionThreshold) {
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

    //Animate color
    function animate(record) {
      Object.keys(regionsData).forEach(
        function (region) {
          var infectedRegion = this[region];
          if (infectedRegion.infectStatus) {
            var degree = infectedRegion.infectDegree;
            var colorBA = 255 / 100;
            var colorNum = 255 - colorBA * degree;
            $("#" + region).css({"fill": "rgb(255," + colorNum + ',' + colorNum + ")"});
          }
        }
        , record)
    }

    function displayMessage(day) {
      var infectedRegions = Object.keys(infectionHistory[day]).filter(function (region) {
        return this[region].infectStatus;
      }, infectionHistory[day]);
      console.log("Day: ", day);
      $("#board").append("<p>Day: " + day + "</p>");
      //infectedRegions.forEach(function(region){
      //  console.log("Region ",region, " is infected!!! Infect Degree: ",infectionHistory[day][region]["infectDegree"]);
      //});
    }

    //Take snapshot of 0 day
    infectionHistory[0] = {};
    Object.keys(regionsData).forEach(function (region) {
      infectionHistory[0][region] = {};
      infectionHistory[0][region]["infectStatus"] = regionsData[region]["infectStatus"];
      infectionHistory[0][region]["infectDegree"] = regionsData[region]["infectDegree"];
      infectionHistory[0][region]["direction"] = regionsData[region]["direction"];
    });

    displayMessage(0);

    //initialize the game properties
    var infectionIncrement = 10;
    var infectionThreshold = infectionIncrement * 4;
    var maxDegree = 100;


    //Game Logic
    function infect() {
      //1. Start a new day
      ++day;
      infectionHistory[day] = {};
      console.log("day ", day);
      //2. Run propagation to the regions with true infectStatus
      Object.keys(regionsData).filter(function (region) {
        return this[region].infectStatus;
      }, regionsData).forEach(propagate, regionsData);
      //3. Save snapshot of today's records of all the history
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

      //5. if every regions is been infected, to 100 then game stop
      if (!survivorsLeft() || day === 28) {
        console.log('Finish');
        return;
      }

      //6. Display game message
      displayMessage(day);

      //7. Run next day
      setTimeout(function () {
        infect();
      }, 500);
    }


    //Run the game!!
    infect();
  });
});

