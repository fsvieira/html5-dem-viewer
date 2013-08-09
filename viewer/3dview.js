function View3D(mapcolor, area) {
	
	this.mapcolor = mapcolor; 
	this.terrain; 
	this.mapcolor; 
	this.camera;
	this.scene;
	this.renderer;
	this.controls; 
  this.geometry;
  this.material; 
  this.points; 
  this.viewport;
  this.mesh; 
  this.area = area;
    
	var w = window.innerWidth-20; 
	var h = window.innerHeight-20;
		
	$("#viewport").width(w); 
	$("#viewport").height(h); 

	this.viewport = document.getElementById('viewport'); 

    this.scene = new THREE.Scene();

	
  this.fov = 50;
	this.aspect = w/h;
	this.near = 1;
	this.far = 100000;
	
	this.camera = new THREE.PerspectiveCamera(
		this.fov,
		this.aspect,
		this.near,
		this.far
	);

  this.scene.add( this.camera );

  this.renderer = new THREE.WebGLRenderer();
  this.renderer.setSize(w, h);

	this.viewport.appendChild(this.renderer.domElement);

	this.controls = new THREE.FirstPersonNavigationControls(
		this.camera,
		this.renderer.domElement
	);

	this.paintFaces = function(){
		var faceIndices = [ 'a', 'b', 'c', 'd' ];
		for(i=0; i < this.terrain.faces.length; i++){
		   var f = this.terrain.faces[i]; 
		   n = ( f instanceof THREE.Face3 ) ? 3 : 4;
				   
		   for(j=0; j < n; j++){
			   var vertexIndex = f[ faceIndices[j] ];
			   var p = this.terrain.vertices[ vertexIndex ];
  			   f.vertexColors[j] = this.mapcolor.getElevationColor(Math.abs(p.y/10));
		   }
		}
		this.terrain.colorsNeedUpdate = true;
	};  


    this.animate = function(){
		if(this.controls){
			requestAnimationFrame( this.animate.bind(this) );
			this.controls.update( 1 );
			this.renderer.render( this.scene, this.camera );
		}
    };

	this.animate(); 
	
	this.setWH = function(w, h){
		this.terrain = new THREE.PlaneGeometry(w*10, h*10, w, h);
		this.terrain.dynamic = true;
	}; 
	
	this.paint = function(){
		/*
		 Set elevations  
		*/
		if(this.area){
			var x, y, i, a=0; 
			
			for(x=this.area.ax; x<=this.area.bx; x++){
				for(y=this.area.ay; y<=this.area.by; y++){
					i = x*(this.mapcolor.raster.data.w)+y; 
					this.terrain.vertices[a].y = this.mapcolor.elevations[i]*10; 
					a++; 
				}
			}
		}else{
			for(i in this.mapcolor.elevations){
				this.terrain.vertices[i].y = this.mapcolor.elevations[i]*10; 
			}
		}
		
		this.paintFaces(); 
		this.mesh = new THREE.Mesh( this.terrain,  new THREE.MeshBasicMaterial({shading: THREE.SmoothShading ,  vertexColors: THREE.VertexColors })); 	   
	    this.scene.add(this.mesh); 
	    
	    var l = Math.floor(this.terrain.vertices.length/2);
	    var v = this.terrain.vertices[l]; 
	    this.camera.position.y = v.y + 100; // window.innerHeight; 
	    this.camera.position.x = v.x; 
	    this.camera.position.z = v.z; 
	}; 
	
	
	this.setElevation = function(i, elevation){
		this.terrain.vertices[i].y = elevation
	}; 
	
	this.free = function(){
		$("#viewport").html(''); 
		$("#viewport").width(0); 
		$("#viewport").height(0);

/*		this.scene.remove(this.mesh);
		this.renderer.deallocateObject( this.mesh );
		this.renderer.deallocateTexture( this.texture );
*/

		delete this.terrain; 
		delete this.camera;
		delete this.scene;
		delete this.renderer;
		delete this.controls; 
		delete this.geometry;
		delete this.material; 
		delete this.points; 
		delete this.viewport;
		delete this.mesh; 	
	}; 
	
};

 
