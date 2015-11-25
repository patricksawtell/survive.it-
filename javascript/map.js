var regionsData = {};
var svg = d3.select("#map")
  .append("svg")
  .attr("width", 600)
  .attr("height", 600)
  .attr("viewBox", "-3160 -1725 655 527")
  .style("border", "solid 5px black"); //can delete style if not needed
var neighborNames;
var mapJ = svg.append("g").attr("id", "main");
var densityLayer = svg.append("g").attr("id", "density");
var populationLayer = svg.append("g").attr("id", "population");
var hospitalsLayer = svg.append("g").attr("id", "hospitals");
var wildlifeLayer = svg.append("g").attr("id", "wildlife");
var bearsLayer = svg.append("g").attr("id", "bears");
var goatsLayer = svg.append("g").attr("id", "goats");
var caribouLayer = svg.append("g").attr("id", "caribou");
var deerLayer = svg.append("g").attr("id", "deer");


d3.csv("RegionsBc.csv", function (data) {
  d3.json("bc29.topo.json", function (map) {

    //Initialize the region data in hash
    var geometries =map.objects.bc_29_crs84.geometries;
    geometries.forEach(function(region){
      var name = region.properties.CDNAME;
      regionsData[name] = {};
      regionsData[name]['infectStatus'] = false;
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
    };
      //regionsData[regionName]['survivalrate'] = survivalRate(regionPopulation,regionDensity,regionHospitals,regionBears,regionGoats,regionCaribou,regionDeer )
    //
    //function survivalRate(population, density, hospital, bears, goats, caribou, deer){
    //  return population*(-0.000001)+density*(-0.001)+hospital*(2)+bears*(-0.01)+goats*(0.01)+caribou*(0.01)+deer*(0.02)
    //}


//Draw the map
    var projection = d3.geo.mercator().scale(2000);
    var path = d3.geo.path().projection(projection);
    var featureCollection = topojson.feature(map, map.objects.bc_29_crs84);
    var neighbors = topojson.neighbors(map.objects.bc_29_crs84.geometries);

//Tooltip Functionality

    function mouseOver(d){
      var regionName = d.properties.CDNAME
      var population = regionsData[regionName]['population']
      displayName = regionName.split("_").join(" ")
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
    	   }
         toolTip();

// Draws the map regions

    mapJ.selectAll("path")
      .data(featureCollection.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", function (item) {
        return item.properties.CDNAME;
      })
      .on("mouseover", mouseOver).on("mouseout", mouseOut);

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
//				.style("fill", colorForProp('Density', '#faa'))
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

    goatsLayer.selectAll("path")
      .data(featureCollection.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", getGeoName)
      .style("fill", function(d){
        var name = d.properties.CDNAME;
        var goats = regionsData[name].goats;
        return getColorLinear(goats, 'Goats')
      })
      .style("opacity", 1);

    caribouLayer.selectAll("path")
      .data(featureCollection.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", getGeoName)
      .style("fill", function(d){
        var name = d.properties.CDNAME;
        var caribou = regionsData[name].caribou;
        return getColorLinear(caribou, 'Caribou')
      })
      .style("opacity", 1);

    deerLayer.selectAll("path")
      .data(featureCollection.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", getGeoName)
      .style("fill", function(d){
        var name = d.properties.CDNAME;
        var deer = regionsData[name].deer;
        return getColorLinear(deer, 'Deer')
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
//					 .range([
//						 textures.lines().thinner(),
//						 textures.lines().thicker()
//					 ]);

      return color(val);
    }

    // calculate bounding box coordinate
    var regions = $('svg path').toArray()
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
				var viewBox = result.minX + ' ' + result.minY + ' ' + result.width + ' ' + result.height;
				return viewBox;
			}

			//calculate single bounding box of region
			$('svg path').toArray().forEach(function(region, index){
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
					}
				});

		//Set the view Box
		var viewBox = getBoundingBox(allCoordinates);
    $('svg').each(function () {
      $(this)[0].setAttribute('viewBox', viewBox)
    });


    //Get the neighbor reference list (In region name)
    function getGeoName(name) {
      return name.properties.CDNAME;
    }
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
  });
});


//$(window).click((e) => console.log(e.target))  this is to check what is been clicked
$(function () {
  $('svg').on('click','path', function(){
    $(this).attr('id');
    var currentRegion =  $(this).attr('id');

    var selectedRegion = regionsData[currentRegion];
    var graphData = [regionsData[currentRegion].caribou, regionsData[currentRegion].bears, regionsData[currentRegion].deer, regionsData[currentRegion].goats];

// Create graphs for each region
    var width = 225,
        height = 200
        radius = Math.min(width, height) / 2;

    var color = d3.scale.category10();
    var domain = ["Caribou", "Bears", "Deer", "Goats"]
    color.domain(domain)
    .range(["#3399FF", "#5DAEF8", "#86C3FA", "#ADD6FB", "#D6EBFD"]);

    var arc = d3.svg.arc()
        .outerRadius(radius)
        .innerRadius(radius - 20);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d;});

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
            .style("fill", function(d) {
              return color(d.data); });

// Generate labels for charts

      g.append("text")
          .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
          .attr("dy", ".35em")
          .style("text-anchor", "middle")
          .text(function(d) { return graphData.label; });

          g.append("text")
           .attr("transform", function(d) { //set the label's origin to the center of the arc
             //we have to make sure to set these before calling arc.centroid
             d.radius = radius + 50; // Set Outer Coordinate
             d.innerRadius = radius + 45; // Set Inner Coordinate
             return "translate(" + arc.centroid(d) + ")";
           })
           .attr("text-anchor", "middle") //center the text on it's origin
           .style("fill", "Purple")
           .style("font", "bold 12px Arial")
           .text(function(d, i) { return selectedRegion[i]; }); //get the label from our original data array

         // Add a magnitude value to the larger arcs, translated to the arc centroid and rotated.
         g.filter(function(d) { return d.endAngle - d.startAngle > .2; }).append("text")
           .attr("dy", ".35em")
           .attr("text-anchor", "middle")
           //.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")rotate(" + angle(d) + ")"; })
           .attr("transform", function(d) { //set the label's origin to the center of the arc
             //we have to make sure to set these before calling arc.centroid
             d.radius = radius; // Set Outer Coordinate
             d.innerRadius = radius/2; // Set Inner Coordinate
             return "translate(" + arc.centroid(d) + ")rotate(" + angle(d) + ")";
           })
           .style("fill", "White")
           .style("font", "bold 10px Arial")
           .text(function(d) { return d.data; });

         // Computes the angle of an arc, converting from radians to degrees.
         function angle(d) {
           var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
           return a > 90 ? a - 180 : a;
         }

//Show/hide the info box based
    function infoBox(){
      $('svg').on('click', function(){
        $('#info-box').toggle("slide", {direction:"down"}, 1000);
      });
    }

    var currentNeighbors = function(currentRegion){
      return neighborNames[currentRegion];
    };

    d3.select(this).style('fill', 'red');

    regionsData[currentRegion].infectStatus = true;
    var propagation = function(target){
      setTimeout(function(){
        currentNeighbors(target).forEach(function(region){
          d3.select('#'+region).style('fill', 'red');
          regionsData[region].infectStatus = true;
        })
      }, 1000)
    };
    propagation(currentRegion);
  });

// Infection rate propagation

$(function () {
  $('svg').on('click', 'path', function () {

      var currentRegion = $(this).attr('id');
      var currentNeighbors = function (currentRegion) {
          var neighbours = neighborNames[currentRegion];
          return neighbours.filter(function(name) {
              return !regionsData[name].infectStatus;
          });
      };
      //d3.select(this).style('fill', 'red');

      //regionsData[currentRegion].infectStatus = true;
      //var propagation = function (target) {
      //    if (currentNeighbors(target).length == 0) return;
      //    setTimeout(function () {
      //        currentNeighbors(target).forEach(function (region) {
      //            d3.select('#' + region).style('fill', 'red');
      //            regionsData[region].infectStatus = true;
      //            propagation(region);
      //
      //        })
      //    }, 1000)

      //using d3.select(this) will overwrite current layer's color, changed logic so it targets same layer as the propagation
      regionsData[currentRegion].infectStatus = true;
      var propagation = function(target){
        d3.select('#'+target).style('fill', 'red');
        setTimeout(function(){
          currentNeighbors(target).forEach(function(region){
            d3.select('#'+region).style('fill', 'red');
            regionsData[region].infectStatus = true;
          })
        }, 1000)
      };
      propagation(currentRegion);
  });

});

});
