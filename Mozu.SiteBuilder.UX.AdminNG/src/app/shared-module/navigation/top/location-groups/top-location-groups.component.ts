import { Component, 
    OnInit } from '@angular/core';
  import { Router } from '@angular/router';  

  @Component({
    selector: 'navigation-top-location-groups',
    templateUrl: './top-location-groups.component.html',
    styleUrls: ['./top-location-groups.component.css']
  })
  export class NavigationTopLocationGroupsComponent implements OnInit {
    createMode: boolean;
    
    constructor(private router: Router) { }
  
    ngOnInit() { 
      this.createMode = false;
    }

    showCreateLG(){
      this.createMode = true;
      this.router.navigate(['/locationGroupCreate']);
    }
  
    cancelCreateLG(){
      this.createMode = false;
      this.router.navigate(['/locationGroups']);
    }

    saveCreateLG(){
      this.createMode = false;
      this.router.navigate(['/locationGroups']);
    }
  }
  