import 'ol/ol.css';
import 'ol-ext/control/Permalink.css'
import 'ol-ext/control/Search.css'
import 'ol-ext/control/Swipe.css'
import Map from 'ol/map';
import View from 'ol/view';
import ol_Scaleline from 'ol/control/scaleline'
import Permalink from 'ol-ext/control/Permalink';
import SearchNominatim from 'ol-ext/control/SearchNominatim'
import ol_layer_Tile from 'ol/layer/tile'
import ol_source_OSM from 'ol/source/osm'
import ol_source_Stamen from 'ol/source/stamen'
import ol_control_Swipe from 'ol-ext/control/Swipe';
import ol_style_Style from 'ol/style/Style';
import ol_style_Chart from 'ol-ext/style/Chart';
import ol_style_Stroke from 'ol/style/Stroke';
import ol_style_Text from 'ol/style/Text';
import ol_style_Fill from 'ol/style/Fill';
import ol_Feature from 'ol/feature';
import ol_geom_Point from 'ol/geom/point';
import ol_layer_Vector from 'ol/layer/Vector';
import ol_source_Vector from 'ol/source/Vector';
import ol_ordering from 'ol-ext/render/ordering';
import ol_interaction_Select from 'ol/interaction/select';
import $ from 'JQuery';
import EsriJSON from 'ol/format/EsriJSON.js';
import Fill from 'ol/style/fill.js';
import Text from 'ol/style/text.js';
import Stroke from 'ol/style/stroke.js';
import Style from 'ol/style/style.js';
import Circle from 'ol/style/circle.js';
//import VectorSource from 'ol/source/Vector.js';
import proj from 'ol/proj.js';
import XYZ from 'ol/source/XYZ.js';

// Layers
var layer = new ol_layer_Tile({ source: new ol_source_Stamen({ layer: 'watercolor' }) });
        
var osm_layer = new ol_layer_Tile({
    source: new ol_source_OSM()
  });

// The tile size supported by the ArcGIS tile service.
var tileSize = 512;

var urlTemplate = 'https://services.arcgisonline.com/arcgis/rest/services/' +
          'ESRI_StreetMap_World_2D/MapServer/tile/{z}/{y}/{x}';

// The map
var map = new Map
    ({	target: 'map',
        view: new View
        ({	zoom: 7,
            center: proj.fromLonLat([-97.6114, 38.8403]),
        }),
        layers: [
        //     new ol_layer_Tile({
        //     source: new XYZ({
        //       attributions: 'Copyright:© 2013 ESRI, i-cubed, GeoEye',
        //       maxZoom: 16,
        //       projection: 'EPSG:4326',
        //       tileSize: tileSize,
        //       tileUrlFunction: function(tileCoord) {
        //         return urlTemplate.replace('{z}', (tileCoord[0] - 1).toString())
        //           .replace('{x}', tileCoord[1].toString())
        //           .replace('{y}', (-tileCoord[2] - 1).toString());
        //       },
        //       wrapX: true
        //     })
        //   })
        new ol_layer_Tile({
            source: new XYZ({
              attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
                  'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
              url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
                  'World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
            })

        })

    ],
});

var info = document.getElementById('info');
var target = document.getElementById('map');
function displayFeatureInfo(pixel) {
        info.style.left = pixel[0] + 'px';
        info.style.top = (pixel[1] - 50) + 'px';
        var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
            return feature;
        });
        if (feature) {
            var text = feature.get('name');
            info.style.display = 'none';
            info.innerHTML = text;
            info.style.display = 'block';
            target.style.cursor = "pointer";
        } else {
            info.style.display = 'none';
            target.style.cursor = "";
        }
    }


map.on('singleclick', function(evt) {
        if (evt.dragging) {
            info.style.display = 'none';
            return;
        }
        var pixel = map.getEventPixel(evt.originalEvent);
        displayFeatureInfo(pixel);
});

// Style function
var styleCache={};

var esrijsonFormat = new EsriJSON();

var serviceUrl = 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Percent_Over_64/MapServer/';
var layer = 1;

