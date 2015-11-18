// Create SVG element
var svg = d3.select("#map")
  .append("svg")
  .attr("width", "80%")
  .attr("height", "80%")
  .attr("viewBox", "-1946.9187411654511 -1066.9600480519075 436.297064352382 351.40925503670087");

//Create a color scale for different value of regions
var color = d3.scale.quantize()
  .range(["#6B6B6B", "#BCBDC9", "#2C2C2C", "#DEDEDE", "#5C5C5C", "#737374", "#E6E6E8", "#83848C" ]);


//The neighbor region reference
var idName;
var neighborNames;
//The region's status of outbreak
var regionStatuts;

//Load the csv file to D3
d3.csv("population.csv", function (data) {

  color.domain([
    d3.min(data, function (d) {
      return d.value;
    }),
    d3.max(data, function (d) {
      return d.value;
    })
  ]);
  //Load the json file to D3
  d3.json("bc_crs84.topo.json", function (error, map) {
    //mapping the csv data to map!!
    for (var i = 0; i < data.length; i++) {
      var dataRegion = data[i].name;
      var dataValue = parseFloat(data[i].value);
      for (var j = 0; j < map.objects.collection.geometries.length; j++) {
        var mapRegion = map.objects.collection.geometries[j].properties.DR_NAME;
        if (dataRegion === mapRegion) {
          map.objects.collection.geometries[j].properties.value = dataValue;
          break;
        }
      }
    }

    if (error) return console.error(error);

    //Set the projection and the path setting
    var projection = d3.geo.mercator().scale(1000);
    var path = d3.geo.path().projection(projection);
    var featureCollection = topojson.feature(map, map.objects.collection);
    var geometries = map.objects.collection.geometries;
    var getGeoName = function (name) {
      return name.properties.DR_NAME;
    };
    //Get the neighbor reference list (In region name)
    idName = geometries.map(getGeoName);
    var neighbors = topojson.neighbors(geometries);
    var nameMap = function (geoIndex) {
      return getGeoName(geometries[geoIndex]);
    };
    neighborNames = neighbors.reduce(function (valuesSoFar, currentValue, index) {
      var name = idName[index];
      valuesSoFar[name] = currentValue.map(nameMap);
      return valuesSoFar;
    }, {});
    //Drawing the map
    var mapJ = svg.selectAll("path")
        .data(featureCollection.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id", function (item) {
          return item.properties.DR_NAME;
        })
        .style("fill", function (d) {
          //Get data value
          var value = d.properties.value;
          if (value) {
            //If value exists…
            return color(value);
          } else {
            //If value is undefined…
            return "#ccc";
          }
        })
      ;

    //Assign the outbreak status of each regions
    regionStatuts = idName.reduce(function(pre, current, index){
      pre[current]= false ;
      return pre;
    },{});
  });
});


  $(function(){
//When click the region, change the current region and neighbor regions
  $('svg').on('click','path', function(){
    var currentRegion =  $(this).attr('id');
    var currentNeighbors = function(currentRegion){
      return neighborNames[currentRegion];
    };
    d3.select(this).style('fill', 'red');
    regionStatuts[currentRegion] = true;
    var propagation = function(target){
      setTimeout(function(){
        currentNeighbors(target).forEach(function(region){
          d3.selectAll('#'+region).style('fill', 'red');
          regionStatuts[region] = true;
        })
      }, 1000)
    };

    propagation(currentRegion);
  });

});
