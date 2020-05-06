import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { By } from '@angular/platform-browser';

import { AccessTileComponent } from '@shared/access-tile/access-tile.component';

import { NO_ERRORS_SCHEMA, DebugElement, ElementRef } from '@angular/core';
import { LoggerService } from '@core';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { HttpClientModule } from '@angular/common/http';

describe('Access-tile component', () => {

    let component: AccessTileComponent;
    let fixture: ComponentFixture<AccessTileComponent>;
    let element: HTMLElement;
    let debugElement: DebugElement;
    let loggerService: LoggerService;
    let loggerServiceSpy: any;

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            declarations: [AccessTileComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [LoggerService, CustomNGXLoggerService, NGXLoggerHttpService]

        })
            .compileComponents();

        fixture = TestBed.createComponent(AccessTileComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;

        // To inject services using spyOn
        loggerService = debugElement.injector.get(LoggerService);
        loggerServiceSpy = spyOn(loggerService, 'info').and.callThrough();

    }));

    it('Application should create access tile Component', () => {
        expect(component).toBeDefined();
    });

    it('Application toolbar should have p-card PrimeNG tag', async(() => {
        fixture = TestBed.createComponent(AccessTileComponent);
        const el = fixture.nativeElement.querySelector('p-card');
        expect(el).toBeTruthy();
    }));

    it('Application toolbar should have p-header PrimeNG tag', async(() => {
        fixture = TestBed.createComponent(AccessTileComponent);
        const el = fixture.nativeElement.querySelector('p-header');
        expect(el).toBeTruthy();
    }));

    it('Application toolbar should have p-footer PrimeNG tag', async(() => {
        fixture = TestBed.createComponent(AccessTileComponent);
        const el = fixture.nativeElement.querySelector('p-footer');
        expect(el).toBeTruthy();
    }));

});
