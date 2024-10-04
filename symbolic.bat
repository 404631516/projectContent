@echo off

:: BatchGotAdmin
:-------------------------------------
REM  --> Check for permissions
    IF "%PROCESSOR_ARCHITECTURE%" EQU "amd64" (
>nul 2>&1 "%SYSTEMROOT%\SysWOW64\cacls.exe" "%SYSTEMROOT%\SysWOW64\config\system"
) ELSE (
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
)

REM --> If error flag set, we do not have admin.
if '%errorlevel%' NEQ '0' (
    echo Requesting administrative privileges...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    set params= %*
    echo UAC.ShellExecute "cmd.exe", "/c ""%~s0"" %params:"=""%", "", "runas", 1 >> "%temp%\getadmin.vbs"

    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    pushd "%CD%"
    CD /D "%~dp0"
:--------------------------------------

:GameServer
rmdir %~dp0server\GameServer\src\Netbase
rmdir %~dp0server\GameServer\src\Netcommon
rmdir %~dp0server\GameServer\src\NetProtocol
rmdir %~dp0server\GameServer\src\Netservice
mklink /d %~dp0server\GameServer\src\Netbase %~dp0network\Netbase
mklink /d %~dp0server\GameServer\src\Netcommon %~dp0network\Netcommon
mklink /d %~dp0server\GameServer\src\NetProtocol %~dp0network\NetProtocol
mklink /d %~dp0server\GameServer\src\Netservice %~dp0server\Netservice

:goplay
rmdir %~dp0goplay\src\views\H5\Net\Netbase
rmdir %~dp0goplay\src\views\H5\Net\Netcommon
rmdir %~dp0goplay\src\views\H5\Net\NetProtocol
mklink /d %~dp0goplay\src\views\H5\Net\Netbase %~dp0network\Netbase
mklink /d %~dp0goplay\src\views\H5\Net\Netcommon %~dp0network\Netcommon
mklink /d %~dp0goplay\src\views\H5\Net\NetProtocol %~dp0network\NetProtocol

:Bot
rmdir %~dp0bot\src\Netbase
rmdir %~dp0bot\src\Netcommon
rmdir %~dp0bot\src\NetProtocol
rmdir %~dp0bot\src\NetClient
mklink /d %~dp0bot\src\Netbase %~dp0network\Netbase
mklink /d %~dp0bot\src\Netcommon %~dp0network\Netcommon
mklink /d %~dp0bot\src\NetProtocol %~dp0network\NetProtocol
mklink /d %~dp0bot\src\NetClient %~dp0goplay\src\views\H5\Net\NetClient

pause