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
        
        if($element.key -eq $propertyToEdit)
        {
            $element.value = [string] $newValue
			write-host $element.key
			write-Host $element.value
        }
    }
    
}

$appPath = get-mozu-AppPoolPath Admin
$adminPath = "$appPath\web.config"
if($adminPath)
{
    update-themes-path $adminPath "coretheme_directory" $OctopusOriginalPackageDirectoryPath
}
