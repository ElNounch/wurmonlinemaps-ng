import { ILandmark, LandmarkType } from '../app.models';

declare var ol: any;

export interface LandmarkModuleLayer {
    generateSource(gtData: any[]): any;
    styleFunction(feature, resolution): any[];
}

export class LandmarkLayer implements LandmarkModuleLayer {
    generateSource(gtData: any[]) {
        console.log("Landmark Data", gtData);
        var guardSources = new ol.source.Vector();

        for (let g of gtData) {
            var landmarkFeature = new ol.Feature({
                geometry: new ol.geom.Point([g.X1, g.Y1]),
                type: g.LandmarkType == 0 ? "guardtower" : "bodyofwater",
                name: g.Name
            });

            guardSources.addFeature(landmarkFeature);
        }

        return guardSources;
    }

    styleFunction(feature, resolution) {
        var type = feature.get('type');
        let fontSize: number = resolution <= 0.125 ? 14 : 10;

        if (type === "guardtower") {
            return [ // gt
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
        }
        else {
            return [
                new ol.style.Style({
                    text: new ol.style.Text({
                        font: "" + fontSize + "px serif",
                        text: resolution < 4 ? feature.get('name') : '',
                        textBaseline: 'middle',
                        textAlign: 'center',
                        fill: new ol.style.Fill({
                            color: "Blue"
                        }),
                    })
                })
            ]
        }
    }
}