let offTypes = {
    "ADO": ['11'],
    "DDS": ['07', '15'],
    "DDS-DDS": ['07'],
    "DDS-DHU": ['15'],
    "EXTAGY": ['09', '0D'],
    "EXTAGY-EXTAGY": ['09'],
    "EXTAGY-OCSE": ['0D'],
    "EQUIP-EQUIP": ['93'],
    "EQUIP-ROCC": ['10'],
    "EQUIP": ['93', '10'],

    "FO": ['13', '01', '18', '16', '0E'],
    "FO-FO/1": ['13'],
    "FO-FO/2": ['01'],
    "FO-FO/RS": ['18'],
    "FO-FSP": ['16'],
    "FO-VSDEXT": ['0E'],

    "FOSU/WSU/SDW": ['42', '30', '65'],
    "FOSU/WSU/SDW-FOSU": ['42'],
    "FOSU/WSU/SDW-ICTS": ['30'],
    "FOSU/WSU/SDW-SDW": ['65'],

    "MISC": ['90', '06', '26'],
    "MISC-AGENCY": ['90'],
    "MISC-HCFA": ['06'],
    "MISC-MISC": ['26'],

    //"ODAR": ['52', '71', '54', '50', '29', '64', '0A', '0C'],
    //"ODAR-OAOLO": ['52', '71', '54'],              
    "ODAR": ['28', '29', '50', '64', '0A', '0C'],
    "ODAR-OHOCO": ['28'],
    "ODAR-OHORO": ['29'],
    "ODAR-OHOFO": ['50'],
    "ODAR-OHOPRS": ['64', '0A', '0C'],

    "OAO": ['49','51','52','54','71'],
    "OAO-OAOCO": ['49'],
    "OAO-OAOAO": ['51'],
    "OAO-OAODR": ['52'],
    "OAO-OAOLO": ['54'],
    "OAO-OAOLD": ['71'],

    //"OAO-OHACO": ['28'],               
    //"ODAR-VTC": ['0C'],
    //"ODAR/roll": ['51', '52', '71', '54'],
    //"ODAR/roll-OAOAO": ['51'],
    //"ODAR/roll-OAODR": ['52'],
    //"ODAR/roll-OAOLD": ['71'],            
    //"ODAR/roll-OAOLO": ['54'],
    "OIG": ['0H', '32', '31', '41', '25', '27'],
    "OIG-OIGCDI": ['0H'],
    "OIG-OIGABR": ['32'],
    "OIG-OIGADV": ['31'],
    "OIG-OIGIBR": ['41'],
    "OIG-OIGIDV": ['25'],
    "OIG-OIGOTH": ['27'],
    "OQP": ['23'],
    //"PSC": ['02', '05'],
    "PC/TSC/WBDOC": ['56', '47', '02', '81', '82', '05', '21'],
    "PC/TSC/WBDOC-OCO": ['56'],
    "PC/TSC/WBDOC-OEO": ['47'],
    "PC/TSC/WBDOC-PC": ['02'],
    "PC/TSC/WBDOC-SAU": ['81', '82'], //two in one
    "PC/TSC/WBDOC-TSC": ['05'],
    "PC/TSC/WBDOC-WBDOC": ['21'],

    //"PSC/roll": ['20', '19', '04', '98', '08'],
    //"PSC/roll-OTHPC": ['20'],
    //"PSC/roll-OTHTSC": ['19'],
    //"PSC/roll-PCMOD": ['04'],
    //"PSC/roll-TSTOFC": ['98'],
    //"PSC/roll-TSUNIT": ['08'],

    "RO": ['03'],

    //"RO/roll": ['24', '22'],
    //"RO/roll-OTHRRO": ['24'],
    //"RO/roll-RSO": ['22'],

    "SSA HQ": ['59', '63'],
    "SSA HQ-COMSNR": ['59'],
    "SSA HQ-DIVISN": ['63'] //,
    //"SDW": ['65']

    //"SSA HQ/Roll": ['60', '66', '61'],
    //"SSA HQ/Roll-DEPCOM": ['60'],
    //"SSA HQ/Roll-DEPMNT": ['66'],
    //"SSA HQ/Roll-OFFICE": ['61']
};

