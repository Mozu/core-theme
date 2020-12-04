import { EventEmitter, Output, SimpleChanges, ViewChild } from '@angular/core';
import { OnChanges } from '@angular/core';
import { Input } from '@angular/core';
import { Component, ViewEncapsulation } from '@angular/core';
import {
  ITreeOptions,
  TreeComponent,
  TreeNode,
} from '@circlon/angular-tree-component';

@Component({
  selector: 'custom-account-hierarchy',
  templateUrl: './account-hierarchy.component.html',
  styleUrls: ['./account-hierarchy.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class AccountHierarchyComponent implements OnChanges {

  // tslint:disable-next-line: no-input-rename
  @Input('account-hierarchy-model') accountHierarchyModel: any;
  @Output() viewAccount = new EventEmitter<any>();
  @Output() changeParentAccount = new EventEmitter<any>();
  isAccountHierarchyModelProvided: boolean;
  @ViewChild('accountHierarchyTree') accountHierarchyTree: TreeComponent;
  contextMenu: { node: TreeNode, x: number, y: number } = null;

  options: ITreeOptions = {
    levelPadding: 25,
    nodeHeight: 23,
    animateExpand: true,
    idField: 'accountId'
  };

  constructor() {

  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.accountHierarchyModel.currentValue) {
      try {
        if (typeof changes.accountHierarchyModel.currentValue === 'object') {
          this.accountHierarchyModel = changes.accountHierarchyModel.currentValue;
          this.isAccountHierarchyModelProvided = true;
        } else {
          this.accountHierarchyModel = (JSON.parse(changes.accountHierarchyModel.currentValue));
          this.isAccountHierarchyModelProvided = true;
        }
      } catch (e) {
      }
    }
  }

  expandAll(): void {
    this.accountHierarchyTree.treeModel.expandAll();
  }

  collapseAll(): void {
    this.accountHierarchyTree.treeModel.collapseAll();
  }

  onEvent(event: any): void {
    this.closeMenu();
  }

  openContextMenu(event: MouseEvent, treeNode: TreeNode): void {
    this.contextMenu = {
      node: treeNode,
      x: event.pageX,
      y: event.pageY
    };
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  closeMenu = () => {
    this.contextMenu = null;
  }

  viewAccountDetails = () => {
    this.viewAccount.emit(this.contextMenu.node.data);
    this.closeMenu();
  }

  changeParentAccountDetails = () => {
    this.changeParentAccount.emit(this.contextMenu.node.data);
    this.closeMenu();
  }
}
