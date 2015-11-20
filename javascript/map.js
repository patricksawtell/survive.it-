var regionsData = {};
var svg = d3.select("#map")
  .append("svg")
  .attr("width", 600)
  .attr("height", 600)
  .style("border", "solid 5px white")
  .attr("viewBox", "-3160 -1725 655 527");

var neighborNames;
var centered;
d3.csv("RegionsBC.csv", function (data) {
  d3.json("bc29.topo.json", function (map) {

    //Initialize the region data in hash
    var geometries =map.objects.bc_29_crs84.geometries;
    geometries.forEach(function(region){
      var name = region.properties.CDNAME;
      regionsData[name] = {};
      regionsData[name]['infectStatus'] = false;
    })


    //Store the csv data into hash
      for (var i = 0; i < data.length; i++) {
      var regionName = data[i].Name;
      var regionValue = parseFloat(data[i].Population);
      regionsData[regionName]['population'] = regionValue;
    };

    //Draw the map
    var projection = d3.geo.mercator().scale(2000);
    var path = d3.geo.path().projection(projection);
    var featureCollection = topojson.feature(map, map.objects.bc_29_crs84);
    var neighbors = topojson.neighbors(map.objects.bc_29_crs84.geometries);


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

    var mapJ = svg.selectAll("path")
      .data(featureCollection.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", function (item) {
        return item.properties.CDNAME;
      })
      .on("mouseover", mouseOver).on("mouseout", mouseOut)
      .on('click', clicked);


  var toolTip =   function tooltipHtml(d, population){
  		return "<h4>"+d+"</h4><table>"+
  			"<tr><td>Population</td><td>"+population+"</td></tr>"+
  			"</table>";
  	   }
       toolTip();

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
    var getGeoName = function (name) {
      return name.properties.CDNAME;
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

    //Click event
    function clicked(d){
      if (d && centered !== d) {
        centered = d;
        var regionName = d.properties.CDNAME;
        $('svg').each(function () {
          $(this)[0].setAttribute('viewBox', regionsData[regionName]['bbox']);
        });
      } else {
        centered = null;
        $('svg').each(function () {
          $(this)[0].setAttribute('viewBox', viewBox)
        });
      }

    }


  });
});
//$(window).click((e) => console.log(e.target))  this is to check what is been clicked
$(function () {
  $('svg').on('click','path', function(){
    $(this).attr('id');
    var currentRegion =  $(this).attr('id');
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

});
