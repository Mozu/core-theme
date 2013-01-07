param($installPath, $toolsPath, $package, $project)

join-path $toolsPath Sitebuilder.CommonTasks.psm1 | out-default
join-path $toolsPath Sitebuilder.CommonTasks.psm1 | import-module -Global

Get-Ext