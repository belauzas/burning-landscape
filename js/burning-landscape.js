"use strict";

class burningLandscape  {
    constructor (target) {
        // DOM elements
        this.target = document.querySelector(target);
        this.field;
        this.background;
        this.objects;

        // game settings
        this.cellSize = 32;
        this.screen = {
            width: 0,
            height: 0,
            cellsX: 0,
            cellsY: 0
        }

        // HTML templates
        this.HTML = {
            background: {
                tile: '<div class="cell"></div>'
            },
            objects: {
                tile: '<div class="cell"></div>'
            }
        }

        // init
        this.init();
    }
    
    init  = () => {
        // reset DOM elements
        this.field = this.target.querySelector('#field');
        this.background = this.field.querySelector('.background');
        this.objects = this.field.querySelector('.objects');

        // reset game settings
        this.screen.width = parseInt(getComputedStyle(this.field).width);
        this.screen.height = parseInt(getComputedStyle(this.field).height);
        this.screen.cellsX = Math.floor( this.screen.width / this.cellSize );
        this.screen.cellsY = Math.floor( this.screen.height / this.cellSize );
        this.field.style.width = this.screen.cellsX * this.cellSize + 'px';
        this.field.style.height = this.screen.cellsY * this.cellSize + 'px';

        // reset cells
        this.background.innerHTML = this.HTML.background.tile.repeat( this.screen.cellsX * this.screen.cellsY );
        this.objects.innerHTML = this.HTML.objects.tile.repeat( this.screen.cellsX * this.screen.cellsY );
        
    }
}

export default burningLandscape;