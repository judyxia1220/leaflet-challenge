// Load GeoJSON data of earthquakes within the past 30 days
const earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Perform a GET request to the query URL
d3.json(earthquakeURL).then(function (data) {
    createFeatures(data.features);
});

// Define markerSize() function that will give markers of different earthquake magnitudes different radii
function markerSize(magnitude) {
    return magnitude * 4;
}

// Define a function for determining the color of the markers based on the size of earthquakes
function colorDepth(depth) {
    if (depth < 25) {
        return "#2006df";
    } else if (depth < 50) {
        return "#400dbf";
    } else if (depth < 75) {
        return "#60139f";
    } else if (depth < 100) {
        return "#7f1a80";
    } else if (depth < 200) {
        return "#9f2060";
    } else if (depth < 300) {
        return "#bf2640";
    } else {
        return "#df2d20";
    }
}

function createFeatures(earthquakeData) {
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
        const magnitude = feature.properties.mag;
        const depth = feature.geometry.coordinates[2];

        // Customize markers
        const markers = {
            color: "white",
            radius: markerSize(magnitude),
            fillColor: colorDepth(depth),
            fillOpacity: 0.75,
            weight: 0.5,
        };

        // Give each feature a popup that describes place, time, and magnitude of Earthquake
        layer.bindPopup(
            `<h3>${feature.properties.place}</h3><hr><p>${new Date(
                feature.properties.time
            )}</p><p>Magnitude: ${magnitude}<br>Depth: ${depth}</p>`
        );
        layer.setStyle(markers);
    }

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        onEachFeature: onEachFeature,
    });

    // Send our earthquakes layer to the createMap function.
    createMap(earthquakes);
}

// Adding the layers
function createMap(earthquakes) {
    // Create base layers
    let street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    let topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        attribution:
            'Map data: &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    });

    // Create baseMap object
    let baseMaps = {
        "Street Map": street,
        "Topographic Map": topo,
    };

    // Create an overlay object to hold overlay
    let overlayMaps = {
        Earthquakes: earthquakes,
    };

    // Create Map Object
    let myMap = L.map("map", {
        center: [40, -100],
        zoom: 5,
        layers: [topo, earthquakes],
    });

    // Create a layer control and add to map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false,
    }).addTo(myMap);

    // Add legend
    let legend = L.control({ position: "bottomright" });

    // Define content of the legend
    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'legend'),
        grades =[0, 25, 50, 75, 100, 200, 300],
        labels =[];
        div.innerHTML = "<h3>Depth</h3>";

        // loop through the different earthquake depths and generate label 
        for (let i = 0; i < grades.length; i++) {
            let color = colorDepth(grades[i] + 1)
            let depth = grades[i] + 1;
            let label = (depth - 1) + (grades[i + 1]? '&ndash;' + (grades[i + 1] - 1) + '<br>' : '+');
            labels.push(
                '<i style="background:' + color + '; color: white;"></i> ' +
                label
            )
        };
        
        div.innerHTML += labels.join('<br')
        return div;
    };

    // add legend to map
    legend.addTo(myMap);
}
