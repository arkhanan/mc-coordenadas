
$ErrorActionPreference = 'Stop'

# ==================================================
# CONFIGURACION
# ==================================================

$DiscordApplicationId = ''
$DiscordGuildId = ''
$DiscordBotToken = ''

$localConfig = Join-Path $PSScriptRoot 'discord-commands.local.ps1'

if (Test-Path -LiteralPath $localConfig) {
    . $localConfig
}

# ==================================================
# OBTENER DATOS
# ==================================================

$applicationId = if ([string]::IsNullOrWhiteSpace($DiscordApplicationId)) {
    (Read-Host 'Application ID').Trim()
} else {
    $DiscordApplicationId.Trim()
}

$guildId = if ([string]::IsNullOrWhiteSpace($DiscordGuildId)) {
    (Read-Host 'Server ID').Trim()
} else {
    $DiscordGuildId.Trim()
}

$secureToken = $null
$tokenPointer = [IntPtr]::Zero
$botToken = $null

try {

    # ==================================================
    # TOKEN
    # ==================================================

    if ([string]::IsNullOrWhiteSpace($DiscordBotToken)) {

        $secureToken = Read-Host 'Bot token (entrada oculta)' -AsSecureString

        $tokenPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR(
            $secureToken
        )

        $botToken = [Runtime.InteropServices.Marshal]::PtrToStringBSTR(
            $tokenPointer
        ).Trim()

    } else {
        $botToken = $DiscordBotToken.Trim()
    }

    # ==================================================
    # VALIDACIONES
    # ==================================================

    if ($applicationId -notmatch '^\d{17,20}$') {
        throw 'Application ID invalido.'
    }

    if ($guildId -notmatch '^\d{17,20}$') {
        throw 'Guild ID invalido.'
    }

    if ([string]::IsNullOrWhiteSpace($botToken)) {
        throw 'El Bot Token esta vacio.'
    }

    if ($botToken -match '[\x00-\x1F\x7F]') {
        throw 'El token contiene caracteres invisibles.'
    }

    Write-Host ''
    Write-Host 'Validaciones correctas.' -ForegroundColor Green

    # ==================================================
    # COMANDO PRINCIPAL
    # ==================================================

    $command = @{
        name = 'coordenadas'
        description = 'Consultar y administrar coordenadas de Minecraft'
        type = 1

        options = @(

            # ------------------------------------------
            # LISTAR
            # ------------------------------------------

            @{
                type = 1
                name = 'listar'
                description = 'Mostrar las coordenadas activas recientes'
                options = @(
                    @{
                        type = 3
                        name = 'dimension'
                        description = 'Filtrar por dimensión'
                        required = $false
                        choices = @(
                            @{ name = 'Overworld'; value = 'Overworld' }
                            @{ name = 'Nether'; value = 'Nether' }
                            @{ name = 'The End'; value = 'The End' }
                        )
                    },
                    @{
                        type = 3
                        name = 'categoria'
                        description = 'Filtrar por categoría'
                        required = $false
                        choices = @(
                            @{ name = 'Granja'; value = 'Granja' }
                            @{ name = 'Base'; value = 'Base' }
                            @{ name = 'Portal'; value = 'Portal' }
                            @{ name = 'Comercio'; value = 'Comercio' }
                            @{ name = 'Spawner'; value = 'Spawner' }
                            @{ name = 'Mineria'; value = 'Mineria' }
                            @{ name = 'Redstone'; value = 'Redstone' }
                            @{ name = 'Otros'; value = 'Otros' }
                        )
                    }
                )
            },

            @{
                type = 1
                name = 'buscar'
                description = 'Buscar una coordenada por nombre'
                options = @(
                    @{
                        type = 3
                        name = 'nombre'
                        description = 'Nombre o parte del nombre'
                        required = $true
                    }
                )
            },

            @{
                type = 1
                name = 'mias'
                description = 'Mostrar tus coordenadas activas'
            },

            # ------------------------------------------
            # AGREGAR
            # ------------------------------------------

            @{
                type = 1
                name = 'agregar'
                description = 'Publicar una coordenada'

                options = @(

                    @{
                        type = 3
                        name = 'nombre'
                        description = 'Nombre de la ubicacion'
                        required = $true
                    },

                    @{
                        type = 3
                        name = 'categoria'
                        description = 'Categoria'
                        required = $true

                        choices = @(
                            @{ name = 'Granja'; value = 'Granja' }
                            @{ name = 'Base'; value = 'Base' }
                            @{ name = 'Portal'; value = 'Portal' }
                            @{ name = 'Comercio'; value = 'Comercio' }
                            @{ name = 'Spawner'; value = 'Spawner' }
                            @{ name = 'Mineria'; value = 'Mineria' }
                            @{ name = 'Redstone'; value = 'Redstone' }
                            @{ name = 'Otros'; value = 'Otros' }
                        )
                    },

                    @{
                        type = 3
                        name = 'dimension'
                        description = 'Dimension'
                        required = $true

                        choices = @(
                            @{ name = 'Overworld'; value = 'Overworld' }
                            @{ name = 'Nether'; value = 'Nether' }
                            @{ name = 'The End'; value = 'The End' }
                        )
                    },

                    @{
                        type = 10
                        name = 'x'
                        description = 'Coordenada X'
                        required = $true
                    },

                    @{
                        type = 10
                        name = 'y'
                        description = 'Coordenada Y'
                        required = $true
                    },

                    @{
                        type = 10
                        name = 'z'
                        description = 'Coordenada Z'
                        required = $true
                    },

                    @{
                        type = 3
                        name = 'descripcion'
                        description = 'Descripcion opcional'
                        required = $false
                    }
                )
            },

            # ------------------------------------------
            # COPIAR
            # ------------------------------------------

            @{
                type = 1
                name = 'copiar'
                description = 'Mostrar coordenadas y comando listos para copiar'

                options = @(
                    @{
                        type = 3
                        name = 'id'
                        description = 'ID UUID de la coordenada'
                        required = $true
                    }
                )
            },

            # ------------------------------------------
            # ARCHIVAR
            # ------------------------------------------

            @{
                type = 1
                name = 'archivar'
                description = 'Archivar una coordenada propia o de la comunidad'

                options = @(
                    @{
                        type = 3
                        name = 'id'
                        description = 'ID UUID de la coordenada'
                        required = $true
                    }
                )
            }
        )
    }

    # ==================================================
    # CONVERTIR JSON
    # ==================================================

    $jsonBody = $command | ConvertTo-Json -Depth 20

    Write-Host ''
    Write-Host 'Comando preparado correctamente.' -ForegroundColor Green

    # ==================================================
    # REGISTRAR EN DISCORD
    # ==================================================

    $uri = "https://discord.com/api/v10/applications/$applicationId/guilds/$guildId/commands"

    $headers = @{
        Authorization = "Bot $botToken"
    }

    Write-Host ''
    Write-Host 'Conectando con Discord API...' -ForegroundColor Cyan

    $result = Invoke-RestMethod `
        -Method POST `
        -Uri $uri `
        -Headers $headers `
        -UserAgent 'DiscordBot (https://github.com/MineCoords, 1.0)' `
        -ContentType 'application/json; charset=utf-8' `
        -Body ([System.Text.Encoding]::UTF8.GetBytes($jsonBody))

    # ==================================================
    # RESULTADO
    # ==================================================

    Write-Host ''
    Write-Host '====================================' -ForegroundColor Green
    Write-Host ' COMANDO REGISTRADO CORRECTAMENTE' -ForegroundColor Green
    Write-Host '====================================' -ForegroundColor Green

    Write-Host "Nombre: /$($result.name)"
    Write-Host "ID: $($result.id)"
    Write-Host "Application ID: $applicationId"
    Write-Host "Guild ID: $guildId"

}
catch {

    # ==================================================
    # CAPTURA DE ERRORES
    # ==================================================

    Write-Host ''
    Write-Host '====================================' -ForegroundColor Red
    Write-Host ' ERROR AL REGISTRAR COMANDO' -ForegroundColor Red
    Write-Host '====================================' -ForegroundColor Red

    Write-Host ''
    Write-Host 'Mensaje:' -ForegroundColor Yellow
    Write-Host $_.Exception.Message

    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {

        Write-Host ''
        Write-Host 'RESPUESTA DE DISCORD:' -ForegroundColor Cyan

        $responseText = $_.ErrorDetails.Message

        try {

            $errorJson = $responseText | ConvertFrom-Json

            Write-Host "Codigo: $($errorJson.code)"
            Write-Host "Mensaje: $($errorJson.message)"

            if ($errorJson.errors) {

                Write-Host ''
                Write-Host 'DETALLES DE VALIDACION:' -ForegroundColor Yellow

                $errorJson.errors | ConvertTo-Json -Depth 20
            }

        }
        catch {
            Write-Host $responseText
        }
    }

    if ($_.Exception.Response) {

        Write-Host ''
        Write-Host 'HTTP STATUS:' -ForegroundColor Cyan

        Write-Host ([int]$_.Exception.Response.StatusCode)
    }

    Write-Host ''
    Write-Host 'No se pudo completar el registro.' -ForegroundColor Red

    exit 1
}
finally {

    # ==================================================
    # LIMPIEZA
    # ==================================================

    if ($tokenPointer -ne [IntPtr]::Zero) {

        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR(
            $tokenPointer
        )
    }

    $botToken = $null

    if ($secureToken) {
        $secureToken.Dispose()
    }
}
