using NUnit.Framework;
using Should;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Models.Customers;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.SiteBuilder.UX.Models.Orders;

namespace Mozu.SiteBuilder.IntegrationTests.Ux.Models
{
    [TestFixture]
    public class CaseInsensitiveNamingContainerExtensionTests
    {
        [Test]
        public void ModelBase_instances_should_GetAlternateNamedProperty_with_different_cases()
        {
            var node = new NavigationRuntimeNode { Index = 234 };
            node["inDex"].ShouldEqual(234);

            var address = new Address { Address1 = "1600 Pennsylvania Ave" };
            var contact = new Contact { Address = address };
            var reference = new PaymentCardReference { BillingAddress = contact };

            contact["ADDRESS"].ShouldBeSameAs(address);
            reference["billingaddress"].ShouldBeSameAs(contact);
        }

        [Test]
        public void ModelBase_instances_hate_spaces()
        {
            var measurement = new Measurement { Unit = "cubits", Value = 12.25m };
            var package = new PackageMeasurements { PackageLength = measurement };

            measurement["Unit     "].ShouldBeNull();
            package["package length"].ShouldBeNull();
        }
    }
}