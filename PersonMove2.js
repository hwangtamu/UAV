//speed variables
var speed = 0.5;

//movement variables
var startPos = Vector3.zero;
var trans = 0.0;
var xMove = 0.0;
var zMove = 0.0;
var x_target = 0.0;
var z_target = -5.5;

//target variables
var target;
target = GameObject.Find("airrobotJ_2").transform;
var goBack = false;

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
	speed = rand/2+0.3;
	
	//determine random starting position within bounding box
	// -2 < x < 2
	// -11 < z < -10
	rand = Random.value;
	var startX = 3*rand - 2;
	rand = Random.value;
	var startZ = -1*rand - 10;
	startPos = new Vector3(startX, 0.33, startZ);
	transform.position = startPos;
	x_target = trans*3.0;
	var travel_route = 	Mathf.Sqrt((x_target-startX)*(x_target-startX)+(z_target-startZ)*(z_target-startZ));
	var t = travel_route/speed;
	xMove = (x_target-startX)*0.03/t;
	zMove = (z_target-startZ)*0.03/t;
	
}

function Update () {

	//determines tilt-ness
	//xMove = trans * Time.deltaTime * speed;
	
	//move forward in z direction
	//zMove = 1.0 * Time.deltaTime * speed;
	
	//determine distance between me and robot
	sqrLen = (target.position - transform.position).sqrMagnitude;
	
	if( sqrLen < social && !goBack){
		zMove += -.125 * Time.deltaTime * speed;
	}
	if( sqrLen < personal && !goBack){
		zMove += -.25 * Time.deltaTime * speed;
	}
	if( sqrLen < intimate || goBack){
		//too scared = leave
		xMove = 0.0;
		zMove = -1.5 * Time.deltaTime * speed;
		
		//stop at back wall
		if(transform.position.z >= -14){
			transform.Translate(xMove, 0, zMove);
		}
		
		goBack = true;
	}
	
	//stop at back wall
	if(transform.position.z < 0.9){
		transform.Translate(xMove, 0, zMove);
	}
	if(transform.position.z<-14 || transform.position.z>0||(Mathf.Abs(transform.position.x)>2.5 && Mathf.Abs(transform.position.z-5.5)<0.1)){
		Destroy(gameObject);
	}
	//Destroy(gameObject,10.0);
}
