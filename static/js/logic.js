//earthquake data api
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
//tictonic plate json static file
var tectonicPlatesJson = "/static/resources/tictonicPlates.json"


// GET request to the query URL
d3.json(earthquakeURL, function(data) {
  addFeatures(data.features);
});

//popup display
function addFeatures(earthquakeData) {

  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Location: "+ feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
    
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: .5,
        color: "#000",
        stroke: true,
        weight: .9
    })
  }
  });

  
  // add  earthquakes layer  the createMap 
  createMap(earthquakes);
}


function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
      "access_token="+API_KEY);
  
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token="+API_KEY);

    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?" +
      "access_token="+API_KEY);
  
    // basemap features 
    var baseMaps = {
      "Satellite": satellite,
      "GrayScale": lightmap,
      "Outdoors": outdoors

    };

    // tectonic plates layer
    var tectonicPlates = new L.LayerGroup();

    // Create overlay for earthquake and tectonic
    //*************check fault line not display-mar 9 2020
    var overlayMaps = {
      "Fault_lines": tectonicPlates,
      "Earthquakes": earthquakes
 
    };


    // Add Fault lines data // Adding our geoJSON data,
    d3.json(tectonicPlatesJson, function(pData) {
      L.geoJson(pData, {
        color: "ff8800",
        weight: 3
      })
      .addTo(tectonicPlates);
  });
    // create satelight initial load
    var myMap = L.map("map", {
        center: [
          43.65, -79.40],
        zoom: 3,
        layers: [satellite, earthquakes, tectonicPlates]
      }); 
  
  
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

  //Create a legend on the bottom left
  var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(myMap){
      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };

  legend.addTo(myMap);
}
   

  //Create color range for the circle diameter 
  function getColor(d){
    return d > 5 ? "#ac4802":
    d  > 4 ? "#e46206":
    d > 3 ? "#ca5705":
    d > 2 ? "#b8810b":
    d > 1 ? "#f5a906":
             "b5f506";
  }

  //Change the maginutde of the earthquake by a factor of 25,000 for the radius of the circle. 
  function getRadius(value){
    return value*30000
  }