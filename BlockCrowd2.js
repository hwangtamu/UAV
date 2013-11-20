#pragma strict

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
var numBodies = 3.0;

// guardLine
var guardLine = ZUpperBound;

// dist
var dist = 0.0;

// movement variables
var movement = Vector3.zero;
var moveSpeed = 2.0;
var followDistance = 0.6;
var keepAliveSpeed = .01;
var goingup = false;

var currentTarget : Transform;
var robot : Transform;

public class Behavior
{
	public var level : int; // higher level has higher priority
	public var motors : Array; // function pointers	
	
	public function Add_motor(motor : function) {
		motors.Push(motor);
	}
	
	public function Behavior(lv : int) {
		level = lv;
	}
}

var behaviors : Array;
var currentBehavior : Behavior;

//define animation behaviors
function Start() {
	var rand = Random.value;
	//numBodies = rand*3;
	numBodies = 3;
	
	spin = animation["Spin"];
	spin.layer = 1;
	spin.blendMode = AnimationBlendMode.Additive;
	spin.wrapMode = WrapMode.Loop;
	spin.speed = 2.0;
	
	bodies = new Array();
	bodies.Add(GameObject.Find("/Red"));
	bodies.Add(GameObject.Find("/Yellow"));
	bodies.Add(GameObject.Find("/Blue"));
	targets = new Array(bodies);	
	
	targetsAboveLine = new Array ();
	currentTarget = targets[0].transform;
	
	dist = guardLine - currentTarget.transform.position.z;
}


function Update () {
	animation.CrossFade("Spin");
	
	//updateState();
	
	// get raw data
	Sensor_module();	
	
	// process raw data
	Perceptual_module();
	
	// 
	Behavior_module();
	
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
	robot = tranform;
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

function behavior_module() {

	dist = guardLine - currentTarget.transform.position.z;

	behaviors = [];
	
	// watching
	if (currentTarget == null) {
		var new_behavior = new Behavior(0);
		// above eye-level
		new_behavior.Add_motor(fly_at_given_altitude);
		new_behavior.Add_motor(stabilize);	
		
		behaviors.Push(new_behavior);
	}
	
	// approaching
	if (currentTarget != null && dist > threshold) {		
		var new_behavior = new Behavior(1);
		// eye-level				
		new_behaviors.Add_motor(fly_at_given_altitude);
		new_behaviors.Add_motor(follow_x_direction);
		
		behaviors.Push(new_behavior);
	}	
	
	// threatening
	if (currentTarget != null && dist <= threshold) {
		var new_behavior = new Behavior(2);
		new_behaviors.Add_motor(random_motion_3D);
		
		behaviors.Push(new_behavior);
	}
}

function Coordination_module() {
	
	// select the behavior with highest level
	if (behaviors.length > 0) {
		var highest = behaviors[0].level;
		currentBehavior = behaviors[0]
		
		for (var behavior in behaviors) {
			if (behavior.level > highest) {
				currentBehavior = behavior;
				highest = behavior.level;
			}
		}
	}
	
}

function Execution_module() {
	for (var motor in currentBehavior.motors)
		motor()
}

//determines how many bodies are current targets
function findTargets() {
	var newTargets = new Array ();
	var newTargetsAboveLine = new Array ();
	
	for (var body in bodies) {
		if(body.transform.position.z < guardLine && body.transform.position.z > social) {
			newTargets.Push(body);
		}
	}
	
	targets = newTargets;
}

// motor schemas
function follow_x_direction() {
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
	
	transform.Translate(movement.x, 0, 0, currentTarget.transform);	
}

function fly_at_given_altitude() {
	// above the range
	if (transform.position.y > YUpperBound){
		transform.Translate(0,-keepAliveSpeed,0);
		goingup = false;
	}
	// below the range
	if (transform.position.y < YLowerBound){
		transform.Translate(0,keepAliveSpeed,0);
		goingup = true;
	}
	// in the range
	if (transform.position.y < YUpperBound && transform.position.y > YLowerBound){
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
	// random pick directional vector
	
}

//this resets the robot's tilt and height to normal
function stabilize() {
	transform.eulerAngles = Vector3(0, 0, 0);
}
