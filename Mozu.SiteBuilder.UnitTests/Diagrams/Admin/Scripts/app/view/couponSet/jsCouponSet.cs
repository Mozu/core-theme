using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UnitTests.Diagrams.Admin.Scripts.app.view.couponSet
{

    public class jsFormForm
    {

    }

    public class jsSearchList
    {

    }


    public class jsCouponSetGrid : jsSearchList
    {
        public jsCouponSetEditor CreateOrEdit { get; set; }

        public jsAdvancedSearch AdvancedSearch { get; set; }
    }

    public class jsAdvancedSearch
    {
        
    }

    public class jsModal
    {
        
    }

    public class jsDrawer : jsModal
    {
        
    }

    public class jsCouponSetEditor : jsDrawer
    {

        public bool isCreateMode;

        public object record;

        public bool doSave()
        {
            return true;
        }

        public void reloadData()
        {
            
        }

        public void show()
        {
            
        }

        public jsGeneralForm General { get; set; }

        public jsGeneratedCodeForm Generated { get; set; }

        public jsManualCodeGrid ManualCodes { get; set; }

        public jsCouponDiscountsGrid Discounts { get; set; }
    }

    public class jsGeneralForm : jsFormForm
    {
        
    }

    public class jsGeneratedCodeForm : jsFormForm
    {
        
    }

    public class jsManualCodeGrid
    {
        
    }

    public class jsCouponDiscountsGrid
    {
        
    }
}
