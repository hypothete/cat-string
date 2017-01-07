Physics(function(){
    var world = this;
    var mousedown = false;

    // subscribe to the ticker
    Physics.util.ticker.on(function( time ){
        world.step( time );
    });
    // start the ticker
    Physics.util.ticker.start();

    // add some gravity
    var gravity = Physics.behavior('constant-acceleration', {
        acc: { x : 0, y: 0.004 } // this is the default
    });
    world.add( gravity );

    var renderer = Physics.renderer('canvas', {
        el: 'canvas',
        width: window.innerWidth,
        height: window.innerHeight,
        meta: false, // don't display meta data
        styles: {
            // set colors for the circle bodies
            'circle' : {
                strokeStyle: 'hsla(60, 37%, 17%, 1)',
                lineWidth: 1,
                fillStyle: 'hsla(60, 37%, 57%, 0.8)',
                angleIndicator: 'hsla(60, 37%, 17%, 0.4)'
            }
        }
    });

    // add the renderer
    world.add( renderer );

    var rigidConstraints = Physics.behavior('verlet-constraints', {
        iterations: 3
    });

    var interactive = Physics.behavior('interactive', { el: renderer.container, moveThrottle: 5 });

    var rope = [];

    for ( var i = 0; i < 50; i++ ){

        l = rope.push(
            Physics.body('circle', {
                x: renderer.width/2 + i*5,
                y: 50,
                radius: 3,
                mass: 0.001,
                restitution: 0.9,
                hidden: false
            })
        );

        rigidConstraints.distanceConstraint( rope[ l - 1 ], rope[ l - 2 ], 2);
    }

    rope[ 0 ].treatment = 'static';

   // world.add( rope );
    world.add(rope);
    world.add(rigidConstraints);
    world.add(interactive);

    world.on('interact:move', function( data ){
        // data.x; // the x coord
        // data.y; // the y coord
        // data.body; // the grabbed body that was moved (if applicable)

        if(mousedown && data.body){
            data.body.state.pos.x = data.x;
            data.body.state.pos.y = data.y;

        }
    });

    renderer.container.addEventListener('mousedown', function(){
        mousedown = true;
    });

    renderer.container.addEventListener('mouseup', function(){
        mousedown = false;
    });

    world.on('step', function(){
        // Note: equivalent to just calling world.render() after world.step()
        // rope[0].state.angular.vel = 0.1;
        world.render();
    });
});