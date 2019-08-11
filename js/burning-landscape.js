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
        this.gameStatus;

        // game clock
        this.gameClock = null;
        this.gameClockSpeed = 1000;

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
            defaultLives: 1000,
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
                { title: 'Easy', value: 5, growProbability: 1, newTreeProbability: 1},
                { title: 'Medium', value: 15, growProbability: 2, newTreeProbability: 4},
                { title: 'Hard', value: 30, growProbability: 5, newTreeProbability: 8}
            ],
            obstaclesCount: 0
        }
        this.map = [];
        this.onFire = [];

        this.trees = {
            growProbability: 2,
            newTreeProbability: 5
        }

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
        this.gameStatus = this.target.querySelector('.play');

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

        const level = this.level.selected;
        this.level.obstaclesCount = Math.floor(this.screen.cellCount * this.level.list[level].value / 100);
        this.trees.growProbability = this.level.list[level].growProbability;
        this.trees.newTreeProbability = this.level.list[level].newTreeProbability;

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
                this.gameStatus.textContent = 'GAME OVER :(';
            }
            if ( this.isWin() ) {
                clearInterval(this.gameClock);
                this.gameStatus.textContent = 'YOU WIN :)';
            }
        }, this.gameClockSpeed);
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
        this.playerLives.textContent = this.player.lives;
        this.player.gun.canFire = true;
        this.levelDownTrees();
        this.removeEmptyFire();
        this.growTrees();
        this.growNewTrees();
    }

    levelDownTrees  = () => {
        let newFire = [];
        this.onFire.forEach( (row, r) => {
            row.forEach( (column, c) => {
                if ( this.onFire[r][c] === 1 ) {
                    this.map[r][c]--;
                    // fire around
                    for ( let x=-1; x<=1; x++ ) {
                        for ( let y=-1; y<=1; y++ ) {
                            if ( r+y >= 0 &&
                                 r+y < this.screen.cellsY &&
                                 c+x >= 0 &&
                                 c+x < this.screen.cellsX &&
                                 this.map[r+y][c+x] > 0 && 
                                 this.map[r+y][c+x] <= this.HTML.objects.trees &&
                                 this.onFire[r+y][c+x] === 0  ) {
                                newFire.push([r+y, c+x]);
                            }
                        }
                    }
                }
            });
        });
        
        newFire.forEach( coords => {
            let rocks = 0;
            for ( let x=-1; x<=1; x++ ) {
                for ( let y=-1; y<=1; y++ ) {
                    if ( coords[1]+x >= 0 &&
                         coords[1]+x < this.screen.cellsX &&
                         coords[0]+y >= 0 &&
                         coords[0]+y < this.screen.cellsY &&
                         this.map[coords[0]+y][coords[1]+x] === 'r' ) {
                        rocks++;
                    }
                }
            }
            
            if ( rocks === 0 ) {
                this.onFire[coords[0]][coords[1]] = 1;
                this.field.querySelector(`.cell[data-id="${coords[1] + (coords[0]) * this.screen.cellsX}"]`)
                    .classList.add('fire');
            }
        });
    }

    removeEmptyFire = () => {
        this.onFire.forEach( (row, r) => {
            row.forEach( (column, c) => {
                if ( this.map[r][c] === 0 ) {
                    const cell = this.field.querySelector(`.cell[data-id="${c + r * this.screen.cellsX}"]`);
                    cell.classList.remove('trees-1', 'trees-2', 'trees-3', 'trees-4', 'fire');
                    this.onFire[r][c] = 0;
                }
            });
        });
    }

    growTrees = () => {
        const w = this.screen.cellsX;
        this.map.forEach( (row, r) => {
            row.forEach( (treeLevel, c) => {
                if ( Number.isInteger(treeLevel) &&
                     treeLevel > 0 &&
                     treeLevel < 4 ) {
                    const prob = Math.random() * 100;
                    if ( prob <= this.trees.growProbability ) {
                        const tree = this.objects.querySelector(`.cell[data-id="${r*w+c}"]`);
                        tree.classList.remove(`trees-${treeLevel}`);
                        this.map[r][c]++;
                        tree.classList.add(`trees-${treeLevel+1}`);
                    }
                }
            });
        });
    }

    growNewTrees = () => {
        const w = this.screen.cellsX;
        this.map.forEach( (row, r) => {
            row.forEach( (treeLevel, c) => {
                if ( treeLevel === 0 ) {
                    const prob = Math.random() * 100;
                    if ( prob <= this.trees.newTreeProbability ) {
                        if ( this.isTreeNeerCoords( c, r ) === true ) {
                            this.objects.querySelector(`.cell[data-id="${(r)*w+c}"]`)
                                .classList.add(`trees-${treeLevel+1}`);
                            this.map[r][c]++;
                        }
                    }
                }
            });
        });
    }

    isTreeNeerCoords = ( X, Y ) => {
        for ( let x=-1; x<=1; x++ ) {
            for ( let y=-1; y<=1; y++ ) {
                if ( Y+y >= 0 &&
                     Y+y < this.screen.cellsY &&
                     X+x >= 0 &&
                     X+x < this.screen.cellsX &&
                     Number.isInteger(this.map[Y+y][X+x]) &&
                     this.map[Y+y][X+x] > 0 ) {
                    return true;
                }
            }
        }
        return false;
    }

    isWin = () => {
        for ( let x=0; x<this.screen.cellsX; x++ ) {
            for ( let y=0; y<this.screen.cellsY; y++ ) {
                if ( this.map[y][x] !== 'r' &&
                     this.map[y][x] > 0 ) {
                    return false;
                }
            }
        }
        return true;
    }
}

export default burningLandscape;