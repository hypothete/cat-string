(function(Physics, console){

    'use strict';

    Physics(function(){
        var world = this;
        var mousedown = false;
        var worldBounds;
        var ropes = [];

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

        function Rope(options){
            options = options || {};
            var ropeObject = {
                id: Math.round(Math.random()*1000).toString(16),
                links: [],
                clicked: false,
                linkRadius : options.links || 15,
                linkRatio : options.linkRatio || 2,
                linkNumber : options.linkNumber || 35,
                speed: options.speed || 1/10000,
                drawRope: drawRope,
                moveRopeEnd: moveRopeEnd,
                hasLink:hasLink
            };

            init();

            return ropeObject;

            function init(){
                for ( var i = 0; i < ropeObject.linkNumber; i++ ){

                    var l = ropeObject.links.push(
                        Physics.body('circle', {
                            x: renderer.width/2 + i*5,
                            y: 50,
                            radius: ropeObject.linkRadius,
                            mass: 0.001,
                            restitution: 0.9,
                            hidden: true
                        })
                    );

                    rigidConstraints.distanceConstraint( ropeObject.links[ l - 1 ], ropeObject.links[ l - 2 ], 1, ropeObject.linkRadius * ropeObject.linkRatio );
                }

                ropeObject.links[ 0 ].treatment = 'static';
            }
            
            function drawRope(){
                for(var i=0; i<ropeObject.links.length-1; i++){
                    renderer.drawLine(ropeObject.links[i].state.pos, ropeObject.links[i+1].state.pos, {
                        strokeStyle: ropeObject.clicked ? '#0066ff' : '#ff0000',
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
                ropeObject.links[0].state.pos.x = renderer.width/2 + lissajous.A*Math.sin(lissajous.a*time*ropeObject.speed + lissajous.d);
                ropeObject.links[0].state.pos.y = -lissajous.B + lissajous.B*Math.sin(lissajous.b*time*ropeObject.speed);
            }

            function hasLink(link){
                for(var i in ropeObject.links){
                    if(link === ropeObject.links[i]){
                        return true;
                    }
                }
                return false;
            }
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
        
        for(var i=0; i<5; i++){
            ropes.push(new Rope({speed: 1/(10000 + Math.random()*4000-2000)}));
        }
        
        ropes.forEach(function(rope){
            world.add(rope.links);
        });
        
        world.on('interact:move', function( data ){
            // data.x; // the x coord
            // data.y; // the y coord
            // data.body; // the grabbed body that was moved (if applicable)

            if(data.body){

                for(var i in ropes){
                    if(ropes[i].hasLink(data.body)){
                        ropes[i].clicked = true;
                    }
                }
                data.body.state.pos.x = data.x;
                data.body.state.pos.y = data.y;
            }
        });

        world.on('interact:release', function(){
            for(var i in ropes){
                ropes[i].clicked = false;
            }
        });

        // subscribe to the ticker
        Physics.util.ticker.on(function( time ){
            world.step( time );
            
            world.render();

            for(var i in ropes){
                ropes[i].moveRopeEnd(time );
                ropes[i].drawRope();
            }

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

        renderer.container.addEventListener('touchstart', function(){
            mousedown = true;
        });

        renderer.container.addEventListener('touchend', function(){
            mousedown = false;
        });

    });

})(window.Physics, window.console);