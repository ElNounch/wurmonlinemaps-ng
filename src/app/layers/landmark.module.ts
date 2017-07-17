import { ILandmark, LandmarkType } from '../app.models';

declare var ol: any;

export interface LandmarkModuleLayer {
    generateSource(gtData: any[]): any;
    styleFunction(feature, resolution): any[];
}

export class LandmarkLayer implements LandmarkModuleLayer {
    generateSource(gtData: any[]) {
        var guardSources = new ol.source.Vector();

        for (let g of gtData) {
            var guardtowerFeature = new ol.Feature({
                geometry: new ol.geom.Point(g),
                type: "guard tower"
            });

            guardSources.addFeature(guardtowerFeature);
        }

        return guardSources;
    }

    styleFunction(feature, resolution) {
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
    }
}