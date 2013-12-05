// guard line definition
var ZUpperBound = -5.49;
var ZLowerBound = -5.51;
var YUpperBound = 1.0;
var YLowerBound = 0.9;
var XUpperBound;
var XLowerBound;

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
var moveVector;

// hokuyo variable
var robot : Transform;

// proximity variables
var sensorRange = 6;
var approachLine = 4;
var threatenLine = 1.5;

// behaviour variables
var behaviours : Array;
var currentBehaviour : Behaviour;

// UAV
var robotWidth;

public class Behaviour
{
	public var level : int; // higher level has higher priority
	public var motors : Array; // function pointers	
	public var YUpperBound : float; // altitude upper bound
	public var YLowerBound : float; // altitude lower bound
	public var moveSpeed : float;	// speed along x direction
	public var verticalSpeed : float; // speed along y direction
	// add function pointer of motor schema
	public function Add_motor(motor : Function) { 
		motors.Push(motor);
	}
	// constructor, initialize level and arrary motor schema pointer
	public function Behaviour(lv : int) { 
		level = lv;
		motors = new Array();
	}
}

// define animation behaviours
function Start()
{
	spin = animation["Spin"];
	spin.layer = 1;
	spin.blendMode = AnimationBlendMode.Additive;
	spin.wrapMode = WrapMode.Loop;
	spin.speed = 2.0;	
	robotWidth = transform.renderer.bounds.size.x / 2;
	
	Debug.Log('Start: ' + transform.position.x);
}

// called for each new frame Unity draws
function Update()
{
	animation.CrossFade("Spin");

	// add objects from simulator
	bodies = new Array();
	bodies.AddRange(GameObject.FindGameObjectsWithTag("Respawn"));
	bodies.AddRange(GameObject.FindGameObjectsWithTag("Wall"));
	bodies.AddRange(GameObject.FindGameObjectsWithTag("Airrobot"));   

	// go through five stages
	Sensor_module();	
		
	Perceptual_module();
		
	Behaviour_module();
		
	Coordination_module();
		
	Execution_module();
}

// get raw data from sensors
function Sensor_module() 
{
	robotCamera();
	
	// sanity check
	if (transform.position.z < ZLowerBound || transform.position.z > ZUpperBound) {
		Debug.Log('Fault: ' + transform.position.z);
	}
}

// get position of crowds from robot on-board camera relative to the robot
function robotCamera() 
{
	var newTargets = new Array ();
	var newTargetsAboveLine = new Array ();
	
	for (var body in bodies) {	
		//Debug.Log((body.transform.position - transform.position).sqrMagnitude);		
		if ((body.transform.position - transform.position).sqrMagnitude < sensorRange * sensorRange)
			newTargets.Push(body);		
	}
	
	targets = newTargets;	
}

// find the closest target
function Perceptual_module() 
{		
	var closest;
	var pos = Mathf.Infinity;
	XLowerBound = -Mathf.Infinity;
	XUpperBound = Mathf.Infinity;
	
	var mx = transform.position.x;
	var mz = transform.position.z;

	// determine x bound
	for (var body in targets) {
		var tx = body.transform.position.x;
		var tz = body.transform.position.z;
		var width = body.renderer.bounds.size.x / 2;
		
		// consider all the objects near the guard line		
		if (ZLowerBound <= tz && tz <= ZUpperBound) {
			if (body.transform == transform) {
				Debug.Log('Itself');
				continue;		
			}
			if (tx + width < mx)
				XLowerBound = Mathf.Max(XLowerBound, tx + width);
			if (tx - width > mx)
				XUpperBound = Mathf.Min(XUpperBound, tx - width);
		}		
	}
	
	Debug.Log("XLowerBound: " + XLowerBound);
	Debug.Log("XUpperBound: " + XUpperBound);	

	// determine closest target	
	for (var body in targets) {
		tx = body.transform.position.x;
		tz = body.transform.position.z;
		
		if (ZLowerBound <= tz && tz <= ZUpperBound)
			continue;
		
		var currenSqrLen = (mx - tx) * (mx - tx) * 0 + (mz - tz) * (mz - tz) * 1;
		if (tz < guardLine && XLowerBound <= tx && tx <= XUpperBound && currenSqrLen < pos) {
			pos = currenSqrLen;
			closest = body.transform;
		}
	}
	
	currentTarget = closest; // could be null
}

