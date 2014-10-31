using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UnitTests.Diagrams.Admin.Scripts.app.view.category
{

    class ExtTreePanel { }
    class TacoCoreUxContentContainer {}

    class TacoStoreCategoriesTree : TacoStoreSharedTreeStore
    {
        public object nodeSorter;
        public TacoModelCategory model;
    }

    class ExtDataTreeStore 
    {

    }

    class TacoStoreSharedTreeStore : ExtDataTreeStore
    {
        public object model;
        public object nodeSorter;

        public void fillNode(object node, object[] newNodes) { }
    }

    class ExtDataModel { }

    class TacoCoreDataModel :ExtDataModel
    {
        
    }

    class TacoModelCategory : TacoCoreDataModel
    {
        public object proxy;

        public void getFacetSets() { }

    }

    class TacoCoreUxTreeList : ExtTreePanel
    {
        public object store;
    }


    class TacoViewCategoryIndex : TacoCoreUxContentContainer
    {
        public TacoCoreUxTreeList treeList;

        public TacoStoreCategoriesTree store;


        public void onItemMove(object node, object oldParent, object newParent, int index, string[] options)
        {
            
        }

    }

    class TacoCoreDataStoreManager
    {
        public TacoStoreCategoriesTree getCategoryTreeByCatalog()
        {
            return null;
        }
    }
}
