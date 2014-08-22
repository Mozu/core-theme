using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Burrows.Publishing;
using Mozu.CommerceRuntime.Contracts.Fulfillment;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.CommerceRuntime.Contracts.Returns;
using Mozu.Core;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Routing;
using Mozu.Core.Logging;
using Mozu.Core.Messaging.Contracts;
using Mozu.Core.Messaging.Contracts.Credit.Commands;
using Mozu.Core.Messaging.Contracts.Notification;
using Mozu.Core.Messaging.Contracts.Order.Commands;
using Mozu.Core.Messaging.Contracts.Product.Commands;
using Mozu.Core.Messaging.Contracts.User.Commands;
using Mozu.Customer.Contracts;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.UX.Models.Admin.Email;
using Mozu.SiteBuilder.UX.TestData;
using Mozu.SiteSettings.General.Contracts.Clients;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/emailTesting", SuppressDescriptorGeneration = true)]
    public class EmailTestController : BaseController
    {
        private const string ServiceIdRenderEmailTenant = "RenderEmailTenant";
        private readonly ICustomerAccountWebApiClient _accountClient;
        private readonly IApiContext _apiContext;
        private readonly IGeneralSettingsWebApiClient _generalSettingsApi;
        private readonly ILogger _logger;
        private readonly IPublisher _publisher;
        private EmailPublishUtility _emailPublishUtility;
        public const string PasswordReset = "user.passwordreset";
        public const string NewUserCreated = "user.created";
        public const string ProductInStockEmailTopic = "product.instock";

        /// <summary>
        ///     Constructor
        /// </summary>
        /// <param name="apiContext"></param>
        /// <param name="publisher"></param>
        /// <param name="logger"> </param>
        /// <param name="accountClient"></param>
        /// <param name="generalSettingsApi"></param>
        public EmailTestController(
            IApiContext apiContext,
            IPublisher publisher,
            ILogger logger,
            ICustomerAccountWebApiClient accountClient,
            IGeneralSettingsWebApiClient generalSettingsApi)
        {
            _apiContext = apiContext;
            _publisher = publisher;
            _logger = logger;
            _accountClient = accountClient;
            _generalSettingsApi = generalSettingsApi;
            _emailPublishUtility = new EmailPublishUtility(_apiContext);
        }


        public class PasswordResetEmailMessage
        {
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string ValidationToken { get; set; }
            public string UserId { get; set; }
        }

        public class SendRequest
        {
            public string email { get; set; }
            public string Id { get; set; }
        }

        [HttpPostRoute(UriTemplate = "Send")]
        public async Task<HttpResponseMessage> SendEmail(SendRequest req)
        {
            switch (req.Id)
            {
                case ProductInStockEmailTopic:
                {

                    SendInStockNotifications(req.email);
                    break;
                }
                case PasswordReset:
                {
                    SendPasswordResets(req.email);
                    break;
                }
                case NewUserCreated:
                {
                    SendNewUserEmails(req.email);
                    break;
                }
                case "order.shipped":
                {
                    OrderShipped(req.email);
                    break;

                }
                case "order.changed":
                {
                    OrderChanged(req.email);
                    break;

                }
                case "giftcard.created":
                {
                    GiftCardCreated(req.email);
                    break;

                }
                case "return.authorized":
                case "return.rejected":
                case "return.closed":
                case "return.changed":
                case "return.created":
                {
                    ReturnEmail(req.email, req.Id);
                    break;
                }
                default:
                {
                    throw new Exception("no test data found for " + req.Id);
                }

            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        private void SendNewUserEmails(string email)
        {
            var accounts = TestDataBroker.Default.GetFileContents<CustomerAccount>(NewUserCreated);
            foreach (var account in accounts)
            {
                PublishUserCreatedEmail(new NewUserEmailMessage()
                                        {
                                            UserEmailAddress = email,

                                        }, account);
            }
        }

        private void SendPasswordResets(string email)
        {
            var accounts = TestDataBroker.Default.GetFileContents<CustomerAccount>(PasswordReset);
            foreach (var account in accounts)
            {
                PublishPasswordResetEmail(new PasswordResetEmailMessage()
                                          {
                                              FirstName = account.FirstName,
                                              LastName = account.LastName,
                                              UserId = account.UserId,
                                              ValidationToken = Guid.NewGuid().ToString()
                                          }, account);
            }
        }



        private void SendInStockNotifications(string email)
        {
            var products = TestDataBroker.Default.GetFileContents<Mozu.ProductRuntime.Contracts.Product>(ProductInStockEmailTopic);
            foreach (var prod in products)
            {
                SendInStockNotification(Guid.NewGuid().ToString(), new InStockNotificationSubscription()
                                                                   {
                                                                       ProductCode = prod.ProductCode ,
                                                                       Email = email,
                                                                       CustomerId = 1
                                                                       
                                                                   }, prod);
                


            }
        }

        void ReturnEmail(string email, string id)
        {
            var returns = TestDataBroker.Default.GetFileContents<Mozu.CommerceRuntime.Contracts.Returns.Return>(id);
            foreach (var ret in returns)
            {
              SendReturnEmail(ret,id,email);


            }
            if (returns.Count() == 0)
            {
                throw new Exception("no test data found for "+id);
            }

        }
       void  OrderShipped(string email)
        {
            var orders = TestDataBroker.Default.GetFileContents<Mozu.CommerceRuntime.Contracts.Orders.Order>("order.shipped");
            foreach (var order in orders)
            {
                var ids = (order.Packages ?? new List<Package>()).Where(x => x.Status == "Fulfilled").Select(x => x.Id).ToList();
                if (ids.Count > 0)
                {
                    SendShipmentEmail(order, ids, email);    
                }
                
         
            }
        }

        void  GiftCardCreated(string email)
        {
            var orderCredits = TestDataBroker.Default.GetFileContents<GiftCardEmailOrderCredit>("giftcard.created");
            
            foreach (var orderCredit in orderCredits)
            {
                SendGiftCardEmail(orderCredit, email);    
            }
        }

       void OrderChanged(string email)
        {
            var orders = TestDataBroker.Default.GetFileContents<Mozu.CommerceRuntime.Contracts.Orders.Order>("order.changed");
            foreach (var order in orders)
            {
                
                    SendOrderEmail(order, email);
                


            }
        }

       public void PublishPasswordResetEmail(PasswordResetEmailMessage message, CustomerAccount account)
       {
           try
           {
               var emailCommand = new SendPasswordResetEmail
               {
                   MessagePublishingContext = _emailPublishUtility.CreateMessagePublishingContext(account),
                   EmailData = _emailPublishUtility.CreateEmailData(account, message, PasswordReset)
               };

               _publisher.Publish(emailCommand);
           }
           catch (Exception ex)
           {
               _logger.Error("Error publishing password reset email", ex);
           }
       }

       public void PublishUserCreatedEmail(NewUserEmailMessage message, CustomerAccount account)
       {
           try
           {
               var emailCommand = new SendUserCreatedEmail
               {
                   MessagePublishingContext = _emailPublishUtility.CreateMessagePublishingContext(account),
                   EmailData = _emailPublishUtility.CreateEmailData(account, message, NewUserCreated)
               };

               _publisher.Publish(emailCommand);
           }
           catch (Exception ex)
           {
               _logger.Error("Error publishing user created email", ex);
           }
       }

       public class EmailPublishUtility 
       {
           private const string ServiceIdRenderEmailTenant = "RenderEmailTenant";

           private readonly IApiContext _apiContext;
         //  private readonly IGeneralSettingsWrapper _generalSettingsWrapper;

           public EmailPublishUtility(IApiContext apiContext)//, IGeneralSettingsWrapper generalSettingsWrapper)
           {
               _apiContext = apiContext;
           //    _generalSettingsWrapper = generalSettingsWrapper;
           }

           public MessagePublishingContext CreateMessagePublishingContext(CustomerAccount account)
           {
               return CreateMessagePublishingContext(account.UserId , account.Id, account.LocaleCode);
           }

           public MessagePublishingContext CreateMessagePublishingContext(string userId, int? customerId, string localeCode = null)
           {
               if (string.IsNullOrEmpty(localeCode))
                   localeCode = _apiContext.LocaleCode;

               var notificationContext = new MessagePublishingContext
               {
                   SiteId = _apiContext.SiteId,
                   TenantId = _apiContext.TenantId,
                   CatalogId = _apiContext.CatalogId,
                   MasterCatalogId = _apiContext.MasterCatalogId,
                   LocaleCode = localeCode,
                   UserId = userId,
                   CreateBy = ApiContextExtensions.GetAuditInfoUserId(_apiContext),
                   CreateDate = DateTime.UtcNow,
                   CurrencyCode = _apiContext.CurrencyCode,
                   CustomerId = customerId.HasValue ? customerId.Value.ToString(CultureInfo.InvariantCulture) : null,
                   InitiatingAppId = _apiContext.InitiatingAppId
               };
               return notificationContext;
           }

           public EmailData CreateEmailData(CustomerAccount user, object message, string topic)
           {
               return CreateEmailData(message, topic, user.EmailAddress, user.FirstName + " " + user.LastName);
           }

           //public EmailData CreateEmailData(CustomerAccount account, object message, string topic)
           //{
           //    return CreateEmailData(message, topic, account.EmailAddress, account.FirstName + " " + account.LastName);
           //}

           public EmailData CreateEmailData(object message, string topic, string emailAddress, string userName = null)
           {
               if (string.IsNullOrWhiteSpace(userName))
               {
                   userName = emailAddress;
               }

               var result = new EmailData
               {
                   RendererServiceId = ServiceIdRenderEmailTenant,
                   Topic = topic,
                   To = new Dictionary<string, string> { { userName, emailAddress } },
                   Content = JsonConvert.SerializeObject(message)
               };
               SetSenderEmail(result);
               return result;
           }

           private void SetSenderEmail(EmailData emailData)
           {
               var senderEmail = "testing@mozu.com";
               if (!string.IsNullOrWhiteSpace(senderEmail))
               {
                   emailData.Sender = new KeyValuePair<string, string>(senderEmail, senderEmail);
               }
           }
       }
       public void SendInStockNotification(string userId, InStockNotificationSubscription inStockNotificationSubscription, Mozu.ProductRuntime.Contracts.Product  product)
       {
           var contractProduct = product;
           if (contractProduct == null)
               return;

           
               var customerEmail = inStockNotificationSubscription.Email;

               var message = new InStockEmail
               {
                   ProductCode = inStockNotificationSubscription.ProductCode,
                   EmailData = _emailPublishUtility.CreateEmailData(contractProduct, ProductInStockEmailTopic, inStockNotificationSubscription.Email),
                   MessagePublishingContext = _emailPublishUtility.CreateMessagePublishingContext(userId, inStockNotificationSubscription.CustomerId)
               };

               _publisher.Publish(message);
               
           
       }



        /// <summary>
        ///     Send Order email
        /// </summary>
        /// <param name="order"></param>
        public virtual void SendOrderEmail(Order order, string email)
        {
            Order contractOrder = order;
            string customerEmail = email;

            var message = new SendOrderEmail
                          {
                              OrderId = contractOrder.Id,
                              EmailData = new EmailData
                                          {
                                              RendererServiceId = ServiceIdRenderEmailTenant,
                                              Topic = EmailTopics.Order.OrderEmailTopic,
                                              Content = JsonConvert.SerializeObject(contractOrder),
                                              To = new Dictionary<string, string> {{email, email}},
                                          },
                              MessagePublishingContext = _emailPublishUtility.CreateMessagePublishingContext(_apiContext.UserClaims.UserId, contractOrder.CustomerAccountId)
                          };

            SetSenderData(message.EmailData);
            _publisher.Publish(message);
        }

        /// <summary>
        ///     Send fulfillment for shipping related e-mail
        /// </summary>
        /// <param name="order"></param>
        /// <param name="packageIds"></param>
        public void SendShipmentEmail(Order order, IEnumerable<String> packageIds, string email)
        {
            Order contractOrder = order;

            //remove any pacakges not in the packageIds
            List<Package> packagesToRemove = contractOrder.Packages.Where(x => !packageIds.Contains(x.Id)).ToList();

            foreach (Package package in packagesToRemove)
            {
                contractOrder.Packages.Remove(package);
            }

            string customerEmail = email;

            var message = new SendOrderShipmentEmail
                          {
                              OrderId = order.Id,
                              MessagePublishingContext = _emailPublishUtility.CreateMessagePublishingContext(_apiContext.UserClaims.UserId, order.CustomerAccountId),
                              EmailData = new EmailData
                                          {
                                              RendererServiceId = ServiceIdRenderEmailTenant,
                                              Topic = EmailTopics.Order.OrderShippedTopic,
                                              Content = JsonConvert.SerializeObject(contractOrder),
                                              To = new Dictionary<string, string> {{email, email}}
                                          },
                          };

            SetSenderData(message.EmailData);

            _publisher.Publish(message);
        }
        
        /// <summary>
        /// Send Gift Card email
        /// </summary>
        /// <param name="orderCredit">Walkens is using dynamic ExpandoObject, so had to create on our side</param>
        /// <param name="email"></param>
        public void SendGiftCardEmail(GiftCardEmailOrderCredit orderCredit, string email)
        {
            var message = new SendCreditEmail
                          {
                              CreditCode = orderCredit.Credit.Code,
                              CreditMessage = orderCredit.Credit.CurrentBalance.ToString("C"),
                              MessagePublishingContext = _emailPublishUtility.CreateMessagePublishingContext(_apiContext.UserClaims.UserId, orderCredit.Order.CustomerAccountId),
                              EmailData = new EmailData
                                          {
                                              RendererServiceId = ServiceIdRenderEmailTenant,
                                              Topic = EmailTopics.Order.OrderGiftCardTopic,
                                              Content = JsonConvert.SerializeObject(orderCredit),
                                              To = new Dictionary<string, string> {{email, email}}
                                          }
                          };

            SetSenderData(message.EmailData);

            _publisher.Publish(message);
        }

        /// <summary>
        ///     Send fulfillment info changed email
        /// </summary>
        /// <param name="order"></param>
        public void SendFulfillmentInfoChangedEmail(Order order, string email)
        {
            Order contractOrder = order;
            string customerEmail = email;

            var message = new SendOrderEmail
                          {
                              OrderId = order.Id,
                              MessagePublishingContext = _emailPublishUtility.CreateMessagePublishingContext(_apiContext.UserClaims.UserId, order.CustomerAccountId),
                              EmailData = new EmailData
                                          {
                                              RendererServiceId = ServiceIdRenderEmailTenant,
                                              Topic = EmailTopics.Order.OrderFulfillmentInfoChangedTopic,
                                              Content = JsonConvert.SerializeObject(contractOrder),
                                              To = new Dictionary<string, string> {{email, email}},
                                          },
                          };

            SetSenderData(message.EmailData);

            _publisher.Publish(message);
        }


        public void SendReturnEmail(Return rma, string topicName, string toEmail)
        {
            Return contractReturn = rma;
         //   CustomerAccount customerAcct = GetCustomerAccount(rma.CustomerAccountId.Value).Result;

            var message = new SendReturnEmail
                          {
                              OrderId = rma.OriginalOrderId,
                              ReturnId = rma.Id,
                              MessagePublishingContext = _emailPublishUtility.CreateMessagePublishingContext(rma.UserId, rma.CustomerAccountId),
                              EmailData = new EmailData
                                          {
                                              RendererServiceId = ServiceIdRenderEmailTenant,
                                              Topic = topicName,
                                              Content = JsonConvert.SerializeObject(contractReturn),
                                              To = new Dictionary<string, string> {{toEmail, toEmail}},
                                          }
                          };

            SetSenderData(message.EmailData);

            _publisher.Publish(message);
        }

        //private static Dictionary<string, string> GetRecipients(Order order, string customerEmail)
        //{
        //    return new Dictionary<string, string>
        //    {
        //        {
        //            string.Format("{0} {1}", order.BillingInfo.BillingContact.FirstName,
        //                          order.BillingInfo.BillingContact.LastNameOrSurname),
        //            customerEmail
        //        }
        //    };
        //}

        //private static Dictionary<string, string> GetRecipients(CustomerAccount acct)
        //{
        //    return new Dictionary<string, string>
        //    {
        //        {
        //            string.Format("{0} {1}", acct.FirstName, acct.LastName),
        //            acct.EmailAddress
        //        }
        //    };
        //}

        private void SetSenderData(EmailData emailData)
        {
            string senderEmail = "mozuTestEmail@mozu.com";

            if (!string.IsNullOrWhiteSpace(senderEmail))
            {
                emailData.Sender = new KeyValuePair<string, string>(senderEmail, senderEmail);
            }
        }

        public static class EmailTopics
        {
            public static class Order
            {
                public const string OrderShippedTopic = "order.shipped";
                public const string OrderFulfillmentInfoChangedTopic = "order.fulfillmentinfochanged";
                public const string OrderEmailTopic = "order.changed";
                public const string OrderGiftCardTopic = "giftcard.created";
            }

            public static class Return
            {
                public const string Changed = "return.changed";
                public const string Created = "return.created";
                public const string Authorized = "return.authorized";
                public const string Rejected = "return.rejected";
                public const string Cancelled = "return.cancelled";
                public const string Closed = "return.closed";
            }
        }

        //   }
    }
}