// Active behaviours when their corresponding perceptual schema is perceived. 
// there are possibly three behaviours: watching, approaching and threatening.
function Behaviour_module() 
{
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
		new_behaviour.YUpperBound = 0.5;
		new_behaviour.YLowerBound = 0.2;
		new_behaviour.moveSpeed = 6.0;
		new_behaviour.verticalSpeed = 0.01;
		
		behaviours.Push(new_behaviour);
		Debug.Log("threatening");
	}
}

// coordinate multiple behaviours
function Coordination_module() 
{	
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
function Execution_module() 
{	
	YUpperBound = currentBehaviour.YUpperBound;
	YLowerBound = currentBehaviour.YLowerBound;
	moveSpeed = currentBehaviour.moveSpeed;
	verticalSpeed = currentBehaviour.verticalSpeed;
	
	for (var motor in currentBehaviour.motors) {
		motor();		
	}
}

// motor schemas
function follow_x_direction() 
{
	Debug.Log("follow_x_direction");	
		
	//keep within follow distance (x)		
	var dest : Vector3;
	dest = transform.position;
	
	if (transform.position.x > currentTarget.position.x + followDistance)
		dest.x = transform.position.x - Time.deltaTime * moveSpeed;	
	if (transform.position.x < currentTarget.position.x - followDistance)
		dest.x = transform.position.x + Time.deltaTime * moveSpeed;
		
	moveVector = dest - transform.position;
	
	avoid();
	move();
}

// going up and down to be within a altitude range
function fly_at_given_altitude() 
{
	Debug.Log("fly_at_given_altitude");
	
	// above the range
	if (transform.position.y > YUpperBound){
		//transform.Translate(0, -verticalSpeed, 0);
		moveVector = Vector3(0, -verticalSpeed, 0);
		goingup = false;
	}
	// below the range
	if (transform.position.y < YLowerBound){
		//transform.Translate(0, verticalSpeed, 0);
		moveVector = Vector3(0, verticalSpeed, 0);
		goingup = true;
	}	
	// in the range
	if (YLowerBound <= transform.position.y && transform.position.y <= YUpperBound) {
		if(goingup){
			//transform.Translate(0, verticalSpeed, 0);
			//if(transform.position.y >= YUpperBound)
			//	goingup = false;
			moveVector = Vector3(0, verticalSpeed, 0);
		}
		if(!goingup){
			//transform.Translate(0, -verticalSpeed, 0);
			//if(transform.position.y <= YLowerBound)
			//	goingup = true;		
			moveVector = Vector3(0, -verticalSpeed, 0);
		}
	}
		
	move();
}

// move randomly in three dimensions
function random_move_3D() 
{
	Debug.Log("random_move_3D");
	// random pick target point within the bound
	var random_vector: Vector3 = Vector3(
									Random.Range(XLowerBound + robotWidth, XUpperBound - robotWidth), 
									Random.Range(YLowerBound, YUpperBound),
									Random.Range(ZLowerBound, ZUpperBound));
									
	// distance between target and current location								
	var targetDist = Mathf.Sqrt((transform.position - random_vector).sqrMagnitude);
	var moveMagnitude = Time.deltaTime * moveSpeed;
	
	// move to the target direction
	//transform.Translate((random_vector - transform.position) / targetDist * moveMagnitude);	
	if (targetDist < moveMagnitude) {
		moveVector = random_vector - transform.position;
		Debug.Log('targetDist < moveMagnitude:' + (random_vector - transform.position).y);
	}
	else {
		moveVector = (random_vector - transform.position) / targetDist * moveMagnitude;
		Debug.Log('targetDist >= moveMagnitude:' + ((random_vector - transform.position) / targetDist * moveMagnitude).y);
	}		 
	
	avoid();
	move();	
}

// avoid the robot moving outside the bound
function avoid()
{
	Debug.Log("avoid");	
	dest = transform.position + moveVector;
	// x bound	
	if (dest.x < XLowerBound + robotWidth)
		dest.x = XLowerBound + robotWidth;
	if (dest.x > XUpperBound - robotWidth)
		dest.x = XUpperBound - robotWidth;
	
	// y bound	
	if (dest.y < YLowerBound)
		dest.y = YLowerBound;
	if (dest.y > YUpperBound)
		dest.y = YUpperBound;		
		
	// z bound
	if (dest.z < ZLowerBound)
		dest.z = ZLowerBound;
	if (dest.z > ZUpperBound)
		dest.z = ZUpperBound;	
		
	moveVector = dest - transform.position;
}

// move the robot
function move()
{
	Debug.Log("move");
	transform.Translate(moveVector);
}

// reset the robot's tilt and height to normal
function stabilize() 
{
	Debug.Log("stabilize");
	transform.eulerAngles = Vector3(0, 0, 0);	
}
