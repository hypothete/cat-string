(function(Physics, console){

    'use strict';

    Physics(function(){
        var world = this;
        var mousedown = false;
        var worldBounds;

        // var cam = document.querySelector('#cam');

        // cam.onload = function(){
        //     console.log('event');
        // };
        
        var renderer = Physics.renderer('canvas', {
            el: 'canvas',
            width: window.innerWidth,
            height: window.innerHeight,
            meta: false, // don't display meta data
            styles: {
                // set colors for the circle bodies
                'circle' : {
                    strokeStyle: '#333',
                    lineWidth: 1,
                    fillStyle: 'rgba(0,0,0,0)',
                    angleIndicator: '#333'
                }
            }
        });

        var gravity = Physics.behavior('constant-acceleration', {
            acc: { x : 0, y: 0.004 } // this is the default
        });

        worldBounds = Physics.aabb(-renderer.width/2, -renderer.height/2, renderer.width*1.5, renderer.height);

        var floorBounce = Physics.behavior('edge-collision-detection', {
            aabb: worldBounds,
            restitution: 0.2,
            cof: 0.8
        });
        

        //ROPE PHYSICS

        var rigidConstraints = Physics.behavior('verlet-constraints', {
            iterations: 3
        });

        var interactive = Physics.behavior('interactive', { el: renderer.container, moveThrottle: 5 });

        var rope = [];
        var linkRadius = 15;
        var linkRatio = 2;
        var linkNumber = 35;
        var ropeClicked = false;

        for ( var i = 0; i < linkNumber; i++ ){

            var l = rope.push(
                Physics.body('circle', {
                    x: renderer.width/2 + i*5,
                    y: 50,
                    radius: linkRadius,
                    mass: 0.001,
                    restitution: 0.9,
                    hidden: true
                })
            );

            rigidConstraints.distanceConstraint( rope[ l - 1 ], rope[ l - 2 ], 1, linkRadius * linkRatio );
        }

        rope[ 0 ].treatment = 'static';

        function drawRope(){
            for(var i=0; i<rope.length-1; i++){
                renderer.drawLine(rope[i].state.pos, rope[i+1].state.pos, {
                    strokeStyle: ropeClicked ? '#0066ff' : '#ff0000',
                    lineWidth: 15, //(rope.length-1 - i) //tentacle!
                    lineCap: 'round'
                });
            }
        }

        function moveRopeEnd( time ){
            var lissajous = {
                a: 3,
                b: 4,
                d: Math.PI/2,
                A: renderer.width/1.5,
                B: renderer.height/4
            };
            rope[0].state.pos.x = renderer.width/2 + lissajous.A*Math.sin(lissajous.a*time + lissajous.d);
            rope[0].state.pos.y = -lissajous.B + lissajous.B*Math.sin(lissajous.b*time);
        }


        // INITIALIZATION

        world.add([
            Physics.behavior('body-impulse-response'),
            Physics.behavior('body-collision-detection'),
            Physics.behavior('sweep-prune'),
            gravity,
            floorBounce,
            rigidConstraints,
            interactive,
            renderer
        ]);
        world.add(rope);

        world.on('interact:move', function( data ){
            // data.x; // the x coord
            // data.y; // the y coord
            // data.body; // the grabbed body that was moved (if applicable)

            if(mousedown && data.body){
                ropeClicked = true;
                data.body.state.pos.x = data.x;
                data.body.state.pos.y = data.y;
            }
        });

        world.on('interact:release', function( data ){
            ropeClicked = false;
        });

        // subscribe to the ticker
        Physics.util.ticker.on(function( time ){
            world.step( time );

            moveRopeEnd( time/4000 );
            
            world.render();

            drawRope();
        });
        // start the ticker
        Physics.util.ticker.start();

        // world.on('step', function(){
        //     // Note: equivalent to just calling world.render() after world.step()
        //     // rope[0].state.angular.vel = 0.1;

        // });


        //listeners

        renderer.container.addEventListener('mousedown', function(){
            mousedown = true;
        });

        renderer.container.addEventListener('mouseup', function(){
            mousedown = false;
        });

    });

})(window.Physics, window.console);