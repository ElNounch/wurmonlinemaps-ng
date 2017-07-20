import { AfterContentInit, AfterViewInit, Component, ElementRef, ViewChild, OnInit } from "@angular/core";
import { MdToolbarModule, MdSidenavModule, MdSlideToggleModule, MdIconModule, MdSelect, MdOption, MdAutocompleteModule } from '@angular/material';

import { LocalStorageService } from 'angular-2-local-storage';

import { DeedsService } from './deeds.service';

import { IDeed, IStartingDeed, ICanal, Constants, IBridge, ILandmark, ServerData, CustomColors } from './app.models';
import { Styles } from './styles'

import { LandmarkLayer } from './layers/landmark.module'
import { StartingDeedLayer } from './layers/starting-towns.module'

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
  customStyles: Styles = new Styles();

  map: any;
  deeds: IDeed[];
  canals: ICanal[];
  bridges: IBridge[];
  landmarks: ILandmark[];

  deedsLayer: any;
  staringTownsLayer: any;
  gridLayer: any;
  canalLayer: any;
  bridgeLayer: any;
  landmarkLayer: any;

  terrainRaster: any;
  topoRaster: any;
  isoRaster: any;

  currentRaster: string = this.constants.TerrainLayerName;

  customColors: any[] = CustomColors;
  deedColor: string;
  canalColor: string;
  bridgeColor: string;

  constructor(private deedsService: DeedsService, public cacheMonster: LocalStorageService) {
  }

  ngOnInit(): void {
    let deedColorCache = this.cacheMonster.get<string>("deedColor");
    this.deedColor = deedColorCache !== null ? deedColorCache : "rgba(255, 0, 0, 0.4)";

    let canalColorCache = this.cacheMonster.get<string>("canalColor");
    this.canalColor = canalColorCache !== null ? canalColorCache : "rgba(125, 125, 255, 0.4)";

    let bridgeColorCache = this.cacheMonster.get<string>("bridgeColor");
    this.bridgeColor = bridgeColorCache !== null ? bridgeColorCache : "rgba(179, 170, 0, 0.4)";

    this.deedsService.getData()
      .subscribe(data => {
        this.renderOpenLayers(data);
      })
  }

  renderOpenLayers(data: ServerData): void {
    this.deeds = data.Deeds;
    this.canals = data.Canals;
    this.bridges = data.Bridges;
    this.landmarks = data.Landmarks;

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

    // les bridge
    var bridgeStyleFuction = function (feature, resolution) {
      let fontSize: number = resolution <= 0.125 ? 16 : 12;

      var bridgeName = feature.get('name') != null ? feature.get('name') : '';
      var bWidth = feature.get('width') != null ? feature.get('width') : 2

      return [
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            width: 8 / resolution,
            color: this.bridgeColor,
          }),
          text: new ol.style.Text({
            font: '' + fontSize + 'px Calibri,sans-serif',
            text: resolution < 8 ? bridgeName : '',
            textBaseline: 'middle',
            textAlign: 'center',
            // offsetY: 12,
            fill: this.customStyles.defaultTextFill,
            stroke: this.customStyles.defaultTextStroke,
          })
        }),

      ]
    }.bind(this);

    var bridgeSources = new ol.source.Vector();

    for (let bridge of this.bridges) {
      // console.log("Rendering bridge:", bridge);

      var bridgeFeature = new ol.Feature({
        // [[78.65, -32,65], [-98.65, 12.65]];
        geometry: new ol.geom.LineString([[bridge.X1, bridge.Y1], [bridge.X2, bridge.Y2]]),
        name: bridge.Name,
        width: bridge.Width
      });
    }

    bridgeSources.addFeature(bridgeFeature);

    this.bridgeLayer = new ol.layer.Vector({
      source: bridgeSources,
      name: this.constants.BridgeLayerName,
      style: bridgeStyleFuction
    });

    // canal passages
    var canalSources = new ol.source.Vector();

    var canalStyleFunction = function (feature, resolution) {
      var isCanal = feature.get('isCanal');
      var isTunnel = feature.get('isTunnel');
      var allBoats = feature.get('allBoats')

      let fontSize: number = resolution <= 0.125 ? 16 : 12;

      let canalName = feature.get('name') != null ? feature.get('name') : '';
      let canalText: string = `${canalName} `;

      if (isCanal === true && isTunnel === true) {
        canalText += `(${isCanal === true ? 'Canal /' : ''} ${isTunnel === true ? 'Tunnel /' : ''} ${allBoats === true ? 'All Boats' : 'Knarrs only'})`;
      }
      else if (isCanal === true && isTunnel === false) {
        canalText += `(${isCanal === true ? 'Canal /' : ''} ${allBoats === true ? 'All Boats' : 'Knarrs only'})`;
      }
      else if (isCanal === false && isTunnel === true) {
        canalText += `(Tunnel)`;
      }

      return [
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            width: 11 / resolution,
            color: this.canalColor,
          }),
          text: new ol.style.Text({
            font: '' + fontSize + 'px Calibri,sans-serif',
            text: resolution < 8 ? canalText : '',
            textBaseline: 'middle',
            textAlign: 'center',
            // offsetY: 12,
            fill: this.customStyles.defaultTextFill,
            stroke: this.customStyles.defaultTextStroke,
          })
        }),

      ]
    }.bind(this);

    for (let canal of this.canals) {
      var canalFeature = new ol.Feature({
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
    var gts = [
      [6323, -2046],
      [6533, -1986],
      [6472, -2015],
      [6584, -1992]
    ];

    var gtm = new LandmarkLayer();

    this.landmarkLayer = new ol.layer.Vector({
      source: gtm.generateSource(gts),
      name: this.constants.GuardTowerLayerName,
      style: gtm.styleFunction
    })

    // grid layer stuff
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
    var sdm = new StartingDeedLayer();

    this.staringTownsLayer = new ol.layer.Vector({
      source: sdm.generateSource(),
      name: this.constants.StarterDeedsLayerName,
      style: sdm.styleFunction
    });

    var deedsSrc = new ol.source.Vector();

    var deedStyleFunction = function (feature, resolution) {
      // console.log("Resolution", resolution);      

      let fontSize: number = resolution <= 0.125 ? 16 : 12;
      let name: string = feature.get('name');
      let notes: string = feature.get('notes');
      let isMarket: boolean = notes != null ? notes.toLowerCase().indexOf("market") >= 0 : false;

      return [
        new ol.style.Style({
          image: new ol.style.RegularShape({
            points: 4,
            radius: (11 / resolution) + 4,
            angle: Math.PI / 4,
            fill: new ol.style.Fill({
              color: this.deedColor
            }),
            stroke: new ol.style.Stroke({
              color: isMarket ? "White" : "transparent",
              width: isMarket ? 3 : 0,
              // lineDash: isMarket ?  [0, 6] : [0, 0]
            })
          }),
          text: new ol.style.Text({
            font: '' + fontSize + 'px Calibri,sans-serif',
            text: resolution < 4 ? feature.get('name') : '',
            textBaseline: 'middle',
            textAlign: 'center',
            fill: this.customStyles.defaultTextFill,
            stroke: this.customStyles.defaultTextStroke,
          })
        })
      ]
    }.bind(this);

    for (let deed of this.deeds) {
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
        name: deed.Name,
        notes: deed.Notes
      });

      deedsSrc.addFeature(deedFeature);
    }

    this.deedsLayer = new ol.layer.Vector({
      source: deedsSrc,
      name: this.constants.DeedLayerName,
      style: deedStyleFunction
    });

    // khaaaaaan
    var easterEggSource = new ol.source.Vector();

    var khaanFeature = new ol.Feature({
      geometry: new ol.geom.Point([6332, -1825]),
      type: "Khaaaan"
    })

    easterEggSource.addFeature(khaanFeature); 9

    var midpointFeature = new ol.Feature({
      geometry: new ol.geom.Point([4096, -4096]),
      type: "Midpoint"
    })

    easterEggSource.addFeature(midpointFeature);

    var khaanStyleFunction = function (feature, resolution) {
      let fontSize: number = 12;
      let khaanText = 'Khaaaan!';

      if (resolution < 0.25) {
        khaanText = 'Khaaaaaaaaaan!';
      }

      if (resolution < 0.125) {
        khaanText = 'Khaaaaaaaaaaaaaaan!';
      }

      if (resolution < 0.07) {
        khaanText = 'Khaaaaaaaaaaaaaaaaaaaaaaaaan!';
      }

      if (resolution < 0.04) {
        khaanText = 'Khaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaan!';
      }

      if (feature.get('type') === "Khaaaan") {
        return [
          new ol.style.Style({
            image: new ol.style.Icon({
              size: [96, 96],
              opacity: 0.7,
              src: resolution < 0.50 ? 'http://wurmonlinemaps.com/Content/dist/assets/khaaan.jpg' : ''
            }),
            text: new ol.style.Text({
              font: '' + fontSize + 'px Calibri,sans-serif',
              text: khaanText,
              textBaseline: 'middle',
              offsetY: 20,
              fill: this.customStyles.defaultTextFill,
              stroke: this.customStyles.defaultTextStroke,
            })
          })
        ]
      }

      if (feature.get('type') === "Midpoint") {
        return [
          new ol.style.Style({
            image: new ol.style.Icon({
              size: [128, 128],
              opacity: 0.8,
              src: resolution < 1 ? 'http://wurmonlinemaps.com/Content/dist/assets/xhair-128.png' : ''
            }),
            text: new ol.style.Text({
              font: '' + fontSize + 'px Calibri,sans-serif',
              text: "Midpoint! (Justa Map Maker's Mark)",
              textAlign: 'center',
              offsetY: 24,
              fill: new ol.style.Fill({
                color: '#FFF'
              }),
              stroke: new ol.style.Stroke({
                color: '#000',
                width: 2,
                offsetY: -2,
                offsetX: 2
              })
            })
          })
        ]
      }
    }.bind(this);

    var khanLayer = new ol.layer.Vector({
      source: easterEggSource,
      style: khaanStyleFunction
    })

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

    this.terrainRaster = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: "http://wurmonlinemaps.com/Content/Tiles/Xanadu-terrain_161101/{z}/{x}/{y}.png",
        tileGrid: mapTileGrid,
      }),
      name: "Xanadu Terrain Raster",
    });

    this.isoRaster = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: "http://wurmonlinemaps.com/Content/Tiles/Xanadu-iso_161101/{z}/{x}/{y}.png",
        tileGrid: mapTileGrid,
      }),
      name: "Xanadu Isometric Raster",
    });

    this.topoRaster = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: "http://wurmonlinemaps.com/Content/Tiles/Xanadu-topo_161101/{z}/{x}/{y}.png",
        tileGrid: mapTileGrid,
      }),
      name: "Xanadu Toplogical Raster",
    });

    this.isoRaster.setVisible(false);
    this.topoRaster.setVisible(false);

    this.map = new ol.Map({
      layers: [
        this.terrainRaster,
        this.isoRaster,
        this.topoRaster,
        this.landmarkLayer,
        this.bridgeLayer,
        this.canalLayer,
        this.deedsLayer,
        this.staringTownsLayer,
        khanLayer
      ],
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

      console.log("Event target", evt.target);

      evt.map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
        //do something
        console.log("Feature at pixel", feature);
        console.log("Feature Goom", feature.getGeometry());
      });
    });
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
            this.map.removeLayer(this.landmarkLayer);
            break;
          }
        case this.constants.BridgeLayerName:
          {
            this.map.removeLayer(this.bridgeLayer);
            break;
          }
        default: {
          console.log("Layer name not found for removal process.", layerName);
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
            this.map.addLayer(this.landmarkLayer);
            break;
          }
        case this.constants.BridgeLayerName:
          {
            this.map.addLayer(this.bridgeLayer);
            break;
          }
        default: {
          console.log("Layer name not found for add process,", layerName);
        }
      }
    }
  }

  gotoDeed(event: any, id: number) {

    let deed = this.deeds[id];

    console.log("Find a deed, deed found:", deed);

    var extent = [deed.X - 100, deed.Y - 100, deed.X + 100, deed.Y + 100];
    console.log("Find a deed Extent:", extent);
    var view = this.map.getView();
    console.log("Find a deed View:", view);
    var size = this.map.getSize();
    console.log("Find a deed Size:", size);

    view.fit(extent, size);
  }

  mainLayer(id: number) {
    if (id === 0) {
      this.terrainRaster.setVisible(true);
      this.isoRaster.setVisible(false);
      this.topoRaster.setVisible(false);
      this.currentRaster = this.constants.TerrainLayerName;
    } else if (id === 1) {
      this.terrainRaster.setVisible(false);
      this.isoRaster.setVisible(true);
      this.topoRaster.setVisible(false);
      this.currentRaster = this.constants.IsoLayerName;
    } else {
      this.terrainRaster.setVisible(false);
      this.isoRaster.setVisible(false);
      this.topoRaster.setVisible(true);
      this.currentRaster = this.constants.TopoLayerName;
    }
  }

  setDeedColor(colorCode: string) {
    if (colorCode.length > 0) {
      this.cacheMonster.set("deedColor", colorCode);

      console.log("Deed color saved", colorCode);
    }
  }

  setCanalColor(colorCode: string) {
    if (colorCode.length > 0) {
      this.cacheMonster.set("canalColor", colorCode);

      console.log("Canal color saved", colorCode);
    }
  }

  setBridgeColor(colorCode: string) {
    if (colorCode.length > 0) {
      this.cacheMonster.set("bridgeColor", colorCode);

      console.log("Brigde color saved", colorCode);
    }
  }
} // end comp