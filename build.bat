nuget restore
msbuild Mozu.SiteBuilder.sln /p:BuildingInsideVisualStudio=true;Configuration=Release;Platform="Any CPU" /v:q