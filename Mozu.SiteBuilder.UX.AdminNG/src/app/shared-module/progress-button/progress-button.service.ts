import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/share';

@Injectable()
export class ProgressButtonService {
    public status: Subject<boolean> = new Subject<boolean>();
    private _isloading = false;

    public get isloading(): boolean {
        return this._isloading;
    }

    public set isloading(v: boolean) {
        this._isloading = v;
        this.status.next(v);
    }

    public start(): void {
        this.isloading = true;
    }

    public stop(): void {
        this.isloading = false;
    }
}
