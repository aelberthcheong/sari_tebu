function Get-Images {
    [CmdLetBinding()]
    param (
        [string]$Link
    )

    $content = Invoke-WebRequest -Uri $Link -Method "GET" | Select-Object -ExpandProperty "Content";
    $name    = Split-Path $Link -Leaf
    Set-Content -Path "$name.svg" -Value $content;
}

@(
    "https://cdn.simpleicons.org/node.js",
    "https://cdn.simpleicons.org/express",
    "https://cdn.simpleicons.org/mysql",
    "https://cdn.simpleicons.org/prisma",
) | % { 
    $content = Get-Images -Link $_ 
}