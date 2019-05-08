import { Component, OnInit } from '@angular/core';
import {TreeNode} from 'primeng/components/common/api';

@Component({
  selector: 'app-physicallocation',
  templateUrl: './physical.location.component.html',
  styleUrls: ['./physical.location.component.css']
})
export class PhysicallocationComponent implements OnInit {
  files: TreeNode[];

  cols: any[];
  constructor() { }

  ngOnInit() {
    //this.nodeService.getFilesystem().then(files => this.files = files);

    this.files = [  
          {  
              "data":{  
                  "name":"Applications",
                  "size":"200mb",
                  "type":"Folder"
              },
              "children":[  
                  {  
                      "data":{  
                          "name":"Angular",
                          "size":"25mb",
                          "type":"Folder"
                      },
                      "children":[  
                          {  
                              "data":{  
                                  "name":"angular.app",
                                  "size":"10mb",
                                  "type":"Application"
                              }
                          },
                          {  
                              "data":{  
                                  "name":"cli.app",
                                  "size":"10mb",
                                  "type":"Application"
                              }
                          },
                          {  
                              "data":{  
                                  "name":"mobile.app",
                                  "size":"5mb",
                                  "type":"Application"
                              }
                          }
                      ]
                  },
                  {  
                      "data":{  
                          "name":"editor.app",
                          "size":"25mb",
                          "type":"Application"
                      }
                  },
                  {  
                      "data":{  
                          "name":"settings.app",
                          "size":"50mb",
                          "type":"Application"
                      }
                  }
              ]
          },          
      ];
        this.cols = [
            { field: 'name', header: 'Name' },
        ];
  }

}
