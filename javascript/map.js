var width = 850;
var height = 700;
var regionsData = {};
var svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);


var mapJ = svg.append("g").attr("id", "main");

var densityLayer = svg.append("g").attr("id", "density");
var populationLayer = svg.append("g").attr("id", "population");
var hospitalsLayer = svg.append("g").attr("id", "hospitals");
var wildlifeLayer = svg.append("g").attr("id", "wildlife");
var bearsLayer = svg.append("g").attr("id", "bears");
var goatsLayer = svg.append("g").attr("id", "goats");
var caribouLayer = svg.append("g").attr("id", "caribou");
var deerLayer = svg.append("g").attr("id", "deer");
var neighborNames;
var neighborDirection;
var infectionHistory = [];
var currentRegion;



d3.csv("RegionsBC.csv", function (data) {
  d3.json("bc29.topo.json", function (map) {

    //Initialize the region data in hash
    var geometries =map.objects.bc_29_crs84.geometries;
    geometries.forEach(function(region){
      var name = region.properties.CDNAME;
      regionsData[name] = {};
      regionsData[name]['infectStatus'] = false;
      regionsData[name]['infectDegree'] = 0;
    });

    //Store the csv data into hash
    var newData = [];
    for (var i = 0; i < data.length; i++) {
      var regionName = data[i].Name;
      var regionPopulation = data[i].Population;
      var regionDensity = data[i].Density;
      var regionHospitals = data[i].Hospitals;
      var regionWildlife = data[i].Wildlife;
      var regionBears = data[i].Bears;
      var regionGoats = data[i].Goats;
      var regionDeer = data[i].Deer;
      var regionCaribou = data[i].Caribou;
      regionsData[regionName]['population'] = +regionPopulation;
      regionsData[regionName]['density'] = +regionDensity;
      regionsData[regionName]['hospitals'] = +regionHospitals;
      regionsData[regionName]['wildlife'] = +regionWildlife;
      regionsData[regionName]['bears'] = +regionBears;
      regionsData[regionName]['goats'] = +regionGoats;
      regionsData[regionName]['deer'] = +regionDeer;
      regionsData[regionName]['caribou'] = +regionCaribou;
      regionsData[regionName]['survivalrate'] = survivalRate(regionPopulation,regionDensity,regionHospitals,regionBears,regionGoats,regionCaribou,regionDeer )
    };

    function survivalRate(population, density, hospital, bears, goats, caribou, deer){
      return population*(-0.000001)+density*(-0.001)+hospital*(3)+bears*(-0.001)+goats*(0.001)+caribou*(0.002)+deer*(0.002)
    }
    //TODO fix number, add police station or rescue station? supermarkets?


//Set Projection and get the neighbours list(but only with number)
    var projection = d3.geo.mercator().scale(2000);
    var path = d3.geo.path().projection(projection);
    var featureCollection = topojson.feature(map, map.objects.bc_29_crs84);
    var neighbors = topojson.neighbors(map.objects.bc_29_crs84.geometries);

//Tooltip Functionality

    function mouseOver(d){
      var regionName = d.properties.CDNAME;
      var population = regionsData[regionName]['population'];
      displayName = regionName.split("_").join(" ");
      d3.select("#tooltip").transition().duration(200).style("opacity", .9);
      d3.select("#tooltip").html(toolTip(displayName, population))
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    }

    function mouseOut(){
      d3.select("#tooltip").transition().duration(500).style("opacity", 0);
    }

    var toolTip =   function tooltipHtml(d, population){
      return "<h4>"+d+"</h4><table>"+
        "<tr><td>Population</td><td>"+population+"</td></tr>"+
        "</table>";
    };
    toolTip();

    mapJ.selectAll("path")
      .data(featureCollection.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", function (item) {
        return item.properties.CDNAME;
      })
      .attr("class", "region")
      .on("mouseover", mouseOver).on("mouseout", mouseOut)
      .on('click', function(){
        d3.select(this).transition().attr("width", 120);
      });


//Generate layers for filters
    populationLayer.selectAll("path")
      .data(featureCollection.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", getGeoName)
      .style("fill", function(d){
        var name = d.properties.CDNAME;
        var population = regionsData[name].population;
        return getColorLog(population, 'Population')
      })
      .style("opacity", 1);

    densityLayer.selectAll("path")
      .data(featureCollection.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", getGeoName)
      .style("fill", function(d){
        var name = d.properties.CDNAME;
        var density = regionsData[name].density;
        return getColorLog(density, 'Density')
      })
      .style("opacity", 1);

    hospitalsLayer.selectAll("path")
      .data(featureCollection.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", getGeoName)
      .style("fill", function(d){
        var name = d.properties.CDNAME;
        var hospitals = regionsData[name].hospitals;
        return getColorLinear(hospitals, 'Hospitals')
      })
      .style("opacity", 1);

    wildlifeLayer.selectAll("path")
      .data(featureCollection.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", getGeoName)
      .style("fill", function(d){
        var name = d.properties.CDNAME;
        var wildlife = regionsData[name].wildlife;
        return getColorLinear(wildlife, 'Wildlife')
      })
      .style("opacity", 1);

    bearsLayer.selectAll("path")
      .data(featureCollection.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", getGeoName)
      .style("fill", function(d){
        var name = d.properties.CDNAME;
        var bears = regionsData[name].bears;
        return getColorLinear(bears, 'Bears')
      })
      .style("opacity", 1);

    // Color functions
    function getColorLinear(val, prop) {
      var color = d3.scale.linear()
        .domain([
          d3.min(data, function (d) {
            return parseFloat(d[prop]);
          }),
          d3.max(data, function (d) {
            return parseFloat(d[prop]);
          })
        ])
        .range([
          "white", "green"]);

      return color(val);
    }

    function getColorLog(val, prop) {
      var color = d3.scale.log()
        .domain([
          d3.min(data, function (d) {
            return parseFloat(d[prop]);
          }),
          d3.max(data, function (d) {
            return parseFloat(d[prop]);
          })
        ])
        .range([
          "white", "red"]);
      return color(val);
    }

    // calculate bounding box coordinate
    var regions = $('svg .region')
      .toArray()
      .map(function (region) {
        if (region.getAttribute('d')) {
          return region.getAttribute('d').split(/[MZ]/).join('').split('L').map(function (s) {
            var pairs = s.split(',');
            return pairs.map(function (n) {
              return parseFloat(n);
            });
          });
        }
      });
    var allCoordinates = _.flatten(regions);

    function getBoundingBox(Coordinates) {
      var result = {};
      result.minX = _.min(Coordinates, function (coordinate) {
        return coordinate[0]
      })[0];
      result.minY = _.min(Coordinates, function (coordinate) {
        return coordinate[1]
      })[1];
      result.maxX = _.max(Coordinates, function (coordinate) {
        return coordinate[0]
      })[0];
      result.maxY = _.max(Coordinates, function (coordinate) {
        return coordinate[1]
      })[1];
      result.width = result.maxX - result.minX;
      result.height = result.maxY - result.minY;
      var marginW = result.width * 0.05;
      var marginH = result.height * 0.05;

      var viewBox = (result.minX) + ' ' + (result.minY + marginH) + ' ' + (result.width + marginW) + ' ' + (result.height + marginH);
      return viewBox;
    }
    //Set the view Box
    var viewBox = getBoundingBox(allCoordinates);
    $('svg').each(function () {
      $(this)[0].setAttribute('viewBox', viewBox)
    });
    //calculate single bounding box of region
    $('svg .region').toArray().forEach(function(region, index){
      if (region.getAttribute('d')) {
        var regionName = region.getAttribute('id');
        var coordinates = region.getAttribute('d').split(/[MZ]/).join('').split('L').map(function (s) {
          var pairs = s.split(',');
          return pairs.map(function (n) {
            return parseFloat(n);
          });
        });
        coordinates = getBoundingBox(coordinates);
        regionsData[regionName]['bbox'] = coordinates;
        var center = getCenterCoordinate(coordinates, regionName);
        regionsData[regionName]['center'] = center;
      }
    });

    //Get the center of bbox
    function getCenterCoordinate(Coordinates, region) {
      var bbox = regionsData[region]['bbox'].split(' ').map(function(c){
        return parseFloat(c);});
      var x = bbox[0]+(bbox[2]/2);
      var y = bbox[1]+(bbox[3]/2);
      return [x, y];
    }

    //Compare direction of two regions
    function getDirection(from, to){
      var x1 = from[0], y1 = from[1];
      var x2 = to[0], y2 = to[1];
      if(x1 > x2){
        if(y1 > y2){
          return "right_bottom"
        }else if(y1 < y2){
          return "right_top"
        }else{
          return "right"
        }
      }else if(x1 < x2){
        if(y1 > y2){
          return "left_bottom"
        }else if(y1 < y2){
          return "left_top"
        }else{
          return 	"left"
        }
      }
      else{
        if(y1 < y2){
          return "bottom"
        }else{
          return	"top"
        }
      }
    }

    //Get the neighbor reference list (In region name)
    var getGeoName = function (region) {
      return region.properties.CDNAME;
    };
    var idName = geometries.map(getGeoName);
    var neighbors = topojson.neighbors(geometries);
    var nameMap = function (geoIndex) {
      return getGeoName(geometries[geoIndex]);
    };
    neighborNames = neighbors.reduce(function (valuesSoFar, currentValue, index) {
      var name = idName[index];
      valuesSoFar[name] = currentValue.map(nameMap);
      return valuesSoFar;
    }, {});

    //Get the direction of neighbor
    neighborDirection = neighbors.reduce(function (valuesSoFar, currentValue, index) {
      var name = idName[index];
      valuesSoFar[name] = {};
      currentValue.forEach(function(value, index){
        var result = {};
        var regionName = nameMap(value);
        var fromPoint = regionsData[name]["center"];
        var toPoint = regionsData[regionName]["center"];
        valuesSoFar[name][regionName] = getDirection(fromPoint, toPoint);
      });
      return valuesSoFar;
    }, {});
  });
});


//$(window).click((e) => console.log(e.target))  this is to check what is been clicked
$(function () {

  $('svg').on('click','path', function() {
    $('#info-box').slideDown("swing", 4000);

    currentRegion = $(this).attr('id');
    d3.selectAll("#main > path")
    .each(function()
    {
      d3.select(this)
      .transition()
      .duration(150)
      .style('stroke-width', 1)
      .style('fill', 'white')
      .attr('transform', 'translate(0)');
    });

    var $path = d3.select(this).moveToFront();
    $path
      .transition()
      .duration(250)
      .style('stroke-width', 5)
      .style('fill', "orange")
      .attr('transform', 'translate(10 -10)');


    var selectedRegion = regionsData[currentRegion];
    var graphData = [regionsData[currentRegion].caribou, regionsData[currentRegion].bears, regionsData[currentRegion].deer, regionsData[currentRegion].goats];


    $('#info-box').html(infoBox(currentRegion.split("_").join(" "), regionsData[currentRegion].population, regionsData[currentRegion].density, regionsData[currentRegion].hospitals));

// Create graphs for each region
    var width = 225,
      height = 175,
      radius = Math.min(width, height) / 2;

    var color = d3.scale.category10();
    var domain = ["Caribou", "Bears", "Deer", "Goats"]
    color.domain(domain)
      .range(["#add4a3", "#65b6aa", "#5b7d8d", "#4f2958"]);

    var arc = d3.svg.arc()
      .outerRadius(radius)
      .innerRadius(radius - 20);

    var pie = d3.layout.pie()
      .sort(null)
      .value(function (d) {
        return d;
      });

    var svg = d3.select("#info-box").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = svg.selectAll(".arc")
      .data(pie(graphData))
      .enter().append("g")
      .attr("class", "arc");

    g.append("path")
      .attr("d", arc)
      .style("fill", function (d) {
        return color(d.data);
      });



// Generate labels for charts

    g.append("text")
      .attr("transform", function (d) {
        return "translate(" + arc.centroid(d) + ")";
      })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function (d) {
        return graphData.label;
      });

    g.append("text")
      .attr("transform", function (d) { //set the label's origin to the center of the arc
        //we have to make sure to set these before calling arc.centroid
        d.radius = radius + 50; // Set Outer Coordinate
        d.innerRadius = radius + 45; // Set Inner Coordinate
        return "translate(" + arc.centroid(d) + ")";
      });

    // Add a magnitude value to the larger arcs, translated to the arc centroid and rotated.
    g.filter(function (d) {
      return d.endAngle - d.startAngle > .2;
    }).append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      //.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")rotate(" + angle(d) + ")"; })
      .attr("transform", function (d) { //set the label's origin to the center of the arc
        //we have to make sure to set these before calling arc.centroid
        d.radius = radius; // Set Outer Coordinate
        d.innerRadius = radius / 2; // Set Inner Coordinate
        return "translate(" + arc.centroid(d) + ")rotate(" + angle(d) + ")";
      })
      .style("fill", "White")
      .style("font", "bold 18px Arial")
      .text(function (d) {
        return d.data;
      });

    // Computes the angle of an arc, converting from radians to degrees.
    function angle(d) {
      var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
      return a > 90 ? a - 180 : a;
    }

    $('#info-box').append("<p>Is this where you'd like to hide out?" +
      "<button class='btn' id='select-btn'>Yes</button>" +
    "</p>");

//Generate infobox
    function infoBox(d, population, density, hospitals){
      $('#info-box').html( function(){
          return "<h3>"+d+"</h3>"+
          "<ul id='infoList'>"+
            "<li><strong>Population: </strong>" +population+ "</li>"+
            "<li><strong>Population Density:</strong> " +density+" per km<sup>2</li>"+
            "<li><strong>Hospitals: </strong>" +hospitals+"</li></ul>"+
            "<ul id='legend'>" +
          "<li><span id='bears'></span> Bears <span id='caribou'></span> Caribou </li>" +
             "<li><span id='deer'></span> Deer <span id='goats'></span> Mountain Goats</li>";
      });
    }

  });
});
