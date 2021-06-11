SET root=%~dp0..\..
SET sourceFolder=%root%\assets\maps
SET outputFolder=%root%\assets\maps\export

FOR %%I IN (%sourceFolder%\*.*) DO (
    Tiled --export-map %%I %outputFolder%\%%~nI.json
)