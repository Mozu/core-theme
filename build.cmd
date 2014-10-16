nuget.exe install Mozu.BuildTools -OutputDirectory packages -ExcludeVersion
nuget.exe restore
packages\Mozu.BuildTools\tools\FAKE\FAKE.exe build.fsx %*