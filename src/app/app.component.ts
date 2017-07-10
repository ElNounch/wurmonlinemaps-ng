import { AfterContentInit, AfterViewInit, Component, ElementRef, ViewChild, OnInit } from "@angular/core";

import { MdToolbarModule, MdSidenavModule, MdSlideToggleModule, MdIconModule } from '@angular/material';

import { DeedsService } from './deeds.service';
import { IDeed, IStartingDeed, ICanal, Constants } from './app.models';

//import * as ol from 'openlayers';

// This is necessary to access ol3!
declare var ol: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, AfterViewInit {
  // This is necessary to access the html element to set the map target (after view init)!
  @ViewChild("mapElement") mapElement: ElementRef;

  constants: Constants = new Constants();
  
  map: any;
  deeds: IDeed[];
  canals: ICanal[];

  deedsLayer: any;
  staringTownsLayer: any;
  gridLayer: any;
  canalLayer: any;
  guardTowerLayer: any;

  constructor(private deedsService: DeedsService) {
  }

  ngOnInit(): void {
    this.deedsService.getDeeds()
      .subscribe(deeds => {
        this.deeds = deeds["data"];
        this.canals = deeds["canals"];
        // console.log("Calling Render Layer with deeds: ", this.deeds);
        console.log("Canals", this.canals);
        this.renderOpenLayers(this.deeds);
      });
  }

  renderOpenLayers(deeds: IDeed[]): void {
    var controls = [
      new ol.control.Attribution(),
      new ol.control.MousePosition({
        undefinedHTML: 'outside',
        coordinateFormat: function (coordinate) {
          return ol.coordinate.format(coordinate, '{x}, {y}', 0);
        }
      }),
      new ol.control.Zoom(),
      new ol.control.FullScreen()
    ];

    // canal passages
    var canalSources = new ol.source.Vector();

    var canalStyleFunction = function (feature, resolution) {
      var isCanal = feature.get('isCanal');
      var isTunnel = feature.get('isTunnel');
      var allBoats = feature.get('allBoats')

      let fontSize: number = resolution <= 0.125 ? 16 : 12;

      var canalName = feature.get('name') != null ? feature.get('name') : '';

      let canalText: string = `${canalName} (${isCanal = true ? 'Canal /' : ''} ${isTunnel = true ? 'Tunnel /' : ''} ${allBoats = true ? 'All Boats' : 'Knarrs only'})`;


      return [
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            width: 11 / resolution,
            color: 'rgba(125, 125, 255, 0.8)',
            lineDash: [.5, 1],
          }),
          text: new ol.style.Text({
            font: '' + fontSize + 'px Calibri,sans-serif',
            text: resolution < 8 ? canalText : '',
            textBaseline: 'middle',
            textAlign: 'center',
            // offsetY: 12,
            fill: new ol.style.Fill({
              color: '#FFF'
            }),
            stroke: new ol.style.Stroke({
              color: '#000',
              width: 2,
              offsetY: 2,
              offsetX: 2
            })
          })
        }),

      ]
    }

    for (let canal of this.canals) {
      var canalFeature = new ol.Feature({
        // [[78.65, -32,65], [-98.65, 12.65]];
        geometry: new ol.geom.LineString([[canal.X1, canal.Y1], [canal.X2, canal.Y2]]),
        name: canal.Name,
        isCanal: canal.IsCanal,
        isTunnel: canal.IsTunnel,
        allBoats: canal.AllBoats,
      });

      canalSources.addFeature(canalFeature);
    }

    this.canalLayer = new ol.layer.Vector({
      source: canalSources,
      name: this.constants.CanalLayerName,
      style: canalStyleFunction
    });

    // guard tower feature
    var guardSources = new ol.source.Vector();

    var guardtowerStyleFunction = function (feature, resolution) {
      // console.log("Feature", feature);
      // console.log("Resolution", resolution);

      return [
        new ol.style.Style({
          image: new ol.style.RegularShape({
            points: 30,
            radius: 20 / resolution,
            angle: Math.PI / 4,
            fill: new ol.style.Fill({
              color: 'rgba(12, 89, 29, 0.6)'
            }),
            stroke: new ol.style.Stroke({
              color: 'rgba(255, 255, 255, 0.1)',
              width: 50 / resolution
            }),
          })
        })
      ]
    };

    // guard tower points [6323.375, -2046.59765625]
    var gts = [
      [6323, -2046],
      [6533, -1986],
      [6472, -2015],
      [6584, -1992]
    ];

    for (let g of gts) {
      var guardtowerFeature = new ol.Feature({
        geometry: new ol.geom.Point(g),
        name: "guard tower"
      });

      guardSources.addFeature(guardtowerFeature);
    }

    this.guardTowerLayer = new ol.layer.Vector({
      source: guardSources,
      name: this.constants.GuardTowerLayerName,
      style: guardtowerStyleFunction
    });

    var gridSrc = new ol.source.Vector();


    var gridLineStyleFunction = function (feature, resolution) {
      // console.log("Resolution", resolution);

      var fontSize = (14 / resolution) + 16;

      if (resolution >= 16) {
        fontSize = 8;
      }

      return [
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'rgba(103, 207, 230, 0.6)',
            width: 2
          }),
          text: new ol.style.Text({
            font: '' + fontSize + 'px Calibri,sans-serif',
            text: feature.get('name'),
            textBaseline: 'middle',
            textAlign: 'center',
            fill: new ol.style.Fill({
              color: 'rgba(103, 207, 230, 0.6)',
            }),
            stroke: new ol.style.Stroke({
              color: 'rgba(103, 207, 230, 0.6)',
              width: 1,
            })
          })
        })
      ]
    };

    // grid lines 
    var gridJSON = [];

    // horiz
    for (var x = 0; x < 20; x++) {
      var y = -((x * 410) + 362);
      gridJSON.push({
        "StartX": 0, "StartY": y, "EndX": 8192, "EndY": y
      });

      var horizLineFeature = new ol.Feature({
        geometry: new ol.geom.LineString([[0, y], [8192, y]]),
        name: ""
      });

      gridSrc.addFeature(horizLineFeature);
    }

    // vertical
    for (var y = 0; y < 20; y++) {
      var x = (y * 410) + 362;
      gridJSON.push({
        "StartX": x, "StartY": 0, "EndX": x, "EndY": -8192
      });

      var vertLineFeature = new ol.Feature({
        geometry: new ol.geom.LineString([[x, 0], [x, -8192]]),
        name: ""
      });

      gridSrc.addFeature(vertLineFeature);
    }

    // grid text
    var gridPoints = [];
    var gridX = ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U"];

    for (var x = 0; x < 20; x++) {
      var yC = -(x * 410) + 50;

      for (var y = 0; y < 20; y++) {
        var xC = (y * 410) - 40;

        var yDisplay = y + 7;
        var gridID = gridX[x] + " " + yDisplay;
        gridPoints.push({ "cX": xC, "cY": yC, "GridID": gridID });

        var gridNameFeature = new ol.Feature({
          geometry: new ol.geom.Point([xC + 205, yC - 205]),
          name: gridID
        });

        gridSrc.addFeature(gridNameFeature);
      }
    }

    this.gridLayer = new ol.layer.Vector({
      source: gridSrc,
      name: this.constants.GridLayerName,
      style: gridLineStyleFunction
    });

    // starter towns
    var startingTowns = [
      {
        "Name": "Summerholt",
        "Coords": [[6582, -2231], [6622, -2231], [6622, -2272], [6582, -2272]]
      },
      {
        "Name": "Greymead",
        "Coords": [[4680, -3030], [4721, -3030], [4721, -3071], [4680, -3071]]
      },
      {
        "Name": "Whitefay",
        "Coords": [[5639, -3041], [5662, -3041], [5662, -3060], [5639, -3060]]
      },
      {
        "Name": "Glasshollow",
        "Coords": [[1559, -766], [1600, -766], [1600, -808], [1559, -808]]
      },
      {
        "Name": "Newspring",
        "Coords": [[862, -7208], [903, -7208], [903, -7250], [862, -7250]]
      },
      {
        "Name": "Esteron",
        "Coords": [[7391, -6416], [7428, -6416], [7428, -6453], [7391, -6452]]
      },
      {
        "Name": "Linton",
        "Coords": [[1805, -4146], [1845, -4146], [1845, -4186], [1805, -4186]]
      },
      {
        "Name": "Lormere",
        "Coords": [[3460, -6416], [3501, -6416], [3501, -6457], [3460, -6457]]
      },
      {
        "Name": "Vrock Landing",
        "Coords": [[2702, -2221], [2742, -2221], [2742, -2261], [2702, -2261]]
      }

    ]

    var startingTownsSource = new ol.source.Vector();

    for (let town of startingTowns) {

      var startingTownFeature = new ol.Feature({
        geometry: new ol.geom.Polygon([town.Coords]),
        name: town.Name
      });

      startingTownsSource.addFeature(startingTownFeature);

      startingTownFeature.setStyle(new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'blue',
          width: 3
        }),
        fill: new ol.style.Fill({
          color: 'rgba(0, 0, 255, 0.1)'
        }),
        text: new ol.style.Text({
          font: '14px Calibri,sans-serif',
          text: town.Name,
          textBaseline: 'middle',
          textAlign: 'center',
          fill: new ol.style.Fill({
            color: '#FFF'
          }),
          stroke: new ol.style.Stroke({
            color: '#000',
            width: 1,
            offsetY: 1,
            offsetX: 2
          })
        })
      }));

      startingTownsSource.addFeature(startingTownFeature);
    }

    this.staringTownsLayer = new ol.layer.Vector({
      source: startingTownsSource,
      name: this.constants.StarterDeedsLayerName
    });


    var deedsSrc = new ol.source.Vector();

    var deedStyleFunction = function (feature, resolution) {
      let fontSize: number = resolution <= 0.125 ? 16 : 12;

      return [
        new ol.style.Style({
          image: new ol.style.RegularShape({
            points: 4,
            radius: 11 / resolution,
            angle: Math.PI / 4,
            fill: new ol.style.Fill({
              color: 'rgba(255,0,0,0.4)'
            }),
          }),
          text: new ol.style.Text({
            font: '' + fontSize + 'px Calibri,sans-serif',
            text: resolution < 8 ? feature.get('name') : '',
            textBaseline: 'middle',
            textAlign: 'center',
            // offsetY: 12,
            fill: new ol.style.Fill({
              color: '#FFF'
            }),
            stroke: new ol.style.Stroke({
              color: '#000',
              width: 2,
              offsetY: 2,
              offsetX: 2
            })
          })
        })
      ]
    }

    for (let deed of deeds) {
      if (deed.Name == "Summerholt" ||
        deed.Name == "Greymead" ||
        deed.Name == "Whitefay" ||
        deed.Name == "Glasshollow" ||
        deed.Name == "Newspring" ||
        deed.Name == "Esteron" ||
        deed.Name == "Linton" ||
        deed.Name == "Lormere" ||
        deed.Name == "Vrock Landing") {
        continue;
      }

      var deedFeature = new ol.Feature({
        geometry: new ol.geom.Point([deed.X, deed.Y]),
        name: deed.Name
      });

      deedsSrc.addFeature(deedFeature);
    }

    this.deedsLayer = new ol.layer.Vector({
      source: deedsSrc,
      name: this.constants.DeedLayerName,
      style: deedStyleFunction
    });

    // oh shit the real map code kinda starts here!

    var mapExtent = [0.00000000, -8192.00000000, 8192.00000000, 0.00000000];
    var mapMinZoom = 0;
    var mapMaxZoom = 5;
    var mapMaxResolution = 1.00000000;
    var tileExtent = [0.00000000, -8192.00000000, 8192.00000000, 0.00000000];

    var mapResolutions = [];

    for (var z = 0; z <= mapMaxZoom; z++) {
      mapResolutions.push(Math.pow(2, mapMaxZoom - z) * mapMaxResolution);
    }

    var mapTileGrid = new ol.tilegrid.TileGrid({
      extent: tileExtent,
      minZoom: mapMinZoom,
      resolutions: mapResolutions
    });

    var terrainRaster = new ol.layer.Tile({
      source: new ol.source.XYZ({
        projection: 'EPSG:3857',
        url: "./assets/tiles/Xanadu-terrain_161101/{z}/{x}/{y}.png",
        tileGrid: mapTileGrid,
      }),
      name: "Xanadu Terrain Raster",
    });

    var isoRaster = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: "../../Content/Tiles/Xanadu-iso_161101/{z}/{x}/{y}.png",
        tileGrid: mapTileGrid,
      }),
      name: "Xanadu Isometric Raster",
    });

    var topoRaster = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: "../../Content/Tiles/Xanadu-topo_161101/{z}/{x}/{y}.png",
        tileGrid: mapTileGrid,
      }),
      name: "Xanadu Toplogical Raster",
    });

    this.map = new ol.Map({
      layers: [
        terrainRaster, 
        this.guardTowerLayer, 
        this.staringTownsLayer, 
        this.canalLayer, 
        this.deedsLayer],
      target: 'map',
      controls: controls,
      view: new ol.View({
        zoom: 2,
        center: [4096, -4096],
        maxResolution: mapTileGrid.getResolution(mapMinZoom)
      })
    });

    this.map.on('singleclick', function (evt) {
      console.log("Event", evt);
      console.log("Coords", evt["coordinate"])

      console.log("Map", evt.map);

      let zoom = evt.map.getView().getZoom();
      console.log("Zoom", zoom);
    })
  }

  // After view init the map target can be set!
  ngAfterViewInit() {
    //this.map.setTarget(this.mapElement.nativeElement.id);
  }

  setMap() {
    this.map.setTarget(this.mapElement.nativeElement.id);
  }

  toggleLayer(event: any, layerName: string) {

    let group = this.map.getLayerGroup();
    let layers = group.getLayers();

    let layerExists: boolean = false;

    layers.forEach(layer => {
      let name = layer.get('name');

      if (name == layerName) {
        layerExists = true;
      }
    });

    if (layerExists) {
      switch (layerName) {
        case this.constants.DeedLayerName:
          {
            this.map.removeLayer(this.deedsLayer);
            break;
          }
        case this.constants.StarterDeedsLayerName:
          {
            this.map.removeLayer(this.staringTownsLayer);
            break;
          }
        case this.constants.GridLayerName:
          {
            this.map.removeLayer(this.gridLayer);
            break;
          }
        case this.constants.CanalLayerName:
          {
            this.map.removeLayer(this.canalLayer);
            break;
          }
          case this.constants.GuardTowerLayerName:
          {
            this.map.removeLayer(this.guardTowerLayer);
            break;
          }
        default: {
          console.log("Layer name not found for removal process");
        }
      }
    }
    else {
      switch (layerName) {
        case this.constants.DeedLayerName:
          {
            this.map.addLayer(this.deedsLayer);
            break;
          }
        case this.constants.StarterDeedsLayerName:
          {
            this.map.addLayer(this.staringTownsLayer);
            break;
          }
        case this.constants.GridLayerName:
          {
            this.map.addLayer(this.gridLayer);
            break;
          }
        case this.constants.CanalLayerName:
          {
            this.map.addLayer(this.canalLayer);
            break;
          }
          case this.constants.GuardTowerLayerName:
          {
            this.map.addLayer(this.guardTowerLayer);
            break;
          }
        default: {
          console.log("Layer name not found for add process");
        }
      }
    }
  }
} // end comp