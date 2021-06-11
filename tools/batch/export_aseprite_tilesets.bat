SET root=%~dp0..\..
SET sourceFolder=%root%\assets\aseprite\tilesets
SET outputFolder=%root%\assets\texturepacker\tileset

FOR %%I IN (%sourceFolder%\*) DO (
    aseprite -b %%I --save-as %outputFolder%\%%~nI.png
)

SET sourceFolder=%root%\assets\texturepacker\tileset
SET outputFolder=%root%\assets\maps\tilesets

texturepacker %sourceFolder% --sheet %outputFolder%\tileset.png --extrude 0 --force-squared --disable-rotation
