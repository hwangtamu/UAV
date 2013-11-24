#pragma strict
//Dynamically generate test dataset.

var crowd :GameObject;
var test:GameObject;
var spawn_position;
var timer = 0.0;

//get prefab(template)
crowd = AssetDatabase.LoadAssetAtPath("Assets/Crowd.prefab",typeof(GameObject));
test = AssetDatabase.LoadAssetAtPath("Assets/Test.prefab",typeof(GameObject));

//count
static var success = 0.0;
static var fail = 0.0;
//default case
var test_case = 0;
//spawn crowd randomly
function Spawn_Crowd(){
	var rand = Random.value;
	//random start position
	var StartX = 3*rand;
	var StartZ = -1*rand - 10;
	spawn_position = Vector3(StartX,0.33,StartZ);
	var spawncrowd = Instantiate(crowd, spawn_position, Quaternion.identity);
	//random crowd size
	spawncrowd.transform.localScale = new Vector3(0.1+0.4*rand,0.3,0.1+0.4*rand);
	//random crowd color
	spawncrowd.renderer.material.color = Color(Random.Range(0.0,1.0),Random.Range(0.0,1.0),Random.Range(0.0,1.0),Random.Range(0.0,1.0));
}


//Game instructions
var showText = true;
var textArea = new Rect(0,0,Screen.width, Screen.height);

//display
function OnGUI(){
    if(showText){
    	GUI.Label(textArea,"Controller:\nEasy Mode: [1]\nHard Mode: [2]\nImpossible Mode: [3]\nCheat Mode: [5]\nStop Spawning: [space]\nSuccess:"
    	+success.ToString()+"\nFail:"+fail.ToString()+"\nSuccess Rate:"+(success/(success+fail)).ToString());
    }
}


function Start () {

}

function Update () {
	//stop spawning crowds
	if (Input.GetButtonDown("Clear")){
		test_case = 0;
		timer = 0.0;
	}
    
	//easy mode
	if (Input.GetButtonDown("Case1")){
		test_case = 1;
		timer = 0.0;    
	}
    
	//hard mode
	if (Input.GetButtonDown("Case2")){
		test_case = 2;
		timer = 4.0;
	}
    
	//impossible mode
	if (Input.GetButtonDown("Case3")){
		test_case = 3;
		timer = 8.0;
	}
    
	//test_1
	if (Input.GetButtonDown("Case4")){
		test_1();
		timer = 0.0;
	}
    
	//reset timer
	if (Input.GetButtonDown("Case5")){
		timer = 12.0;
	}
	timer += Time.deltaTime;
    
	//case 1 -- easy mode
	if (timer>3 && test_case == 1){
		Spawn_Crowd();
		timer = 0.0;
	}
    
	//case 2 -- haed mode
	if (timer>7 && test_case == 2){
		Spawn_Crowd();
		Spawn_Crowd();
		Spawn_Crowd();
		timer = 4.0;
	}
    
	//case 3 -- impossible mode
	if(timer>11 && test_case == 3){
		Insane();
		timer = 8.0;
	}
}

//Generate a huge number of crowds.
function Insane(){
	for(var i=0;i<1000;i++ ){
		timer+=Time.deltaTime;
		if(timer>1.0){
			Spawn_Crowd();
			timer = 0.0;
		}
	}
}

//function for unit test
function test_1(){
	spawn_position = Vector3(1,0.33,-6.3);
	var spawncrowd = Instantiate(test, spawn_position, Quaternion.identity);
}
