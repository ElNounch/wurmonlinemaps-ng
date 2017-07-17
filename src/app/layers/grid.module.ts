// this one not working for some reason.. put the loic back in the app component

declare var ol: any;

export interface GridModuleLayer {
    generateSource(): any;
    styleFunction(feature, resolution): any[];
}

export class GridLayer implements GridModuleLayer {
    generateSource() {
        var gridSrc = new ol.source.Vector();

        // horiz
        for (var x = 0; x < 20; x++) {
            var y = -((x * 410) + 362);

            var horizLineFeature = new ol.Feature({
                geometry: new ol.geom.LineString([[0, y], [8192, y]]),
                name: ""
            });

            gridSrc.addFeature(horizLineFeature);
        }

        // vertical
        for (var y = 0; y < 20; y++) {
            var x = (y * 410) + 362;

            var vertLineFeature = new ol.Feature({
                geometry: new ol.geom.LineString([[x, 0], [x, -8192]]),
                name: ""
            });

            gridSrc.addFeature(vertLineFeature);
        }

        // grid text
        var gridX = ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U"];

        for (var x = 0; x < 20; x++) {
            var yC = -(x * 410) + 50;

            for (var y = 0; y < 20; y++) {
                var xC = (y * 410) - 40;

                var yDisplay = y + 7;
                var gridID = gridX[x] + " " + yDisplay;

                var gridNameFeature = new ol.Feature({
                    geometry: new ol.geom.Point([xC + 205, yC - 205]),
                    name: gridID
                });

                gridSrc.addFeature(gridNameFeature);
            }
        }

        return gridSrc;
    }

    styleFunction(feature, resolution) {
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
    }
}