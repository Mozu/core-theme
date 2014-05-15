function get-web-vdir($vdirName)
{
    $found = $false
    if(test-path iis:)
    {
        cd IIS:\sites
        $sites = dir 
        pushd
        foreach($site in $sites)
        {
            cd $site.name
            $vdirs = dir
            foreach($vdir in $vdirs)
            {
               if(($vdir.NodeType -eq "virtualDirectory")-and ($vdir.Name -eq $vdirName))
               {
                 $found = $true, ($vdir.name), ($vdir.PhysicalPath)
               } 
            }
        }
        popd
    }
    return $found
}


function CreateVirtualDir(
    [string] $virtualDir,
	[string] $virtualDirPhysicalPath,
    [string] $siteName)
{
    New-WebVirtualDirectory -name $virtualDir -PhysicalPath $virtualDirPhysicalPath $sitename
}

Function get-mozu-AppPoolPath($appPool)
{
    $appLocation = Get-WebApplication | select path,physicalPath | ?{$_.path -like "*$appPool*"} | select -ExpandProperty PhysicalPath -ErrorAction SilentlyContinue
    pushd
    if(test-path $applocation)
    {
        return $applocation
    }
    else{ throw "can't find dll"}
    popd
}

function update-themes-path($configFile, $propertyToEdit, $newValue)
{
    [xml]$xml=[xml](Get-Content $configFile -ErrorAction SilentlyContinue)
    #$xml.configuration.appSettings.add.$propertyToEdit.key($newValue)
    foreach($element in $xml.configuration.appSettings.add)
    {
        write-host $element.key
        if($element.key -eq $propertyToEdit)
        {
            $element.value = [string] $newValue
        }
    }
    
}


if(get-web-vdir "themes")
{ Write-host "Themes directory is already in place" 
}
else{ 
    CreateVirtualDir "Themes" "D:\mozu\Sites\SiteBuilder\themes" "SiteBuilder"
}

$appPath = get-mozu-AppPoolPath Admin
$adminPath = "$appPath\web.config"
if($adminPath)
{
    update-themes-path $adminPath "coretheme_directory" $OctopusOriginalPackageDirectoryPath
}
