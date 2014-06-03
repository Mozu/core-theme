nuget restore
cd Mozu.SiteBuilder.UX.Admin
msbuild /p:BuildingInsideVisualStudio=true /v:q
cd ../Mozu.SiteBuilder.UX
msbuild /p:BuildingInsideVisualStudio=true /v:q
cd ..