var officeTypeSymbols = {
    "ADO": [255, 215, 0, 1],
    "DDS-DDS": [255, 0, 255, 1],
    "DDS-DHU": [0, 255, 0, 1],
    "EXTAGY-EXTAGY": [0, 255, 255, 1],
    "EXTAGY-OCSE": [100, 149, 237, 1],
    "EQUIP-EQUIP": [255, 165, 0, 1],
    "EQUIP-ROCC": [0, 250, 154, 1],

    "FO": [102, 51, 255, 1],
    "FO-FO/1": [166, 206, 227, 1],
    "FO-FO/2": [31, 120, 180, 1],
    "FO-FO/RS": [178, 223, 138, 1],
    "FO-FSP": [51, 160, 44, 1],
    "FO-VSDEXT": [251, 154, 153, 1],

    "FOSU/WSU/SDW-FOSU": [154, 205, 50, 1],
    "FOSU/WSU/SDW-ICTS": [32, 178, 170, 1],
    "FOSU/WSU/SDW-SDW": [250, 235, 215, 1],

    "MISC-AGENCY": [239, 237, 245, 1],
    "MISC-HCFA": [188, 189, 220, 1],
    "MISC-MISC": [117, 107, 177, 1],

    //"ODAR-OAOCO": [127, 201, 127, 1],
    "ODAR-OHO": [190, 174, 212, 1],
    //"ODAR-OAOLO": [253, 192, 134, 1],
    "ODAR-OHOCO": [253, 192, 134, 1],
    "ODAR-OHORO": [56, 108, 176, 1],
    "ODAR-OHOFO": [255, 255, 153, 1],                
    "ODAR-OHOPRS": [240, 2, 127, 1],
    "ODAR-VTC": [191, 91, 23, 1],

    "OAO-OAOCO": [127, 201, 127, 1],
    "OAO-OAOAO": [253, 192, 134, 1],
    "OAO-OAODR": [0, 250, 154, 1],
    "OAO-OAOLO": [188, 189, 220, 1],
    "OAO-OAOLD": [118, 42, 131, 1],

    //"ODAR/roll-OAOAO": [202, 0, 32, 1],
    //"ODAR/roll-OAODR": [244, 165, 130, 1],
    //"ODAR/roll-OAOLD": [146, 197, 222, 1],
    //"ODAR/roll-OAOLO": [5, 113, 176, 1],
    "OIG-OIGCDI": [118, 42, 131, 1],
    "OIG-OIGABR": [175, 141, 195, 1],
    "OIG-OIGADV": [231, 212, 232, 1],
    "OIG-OIGIBR": [217, 240, 211, 1],
    "OIG-OIGIDV": [127, 191, 123, 1],
    "OIG-OIGOTH": [27, 120, 55, 1],
    "OQP": [255, 255, 150, 1],

    "PC/TSC/WBDOC-OCO": [141, 211, 199, 1],
    "PC/TSC/WBDOC-OEO": [255, 255, 179, 1],
    "PC/TSC/WBDOC-PC": [190, 186, 218, 1],
    "PC/TSC/WBDOC-SAU": [251, 128, 114, 1],
    "PC/TSC/WBDOC-TSC": [128, 177, 211, 1],
    "PC/TSC/WBDOC-WBDOC": [253, 180, 98, 1],

    //"PSC/roll-OTHPC": [208, 28, 139, 1],
    //"PSC/roll-OTHTSC": [241, 182, 218, 1],
    //"PSC/roll-PCMOD": [253, 180, 98, 1],
    //"PSC/roll-TSTOFC": [184, 225, 134, 1],
    //"PSC/roll-TSUNIT": [77, 172, 38, 1],

    //"PSC": [204, 204, 0, 1],
    "RO": [255, 0, 51, 1],

    //"RO/roll-OTHRRO": [127, 205, 187, 1],
    //"RO/roll-RSO": [44, 127, 184, 1],

    "SSA HQ-COMSNR": [158, 188, 218, 1],
    "SSA HQ-DIVISN": [136, 86, 167, 1],

    //"SSA HQ/Roll-DEPCOM": [229, 245, 249, 1],
    //"SSA HQ/Roll-DEPMNT": [153, 216, 201, 1],
    //"SSA HQ/Roll-OFFICE": [44, 162, 95, 1]
    //"SDW": [255, 102, 204, 1]
};

var url = serviceUrl + layer + '/query/?f=json&' +
              'returnGeometry=true&inSR=102100&outFields=*' +
              '&outSR=102100&where=1%3D1';

$.ajax({url: url, dataType: 'jsonp', success: function(response) {
            if (response.error) {
              alert(response.error.message + '\n' +
                  response.error.details.join('\n'));
            } else {
              // dataProjection will be read from document
              var features = esrijsonFormat.readFeatures(response, {
                featureProjection:  'EPSG:102100',
              });
              if (features.length > 0) {
                //vectorSource.addFeatures(features);
                sourceFeatures.addFeatures(features);
                console.log(features);
              }
            }

}});
        

var styleCache = {
    'ABANDONED': new Style({
      fill: new Fill({
        color: 'rgba(225, 225, 225, 255)'
      }),
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 255)',
        width: 0.4
      })
    }),
    'GAS': new Style({
      fill: new Fill({
        color: 'rgba(255, 0, 0, 255)'
      }),
      stroke: new Stroke({
        color: 'rgba(110, 110, 110, 255)',
        width: 0.4
      })
    }),
    'OIL': new Style({
      fill: new Fill({
        color: 'rgba(56, 168, 0, 255)'
      }),
      stroke: new Stroke({
        color: 'rgba(110, 110, 110, 255)',
        width: 0
      })
    }),
    'OILGAS': new Style({
      fill: new Fill({
        color: 'rgba(168, 112, 0, 255)'
      }),
      stroke: new Stroke({
        color: 'rgba(110, 110, 110, 255)',
        width: 0.4
      })
    })
  };

var sourceFeatures = new ol_source_Vector({
    
});

