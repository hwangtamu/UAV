//guard line definition
var ZUpperBound = -5.4;
var ZLowerBound = -5.6;
var YUpperBound = 1.0;
var YLowerBound = 0.9;

//animation variables
private var spin : AnimationState;

//target variables
//var builtin : Transform[];
var bodies : Array;
var targets : Array;

// guardLine
var guardLine = ZUpperBound;

// dist
var dist = 0.0;

// movement variables
var movement = Vector3.zero;
var moveSpeed = 2.0;
var followDistance = 0.2;
var keepAliveSpeed = 0.01;
var goingup = false;

var currentTarget : Transform;
var robot : Transform;

var approachLine = 4;
var threatenLine = 1;

public class Behaviour
{
	public var level : int; // higher level has higher priority
	public var motors : Array; // function pointers	
	
	public function Add_motor(motor : Function) {
		motors.Push(motor);
	}
	
	public function Behaviour(lv : int) {
		level = lv;
		motors = new Array();
	}
}

var behaviours : Array;
var currentBehaviour : Behaviour;

//define animation behaviours
function Start() {
	var rand = Random.value;
	//numBodies = rand*3;
	numBodies = 3;
	
	spin = animation["Spin"];
	spin.layer = 1;
	spin.blendMode = AnimationBlendMode.Additive;
	spin.wrapMode = WrapMode.Loop;
	spin.speed = 2.0;
	
	//bodies = new Array();
	/*for (var obj in GameObject){
	    Debug.Log(obj.ToString);
	}*/
	/*bodies.Add(GameObject.Find("/Red"));
	bodies.Add(GameObject.Find("/Yellow"));
	bodies.Add(GameObject.Find("/Blue"));*/
	//bodies = GameObject.FindGameObjectsWithTag("Respawn");
	//targets = new Array(bodies);	
	
	//targetsAboveLine = new Array ();
	//currentTarget = targets[0].transform;
	
	//dist = guardLine - currentTarget.transform.position.z;
}


function Update () {
	bodies = new Array();
	bodies = GameObject.FindGameObjectsWithTag("Respawn");
	targets = new Array(bodies);	
	
	animation.CrossFade("Spin");	
	
	// get raw data
	Sensor_module();	
	
	// process raw data
	Perceptual_module();
	
	// 
	Behaviour_module();
	
	// 
	Coordination_module();
	
	//
	Execution_module();
}

function Sensor_module() {
	Hokuyo();
	Camera();
}

// get position of robot relative to Hokuyo
function Hokuyo() {	
	robot = transform;
}

// get position of crowds from robot on-board camera relative to the robot
function Camera() {
	var newTargets = new Array ();
	var newTargetsAboveLine = new Array ();
	
	for (var body in bodies) {		
		newTargets.Push(body);		
	}
	
	targets = newTargets;	
}

// find the closest target
function Perceptual_module() {
	if (targets.length > 0) {
		var closest = targets[0].transform;
		var pos = targets[0].transform.position.z;
	
		//determine closest z-value
		for (var body in targets) {
			if (body.transform.position.z > pos) {
				pos = body.transform.position.z;
				closest = body.transform;
			}	
		}
	}	
	
	currentTarget = closest; // could be null
}

function Behaviour_module() {

	dist = guardLine - currentTarget.transform.position.z;
	//Debug.Log("dist: " + dist);

	behaviours = [];
	
	// watching
	if (currentTarget == null || approachLine < dist) {
		var new_behaviour = new Behaviour(0);
		// above eye-level
		new_behaviour.Add_motor(fly_at_given_altitude);
		new_behaviour.Add_motor(stabilize);	
		
		behaviours.Push(new_behaviour);
	}
	
	// approaching
	if (currentTarget != null && threatenLine < dist && dist <= approachLine) {		
		new_behaviour = new Behaviour(1);
		// eye-level				
		new_behaviour.Add_motor(fly_at_given_altitude);
		new_behaviour.Add_motor(follow_x_direction);
		
		behaviours.Push(new_behaviour);
	}	
	
	// threatening
	if (currentTarget != null && dist <= threatenLine) {
		new_behaviour = new Behaviour(2);
		new_behaviour.Add_motor(random_move_3D);
		
		behaviours.Push(new_behaviour);
	}
}

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

function Execution_module() {	
	for (var motor in currentBehaviour.motors) {
		motor();
		Debug.Log("motor");
	}
}

// motor schemas
function follow_x_direction() {

	Debug.Log("follow_x_direction");
	var tx = currentTarget.position.x;	
	var myx = transform.position.x;
	
	var diffx = tx - myx;
	
	//keep within follow distance (x)
	if (diffx < -followDistance) {
		movement.x = Time.deltaTime * -moveSpeed;
	}
	else if (diffx > followDistance) {
		movement.x = Time.deltaTime * moveSpeed;
	}
	else  {
		movement.x = 0.0;
	}
	
	//Debug.Log(movement.x);
	transform.Translate(movement.x, 0, 0, currentTarget.transform);	
}

function fly_at_given_altitude() {
	Debug.Log("fly_at_given_altitude");
	// above the range
	if (transform.position.y > YUpperBound){
		transform.Translate(0, -keepAliveSpeed, 0);
		goingup = false;
	}
	// below the range
	if (transform.position.y < YLowerBound){
		transform.Translate(0, keepAliveSpeed, 0);
		goingup = true;
	}
	// in the range
	if (YLowerBound <= transform.position.y && transform.position.y <= YUpperBound){
		if(goingup){
			transform.Translate(0, keepAliveSpeed, 0);
			if(transform.position.y >= YUpperBound)
				goingup = false;
		}
		if(!goingup){
			transform.Translate(0, -keepAliveSpeed, 0);
			if(transform.position.y <= YLowerBound)
				goingup = true;
		}
	}
}

function random_move_3D() {
	Debug.Log("random_move_3D");
	// random pick directional vector
	var random_vector: Vector3 = Vector3(Random.Range(-1, 1), Random.Range(-1, 1), Random.Range(-1, 1));
	var move : Vector3;
	move = 0.1 * random_vector.normalized;
	//Debug.Log("move y" + move.y);
	
	var dest : Vector3;
	dest = transform.position + move;	
	
	if (dest.z > ZUpperBound)
		dest.z = transform.position.z - keepAliveSpeed;
	if (dest.z < ZLowerBound)
		dest.z = transform.position.z + keepAliveSpeed;
		
	if (dest.y > YUpperBound)
		dest.y = transform.position.y - keepAliveSpeed;
	if (dest.y < YLowerBound)
		dest.y = transform.position.y + keepAliveSpeed;		
		
	if (dest.x > currentTarget.position.x + followDistance)
		dest.x = transform.position.x - keepAliveSpeed;	
	if (dest.x < currentTarget.position.x - followDistance)
		dest.x = transform.position.x + keepAliveSpeed;
		
	transform.Translate(dest - transform.position);
}

//this resets the robot's tilt and height to normal
function stabilize() {
	Debug.Log("stabilize");
	transform.eulerAngles = Vector3(0, 0, 0);	
}
