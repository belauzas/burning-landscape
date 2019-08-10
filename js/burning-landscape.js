"use strict";

class burningLandscape  {
    constructor (target) {
        // DOM elements
        this.target = document.querySelector(target);
        this.field;
        this.background;
        this.objects;
        this.unit;
        this.fireTarget;
        this.playerLives;

        // game clock
        this.gameClock = null;

        // game settings
        this.cellSize = 32;
        this.screen = {
            width: 0,
            height: 0,
            fieldTop: 0,
            fieldLeft: 0,
            cellsX: 0,
            cellsY: 0,
            cellCount: 0
        }
        this.player = {
            defaultLives: 10,
            lives: 1000,
            unitCount: 24,
            selectedUnit: 1,
            position: {
                x: 0,
                y: 0
            },
            gun: {
                target: {
                    x: 0,
                    y: 0
                },
                canFire: false,
                selected: 0,
                list: [
                    { type: 'fire', range: 3 }
                ]
            }
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
        this.onFire = [];

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
        this.unit = this.target.querySelector('.player > .unit');
        this.fireTarget = this.target.querySelector('.player > .target');
        this.playerLives = this.target.querySelector('header > .lives');

        // reset game settings
        this.player.lives = this.player.defaultLives;
        this.screen.width = parseInt(getComputedStyle(this.field).width);
        this.screen.height = parseInt(getComputedStyle(this.field).height);
        this.screen.cellsX = Math.floor( this.screen.width / this.cellSize );
        this.screen.cellsY = Math.floor( this.screen.height / this.cellSize );
        this.screen.cellCount = this.screen.cellsX * this.screen.cellsY;
        this.field.style.width = this.screen.cellsX * this.cellSize + 'px';
        this.field.style.height = this.screen.cellsY * this.cellSize + 'px';
        this.screen.fieldTop = this.field.offsetTop;
        this.screen.fieldLeft = Math.floor( (this.screen.width - this.screen.cellsX * this.cellSize) / 2 );

        this.level.obstaclesCount = Math.floor(this.screen.cellCount * this.level.list[ this.level.selected ].value / 100);

        this.map = [];
        this.onFire = [];
        for ( let y=0; y<this.screen.cellsY; y++) {
            this.map.push([]);
            this.onFire.push([]);
            for ( let x=0; x<this.screen.cellsX; x++ ) {
                const size = Math.floor( Math.random() * this.HTML.objects.trees ) + 1;
                this.map[y].push(size);
                this.onFire[y].push(0);
            }
        }

        this.obstacles();
        // reset player chracter
        this.playerChracterReset();
        this.playerLives.textContent = this.player.lives;

        // reset cells
        this.background.innerHTML = this.HTML.background.tile
                                        .repeat( this.screen.cellCount );
        let html = '';
        this.map.map( (row, rx) => 
            row.map( (column, cy) => {
                if ( column >= 0 && column <= this.HTML.objects.trees ) {
                    html += `<div class="cell trees-${column}" data-id="${cy + rx * this.screen.cellsX}"></div>`;
                }
                if ( column === 'r' ) {
                    html += `<div class="cell rock" data-id="${cy + rx * this.screen.cellsX}"></div>`;
                }
            })
        );
        this.objects.innerHTML = html;

        // DOM events
        window.addEventListener('keyup', this.moveUnit);
        window.addEventListener('mousemove', this.targetObstacle);
        this.fireTarget.addEventListener('click', this.gunFire)

        // start game clock
        this.gameClock = setInterval(() => {
            if ( this.player.lives > 0 ) {
                this.updateGame();
            } else {
                clearInterval(this.gameClock);
                console.log('GAME OVER...');
            }
        }, 1000);
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

    playerChracterReset = () => {
        this.player.position.x = Math.floor( this.screen.cellsX / 2 );
        this.player.position.y = this.screen.cellsY - 1;

        this.unit.style.top = this.player.position.y * this.cellSize + 'px';
        this.unit.style.left = this.player.position.x * this.cellSize + 'px';

        // clear space around player
        for ( let x=-1; x<=1; x++ ) {
            for ( let y=-1; y<=1; y++ ) {
                if ( this.player.position.x + x >= 0 &&
                     this.player.position.x + x < this.screen.cellsX &&
                     this.player.position.y + y >= 0 &&
                     this.player.position.y + y < this.screen.cellsY
                    ) {
                    this.map[ this.player.position.y + y ][ this.player.position.x + x ] = 0;
                }
            }
        }
    }
    
    moveUnit = ( event ) => {
        let move = {x:0, y:0};
        switch (event.keyCode) {
            // up
            case 87: move.y--; break;
            // left
            case 65: move.x--; break;
            // down
            case 83: move.y++; break;
            // right
            case 68: move.x++; break;
            default: break;
        }

        // move unit only if it's not going to move over the obstacle or out of the field
        const horizontal = this.player.position.x + move.x;
        const vertical = this.player.position.y + move.y;
        if ( horizontal >= 0 &&
             horizontal < this.screen.cellsX &&
             vertical >= 0 &&
             vertical < this.screen.cellsY &&
             this.map[ vertical ][ horizontal ] === 0 ) {
            this.player.position.x += move.x;
            this.player.position.y += move.y;

            this.unit.style.top = this.player.position.y * this.cellSize + 'px';
            this.unit.style.left = this.player.position.x * this.cellSize + 'px';
        }
    }

    targetObstacle = ( event ) => {
        const targetX = Math.floor((event.clientX - this.screen.fieldLeft) / this.cellSize);
        const targetY = Math.floor((event.clientY - this.screen.fieldTop) / this.cellSize);
        // make sure its in the field territory
        if ( targetX < 0 || targetX >= this.screen.cellsX ||
             targetY < 0 || targetY >= this.screen.cellsY ) {
            return;
        }

        const playerX = this.player.position.x;
        const playerY = this.player.position.y;
        const fireDistance = this.player.gun.list[ this.player.gun.selected ].range;
        const targetDistance = Math.floor( Math.sqrt( (playerX - targetX) * (playerX - targetX) + (playerY - targetY) * (playerY - targetY) ) );

        if ( fireDistance >= targetDistance &&
             this.map[targetY][targetX] !== 0 ) {
            this.fireTarget.style.display = 'block';
            if ( this.player.gun.target.x !== targetX ||
                 this.player.gun.target.y !== targetY ) {
                this.player.gun.target.x = targetX;
                this.player.gun.target.y = targetY;
                this.fireTarget.style.top = targetY * this.cellSize + 'px';
                this.fireTarget.style.left = targetX * this.cellSize + 'px';
            }
        } else {
            this.fireTarget.style.display = 'none';
            this.player.gun.canFire = true;
        }
    }

    gunFire = () => {
        console.log(this.player.gun.canFire);
        
        const x = this.player.gun.target.x;
        const y = this.player.gun.target.y;
        if ( this.player.gun.canFire === true &&
             this.onFire[y][x] === 0 ) {
            this.onFire[y][x] = 1;
            this.player.gun.canFire = false;
            this.field.querySelector(`.cell[data-id="${x + y * this.screen.cellsX}"]`)
                .classList.add('fire');
        }
    }

    updateGame = () => {
        this.player.lives--;
        this.player.gun.canFire = true;
        console.log('updating...');
    }
}

export default burningLandscape;