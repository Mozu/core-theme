namespace Mozu.SiteBuilder.UX.Admin.Api.Models.DiscountSettings
{
    /// <summary>
    ///     Discount stacking configuration
    /// </summary>
    public class StackingConfiguration
    {

        public bool StackingEnabled { get; set; }

        public int ProductOrderLayers { get; set; }

        public int ProductLineItemLayers { get; set; }

    }
}