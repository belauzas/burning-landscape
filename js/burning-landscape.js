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
            cellsY: 0,
            cellCount: 0
        }
        this.level = {
            selected: 0,
            list: [
                { title: 'Easy', value: 5},
                { title: 'Medium', value: 15},
                { title: 'Hard', value: 30}
            ],
            obstaclesCount: 0
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
        this.screen.cellCount = this.screen.cellsX * this.screen.cellsY;
        this.field.style.width = this.screen.cellsX * this.cellSize + 'px';
        this.field.style.height = this.screen.cellsY * this.cellSize + 'px';

        this.level.obstaclesCount = Math.floor(this.screen.cellCount * this.level.list[ this.level.selected ].value / 100);

        this.map = [];
        for ( let y=0; y<this.screen.cellsY; y++) {
            this.map.push([]);
            for ( let x=0; x<this.screen.cellsX; x++ ) {
                const size = Math.floor( Math.random() * this.HTML.objects.trees ) + 1;
                this.map[y].push(size);
            }
        }

        this.obstacles();

        // reset cells
        this.background.innerHTML = this.HTML.background.tile
                                        .repeat( this.screen.cellCount );
        let html = '';
        this.map.map( row => 
            row.map( column => {
                if ( column > 0 && column <= this.HTML.objects.trees ) {
                    html += `<div class="cell trees-${column}"></div>`;
                }
                if ( column === 'r' ) {
                    html += `<div class="cell rock"></div>`;
                }
            })
        );
        this.objects.innerHTML = html;
        
    }

    obstacles = () => {
        let list = [];
        const max = this.screen.cellCount;
        const w = this.screen.cellsX;
        while( list.length < this.level.obstaclesCount ) {
            const random = Math.floor( Math.random() * max );
            if ( list.indexOf(random) === -1 ) {
                list.push(random);
            }
        }

        list.forEach( cellID => {
            const x = cellID % w;
            const y = (cellID - x) / w;
            this.map[y][x] = 'r';
        });
    }
}

export default burningLandscape;