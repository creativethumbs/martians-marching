#pragma strict

var alienSound: AudioClip;
var alienDeath: AudioClip; 

function Start () {
	audio.PlayOneShot(alienSound); 
	
}

function Update () {
	if(transform.position.y < -5.2) {
		Destroy(gameObject);
		
		var script: OSCReceiver = gameObject.GetComponent(OSCReceiver);
		script.aliensonscreen--;
		script.alienslanded++;
		 
		print("aliens landed: "+script.alienslanded);
	}
}


function OnCollisionEnter2D(coll: Collision2D) {
	if(coll.gameObject.tag == "shield") {
		renderer.enabled = false;
		audio.PlayOneShot(alienDeath);
		Destroy(coll.gameObject);
		var script: OSCReceiver = gameObject.GetComponent(OSCReceiver);
		script.aliensonscreen--;
		script.alienshield++;
		Destroy(gameObject, alienDeath.length);
		 
		print("aliens shield: " + script.alienshield);
	}
	
}