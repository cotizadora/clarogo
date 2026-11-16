@echo off
title ClaroGo! Actualizar stock
echo Actualizar stock de ClaroGo!
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0actualizar-stock.ps1"
