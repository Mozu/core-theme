using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UX.Models.Settings
{
    public class EmailTypeSettingVM : Mozu.SiteSettings.General.Contracts.EmailTypeSetting
    {
        public bool? Enabled { get; set; }
    }
    public enum EmailTypes
    {
        NotSet,
        BackInStock,
        OrderChanged,
        OrderShipped,
        OrderFulfillmentDetailsChanged,
        ShopperLoginCreated,
        ShopperPasswordReset,
        ReturnCreated,
        ReturnAuthorized,
        ReturnUpdated,
        ReturnRejected,
        ReturnCancelled,
        ReturnClosed,
        RefundCreated,
        StoreCreditCreated,
        StoreCreditUpdated,
        GiftCardCreated
    };
}
