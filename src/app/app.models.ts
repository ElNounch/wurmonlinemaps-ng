export interface IDeed {
    ID: number;
    Server: number;
    X: number;
    Y: number;
    Name: string;
    Notes: string;
}

export interface ServerData {
    Deeds: IDeed[];
    Canals: ICanal[];
    Bridges: IBridge[];
    Landmarks: ILandmark[];
}

export enum LandmarkType {
    GuardTower,
}

export interface IStartingDeed {
    Name: string;
    X: number;
    Y: number;
}

export interface ICanal {
    ID: number;
    Server: number;
    X1: number;
    Y1: number;
    X2: number;
    Y2: number;
    Name: string;
    IsCanal: boolean;
    IsTunnel: boolean;            
    AllBoats: boolean;
    Notes: string;
}

export interface IBridge {
    ID: number;
    Server: number;
    X1: number;
    Y1: number;
    X2: number;
    Y2: number;
    Width: number;
    Name: string;
    Notes: string;
}

export interface ILandmark {
    ID: number;
    LandmarkType: LandmarkType;
    Server: number;
    X1: number;
    Y1: number;
    Name: string;
    Notes: string;
}

export class Constants {
    StarterDeedsLayerName: string = "Starter Deeds Layer";
    DeedLayerName: string = "Deeds Layer";
    GridLayerName: string = "Grid Layer";
    GuardTowerLayerName: string = "Guard Tower Layer";
    CanalLayerName: string = "Canal Layer";
    BridgeLayerName: string = "Bridge Layer";
    TerrainLayerName: string = "Terrain (2016 Nov)";
    IsoLayerName: string = "Isometric (2016 Nov)";
    TopoLayerName: string = "Topological (2016 Nov)";
}

export var CustomColors =  [
    {
        code: "rgba(255, 0, 0, 0.4)",
        name: "Red (Default)"
    },
    {
        code: "rgba(0, 255, 0, 0.4)",
        name: "Green"
    },
    {
        code: "rgba(0, 0, 255, 0.4)",
        name: "Blue"
    },
    {
        code: "rgba(0, 191, 255, 0.4)",
        name: "Cesium"
    },
    {
        code: "rgba(179, 170, 0, 0.4)",
        name: "Puke Green"
    },
    {
        code: "rgba(139, 69, 19, 0.4)",
        name: "Saddle Brown"
    },
    {
        code: "rgba(255, 255, 0, 0.4)",
        name: "Old Yeller"
    },
    {
        code: "rgba(255, 0, 255, 0.4)",
        name: "Fuchsia"
    },
    {
        code: "rgba(75, 0, 130, 0.4)",
        name: "Mood Indigo"
    },
    {
        code: "rgba(0, 0, 0, 0.4)",
        name: "Negroni"
    },

]

