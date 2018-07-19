import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZSource from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import clusterlayer from 'ol/source/Cluster.js';
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster.js';
import $ from 'jquery';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import Polygon from 'ol/geom/Polygon.js';
import Circle from 'ol/style/Circle.js';
import Fill from 'ol/style/Fill.js';
import Text from 'ol/style/Text.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';
import interaction from 'ol/interaction/interaction.js';
import SelectCluster from 'ol-ext/interaction/SelectCluster.js';
import coordinate from 'ol/coordinate.js';
import OSM from 'ol/source/osm.js';
//import ol_coordinate_convexHull from 'ol-ext/src/geom/ConvexHull.js';



// Layers
var layers = [ new TileLayer(
    {	source: new OSM()
    })];

var clusterLayer = {};    

const map = new Map({
  target: 'map-container', 
  view: new View({
    center: [166326, 5992663],
    zoom: 2
  }),
  layers: layers
});

var layer = new TileLayer({
  source: new XYZSource({
    url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg'
  })
});

var statevector = new VectorLayer({
  source: new VectorSource({
    url: 'http://gisval.labs.addev.ssa.gov:6080/arcgis/rest/services/GETSTATS_PRD/GETSTATS2/MapServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson',
    format: new GeoJSON()
  })
});

var officevector = new VectorLayer({
  source: new VectorSource({
    url: 'http://gisval.labs.addev.ssa.gov:6080/arcgis/rest/services/GETSTATS_PRD/GETSTATS2/MapServer/7/query?where=1=1&outFields=*&outSR=4326&f=geojson',
    format: new GeoJSON()
  })
});


    // Addfeatures to the cluster
    function addFeatures(nb)
    {	var ext = map.getView().calculateExtent(map.getSize());
        var features=[];
        for (var i=0; i<nb; ++i)
        {	features[i]=new Feature(new Point([ext[0]+(ext[2]-ext[0])*Math.random(), ext[1]+(ext[3]-ext[1])*Math.random()]));
            features[i].set('id',i);
        }
        console.log(features);
        clusterSource.getSource().clear();
        clusterSource.getSource().addFeatures(features);
    }

    // Style for the clusters
    var styleCache = {};
    function getStyle (feature, resolution)
    {	var size = feature.get('features').length;
        var style = styleCache[size];
        if (!style)
        {	var color = size>25 ? "192,0,0" : size>8 ? "255,128,0" : "0,128,0";
            var radius = Math.max(8, Math.min(size*0.75, 20));
            var dash = 2*Math.PI*radius/6;
            var dash = [ 0, dash, dash, dash, dash, dash, dash ];
            style = styleCache[size] = new Style(
                {	image: new Circle(
                    {	radius: radius,
                        stroke: new Stroke(
                        {	color: "rgba("+color+",0.5)", 
                            width: 15 ,
                            lineDash: dash,
                            lineCap: "butt"
                        }),
                        fill: new Fill(
                        {	color:"rgba("+color+",1)"
                        })
                    }),
                    text: new Text(
                    {	text: size.toString(),
                        fill: new Fill(
                        {	color: '#fff'
                        })
                    })
                });
        }
        return [style];
    }

    // Cluster Source
    var clusterSource=new clusterlayer({
        distance: 40,
        source: new VectorSource()
    });
    // Animated cluster layer
    clusterLayer = new AnimatedCluster(
    {	name: 'Cluster',
        source: clusterSource,
        animationDuration: $("#animatecluster").prop('checked') ? 700:0,
        // Cluster style
        style: getStyle
    });

    map.addLayer(clusterLayer);
    // add 2000 features
    addFeatures(2000);

    // Style for selection
    var img = new Circle(
        {	radius: 5,
            stroke: new Stroke(
            {	color:"rgba(0,255,255,1)", 
                width:1 
            }),
            fill: new Fill(
            {	color:"rgba(0,255,255,0.3)"
            })
        });
    var style0 = new Style( 
        {	image: img
        });
    var style1 = new Style( 
        {	image: img,
            // Draw a link beetween points (or not)
            stroke: new Stroke(
                {	color:"#fff", 
                    width:1 
                }) 
        });
    // Select interaction to spread cluster out and select features
    var selectCluster = new SelectCluster(
        {	// Point radius: to calculate distance between the features
            pointRadius:7,
            animate: $("#animatesel").prop('checked'),
            // Feature style when it springs apart
            featureStyle: function()
            {	return [ $("#haslink").prop('checked') ? style1:style0 ]
            },
            // selectCluster: false,	// disable cluster selection
            // Style to draw cluster when selected
            style: function(f,res)
            {	var cluster = f.get('features');
                if (cluster.length>1)
                {	var s = getStyle(f,res);
                    if ($("#convexhull").prop("checked") && coordinate.convexHull)
                    {	var coords = [];
                        for (i=0; i<cluster.length; i++) coords.push(cluster[i].getGeometry().getFirstCoordinate());
                        var chull = coordinate.convexHull(coords);
                        s.push ( new Style(
                            {	stroke: new Stroke({ color: "rgba(0,0,192,0.5)", width:2 }),
                                fill: new Fill({ color: "rgba(0,0,192,0.3)" }),
                                geometry: new Polygon([chull]),
                                zIndex: 1
                            }));
                    }
                    return s;
                }
                else 
                {	return [
                        new Style(
                        {	image: new Circle (
                            {	stroke: new Stroke({ color: "rgba(0,0,192,0.5)", width:2 }),
                                fill: new Fill({ color: "rgba(0,0,192,0.3)" }),
                                radius:5
                            })
                        })];
                }
            }
        });
    map.addInteraction(selectCluster);

    // On selected => get feature in cluster and show info
    selectCluster.getFeatures().on(['add'], function (e)
    {	var c = e.element.get('features');
        if (c.length==1)
        {	var feature = c[0];
            $(".infos").html("One feature selected...<br/>(id="+feature.get('id')+")");
        }
        else
        {	$(".infos").text("Cluster ("+c.length+" features)");
        }
    })
    selectCluster.getFeatures().on(['remove'], function (e)
    {	$(".infos").html("");
    })


//map.addLayer(layer);
//map.addLayer(clusterLayer);
//map.addLayer(officevector);
//map.addLayer(statevector);