/**
 * @ Dr. S. Boroushaki
 * Introduction to ESRI JavaScript 4.x
 */

let aMap, aView, aSFVLayer, BGSimpleRenderer2;

$(function () {

    // With strict mode, you can not use undeclared variables.
    // Strict mode makes it easier to write "secure" JavaScript. https://www.w3schools.com/js/js_strict.asp
    "use strict";

    console.info("Start Web-Mapping with ESRI!");
    require([
        "esri/Map",
        "esri/views/MapView",
        "esri/widgets/BasemapToggle",
        "esri/Basemap",
        "esri/layers/FeatureLayer",
        "esri/request"
    ], function (Map, MapView, BasemapToggle, Basemap, FeatureLayer, esriRequest) {

        let BGSimpleRenderer = {
            type: "simple",
            symbol: {
                type: "simple-fill",
                color: "#FFC300",
                style: "diagonal-cross", //"diagonal-cross" "none" "cross" "solid"
                outline: {
                    color: "#FFFEFC",
                    width: 1,
                    style: "solid" // "none" "dash-dot" "solid"
                }
            }
        };

        BGSimpleRenderer2 = {
            type: "simple",
            symbol: {
                type: "simple-fill",
                color: "#99958D ",
                style: "solid", //"diagonal-cross" "none" "cross" "solid"
                outline: {
                    color: "#FFFEFC",
                    width: 1,
                    style: "solid" // "none" "dash-dot" "solid"
                }
            }
        };

        var aBasemap = new Basemap({
            portalItem: {
                id: "867895a71a1840399476fc717e76bb43" // WGS84 Streets Vector webmap
            }
        });

        aMap = new Map({
            basemap: 'gray-vector'
        });

        aView = new MapView({
            container: "myMap",
            map: aMap,
            center: [-118.46927381363027, 34.229132264745736], // longitude, latitude
            zoom: 10,
            highlightOptions: {
                color: [255, 153, 0, 1]
            }
        });

        let basemapToggle = new BasemapToggle({
            view: aView,
            nextBasemap: "streets-night-vector"
        });
        aView.ui.add(basemapToggle, "bottom-right");

        aSFVLayer = new FeatureLayer({
            url: "https://services6.arcgis.com/4XnW0LugjJEsZM3v/arcgis/rest/services/SFV_Online_gdb/FeatureServer/0",
            //definitionExpression: "POP_16 < 1500",
            popupEnabled: true,
            popupTemplate: { // Enable a popup
                title: "<b>Block Group Information</b>", // Show attribute value
                content: "<b>Block Group FIPS:</b> {FIPS}<br> <b>The total population of 2010 is:</b> {POP2010}" // Display text in pop-up
            },
            renderer: BGSimpleRenderer2,
            outFields: ["*"]

        });

        aMap.add(aSFVLayer, 0);

        aSFVLayer.when(function () {

            console.info('Layer is ready!');
            aView.goTo(aSFVLayer.fullExtent);
        });

        $('#about').on('click', (e) => {
            console.clear();

            let url = 'https://server.arcgisonline.com/arcgis/rest/services?f=pjson';

            esriRequest(url, {
                responseType: "json"
            }).then(function (response) {
                // The requested data
                console.info('Current Version: ', response.data.currentVersion);
            }).catch(function (error) {
                console.error(error);
            });

            // First attemp
            aSFVLayer.queryFeatures(aSFVLayer.createQuery()).then(function (results) {
                // prints the array of result graphics to the console
                console.log(results);
                console.info('it worked Soheil');
            });

            esriRequest('https://services6.arcgis.com/4XnW0LugjJEsZM3v/arcgis/rest/services/SFV_Online_gdb/FeatureServer/0/query', {
                responseType: "json",
                query: {

                    f: 'json',
                    where: '1=1',
                    returnCountOnly: true

                }
            }).then(function (response) {
                // The requested data
                console.info('Request Data Query : ', response.data.count);
            }).catch(function (error) {
                console.error(error);
            });


        });

        $('#info').on('click', (e) => {
            console.clear();

            let url = 'https://services6.arcgis.com/4XnW0LugjJEsZM3v/arcgis/rest/services/SFV_Online_gdb/FeatureServer/0?f=pjson';

            esriRequest(url, {
                responseType: "json"
            }).then(function (response) {
                // The requested data
                console.info('Current Version: ', response.data.currentVersion);
                console.info(response.data.fields);
                response.data.fields.forEach(item => console.log(item.name));
            }).catch(function (error) {
                console.error(error);
            });

        });

        aView.when(function () {
            console.clear();
            console.log('View is Ready');
        });

        aView.on("pointer-move", function (event) {
            //console.info('move!');
            aView.hitTest(event).then(function (response) {
                // filter creates an array of all the elements that pass a test
                const graphic = response.results.filter(function (result) {
                    return result.graphic.layer === aSFVLayer;
                })[0].graphic;
                console.log(graphic.attributes);
            });
        });

        aView.whenLayerView(aSFVLayer)
            .then(function (layerView) {
                // The layerview for the layer
                console.info('layerview:', layerView)
            })
            .catch(function (error) {
                // An error occurred during the layerview creation
            });

        $('#add-field').on('click', (e) => {
            console.clear();
            console.info('Adding a field');

            let addToDefinition = {
                "fields": [
                  {
                    "name": "TOPSIS",
                    "type": "esriFieldTypeInteger", 
                    "alias": "TOPSIS", 
                    "nullable": true, 
                    "editable": true
                  }
              
                ]
            };

            let url = 'https://services6.arcgis.com/4XnW0LugjJEsZM3v/arcgis/rest/services/SFV_ADD_gdb/FeatureServer/0?f=pjson';

            
            esriRequest(url, {
                responseType: "json",
                addToDefinition: {
                    "fields": [
                      {
                        "name": "TOPSIS",
                        "type": "esriFieldTypeInteger", 
                        "alias": "TOPSIS", 
                        "nullable": true, 
                        "editable": true
                      }
                  
                    ]
                }
            }).then(function (response) {
                // The requested data
                console.info('OK', response);
                
            }).catch(function (error) {
                console.error(error);
            });

        }); // end add -field click



    }); // end require

}); // end document ready