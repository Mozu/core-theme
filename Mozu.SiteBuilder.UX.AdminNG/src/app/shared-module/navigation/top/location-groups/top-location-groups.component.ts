import { Component, 
    OnInit } from '@angular/core';
  import { Router } from '@angular/router';  
import { NotificationService } from '@global';

  @Component({
    selector: 'navigation-top-location-groups',
    templateUrl: './top-location-groups.component.html',
    styleUrls: ['./top-location-groups.component.css']
  })
  export class NavigationTopLocationGroupsComponent implements OnInit {
    
    createMode: boolean;
    subscriptions = [];

    constructor(private router: Router,
      private _notificationService:NotificationService) { 

    }
  
    ngOnInit() { 
      this.createMode = false;
      this.checkCreateMode();

      this.subscriptions.push(
        this._notificationService.addLocationGroup.subscribe((action: string) => {
            if(action === "Save Success" || action === "Cancel Success"){
              this.createMode = false;
            }
        })
      );
    }
    
    ngOnDestroy() {
      this.subscriptions.forEach((s) => {
          s.unsubscribe();
      });
    }

    checkCreateMode(){
        if(this.router.url === '/locationGroups'){
          this.createMode = false;
        }
        if(this.router.url === '/locationGroupCreate'){
          this.createMode = true;
        }
    }

    showCreateLG(){
      this.createMode = true;
      this.router.navigate(['/locationGroupCreate']);
    }
  
    cancelCreateLG(){
      this._notificationService.notifyAddLocationGroup("Cancel");
    }

    saveCreateLG(){
      this._notificationService.notifyAddLocationGroup("Save");
    }
  }
  