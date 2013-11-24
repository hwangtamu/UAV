// const
var inf = 1e10;
var robotWidth = 0.309;

// guard line definition
var ZUpperBound = -5.4;
var ZLowerBound = -5.6;
var YUpperBound = 1.0;
var YLowerBound = 0.9;
var XUpperBound = 1.5 - robotWidth;
var XLowerBound = -1.5 + robotWidth;

// animation variables
private var spin : AnimationState;

// target variables
var bodies : Array;
var targets : Array;
var currentTarget : Transform;

// guardLine
var guardLine = ZUpperBound;

// dist
var dist = 0.0;

// movement variables
var moveSpeed = 2.0;
var followDistance = 0.2;
var verticalSpeed = 0.01;
var goingup = false;

// hokuyo variable
var robot : Transform;

// proximity variables
var sensorRange = 6;
var approachLine = 4;
var threatenLine = 1;

// behaviour variables
var behaviours : Array;
var currentBehaviour : Behaviour;

public class Behaviour
{
	public var level : int; // higher level has higher priority
	public var motors : Array; // function pointers	
	public var YUpperBound : float;
	public var YLowerBound : float;
	public var moveSpeed : float;
	public var verticalSpeed : float;
	
	public function Add_motor(motor : Function) {
		motors.Push(motor);
	}
	
	public function Behaviour(lv : int) {
		level = lv;
		motors = new Array();
	}
}

// define animation behaviours
function Start() {
	var rand = Random.value;
	//numBodies = rand*3;
	numBodies = 3;
	
	spin = animation["Spin"];
	spin.layer = 1;
	spin.blendMode = AnimationBlendMode.Additive;
	spin.wrapMode = WrapMode.Loop;
	spin.speed = 2.0;	
}

// called for each new frame Unity draws
function Update () {
    	bodies = new Array();
    	bodies = GameObject.FindGameObjectsWithTag("Respawn");
	targets = new Array(bodies);	
	
	animation.CrossFade("Spin");	

	// go through five stages
	Sensor_module();	
		
	Perceptual_module();
		
	Behaviour_module();
		
	Coordination_module();
		
	Execution_module();
}

// get raw data from sensors
function Sensor_module() {
	Hokuyo();
	robotCamera();
}

// get position of robot relative to Hokuyo
function Hokuyo() {	
	robot = transform;
}

// get position of crowds from robot on-board camera relative to the robot
function robotCamera() {
	var newTargets = new Array ();
	var newTargetsAboveLine = new Array ();
	
	for (var body in bodies) {	
		//Debug.Log((body.transform.position - robot.transform.position).sqrMagnitude);
		if ((body.transform.position - robot.transform.position).sqrMagnitude < sensorRange * sensorRange)
			newTargets.Push(body);		
	}
	
	targets = newTargets;	
}

// find the closest target
function Perceptual_module() {
		
	var closest;
	var pos = inf;

	//determine closest z-value
	for (var body in targets) {
		var tx = body.transform.position.x;
		var tz = body.transform.position.z;
		var mx = transform.position.x;
		var mz = transform.position.z;
		var currenSqrLen = (mx - tx) * (mx - tx) * 0 + (mz - tz) * (mz - tz) * 1;
		if (body.transform.position.z < guardLine && currenSqrLen < pos) {
			pos = currenSqrLen;
			closest = body.transform;
		}
	}
	
	currentTarget = closest; // could be null
}

// Active behaviours when their corresponding perceptual schema is perceived. 
// there are possibly three behaviours: watching, approaching and threatening.
function Behaviour_module() {

	if (currentTarget != null) {
		dist = guardLine - currentTarget.transform.position.z;
		Debug.Log("dist: " + dist);
	}
	else
		Debug.Log("Target not found");

	behaviours = [];
	
	// watching	
	var new_behaviour = new Behaviour(0);
	// above eye-level
	new_behaviour.Add_motor(fly_at_given_altitude);
	new_behaviour.Add_motor(stabilize);	
	new_behaviour.YUpperBound = 1.0;
	new_behaviour.YLowerBound = 0.9;
	new_behaviour.moveSpeed = 0.0;
	new_behaviour.verticalSpeed = 0.01;
	
	behaviours.Push(new_behaviour);
	Debug.Log("watching");
	
	// approaching
	if (currentTarget != null && dist <= approachLine) {		
		new_behaviour = new Behaviour(1);
		// eye-level				
		new_behaviour.Add_motor(fly_at_given_altitude);
		new_behaviour.Add_motor(follow_x_direction);
		new_behaviour.YUpperBound = 0.6;
		new_behaviour.YLowerBound = 0.5;
		new_behaviour.moveSpeed = 2.0;
		new_behaviour.verticalSpeed = 0.02;
		
		behaviours.Push(new_behaviour);
		Debug.Log("approaching");
	}	
	
	// threatening
	if (currentTarget != null && dist <= threatenLine) {
		new_behaviour = new Behaviour(2);
		new_behaviour.Add_motor(random_move_3D);
		new_behaviour.YUpperBound = 0.4;
		new_behaviour.YLowerBound = 0.3;
		new_behaviour.moveSpeed = 4.0;
		new_behaviour.verticalSpeed = 0.01;
		
		behaviours.Push(new_behaviour);
		Debug.Log("threatening");
	}
}

