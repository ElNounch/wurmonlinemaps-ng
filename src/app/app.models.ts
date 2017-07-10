export interface IDeed {
    ID: number;
    Server: number;
    X: number;
    Y: number;
    Name: string;
    Notes: string;
}

export interface ServerData {
    
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

export class Constants {
    StarterDeedsLayerName: string = "Starter Deeds Layer";
    DeedLayerName: string = "Deeds Layer";
    GridLayerName: string = "Grid Layer";
    GuardTowerLayerName: string = "Guard Tower Layer";
    CanalLayerName: string = "Canal Layer";
}