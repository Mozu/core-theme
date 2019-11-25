import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { LoggerService, HttpClientService, httpClientServiceCreator, UtilityService, AuthService, EnvironmentConfig } from '@core';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { CreateLocationGroupService } from 'app/location-groups-module/create/create.service';
import { HttpClient } from '@angular/common/http';
import { Constants as GlobalConstant } from '@global/infrastructure/constants';

describe('Create Location Group Service', () => {
    let locationGroupService: CreateLocationGroupService;
    let loggerService: LoggerService;
    let loggerServiceSpy: any;
    let httpMock: HttpTestingController;


    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CreateLocationGroupService, LoggerService, CustomNGXLoggerService, NGXLoggerHttpService, UtilityService, EnvironmentConfig, AuthService,
                {
                    provide: HttpClientService,
                    useFactory: httpClientServiceCreator,
                    deps: [HttpClient, UtilityService, AuthService]
                }]

        });
        locationGroupService = TestBed.get(CreateLocationGroupService);
        loggerService = TestBed.get(LoggerService);
        httpMock = TestBed.get(HttpTestingController);

        loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();

    });

    it('should return an Observable of Location Group on Create request', () => {

        let dummyLocationGroup =
        {
            "locationGroupId": 5,
            "locationGroupCode": "DLG5",
            "siteIds": [
                21550
            ],
            "name": "Another Group of Locations",
            "locationCodes": [
                "roletest10",
                "roletest11",
                "roletest12"
            ],
            "auditInfo": {
                "updateDate": "2019-04-26T15:26:46.969Z",
                "createDate": "2019-04-26T15:26:46.969Z",
                "updateBy": "1",
                "createBy": "1"
            }
        };

        locationGroupService.addLocationGroup(dummyLocationGroup).subscribe(locationGroup => {
            expect(loggerServiceSpy).toHaveBeenCalledWith("CreateLocationGroupService: addLocationGroup" + JSON.stringify(locationGroup));
            expect(locationGroup.name).toBe("Another Group of Locations");
        },
            err => {
                expect(err).toBe(`Error on data fetching.`)
            })

        const req = httpMock.expectOne(GlobalConstant.webApis.addLocationGroup);
        expect(req.request.method).toBe("POST")
        req.flush(dummyLocationGroup);
        httpMock.verify();
    });

    it('should return an Observable of Location Group on Get Request', () => {

        let locationGroupId = "5"

        let dummyLocationGroup =
        {
            "locationGroupId": 5,
            "siteIds": [
                21550
            ],
            "name": "Another Group of Locations",
            "locationCodes": [
                "roletest10",
                "roletest11",
                "roletest12"
            ],
            "auditInfo": {
                "updateDate": "2019-04-26T15:26:46.969Z",
                "createDate": "2019-04-26T15:26:46.969Z",
                "updateBy": "1",
                "createBy": "1"
            }
        };

        locationGroupService.getLocationGroup(locationGroupId).subscribe(locationGroup => {
            expect(loggerServiceSpy).toHaveBeenCalledWith("EditLocationGroupService: getLocationGroup");
            expect(locationGroup.name).toBe("Another Group of Locations");
        },
            err => {
                expect(err).toBe(`Error on data fetching.`)
            })

        const req = httpMock.expectOne(GlobalConstant.webApis.getLocationGroup + "/" + locationGroupId);
        expect(req.request.method).toBe("GET")
        req.flush(dummyLocationGroup);
        httpMock.verify();
    });

    it('should return an Observable of Location Group on Update Request', () => {

        let dummyLocationGroup =
        {
            "locationGroupId": 5,
            "locationGroupCode": "DLG5",
            "siteIds": [
                21550
            ],
            "name": "Another Group of Locations",
            "locationCodes": [
                "roletest10",
                "roletest11",
                "roletest12"
            ],
            "auditInfo": {
                "updateDate": "2019-04-26T15:26:46.969Z",
                "createDate": "2019-04-26T15:26:46.969Z",
                "updateBy": "1",
                "createBy": "1"
            }
        };

        locationGroupService.updateLocationGroup(dummyLocationGroup).subscribe(locationGroup => {
            expect(loggerServiceSpy).toHaveBeenCalledWith("CreateLocationGroupService: updateLocationGroup" + JSON.stringify(locationGroup));
            expect(locationGroup.name).toBe("Another Group of Locations");
        },
            err => {
                expect(err).toBe(`Error on data fetching.`)
            })

        const req = httpMock.expectOne(GlobalConstant.webApis.editLocationGroup);
        expect(req.request.method).toBe("POST")
        req.flush(dummyLocationGroup);

        httpMock.verify()
    });
});

