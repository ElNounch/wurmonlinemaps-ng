declare var ol: any;

export interface RoadModuleLayer {
    generateSource(): any;
    styleFunction(feature, resolution): any[];
}

export class RoadLayer implements RoadModuleLayer {
    roads: any[] = [
        {
            Name: "Summerholt Parkway",
            Points: [
                [6498, -2253],
                [6584, -2253],
                [6584, -2251],
                [6875, -2251],
                [6875, -2263],
                [7041, -2263]
            ]
        }
    ];

    generateSource() {
        console.log("Roads", this.roads)
        var roadSources = new ol.source.Vector();

        for (let r of this.roads) {
            var roadFeature = new ol.Feature({
                geometry: new ol.geom.LineString(r.Points),
                name: r.Name
            })

            roadSources.addFeature(roadFeature);
        }

        return roadSources;
    }
    styleFunction(feature, resolution) {
        let fontSize: number = resolution <= 0.125 ? 12 : 8;

        let roadName = feature.get('name') != null ? feature.get('name') : '';

        return [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    width: 11 / resolution,
                    color: "rgba(0, 0, 0, 0.4)"
                }),
                text: new ol.style.Text({
                    font: '' + fontSize + 'px Calibri,sans-serif',
                    text: resolution < 8 ? roadName : '',
                    textBaseline: 'middle',
                    textAlign: 'center',
                    // offsetY: 12,
                    fill: new ol.style.Fill({
                        // color: '#FFF'
                        color: "White"
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'Black',
                        width: 1
                    })
                })
            }),
        ]
    }
}