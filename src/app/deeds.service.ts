import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';

import { IDeed } from './app.models'

@Injectable()
export class DeedsService {
    private _deedJsonUrl: string = './assets/deedsdump.json'

    constructor(private _http: Http) { }

    getDeeds(): Observable<IDeed[]> {
        return this._http.get(this._deedJsonUrl)
            .map((response: Response) => <IDeed[]>response.json())
            .do(data => console.log('Deeds: ', data))
            .catch(this.handleError)
    }

    private handleError(error: Response) {
        // in a real world app, we may send the server to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }

}
