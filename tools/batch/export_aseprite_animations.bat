SET root=%~dp0..\..
SET sourceFolder=%root%\assets\aseprite\animations
SET outputFolder=%root%\assets\texturepacker\animations

FOR /D %%G IN (%sourceFolder%\*) DO (
    FOR %%I IN (%%G\*.*) DO (
        aseprite -b %%I --save-as %outputFolder%\%%~nxG\%%~nI_00.png
    )
)

SET sourceFolder=%root%\assets\texturepacker\animations\
SET outputFolder=%root%\build\assets\

FOR /D %%G IN (%sourceFolder%\*) DO (
    texturepacker %%G --format phaser --data %outputFolder%\%%~nxG_sheet.json --sheet %outputFolder%\%%~nxG_sheet.png --extrude 0 --force-squared --disable-rotation
)
