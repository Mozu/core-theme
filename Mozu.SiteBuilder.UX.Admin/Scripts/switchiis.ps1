
Param(
  $websiteName = "sb1"
  )





Import-Module webadministration




$rootPath=(get-location|get-item).Parent.Parent.FullName



write-host "IIS:\sites\$websiteName"
write-host "$rootPath\Mozu.SiteBuilder.UX"


Set-ItemProperty "IIS:\sites\$websiteName" -name physicalPath -value "$rootPath\Mozu.SiteBuilder.UX"
Set-ItemProperty "IIS:\sites\$websiteName\admin" -name physicalPath -value "$rootPath\Mozu.SiteBuilder.UX.ADMIN"



