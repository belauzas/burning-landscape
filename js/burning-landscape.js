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
        this.map = [];

        // HTML templates
        this.HTML = {
            background: {
                tile: '<div class="cell"></div>'
            },
            objects: {
                tile: '<div class="cell"></div>',
                trees: 4
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

        this.map = [];
        for ( let x=0; x<this.screen.cellsX; x++) {
            this.map.push([]);
            for ( let y=0; y<this.screen.cellsY; y++ ) {
                const size = Math.floor( Math.random() * this.HTML.objects.trees ) + 1;
                this.map[x].push(size);
            }
        }

        // reset cells
        this.background.innerHTML = this.HTML.background.tile
                                        .repeat( this.screen.cellsX * this.screen.cellsY );
        let html = '';
        this.map.map( row => 
            row.map( column => 
                html += `<div class="cell trees-${column}"></div>` ));
        this.objects.innerHTML = html;
        
    }
}

export default burningLandscape;