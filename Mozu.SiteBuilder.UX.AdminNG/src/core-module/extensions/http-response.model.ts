import {
    HttpError,
    ErrorCode,
    ErroNotificationType
} from './http-error.model';

export class HttpResponse extends HttpError {

    constructor(cd: ErrorCode, erroNotificationType: ErroNotificationType,msg: string = "", subcd: string = "") {
        super(cd, erroNotificationType,msg, subcd);
    }

}
