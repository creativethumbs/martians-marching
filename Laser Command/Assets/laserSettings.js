#pragma strict

var shootSound: AudioClip;
var hitSound: AudioClip;
var alienDeath: AudioClip; 

private var tolerance : float; 
private var myred : float;
private var mygreen : float;
private var myblue : float;
private var OSCscript : OSCReceiver; 
 

function Start () { 
	audio.PlayOneShot(shootSound);
	var aim = GameObject.Find("aimPrefab");
	var cam = Camera.main;
	tolerance = 0.15; 
	myred = gameObject.renderer.material.color.r;
	mygreen = gameObject.renderer.material.color.g;
	myblue = gameObject.renderer.material.color.b;
	
	var worldPoint = aim.transform.position;
	var direction = worldPoint - transform.position;
	direction = direction.normalized; 
	
	transform.LookAt(transform.position + new Vector3(0,0,1), direction);
	
	var xscale = direction.x * 3; 
	var yscale = direction.y * 3;   
	
	var force = new Vector2(xscale, yscale);
	rigidbody2D.AddForce(force);
	
}

function Update() {

	if(transform.position.y > 15) {
		Destroy(gameObject);
	}
	
}

//called on beginning of a collision
function OnCollisionEnter2D(coll: Collision2D) {
	 
	if (coll.gameObject.tag == "minion")
	{
		var rmin = coll.gameObject.renderer.material.color.r - tolerance;
		var rmax = coll.gameObject.renderer.material.color.r + tolerance;
		var gmin = coll.gameObject.renderer.material.color.g - tolerance;
		var gmax = coll.gameObject.renderer.material.color.g + tolerance;
		var bmin = coll.gameObject.renderer.material.color.b - tolerance;
		var bmax = coll.gameObject.renderer.material.color.b + tolerance;
		
		if(coll.gameObject.renderer.enabled &&
			rmin <= myred && myred <= rmax &&
			gmin <= mygreen && mygreen <= gmax &&
			bmin <= myblue && myblue <= bmax) {
				var script: OSCReceiver = coll.gameObject.GetComponent(OSCReceiver);
				audio.PlayOneShot(hitSound);
				renderer.enabled = false;
				audio.PlayOneShot(alienDeath);
				coll.gameObject.renderer.enabled = false;
				
				Destroy(coll.gameObject,alienDeath.length);
				
				script.aliensonscreen--;
				script.alienskilled++;
				Destroy(gameObject, hitSound.length); 
				print("aliens killed: " + script.alienskilled);
			}
			
		else if (coll.gameObject.renderer.enabled) {
			audio.PlayOneShot(hitSound);
			renderer.enabled = false;
			var vx = coll.rigidbody.velocity.x;
			var vy = coll.rigidbody.velocity.y;
			var xscale = (vx) * 140; 
			var yscale =  Mathf.Abs(vy) * -140;   
			
			var force = new Vector2(xscale, yscale);
			coll.rigidbody.AddForce(force); 
			Destroy(gameObject, hitSound.length);
		}
		else {
			Destroy(gameObject);
		}
		
	}
	
	else {
		audio.PlayOneShot(hitSound);
		renderer.enabled = false;
		Destroy(gameObject, hitSound.length);
	}
	
	

}