var  layerFeatures = new ol_layer_Vector({
    source: sourceFeatures,
    style: function(feature, resolution){
        var styleR3 = new Style( {
            image: new Circle( {
                radius: 5,
                fill: new Fill( {
                    color: [0,0,255]
                } )
            } )
        } );

        var styleCatchAll = new Style( {
            image: new Circle( {
                radius: 5,
                fill: new Fill( {
                    color: [255,0,0]
                } )
            } )
        } );
        
        var ofctypes = [];
        var officetypeList = offTypes;
        for (var key in officetypeList) {
            //console.log(key);
            if (officetypeList.hasOwnProperty(key)) {
                
                
                if (officetypeList[key].length == 1) {
                    //ofctypes.push("'" + officetypeList[key][0] + "'");                    
                    if(officetypeList[key] == feature.get('OFC_TYP')){
                        return new Style( {
                            image: new Circle( {
                                radius: 5,
                                fill: new Fill( {
                                    color: officeTypeSymbols[key]
                                } ),
                                stroke: new ol_style_Stroke({
                                    width : 1,
                                    // color: 'rgba(255, 100, 50, 0.8)'
                                    color : 'black',
                                    radius : 1
                                })
                            } )
                        }) // officeTypeSymbols[key];    
                    }
                } else {
                    //if (key == "PC/TSC/WBDOC-SAU") {
                        for (var item in officetypeList[key]) {
                            if (officetypeList[key].hasOwnProperty(item)) {
                                //ofctypes.push("'" + officetypeList[key][item][0] + "'");
                                if(officetypeList[key] == feature.get('OFC_TYP')){
                                    return new Style( {
                                        image: new Circle( {
                                            radius: 5,
                                            fill: new Fill( {
                                                color: officeTypeSymbols[key][item][0]
                                            } )
                                        } )
                                    }) // officeTypeSymbols[key];    
                                }
                            }
                        }
                    //}

                }

            }
        }
        // console.log(ofctypes);
        // if ( feature.get('OFC_TYP') == '13') {            
        //     return [styleR3];
        // } else {
        //     return [styleCatchAll];
        // }
    }
});

	
var  getFeatureStyle = function(feature, sel)
{	var k = $("#graph").val()+"-"+ $("#color").val()+"-"+(sel?"1-":"")+feature.get("data");
      var style = styleCache[k];
    if (!style) 
    {	var radius = 15;
        // area proportional to data size: s=PI*r^2
        radius = 8* Math.sqrt (feature.get("sum") / Math.PI);
        var data = feature.get("data");
        radius *= (sel?1.2:1);
        // Create chart style
        style = [ new ol_style_Style(
            {	image: new ol_style_Chart(
                {	type: "pie", 
                    radius: radius, 
                    data: data, 
                    rotateWithView: true,
                    stroke: new ol_style_Stroke(
                    {	color: "#fff",
                        width: 2
                    }),
                })
            })];

        // Show values on select
        if (sel)
        {	/*
            var sum = 0;
            for (var i=0; i<data.length; i++)
            {	sum += data[i];
            }
            */
            var sum = feature.get("sum");
  
            var s = 0;
            for (var i=0; i<data.length; i++)
            {	var d = data[i];
                  var a = (2*s+d)/sum * Math.PI - Math.PI/2; 
                var v = Math.round(d/sum*1000);
                if (v>0)
                  {	style.push(new ol_style_Style(
                    {	text: new ol_style_Text(
                        {	text: (v/10)+"%", /* d.toString() */
                              offsetX: Math.cos(a)*(radius+3),
                              offsetY: Math.sin(a)*(radius+3),
                            textAlign: (a < Math.PI/2 ? "left":"right"),
                            textBaseline: "middle",
                            stroke: new ol_style_Stroke({ color:"#fff", width:2.5 }),
                            fill: new ol_style_Fill({color:"#333"})
                        })
                    }));
                }
                s += d;
            }
        }
    }
    styleCache[k] = style;
    return style;
}

// 30 random features with data: array of 4 values
var ext = map.getView().calculateExtent(map.getSize());
var features=[];
for (var i=0; i<30; ++i)
{	var n, nb=0, data=[];
    for (var k=0; k<4; k++) 
    {	n = Math.round(8*Math.random());
        data.push(n);
        nb += n;
    }
    features[i] = new ol_Feature(
        {	geometry: new ol_geom_Point([ext[0]+(ext[2]-ext[0])*Math.random(), ext[1]+(ext[3]-ext[1])*Math.random()]),
            data: data,
            sum: nb
        });
}
var vector = new ol_layer_Vector(
{	name: 'Vecteur',
    source: new ol_source_Vector({ features: features }),
    // y ordering
    renderOrder: ol_ordering.yOrdering(),
    style: function(f) { return getFeatureStyle(f); }
})

//map.addLayer(vector);
map.addLayer(layerFeatures);

// Control Select 
var select = new ol_interaction_Select({
        style: function(f) { return getFeatureStyle(f, true); }
      });
//map.addInteraction(select);
