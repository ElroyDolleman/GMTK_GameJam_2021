/// <reference path="../definitions/phaser.d.ts"/>
/// <reference path="scenes/game_scene.ts"/>

var config = {
    type: Phaser.AUTO,
    width: 320,
    height: 320,
    scaleMode: 3,
    pixelArt: true,
    backgroundColor: '#000000',//'#333333',
    parent: 'GMTK Game Jam 2021',
    title: "GMTK Game Jam 2021",
    version: "0.0.2",
    disableContextMenu: true,
    scene: [ GameScene ],
};

var game = new Phaser.Game(config);