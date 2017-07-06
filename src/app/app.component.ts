import { AfterContentInit, AfterViewInit, Component, ElementRef, ViewChild, OnInit } from "@angular/core";

import { MdToolbarModule, MdSidenavModule, MdSlideToggleModule, MdIconModule } from '@angular/material';

import { DeedsService } from './deeds.service';
import { IDeed, IStartingDeed } from './app.models';

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

  public map: any;
  deeds: IDeed[];
  deedsLayer: any;
  staringTownsLayer: any;

  constructor(private deedsService: DeedsService) {
  }

  ngOnInit(): void {
    this.deedsService.getDeeds()
      .subscribe(deeds => {
        this.deeds = deeds["data"];
        // console.log("Calling Render Layer with deeds: ", this.deeds);
        this.renderOpenLayers(this.deeds);
      });
  }

  renderOpenLayers(deeds: IDeed[]): void {

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

    var guardLayer = new ol.layer.Vector({
      source: guardSources,
      name: "Guard Tower Layer",
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
    var gridX = ["C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U"];

    for (var x = 0; x < 19; x++) {
      var yC = -((x * 410) + 362);

      for (var y = 0; y < 19; y++) {
        var xC = (y * 410) + 362;

        var yDisplay = y + 8;
        var gridID = gridX[x] + " " + yDisplay;
        gridPoints.push({ "cX": xC, "cY": yC, "GridID": gridID });

        var gridNameFeature = new ol.Feature({
          geometry: new ol.geom.Point([xC + 205, yC - 205]),
          name: gridID
        });

        gridSrc.addFeature(gridNameFeature);
      }
    }

    var gridLayer = new ol.layer.Vector({
      source: gridSrc,
      name: "Grid Layer",
      style: gridLineStyleFunction
    });

    // starter towns
    var startingTowns = [
      {
        "Name": "Summerholt",
        "Coords": [[6582, -2231], [6622, -2231], [6622, -2272], [6582, -2272]],
      },
      {
        "Name": "Greymead",
        "Coords": [[4680, -3030], [4721, -3030], [4721, -3071], [4680, -3071]],
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
      name: "Starter Deeds Layer"
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
      if (deed.Name == "Summerholt" || deed.Name == "Greymead") {
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
      name: "Deeds Layer",
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
      layers: [terrainRaster, guardLayer, gridLayer, this.staringTownsLayer, this.deedsLayer],
      target: 'map',
      controls: ol.control.defaults({
        attributionOptions: ({
          collapsible: false
        })
      }),
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

  showStarters(event: any) {

    let group = this.map.getLayerGroup();
    let layers = group.getLayers();

    let layerExists: boolean = false;

    layers.forEach(layer => {
      let name = layer.get('name');

      if (name == "Starter Deeds Layer") {
        layerExists = true;
      }
    });


    if (layerExists) {
      this.map.removeLayer(this.staringTownsLayer)
    }
    else {
      this.map.addLayer(this.staringTownsLayer)
    }
  }



  // Deeds Layer
  showDeeds(event: any) {

    let group = this.map.getLayerGroup();
    let layers = group.getLayers();

    let layerExists: boolean = false;

    layers.forEach(layer => {
      let name = layer.get('name');

      if (name == "Deeds Layer") {
        layerExists = true;
      }
    });


    if (layerExists) {
      this.map.removeLayer(this.deedsLayer)
    }
    else {
      this.map.addLayer(this.deedsLayer)
    }
  }

} // end comp