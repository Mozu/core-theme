using Mozu.Core.Condition;
using Mozu.SiteBuilder.Mvc.Specifications;
using Mozu.SiteBuilder.UX.Models.Checkout;

namespace Mozu.SiteBuilder.Mvc.Orders
{
    public class OrderStatusProvider
    {
        private readonly ISpecification<ShipmentInformation> _orderSpecification = new CanCheckForAvailableShippingSpecification();
        private readonly ISpecification<ShippingMethodInformation> _shippingMethodSpecification = new HasValidShippingMethodSpecification();
        private readonly ISpecification<PaymentInformation> _paymentMethodSpecification = new HasValidPaymentSpecification();

        //public void SetStatus(CheckoutPage page)
        //{
        //    if (page == null || page.Order == null || page.Model == null)
        //        return;

        //    CheckShipmentSpecifications(page.Order.Shipment, _orderSpecification);
        //    StepForward(page);
        //    CheckShippingMethodSpecifications(page.Model.ShippingMethod, _shippingMethodSpecification);
        //    StepForward(page);
        //    CheckPaymentMethodSpecifications(page.Model.PaymentSection, _paymentMethodSpecification);
        //    StepForward(page);
        //    CheckOrderSpecifications(page.Order);
        //    StepForward(page);
        //}

        //private static void StepForward(CheckoutPage page)
        //{
        //    var model = page.Model;

        //    var shippingAddress = model.ShippingAddress;
        //    var shippingMethod = model.ShippingMethod;
        //    var paymentSection = model.PaymentSection;

        //    if (shippingAddress.StepStatus != StepStatus.Complete)
        //        return;

        //    if (shippingMethod.StepStatus == StepStatus.New)
        //        shippingMethod.SetStepStatus(StepStatus.Incomplete);

        //    if (shippingMethod.StepStatus == StepStatus.Complete && paymentSection.StepStatus == StepStatus.New)
        //        paymentSection.SetStepStatus(StepStatus.Incomplete);
        //}

        private static void CheckPaymentMethodSpecifications(PaymentInformation paymentInformation, ISpecification<PaymentInformation> specification)
        {
            if (paymentInformation.StepStatus == StepStatus.New)
                return;

            var isSatisfied = specification.IsSatisfiedBy(paymentInformation);
            if (isSatisfied)
            {
                paymentInformation.SetStepStatus(StepStatus.Complete);
                return;
            }

            var checkoutStep = string.IsNullOrWhiteSpace(paymentInformation.OrderId) ? StepStatus.Incomplete : StepStatus.Invalid;
            checkoutStep.Messages.Add(specification.Message());
            paymentInformation.SetStepStatus(checkoutStep);
        }

        private static void CheckShippingMethodSpecifications(ShippingMethodInformation shippingMethodInformation, ISpecification<ShippingMethodInformation> specification)
        {
            if (shippingMethodInformation.StepStatus == StepStatus.New)
                return;

            var isSatisfied = specification.IsSatisfiedBy(shippingMethodInformation);

            shippingMethodInformation.SetStepStatus(isSatisfied ? StepStatus.Complete : StepStatus.Incomplete);
        }

        private static void CheckShipmentSpecifications(ShipmentInformation shipmentInformation, ISpecification<ShipmentInformation> specification)
        {
            var isSatisfied = specification.IsSatisfiedBy(shipmentInformation);

            if (isSatisfied)
            {
                shipmentInformation.SetStepStatus(StepStatus.Complete);
                return;
            }

            if (shipmentInformation.StepStatus == StepStatus.New)
            {
                shipmentInformation.SetStepStatus(StepStatus.Incomplete);
                return;
            }

            var checkoutStep = StepStatus.Invalid;
            checkoutStep.Messages.Add(specification.Message());
            shipmentInformation.SetStepStatus(checkoutStep);
        }

        //private static void CheckOrderSpecifications(OrderInformation orderInformation)
        //{
        //    if (orderInformation.StepStatus != StepStatus.New)
        //        return;

        //    // Todo: there isn't a good story yet behind discounts and coupons. For now, this
        //    //       logic should work to tell the UI that we have received something.

        //    if (!string.IsNullOrWhiteSpace(orderInformation.CouponCode))
        //        orderInformation.SetStepStatus(StepStatus.Complete);

        //    if (orderInformation.DiscountTotal > 0m)
        //        orderInformation.SetStepStatus(StepStatus.Complete);
        //}
    }
}