// coordinate multiple behaviours
function Coordination_module() {
	
	// select the behaviour with highest level
	if (behaviours.length > 0) {
		var highest = behaviours[0].level;
		currentBehaviour = behaviours[0];
		
		for (var behaviour in behaviours) {
			if (behaviour.level > highest) {
				currentBehaviour = behaviour;
				highest = behaviour.level;
			}
		}
	}	
}

// execute the overall behaviours
function Execution_module() {	
	YUpperBound = currentBehaviour.YUpperBound;
	YLowerBound = currentBehaviour.YLowerBound;
	moveSpeed = currentBehaviour.moveSpeed;
	verticalSpeed = currentBehaviour.verticalSpeed;
	
	for (var motor in currentBehaviour.motors) {
		motor();
		//Debug.Log("motor");
	}
}

// motor schemas
function follow_x_direction() {

	Debug.Log("follow_x_direction");	
		
	//keep within follow distance (x)		
	var dest : Vector3;
	dest = transform.position;
	
	if (transform.position.x > currentTarget.position.x + followDistance)
		dest.x = transform.position.x - Time.deltaTime * moveSpeed;	
	if (transform.position.x < currentTarget.position.x - followDistance)
		dest.x = transform.position.x + Time.deltaTime * moveSpeed;
		
	if (dest.x > XUpperBound)
		dest.x = dest.x - Time.deltaTime * moveSpeed;	
	if (dest.x < XLowerBound)
		dest.x = dest.x + Time.deltaTime * moveSpeed;
	
	//Debug.Log((dest - transform.position).x);	
	transform.Translate(dest - transform.position);
}

// going up and down to be within a altitude range
function fly_at_given_altitude() {

	Debug.Log("fly_at_given_altitude");
	
	// above the range
	if (transform.position.y > YUpperBound){
		transform.Translate(0, -verticalSpeed, 0);
		goingup = false;
	}
	// below the range
	if (transform.position.y < YLowerBound){
		transform.Translate(0, verticalSpeed, 0);
		goingup = true;
	}
	// in the range
	if (YLowerBound <= transform.position.y && transform.position.y <= YUpperBound){
		if(goingup){
			transform.Translate(0, verticalSpeed, 0);
			if(transform.position.y >= YUpperBound)
				goingup = false;
		}
		if(!goingup){
			transform.Translate(0, -verticalSpeed, 0);
			if(transform.position.y <= YLowerBound)
				goingup = true;
		}
	}
}

// move randomly in three dimensions
function random_move_3D() {
	Debug.Log("random_move_3D");
	// random pick directional vector
	var random_vector: Vector3 = Vector3(Random.Range(-1.0, 1.0), Random.Range(-1.0, 1.0), Random.Range(-1.0, 1.0));
	var move : Vector3;
	move = Time.deltaTime * moveSpeed * random_vector.normalized;
	//Debug.Log("move x1: " + move.x);
	
	var dest : Vector3;
	dest = transform.position + move;	
	
	if (dest.z > ZUpperBound)
		dest.z = transform.position.z - Time.deltaTime * moveSpeed;
	if (dest.z < ZLowerBound)
		dest.z = transform.position.z + Time.deltaTime * moveSpeed;
		
	if (dest.y > YUpperBound)
		dest.y = transform.position.y - Time.deltaTime * moveSpeed;
	if (dest.y < YLowerBound)
		dest.y = transform.position.y + Time.deltaTime * moveSpeed;		
	
	// make sure the robot does not hit the wall as well
	if (dest.x > currentTarget.position.x + followDistance)
		dest.x = transform.position.x - Time.deltaTime * moveSpeed;	
	if (dest.x < currentTarget.position.x - followDistance)
		dest.x = transform.position.x + Time.deltaTime * moveSpeed;
	
	// make sure the robot does not hit the wall as well	
	if (dest.x > XUpperBound)
		dest.x = transform.position.x - Time.deltaTime * moveSpeed;	
	if (dest.x < XLowerBound)
		dest.x = transform.position.x + Time.deltaTime * moveSpeed;
	
	//Debug.Log("move x2: " + (dest - transform.position).x);
				
	transform.Translate(dest - transform.position);
}

// reset the robot's tilt and height to normal
function stabilize() {
	Debug.Log("stabilize");
	transform.eulerAngles = Vector3(0, 0, 0);	
}
