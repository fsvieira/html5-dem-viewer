/*
 * @author Sann-Remy Chea / http://srchea.com/
 * FirstPersonNavigationControls class enables the mouse drag and drop and arrow keys for navigation.
 * Dependance: FirstPersonControls.js (included in Three.js)
 */

THREE.FirstPersonNavigationControls = function(object, domElement) {
	this.object = object;
	this.object.target = new THREE.Vector3(0, 0, 0);
	
	this.domElement = domElement;
	
	this.firstPersonControls = new THREE.FirstPersonControls(this.object, this.domElement);
	
	this.inverseDirection = true;
	this.velocity = 0.08;
	
	// initialization of FirstPersonControls variables
	this.firstPersonControls.movementSpeed = 10; 
	this.firstPersonControls.lookSpeed = 0.005;
	this.firstPersonControls.noFly = true;
	this.firstPersonControls.activeLook = false;
	this.firstPersonControls.constrainVertical = true;
	this.firstPersonControls.verticalMin = 0;
	this.firstPersonControls.verticalMax = 0;
	
	// internals (for drag and drop)
	this._mouseDown = false;
	this._lon = 0;
	this._lat = 0;
	this._phi = 0;
	this._theta = 0;
	this._mouseDownX = 0;
	this._mouseDownY = 0;
	this._mouseDownLon = 0;
	this._mouseDownLat = 0;
	
	// functions
	this.setDomElement = function(domElement) {
		this.domElement = domElement;
		this.firstPersonControls.domElement = this.domElement;
	};
	
	// event functions
	this.onMouseDown = function(event) {
		event.preventDefault();
		
		this._mouseDown = true;
		
		this._mouseDownX = event.clientX;
		this._mouseDownY = event.clientY;
		
		this._mouseDownLon = this._lon;
		this._mouseDownLat = this._lat;
	};
	
	this.onMouseMove = function(event) {
		if(this._mouseDown) {
			var dragDirection = this.inverseDirection ? 1 : -1;
			this._lon = this._mouseDownLon+(dragDirection)*(this._mouseDownX-event.clientX)*this.velocity;
			this._lat = this._mouseDownLat+(dragDirection)*(event.clientY-this._mouseDownY)*this.velocity;
		}
	};
	
	this.onMouseUp = function(event) {
		this._mouseDown = false;
	};
	
	// update function
	this.update = function(delta) {
		this.firstPersonControls.update(delta);
		
		this._lat = Math.max(-90, Math.min(90, this._lat));
		this._phi = (90-this._lat)*Math.PI/180;
		this._theta = this._lon * Math.PI/180;
		
		/*
		
		
		this.object.target.x = Math.sin(this._phi)*Math.cos(this._theta);
		this.object.target.y = Math.cos(this._phi);
		this.object.target.z = Math.sin(this._phi)*Math.sin(this._theta);
		 
		var x = THREE.Matrix4.__v1,
		y = THREE.Matrix4.__v2,
		z = THREE.Matrix4.__v3;
		 
		
		z.x = -this.object.target.x;
		z.y = -this.object.target.y;
		z.z = -this.object.target.z;
		 
		
		if (z.length() === 0)
			z.z = 1;

		x.cross(this.object.up, z).normalize();

		if (x.length() === 0) {
			z.x += 0.0001;
			x.cross(this.object.up, z).normalize();
		}

		y.cross(z, x).normalize();
		 
		 
		*/
		
		
		
		this.object.target.z = Math.sin(this._phi)*Math.cos(this._theta);
		this.object.target.y = Math.cos(this._phi);
		this.object.target.x = Math.sin(this._phi)*Math.sin(this._theta);
		 
		var z = THREE.Matrix4.__v1,
		y = THREE.Matrix4.__v2,
		x = THREE.Matrix4.__v3;
		 
		
		z.x = -this.object.target.x;
		z.y = -this.object.target.y;
		z.z = -this.object.target.z;
		 
		
		if (z.length() === 0)
			z.z = 1;

		x.cross(this.object.up, z).normalize();

		if (x.length() === 0) {
			z.x += 0.0001;
			x.cross(this.object.up, z).normalize();
		}

		y.cross(z, x).normalize();
		 
		
		var m = this.object.matrix;
		
		// this.object.matrix.n11 = x.x;
		m.elements[0] = x.x; 
		
		// this.object.matrix.n12 = y.x;
		m.elements[4] = z.x; 
		
		// this.object.matrix.n13 = z.x;
		m.elements[8] = z.x; 
		
		// this.object.matrix.n21 = x.y;
		m.elements[1] = x.y; 
		
		// this.object.matrix.n22 = y.y;
		m.elements[5] = y.y; 
		
		// this.object.matrix.n23 = z.y;
		m.elements[9] = z.y; 
		
		
		// this.object.matrix.n31 = x.z;
		m.elements[2] = x.z;
		
		// this.object.matrix.n32 = y.z;
		m.elements[6] = y.z;
		
		// this.object.matrix.n33 = z.z;
		m.elements[10] = z.z; 

		if(this.object.rotationAutoUpdate){
			// this.object.rotation.setRotationFromMatrix(this.object.matrix);
			this.object.rotation.getRotationFromMatrix(this.object.matrix); 	
			// this.object.matrix.multiplyVector3(this.object.rotation); 
		}
		
	};
	
	
	
	function bind(scope, fn) {
		return function() {
			fn.apply(scope, arguments);
		};
	};
	
	this.domElement.addEventListener('mousedown', bind(this, this.onMouseDown), false);
	this.domElement.addEventListener('mousemove', bind(this, this.onMouseMove), false);
	this.domElement.addEventListener('mouseup', bind(this, this.onMouseUp), false);
};
