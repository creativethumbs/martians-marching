
//DO NOT CHANGE THESE
public var RemoteIP : String = "192.168.1.117"; // signifies a local host (if testing locally
public var SendToPort : int = 9000; //the port you will be sending from
public var ListenerPort : int = 8000; //the port you will be listening on
public var controller : Transform;
private var handler : Osc;

var realwidth;
var realheight;
var screenwidth = Screen.width; 
var screenheight = Screen.height;
var wscale : float;
var hscale : float;

var laser : Rigidbody2D; // laser prefab
var minion : Rigidbody2D; // alien prefab
var earthvictoryscreen : Rigidbody2D; // laser prefab
var marsvictoryscreen : Rigidbody2D; // alien prefab

private var totalAliens; 

private var startpos : Vector3;

//VARIABLES AFFECTED BY OSC
private var cursorPos : Vector3; 
private var alienStartPos : Vector3; 
private var alienEndPos : Vector3; 
private var firePressed = false; 
private var dispatchPressed = false; 
//color components for lasers
private var humanred : float; 
private var humangreen : float; 
private var humanblue : float; 
//color components for aliens
private var alienred : float; 
private var aliengreen : float; 
private var alienblue : float; 

private var aliencount : int; 
public static var aliensonscreen : int;
public static var alienskilled : int; 
public static var alienslanded : int; 
public static var alienshield : int; 
private var endgame : boolean; 

var aim;

public function Start ()
{	
	totalAliens = 21;
	realwidth = Screen.currentResolution.width;
	realheight = Screen.currentResolution.height;
	//print(realwidth);
	//print(realheight);
	
	startpos = Vector3(realwidth*0.5, 0,0); //start position of laser
	cursorPos = Vector3(realwidth*0.5,realheight*0.5,0); 
	alienStartPos = Vector3(realwidth*0.5,realheight,0); 
	alienEndPos = Vector3(realwidth*0.5,0,0); 
	humanred = 0.0; 
	humangreen = 0.0; 
	humanblue = 0.0; 
	alienred = 0.0; 
	aliengreen = 0.0;
	alienblue = 0.0;
	
	aliensonscreen = 0; 
	alienskilled = 0; 
	alienslanded = 0; 
	alienshield = 0; 
	 
	endgame = false; 
	
	//DUMB SCREEN SETTINGS
	
	var w : float = screenwidth;
	var h : float = screenheight;
	wscale = realwidth/w; 
	hscale = realheight/h;  
	
	//Initializes on start up to listen for messages
	//make sure this game object has both UDPPackIO and OSC script attached
	var udp : UDPPacketIO = GetComponent("UDPPacketIO");
	udp.init(RemoteIP, SendToPort, ListenerPort);
	handler = GetComponent("Osc");
	handler.init(udp);
	handler.SetAllMessageHandler(AllMessageHandler);

}
Debug.Log("Running");

function Update () {
	//print(aliensonscreen);
	if(!endgame) {
		//print("here");
		endgame = (totalAliens == alienskilled + alienslanded + alienshield);
		
		if(endgame && alienskilled >= alienslanded) {
			Instantiate(earthvictoryscreen);  
		}
		
		else if(endgame && alienskilled < alienslanded) {
			var spacebg = GameObject.Find("spacebg"); 
			Destroy(spacebg);
			Instantiate(marsvictoryscreen);  
		} 
		
		else {
			var cam = Camera.main; 
			
			//updates aim position
			aim = GameObject.Find("aimPrefab"); 
			var newPos = cam.ScreenToWorldPoint(cursorPos); 
			newPos.z = 0; //need this or else weird things will happen
			var newStartPos = cam.ScreenToWorldPoint(startpos); 
			newStartPos.z = 0; //need this or else weird things will happen
			aim.transform.position = newPos; 
			aim.renderer.material.color = Color(humanred, humangreen, humanblue);
			
			if(firePressed) {
				firePressed = false;   
				var laserclone = Instantiate (laser, newStartPos, Quaternion.identity);  
				laserclone.renderer.material.color = new Color(humanred, humangreen, humanblue); 
				
			}
			if(dispatchPressed) {
				dispatchPressed = false; 
				if (aliensonscreen < 2) {  
					var newAlienStart = cam.ScreenToWorldPoint(alienStartPos); 
					newAlienStart.z = 0; 
					var alienclone = Instantiate (minion, newAlienStart, Quaternion.identity);  
					alienclone.renderer.material.color = new Color(alienred, aliengreen, alienblue); 
					
					var direction = alienEndPos - alienStartPos;
					direction = direction.normalized; 
					alienclone.transform.LookAt(alienclone.transform.position + new Vector3(0,0,1), direction);
					
					var xscale = direction.x * 45; 
					var yscale = direction.y * 45;   
					
					var force = new Vector2(xscale, yscale);
					alienclone.rigidbody2D.AddForce(force);
					
					aliencount--; 
					aliensonscreen++;  
				}
			}
		}
	}
}

//These functions are called when messages are received
//Access values via: oscMessage.Values[0], oscMessage.Values[1], etc

public function AllMessageHandler(oscMessage: OscMessage){
	var msgString = Osc.OscMessageToString(oscMessage); //the message and value combined
	var msgAddress = oscMessage.Address; //the message parameters
	var msgValue = oscMessage.Values[0]; //the message value
	Debug.Log(msgString); //log the message and values coming from OSC
	
	//FUNCTIONS YOU WANT CALLED WHEN A SPECIFIC MESSAGE IS RECEIVED
	switch (msgAddress){
		case "/1/lasermap":
			moveCursor(oscMessage.Values[0], oscMessage.Values[1]); 
			break; 
		case "/1/alientop":
			changeAlienStartPos(msgValue); 
			break;
		case "/1/alienbottom":
			changeAlienEndPos(msgValue); 
			break;
		case "/1/firelaser":
			if(msgValue == 0) {
				firePressed = true; 
			}
			break;
		case "/1/dispatch":
			if(msgValue == 0) {
				dispatchPressed = true; 
			}
			break;
		case "/1/alienred":	
			alienred = msgValue; 
			break; 
		case "/1/aliengreen":	
			aliengreen = msgValue; 
			break; 
		case "/1/alienblue":	
			alienblue = msgValue; 
			break; 
		case "/1/humanred":	
			humanred = msgValue;  
			break; 
		case "/1/humangreen":	
			humangreen = msgValue;  
			break; 
		case "/1/humanblue":	
			humanblue = msgValue;  
			break; 
		default:
			break;
	}

}


//FUNCTIONS CALLED BY MATCHING A SPECIFIC MESSAGE IN THE ALLMESSAGEHANDLER FUNCTION

//this sets the new position of the cursor
public function moveCursor(xscale, yscale) : void 
{
	cursorPos =  Vector3(realwidth*xscale, realheight*(1-yscale), 0);
}

public function changeAlienStartPos(scale) : void 
{
	alienStartPos =  Vector3(realwidth*scale, realheight, 0);
}

public function changeAlienEndPos(scale) : void 
{
	alienEndPos =  Vector3(realwidth*scale, 0, 0);
}


