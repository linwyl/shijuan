@echo off
setlocal
chcp 65001 >nul
title Paper Cards
set "PAPER_CARDS_NODE=node"
where node >nul 2>nul
if not errorlevel 1 goto ready
set "PAPER_CARDS_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%PAPER_CARDS_NODE%" goto ready
set "PAPER_CARDS_NODE=%ProgramFiles%\nodejs\node.exe"
if exist "%PAPER_CARDS_NODE%" goto ready
echo Please install Node.js 22.13 or later, then open this file again.
pause
exit /b 1
:ready
set "PAPER_CARDS_START=%~dp0start-local.mjs"
if not exist "%PAPER_CARDS_START%" set "PAPER_CARDS_START=%~dp0scripts\start-local.mjs"
"%PAPER_CARDS_NODE%" "%PAPER_CARDS_START%"
if errorlevel 1 pause
