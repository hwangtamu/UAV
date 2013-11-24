//speed variables
var speed = 0.5;
var backspeed = 0.0;
//movement variables
var startPos = Vector3.zero;
var trans = 0.0;
var xMove = 0.0;
var zMove = 0.0;

//set up a target for the crowd to reduce the chance of hitting the wall.
var x_target = 0.0;
var z_target = -5.5;

//measure if the crowd got stuck in the corners
var deviant_x = 0;
var deviant_z = 0;

//target variables
var target;
target = GameObject.Find("airrobotJ_2").transform;
var goBack = false;
var marked = false;

//position variables
var intimate = 0.46;
var personal = 1.22;
var social = 3.66;
var sqrLen = 0.0;


function Start(){
	//random returns a float f such thatr 0 <= f <= 1
	var rand = Random.value;
	//movement in x direction
	//transform into a value between -.5 and .5 (+/- 45 degrees)
	trans = rand - 0.5;
	//determine random speed (at least 0.3 so it's not completely tedious)
	rand = Random.value;
	speed = rand/2+0.8;
	
	//determine random starting position within bounding box
	// -2 < x < 1
	// -11 < z < -10
	rand = Random.value;
	var startX = 3*rand - 2;
	rand = Random.value;
	var startZ = -1*rand - 10;
	
	startPos = new Vector3(startX, 0.33, startZ);
	transform.position = startPos;
	
	//make the crowds move in various ways
	x_target = trans*3.0;
	var travel_route = 	Mathf.Sqrt((x_target-startX)*(x_target-startX)+(z_target-startZ)*(z_target-startZ));
	var t = travel_route/speed;
	xMove = (x_target-startX)*2*Time.deltaTime/t;
	zMove = (z_target-startZ)*2*Time.deltaTime/t;
	
	backspeed = -zMove;
}

function Update () {
	
	//determines tilt-ness
	//xMove = trans * Time.deltaTime * speed;
	
	//move forward in z direction
	//zMove = 1.0 * Time.deltaTime * speed;
	
	//determine distance between me and robot
	sqrLen = (target.position - transform.position).sqrMagnitude;
	//the speed of the crowd depends on the distance between the crowd and the robot.
	if( sqrLen < social && !goBack){
		zMove += -.1 * Time.deltaTime * zMove;
	}
	if( sqrLen < personal && !goBack){
		zMove += -.2 * Time.deltaTime * zMove;
	}
	if( sqrLen < intimate || goBack){
		//too scared = leave
		xMove = 0.0;
		if(sqrLen < personal )
			zMove = 0.2*backspeed;
		
		if(sqrLen < social )
			zMove = 0.6*backspeed;
			
		if(sqrLen >=social )
			zMove = 1.0*backspeed;
			
		transform.Translate(xMove, 0, zMove);
		goBack = true;
		//a successful block
		if(marked == false){
			Spawn.success += 1;
			marked = true;
		}
	}

	
	//stop at back wall
	if(transform.position.z <= 0){
		transform.Translate(xMove, 0, zMove);
	}
	
	
	
	//robot fails if people pass the exit
	if(transform.position.z>-3.5 && marked == false){
		Spawn.fail += 1;
		marked = true;
	}
	
	if(transform.position.z<-14 || transform.position.z>0){
		
		Destroy(gameObject);
	}
	
	//Destroy redundant gameobject automatically.
	deviant_x = Mathf.Abs(transform.position.x);
	deviant_z = Mathf.Abs(transform.position.z+5.5);
	
	if(deviant_x >1.5 && deviant_z < 0.5){
		Destroy(gameObject);
	}
}


