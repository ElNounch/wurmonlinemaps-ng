declare var ol: any;

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
];

export interface StartingTownModuleLayer {
    generateSource(): any;
    styleFunction(feature, resolution): any[];
}

export class StartingDeedLayer implements StartingTownModuleLayer {
    generateSource() {

        var startingTownsSource = new ol.source.Vector();
        for (let town of startingTowns) {

            var startingTownFeature = new ol.Feature({
                geometry: new ol.geom.Polygon([town.Coords]),
                name: town.Name
            });

            startingTownsSource.addFeature(startingTownFeature);
        }
        return startingTownsSource
    }



    styleFunction(feature, resolution) {
        var name = feature.get('name');

        return [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'blue',
                    width: 3
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 255, 0.1)'
                }),
                text: new ol.style.Text({
                    font: '14px Calibri,sans-serif',
                    text: name,
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
            })
        ]
    }
}