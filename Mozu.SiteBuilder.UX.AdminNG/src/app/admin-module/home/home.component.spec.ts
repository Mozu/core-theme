import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminHomeComponent } from './home.component';
import { HeaderComponent, NavigationComponent } from '@shared';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LoggerService } from '@core';
import { CustomNGXLoggerService, NGXLoggerHttpService } from 'ngx-logger';
import { HttpClientModule } from '@angular/common/http';
 
describe('Home Component', () => {

 let component: AdminHomeComponent;
 let fixture: ComponentFixture<AdminHomeComponent>;
 
 beforeEach(async(() => {
 TestBed.configureTestingModule({
 imports: [HttpClientModule],
 declarations: [ AdminHomeComponent, HeaderComponent, NavigationComponent ],
 schemas: [NO_ERRORS_SCHEMA],
 providers: [LoggerService,CustomNGXLoggerService,
 NGXLoggerHttpService]
 })
 .compileComponents();
 }));
 

 beforeEach(() => {
 fixture = TestBed.createComponent(AdminHomeComponent);
 component = fixture.componentInstance;
 fixture.detectChanges();
 });
 
 it('should create admin home component', () => {
 expect(component).toBeTruthy();
 });

});