import * as THREE from "three";
var ThreeScene = /** @class */ (function () {
    function ThreeScene() {
        var _this = this;
        this.blobs = [];
        this.animationFrameId = null;
        this.handleResize = function () {
            // Update camera aspect ratio
            _this.camera.aspect = window.innerWidth / window.innerHeight;
            _this.camera.updateProjectionMatrix();
            // Update renderer size
            _this.renderer.setSize(window.innerWidth, window.innerHeight);
        };
        this.animate = function () {
            _this.animationFrameId = requestAnimationFrame(_this.animate);
            // Animate blobs
            var time = Date.now() * 0.001;
            _this.blobs.forEach(function (blob, index) {
                var offset = index * Math.PI / 4;
                blob.position.y += Math.sin(time + offset) * 0.01;
                blob.position.x += Math.cos(time + offset) * 0.005;
                blob.rotation.z += 0.001;
            });
            // Render scene
            _this.renderer.render(_this.scene, _this.camera);
        };
        // Create scene
        this.scene = new THREE.Scene();
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        // Add renderer to DOM
        this.renderer.domElement.style.position = "fixed";
        this.renderer.domElement.style.top = "0";
        this.renderer.domElement.style.left = "0";
        this.renderer.domElement.style.width = "100%";
        this.renderer.domElement.style.height = "100%";
        this.renderer.domElement.style.zIndex = "-1";
        this.renderer.domElement.style.pointerEvents = "none";
        document.body.appendChild(this.renderer.domElement);
        // Create blobs
        this.createBlobs();
        // Add window resize listener
        window.addEventListener("resize", this.handleResize);
        // Start animation loop
        this.animate();
    }
    ThreeScene.prototype.createBlobs = function () {
        // Create blob geometries
        var blobGeometry = new THREE.SphereGeometry(2, 32, 32);
        // Create materials with different colors
        var greenMaterial = new THREE.MeshBasicMaterial({
            color: 0x4DFF8E,
            transparent: true,
            opacity: 0.2
        });
        var purpleMaterial = new THREE.MeshBasicMaterial({
            color: 0xB56EFF,
            transparent: true,
            opacity: 0.2
        });
        var blueMaterial = new THREE.MeshBasicMaterial({
            color: 0x00C2FF,
            transparent: true,
            opacity: 0.2
        });
        // Create blobs
        var greenBlob = new THREE.Mesh(blobGeometry, greenMaterial);
        greenBlob.position.set(-5, 3, -10);
        greenBlob.scale.set(2, 2, 0.5);
        var purpleBlob = new THREE.Mesh(blobGeometry, purpleMaterial);
        purpleBlob.position.set(5, -3, -10);
        purpleBlob.scale.set(2, 2, 0.5);
        var blueBlob = new THREE.Mesh(blobGeometry, blueMaterial);
        blueBlob.position.set(0, -5, -10);
        blueBlob.scale.set(1.5, 1.5, 0.5);
        // Add blobs to scene
        this.scene.add(greenBlob, purpleBlob, blueBlob);
        // Store blobs for animation
        this.blobs = [greenBlob, purpleBlob, blueBlob];
    };
    ThreeScene.prototype.dispose = function () {
        // Stop animation loop
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }
        // Remove event listener
        window.removeEventListener("resize", this.handleResize);
        // Dispose geometries and materials
        this.blobs.forEach(function (blob) {
            blob.geometry.dispose();
            blob.material.dispose();
        });
        // Remove renderer from DOM
        if (this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
        // Dispose renderer
        this.renderer.dispose();
    };
    return ThreeScene;
}());
export { ThreeScene };
