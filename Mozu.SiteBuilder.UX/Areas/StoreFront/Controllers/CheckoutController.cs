using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Runtime.Serialization;
using System.Threading.Tasks;
using System.Web.Mvc;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.Core.Api.Contracts.Client;

using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Orders;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.Checkout;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class CheckoutController : BaseController
    {
        private readonly IOrderService _orderService;
        private readonly IAuthenticationHelper _authHelper;
        private readonly ICookieProvider _cookieProvider;
        private readonly IPciSettingsProvider _pciSettingsProvider;
        private readonly IOrderWebApiClient _orderWebApiClient;
        private readonly OrderStatusProvider _orderStatusProvider = new OrderStatusProvider();

        //private static string _merchantId;
        private const string CookieName = "order";

        public CheckoutController(IOrderService orderService, IAuthenticationHelper authHelper, ICookieProvider cookieProvider, IPciSettingsProvider pciSettingsProvider, IOrderWebApiClient orderWebApiClient)
        {
            _orderService = orderService;
            _authHelper = authHelper;
            _cookieProvider = cookieProvider;
            _pciSettingsProvider = pciSettingsProvider;
            _orderWebApiClient = orderWebApiClient;
        }

        /*public string MerchantId
        {
            get { return _merchantId ?? (_merchantId = _orderService.GetMerchantId()); }
        }*/

        public async Task<ActionResult> Index(string orderId)
        {
            var pc = this.SiteContext.PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "checkout"
                }

            };
            //var id = OrderId;
            var id = orderId;
            if (string.IsNullOrWhiteSpace(id)) return RedirectToAction("Index", "Cart");

            var model = _orderWebApiClient.GetOrder(id).Result.ReadAsAsync().Result;
            if (model == null) return RedirectToAction("Index", "Cart");
            if (model.Status == "Open") return RedirectToAction("Confirmation", new { orderId = model.Id });
           
            
          

            if (model.ShippingInfo != null && model.ShippingInfo.ShippingContact  != null && model.ShippingInfo.ShippingContact .Address  != null)
            {
                ViewData["availableShippingMethods"] = _orderWebApiClient.GetAvailableShipmentMethods(id).Result.ReadAsSync();
            }
           
            await this.AsyncInitData();

            ViewData["paymentApiBase"] = _pciSettingsProvider.GetPaymentApiBase();
            ViewData["availableCountries"] = _orderService.GetShippableCountries().Select(x => new { code = x.Key, name = x.Value } as object).ToList();
            
            
            return View("checkout", model);
        }

     

        //protected string LastOrderId
        //{
        //    get
        //    {
        //        var cookie = _cookieProvider.GetRequestCookie(CookieName);
        //        return cookie == null ? null : cookie["lastorderid"];
        //    }
        //}

        //protected string OrderId
        //{
        //    get
        //    {
        //        var cookie = _cookieProvider.GetRequestCookie(CookieName);
        //        return cookie == null ? null : cookie["orderid"];
        //    }
        //}

        //public ActionResult Data()
        //{
        //    var model = GetModel(OrderId);
        //    var cartRedirect = CheckoutHelper<CheckoutInformation>.CartRedirect;

        //    var data = (model != null) ? ((model.Model != null) ? model : cartRedirect) : cartRedirect;

        //    return new JsonDCResult { Data = data };
        //}

        public ActionResult Confirmation(string orderId)
        {
            var order = _orderWebApiClient.GetOrder(orderId).Result.ReadAsSync();
            if (order == null)
                return RedirectToAction("Index");
            this.ViewData["MailCheckTo"] = SiteBuilderContext.Current.Settings.Shipping.SiteShippingOriginAddress;
            return View("confirmation", order);
        }

        //public ActionResult UpdateOrder(OrderInformation orderInformation)
        //{
        //    return CheckoutAction(orderInformation, (input, service, order) => service.UpdateCoupon(order.Id, input));
        //}

        //public ActionResult UpdateShippingMethod(ShippingMethodInformation shippingMethodInformation)
        //{
        //    return CheckoutAction(shippingMethodInformation, (input, service, order) => service.UpdateShippingMethod(input, order.Id));
        //}

        //public ActionResult UpdatePayment(PaymentInformation paymentInformation)
        //{
        //    return CheckoutAction(paymentInformation, (input, service, order) => service.UpdatePayment(input, order.Id));
        //}

        //public ActionResult UpdateShippingAddress(ShipmentInformation shipmentInformation)
        //{
        //    return CheckoutAction(shipmentInformation, (input, service, order) => service.UpdateShippingAddress(input, order.Id));
        //}

        //public ActionResult Submit(SubmitInformation submitInformation)
        //{
        //    return CheckoutAction(submitInformation, (input, service, order) =>
        //    {
        //        service.UpdateComment(input.Comments, order.Id);
        //        service.CreateAccount(submitInformation, order.Id);

        //        var submittedOrder = service.Submit(input.OrderId, order);
        //        if (submittedOrder.OrderNumber.HasValue && submittedOrder.OrderNumber > 0)
        //        {
        //            var cookie = _cookieProvider.GetRequestCookie(CookieName);

        //            cookie["lastorderid"] = submittedOrder.Id;
        //            cookie["orderid"] = null;

        //            _cookieProvider.SaveResponseCookie(CookieName, cookie);
        //        }
        //    });
        //}

        //[NonAction]
        //private CheckoutPage GetModel(string orderId)
        //{
        //    var modelBuilder = new CheckoutModelBuilder(_authHelper, _orderService, _pciSettingsProvider);
        //    var checkoutPage = modelBuilder.GetCheckoutPage(orderId);

        //    if (checkoutPage.Order.Shipment.IsEmpty && checkoutPage.Contact != null)
        //        _orderService.UpdateShippingAddress(checkoutPage.Contact.CopyTo(checkoutPage.Order.Shipment), orderId);

        //    _orderStatusProvider.SetStatus(checkoutPage);

        //    return checkoutPage;
        //}

        //[NonAction]
        //private ActionResult CheckoutAction<T>(T input, Action<T, IOrderService, OrderInformation> action) where T : CheckoutInformation
        //{
        //    var checkoutHelper = new CheckoutHelper<T>(new CheckoutModelBuilder(_authHelper, _orderService, _pciSettingsProvider), input, _orderService, GetModel);
        //    using (checkoutHelper)
        //    {
        //        checkoutHelper.Action(action, OrderId);
        //    }
        //    return checkoutHelper.Response;
        //}

        //private class CheckoutModelBuilder
        //{
        //    private readonly IAuthenticationHelper _authenticationHelper;
        //    private readonly IOrderService _orderService;
        //    private readonly IPciSettingsProvider _pciSettingsProvider;

        //    public CheckoutModelBuilder(IAuthenticationHelper authenticationHelper, IOrderService orderService, IPciSettingsProvider pciSettingsProvider)
        //    {
        //        _authenticationHelper = authenticationHelper;
        //        _orderService = orderService;
        //        _pciSettingsProvider = pciSettingsProvider;
        //    }

        //    private ContactInformation GetContact()
        //    {
        //        var UserProfile = _authenticationHelper.GetCurrentProfileToken();
        //        var contact = _orderService.GetOrderContact(UserProfile);

        //        return contact ?? new ContactInformation();
        //    }

        //    private ShippingMethodInformation GetShippingInformation(OrderInformation order)
        //    {
        //        var shippingMethods = _orderService.GetAvailableShippingMethods(order);

        //        var shippingMethodInformation = new ShippingMethodInformation
        //        {
        //            AvailableShippingMethods = shippingMethods.Items,
        //            Id = order.ShippingMethod,
        //        };
        //        return shippingMethodInformation;
        //    }

        //    public CheckoutPage GetCheckoutPage(string orderId)
        //    {
        //        if (string.IsNullOrWhiteSpace(orderId))
        //            return null;

        //        var order = _orderService.GetOrder(orderId);
        //        if (order == null)
        //            return null;

        //        var page = GetPageFromOrder(order);

        //        return page;
        //    }

        //    public CheckoutPage GetPageFromOrder(OrderInformation order)
        //    {
        //        order.Shipment = order.Shipment ?? new ShipmentInformation();

        //        order.Shipment.AvailableCountries = _orderService.GetShippableCountries().Select(x => new { code = x.Key, name = x.Value } as object).ToList();

        //        var model = new CheckoutModel
        //        {
        //            OrderId = order.Id,
        //            ShippingAddress = order.Shipment,
        //            ShippingMethod = GetShippingInformation(order),
        //            PaymentSection = order.Payment,
        //        };

        //        var page = new CheckoutPage(model)
        //        {
        //            Contact = GetContact(),
        //            Success = true,
        //            PaymentApi = new PaymentApiModel
        //            {
        //                Base = _pciSettingsProvider.GetPaymentApiBase(),
        //            },
        //            //MerchantId = _orderService.GetMerchantId(),
        //        };

        //        return page.WithOrder(order);
        //    }
        //}

        //private class CheckoutHelper<T> : IDisposable where T : CheckoutInformation
        //{
        //    private readonly CheckoutModelBuilder _builder;
        //    private readonly T _input;
        //    private readonly IOrderService _orderService;
        //    private readonly Func<string, object> _modelSelector;

        //    private object _data;

        //    public CheckoutHelper(CheckoutModelBuilder builder, T input, IOrderService orderService, Func<string, object> modelSelector)
        //    {
        //        _builder = builder;
        //        _input = input;
        //        _orderService = orderService;
        //        _modelSelector = modelSelector;
        //    }

        //    public ActionResult Response { get; private set; }

        //    public void Dispose()
        //    {
        //        Response = new JsonDCResult { Data = _data };
        //    }

        //    public void Action(Action<T, IOrderService, OrderInformation> action, string orderId)
        //    {
        //        try
        //        {
        //            if (_input == null || _input.OrderId == null)
        //                throw new ArgumentNullException("orderId", "Your request is missing 'orderId'. This is required.");

        //            var order = _orderService.GetOrder(_input.OrderId);

        //            if (order == null || _input.OrderId != orderId)
        //            {
        //                _data = CartRedirect;
        //                return;
        //            }

        //            var before = _builder.GetPageFromOrder(order);
        //            action(_input, _orderService, order);

        //            var page = _modelSelector(_input.OrderId) as CheckoutPage;
        //            var model = page.Model;

        //            // Only diff the sections we care about, not the whole object
        //            model.PaymentSection = Diff.GetDynamicDiff(before.Model.PaymentSection, model.PaymentSection);
        //            model.ShippingAddress = Diff.GetDynamicDiff(before.Model.ShippingAddress, model.ShippingAddress);
        //            model.ShippingMethod = Diff.GetDynamicDiff(before.Model.ShippingMethod, model.ShippingMethod);

        //            _data = page;
        //        }
        //        catch (AggregateException agex)
        //        {
        //            var ex = agex.UnwrapAgg();
        //            _data = new { success = false, message = ex.Message, error = ex.ToString() };
        //        }
        //        catch (Exception ex)
        //        {
        //            _data = new { success = false, message = ex.Message, error = ex.ToString() };
        //        }
        //    }

        //    internal static object CartRedirect
        //    {
        //        get {
        //            return new
        //            {
        //                overallStatus = "incomplete",
        //                success = false,
        //                actions = new[] { new { redirect = "/cart" } }
        //            };
        //        }
        //    }
        //}

        //public static class Diff
        //{
        //    private static readonly Type[] ignoredDeclaringTypes = new[] { typeof (Models.ModelBase) };

        //    public static dynamic GetDynamicDiff<T>(T left, T right)
        //    {
        //        return GetDynamicDiff(left, right, typeof(T));
        //    }

        //    private static dynamic GetDynamicDiff<T>(T left, T right, Type type)
        //    {
        //        dynamic expando = new System.Dynamic.ExpandoObject();
        //        var properties = type.GetProperties();

        //        foreach (var leftProperty in properties)
        //        {
        //            if (ignoredDeclaringTypes.Contains(leftProperty.DeclaringType))
        //                return expando;

        //            var rightProperty = type.GetProperty(leftProperty.Name);
        //            var leftValue = leftProperty.GetValue(left, null);
        //            var rightValue = rightProperty.GetValue(right, null);

        //            if (typeof(IEnumerable).IsAssignableFrom(leftProperty.PropertyType) && leftProperty.PropertyType != typeof(string))
        //            {
        //                // if a list, just copy the new values into the diff'd object
        //                Add(expando, leftProperty, rightValue);
        //                continue;
        //            }

        //            if (leftProperty.PropertyType.IsValueType && !object.Equals(leftValue, rightValue))
        //            {
        //                Add(expando, leftProperty, rightValue);
        //            }
        //            else if (!leftProperty.PropertyType.IsValueType && leftProperty.PropertyType != typeof(string))
        //            {
        //                var diff = GetDynamicDiff(leftValue, rightValue, leftProperty.PropertyType);
        //                if (!((IDictionary<string, object>)diff).Any())
        //                    continue;

        //                Add(expando, leftProperty, ((IDictionary<string, object>)diff).Any() ? diff : null);
        //            }
        //            else if (!object.Equals(leftValue, rightValue))
        //            {
        //                Add(expando, leftProperty, rightValue);
        //            }
        //        }
        //        return expando;
        //    }

        //    private static void Add(dynamic expando, System.Reflection.PropertyInfo property, object value)
        //    {
        //        var attribute = property.GetCustomAttributes(typeof(DataMemberAttribute), false).Cast<DataMemberAttribute>().FirstOrDefault();
        //        if (attribute == null)
        //            return;

        //        ((IDictionary<string, object>)expando).Add(attribute.Name, value);
        //    }
        //}
    }
}
