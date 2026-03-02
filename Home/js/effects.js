/**
 * WebGL Effects for Vrindopnishad
 * Inspired by cydstumpel.nl, iheartcomix.com, and fiddle.digital
 */

// Initialize WebGL effects when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if WebGL is supported
    if (!document.querySelector('canvas')) {
        const canvas = document.createElement('canvas');
        canvas.classList.add('webgl-background');
        document.body.appendChild(canvas);
    }

    initParticleField();
});

// Create a particle field effect
function initParticleField() {
    const canvas = document.querySelector('canvas.webgl-background') || document.createElement('canvas');
    if (!canvas.classList.contains('webgl-background')) {
        canvas.classList.add('webgl-background');
        document.body.appendChild(canvas);
    }

    // Set canvas to full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Style the canvas
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';

    // Get WebGL context
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    // Vertex shader program
    const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;
        
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        
        varying lowp vec4 vColor;
        
        void main(void) {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            gl_PointSize = 2.0;
            vColor = aVertexColor;
        }
    `;

    // Fragment shader program
    const fsSource = `
        varying lowp vec4 vColor;
        
        void main(void) {
            gl_FragColor = vColor;
        }
    `;

    // Initialize a shader program
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Collect all the info needed to use the shader program
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };

    // Create the particle buffers
    const buffers = initBuffers(gl);

    // Draw the scene
    let then = 0;

    // Render loop
    function render(now) {
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;

        drawScene(gl, programInfo, buffers, deltaTime);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    // Aspect ratio cache to avoid forced reflows
    let aspect = window.innerWidth / window.innerHeight;

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        aspect = canvas.width / canvas.height;
    });
}

// Initialize the buffers for the particles
function initBuffers(gl) {
    // Create a buffer for the particle positions
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Create an array of positions for the particles
    const positions = [];
    const numParticles = 1000;

    for (let i = 0; i < numParticles; i++) {
        const x = (Math.random() - 0.5) * 20;
        const y = (Math.random() - 0.5) * 20;
        const z = (Math.random() - 0.5) * 20;

        positions.push(x, y, z);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Create a buffer for the particle colors
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    // Create an array of colors for the particles
    const colors = [];

    for (let i = 0; i < numParticles; i++) {
        // Generate a subtle color palette
        const r = 0.8 + Math.random() * 0.2;  // Mostly white
        const g = 0.8 + Math.random() * 0.2;
        const b = 0.8 + Math.random() * 0.2;
        const a = 0.1 + Math.random() * 0.3;  // Low opacity

        colors.push(r, g, b, a);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        color: colorBuffer,
        count: numParticles,
    };
}

// Draw the scene
function drawScene(gl, programInfo, buffers, deltaTime) {
    gl.clearColor(0.0, 0.0, 0.0, 0.0);  // Clear to transparent
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Use cached aspect ratio to avoid forced reflow
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Set the drawing position to the "identity" point
    const modelViewMatrix = mat4.create();

    // Move the drawing position based on mouse position
    const mouseX = (window.mouseX || 0) / window.innerWidth - 0.5;
    const mouseY = (window.mouseY || 0) / window.innerHeight - 0.5;

    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0 + mouseX * 2, 0.0 - mouseY * 2, -6.0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, performance.now() * 0.0001, [0, 1, 0]);

    // Tell WebGL how to pull out the positions from the position buffer
    {
        const numComponents = 3;  // pull out 3 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
        const offset = 0;         // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the colors from the color buffer
    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    }

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    // Draw the particles
    {
        const offset = 0;
        const vertexCount = buffers.count;
        gl.drawArrays(gl.POINTS, offset, vertexCount);
    }
}

// Initialize a shader program
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

// Creates a shader of the given type, uploads the source and compiles it
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Track mouse position for particle movement
document.addEventListener('mousemove', (e) => {
    window.mouseX = e.clientX;
    window.mouseY = e.clientY;
});

// Simple matrix library (minimal implementation)
const mat4 = {
    create: function () {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    },

    perspective: function (out, fovy, aspect, near, far) {
        const f = 1.0 / Math.tan(fovy / 2);
        const nf = 1 / (near - far);

        out[0] = f / aspect;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = f;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = (far + near) * nf;
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[14] = (2 * far * near) * nf;
        out[15] = 0;

        return out;
    },

    translate: function (out, a, v) {
        const x = v[0], y = v[1], z = v[2];

        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];

        return out;
    },

    rotate: function (out, a, rad, axis) {
        let x = axis[0], y = axis[1], z = axis[2];
        let len = Math.sqrt(x * x + y * y + z * z);

        if (len < 0.000001) { return null; }

        len = 1 / len;
        x *= len;
        y *= len;
        z *= len;

        const s = Math.sin(rad);
        const c = Math.cos(rad);
        const t = 1 - c;

        // Cache some matrix values for optimization
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];

        // Construct the rotation matrix
        const b00 = x * x * t + c;
        const b01 = y * x * t + z * s;
        const b02 = z * x * t - y * s;
        const b10 = x * y * t - z * s;
        const b11 = y * y * t + c;
        const b12 = z * y * t + x * s;
        const b20 = x * z * t + y * s;
        const b21 = y * z * t - x * s;
        const b22 = z * z * t + c;

        // Perform rotation-specific matrix multiplication
        out[0] = a00 * b00 + a10 * b01 + a20 * b02;
        out[1] = a01 * b00 + a11 * b01 + a21 * b02;
        out[2] = a02 * b00 + a12 * b01 + a22 * b02;
        out[3] = a03 * b00 + a13 * b01 + a23 * b02;
        out[4] = a00 * b10 + a10 * b11 + a20 * b12;
        out[5] = a01 * b10 + a11 * b11 + a21 * b12;
        out[6] = a02 * b10 + a12 * b11 + a22 * b12;
        out[7] = a03 * b10 + a13 * b11 + a23 * b12;
        out[8] = a00 * b20 + a10 * b21 + a20 * b22;
        out[9] = a01 * b20 + a11 * b21 + a21 * b22;
        out[10] = a02 * b20 + a12 * b21 + a22 * b22;
        out[11] = a03 * b20 + a13 * b21 + a23 * b22;

        // If the source and destination differ, copy the unchanged last row
        if (a !== out) {
            out[12] = a[12];
            out[13] = a[13];
            out[14] = a[14];
            out[15] = a[15];
        }

        return out;
    }
};

/**
 * Visual effects for Vrindopnishad
 * Inspired by cydstumpel.nl, iheartcomix.com, and fiddle.digital
 */

{
    // DOM Elements - Block scoped
    const body = document.querySelector('body');
    const links = document.querySelectorAll('a');
    const textElements = document.querySelectorAll('.text-effect');
    const tiltElements = document.querySelectorAll('.tilt');
    const gradientElements = document.querySelectorAll('.animated-gradient');
    const noiseElement = document.querySelector('.noise');
    const magneticElements = document.querySelectorAll('.magnetic');


    // Page transition effect
    function initPageTransitions() {
        const pageTransition = document.createElement('div');
        pageTransition.classList.add('page-transition');
        document.body.appendChild(pageTransition);

        // Add transition to all links that lead to another page
        links.forEach(link => {
            const href = link.getAttribute('href');
            // Skip links without href, anchor links and javascript links
            if (!href || href.startsWith('#') ||
                href.startsWith('javascript')) {
                return;
            }

            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                // Don't transition for external links
                if (href.startsWith('http') && !href.includes(window.location.hostname)) {
                    return;
                }

                e.preventDefault();

                // Activate transition
                pageTransition.classList.add('active');

                // Navigate after transition completes
                setTimeout(() => {
                    window.location.href = href;
                }, 600);
            });
        });

        // Handle back button
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                // Page was loaded from cache (back button)
                pageTransition.classList.add('exit');

                setTimeout(() => {
                    pageTransition.classList.remove('exit');
                    pageTransition.classList.remove('active');
                }, 600);
            }
        });
    }

    // Text scramble effect
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.update = this.update.bind(this);
        }

        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];

            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end });
            }

            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }

        update() {
            let output = '';
            let complete = 0;

            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];

                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.randomChar();
                        this.queue[i].char = char;
                    }
                    output += `<span class="scramble-char">${char}</span>`;
                } else {
                    output += from;
                }
            }

            this.el.innerHTML = output;

            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }

        randomChar() {
            return this.chars[Math.floor(Math.random() * this.chars.length)];
        }
    }

    // Initialize text scramble effect
    function initTextScramble() {
        const elements = document.querySelectorAll('.scramble-text');

        elements.forEach(el => {
            const originalText = el.textContent;
            const fx = new TextScramble(el);

            // Scramble on hover
            el.addEventListener('mouseenter', () => {
                fx.setText(originalText);
            });

            // Initial animation
            if (el.classList.contains('auto-scramble')) {
                setTimeout(() => {
                    fx.setText(originalText);
                }, 1000);
            }
        });
    }

    // Magnetic effect for elements
    function initMagneticEffect() {
        // Manually initialize magnetic effect
        document.addEventListener('DOMContentLoaded', () => {
            console.log('Manually initializing magnetic effect...');
            const magneticElements = document.querySelectorAll('.magnetic');
            console.log(`Found ${magneticElements.length} magnetic elements.`);

            if (magneticElements.length === 0) {
                console.warn('No magnetic elements found!');
                return;
            }

            // Initialize magnetic effect for each element
            magneticElements.forEach(element => {
                // Create state object for each element
                const state = {
                    x: 0,             // Current x position
                    y: 0,             // Current y position
                    targetX: 0,       // Target x position
                    targetY: 0,       // Target y position
                    lastX: 0,         // Last x position before click
                    lastY: 0,         // Last y position before click
                    active: false,    // Is currently being clicked
                    hovering: false   // Is being hovered
                };

                // Get strength from data attribute or use default
                const strength = parseFloat(element.getAttribute('data-magnetic-strength')) || 0.5;

                // Ensure element has inner span
                let innerElement = element.querySelector('span');
                if (!innerElement) {
                    console.log(`Adding span element to magnetic element:`, element);
                    const content = element.innerHTML;
                    element.innerHTML = `<span>${content}</span>`;
                    innerElement = element.querySelector('span');
                }

                // Add event listeners for hover
                element.addEventListener('mouseenter', () => {
                    state.hovering = true;
                    element.classList.add('magnetic-hover');

                    // Add cursor effect if exists
                    const cursor = document.querySelector('.cursor');
                    const cursorFollower = document.querySelector('.cursor-follower');
                    if (cursor && cursorFollower) {
                        cursor.classList.add('magnetic-hover');
                        cursorFollower.classList.add('magnetic-hover');
                    }
                });

                // Track mouse movement for magnetic effect
                element.addEventListener('mousemove', (e) => {
                    if (!state.hovering) return;

                    // Get element dimensions
                    const rect = element.getBoundingClientRect();

                    // Calculate mouse position relative to center
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;

                    // Distance from center
                    const distX = e.clientX - centerX;
                    const distY = e.clientY - centerY;

                    // Set target positions with strength factor
                    state.targetX = distX * strength;
                    state.targetY = distY * strength;

                    // Apply transform with easing
                    const ease = state.active ? 0.1 : 0.2;
                    state.x += (state.targetX - state.x) * ease;
                    state.y += (state.targetY - state.y) * ease;

                    // Apply to element
                    element.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;

                    // Move inner element in opposite direction
                    if (innerElement) {
                        innerElement.style.transform = `translate3d(${state.x * -0.2}px, ${state.y * -0.2}px, 0)`;
                    }
                });

                // Reset on mouse leave
                element.addEventListener('mouseleave', () => {
                    state.hovering = false;
                    element.classList.remove('magnetic-hover');

                    // Reset positions
                    state.targetX = 0;
                    state.targetY = 0;

                    // Animate back to original position
                    element.style.transform = 'translate3d(0px, 0px, 0)';
                    element.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';

                    if (innerElement) {
                        innerElement.style.transform = 'translate3d(0px, 0px, 0)';
                        innerElement.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
                    }

                    // Remove cursor effect
                    const cursor = document.querySelector('.cursor');
                    const cursorFollower = document.querySelector('.cursor-follower');
                    if (cursor && cursorFollower) {
                        cursor.classList.remove('magnetic-hover');
                        cursorFollower.classList.remove('magnetic-hover');
                    }

                    // Clear transition after animation completes
                    setTimeout(() => {
                        element.style.transition = '';
                        if (innerElement) innerElement.style.transition = '';
                    }, 400);
                });

                // Handle click effect
                element.addEventListener('mousedown', () => {
                    state.active = true;
                    element.classList.add('active');

                    // Add cursor effect
                    const cursor = document.querySelector('.cursor');
                    const cursorFollower = document.querySelector('.cursor-follower');
                    if (cursor && cursorFollower) {
                        cursor.classList.add('magnetic-click');
                        cursorFollower.classList.add('magnetic-click');
                    }

                    // Scale inner element
                    if (innerElement) {
                        innerElement.style.transform = `translate3d(${state.x * -0.1}px, ${state.y * -0.1}px, 0) scale(0.95)`;
                    }
                });

                // Handle release
                element.addEventListener('mouseup', () => {
                    state.active = false;

                    // Delayed removal of active class for better effect
                    setTimeout(() => {
                        element.classList.remove('active');
                    }, 300);

                    // Remove cursor effect
                    const cursor = document.querySelector('.cursor');
                    const cursorFollower = document.querySelector('.cursor-follower');
                    if (cursor && cursorFollower) {
                        cursor.classList.remove('magnetic-click');
                        cursorFollower.classList.remove('magnetic-click');
                    }

                    // Reset inner element
                    if (innerElement) {
                        innerElement.style.transform = `translate3d(${state.x * -0.2}px, ${state.y * -0.2}px, 0) scale(1)`;
                    }
                });
            });

            console.log('Magnetic effect initialization complete!');
        });
    }

    // GSAP magnetic movement (keeping for compatibility but not using it in the new implementation)
    function gsapMagnetic(element, x, y, strength, isReturn = false) {
        if (typeof gsap !== 'undefined') {
            gsap.to(element, {
                x: isReturn ? 0 : x * strength,
                y: isReturn ? 0 : y * strength,
                duration: isReturn ? 0.5 : 0.3,
                ease: isReturn ? "elastic.out(1, 0.3)" : "power2.out"
            });
        } else {
            element.style.transform = isReturn ?
                'translate3d(0px, 0px, 0)' :
                `translate3d(${x * strength}px, ${y * strength}px, 0)`;
            element.style.transition = isReturn ? 'transform 0.5s ease' : 'none';
        }
    }

    // 3D tilt effect
    function initTiltEffect() {
        tiltElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const percentX = (x - centerX) / centerX;
                const percentY = (y - centerY) / centerY;

                const maxTilt = element.getAttribute('data-tilt-max') || 10;
                const tiltX = percentY * maxTilt;
                const tiltY = -percentX * maxTilt;

                element.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
            });

            element.addEventListener('mouseleave', () => {
                element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
                element.style.transition = 'transform 0.5s ease';
            });
        });
    }

    // Animated gradient backgrounds
    function initAnimatedGradients() {
        gradientElements.forEach(element => {
            let hue = 0;

            const animate = () => {
                hue = (hue + 0.5) % 360;

                const color1 = `hsl(${hue}, 70%, 60%)`;
                const color2 = `hsl(${(hue + 60) % 360}, 70%, 60%)`;
                const color3 = `hsl(${(hue + 180) % 360}, 70%, 60%)`;

                element.style.background = `
                linear-gradient(45deg, ${color1}, ${color2}, ${color3})
            `;

                requestAnimationFrame(animate);
            };

            animate();
        });
    }

    /* Noise effect */
    function initNoiseEffect() {
        if (!noiseElement) return;

        // Create canvas for noise
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = 256;
        canvas.height = 256;

        // Generate noise
        const generateNoise = () => {
            const imageData = ctx.createImageData(canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                // const value = Math.random() * 255;// Grayscale noise
                const value = Math.random() * 500;
                data[i] = value;
                data[i + 1] = value;
                data[i + 2] = value;
                data[i + 3] = Math.random() * 50; // Alpha
            }

            ctx.putImageData(imageData, 0, 0);

            // Convert to data URL
            const dataURL = canvas.toDataURL('image/png');
            noiseElement.style.backgroundImage = `url(${dataURL})`;
        };

        // Generate initial noise
        generateNoise();

        // Regenerate noise periodically
        setInterval(generateNoise, 500);
    }

    // Distortion effect on images
    function initImageDistortion() {
        const images = document.querySelectorAll('.distort-on-hover');

        images.forEach(img => {
            img.addEventListener('mouseenter', () => {
                img.classList.add('distort');

                setTimeout(() => {
                    img.classList.remove('distort');
                }, 500);
            });
        });
    }

    // Parallax scroll effect
    function initParallaxScroll() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');

        const handleScroll = () => {
            const scrollTop = window.scrollY;

            parallaxElements.forEach(element => {
                const speed = element.getAttribute('data-parallax') || 0.1;
                const offset = scrollTop * speed;

                element.style.transform = `translateY(${offset}px)`;
            });
        };

        window.addEventListener('scroll', handleScroll);
    }

    // Smooth scroll for anchor links
    function initSmoothScroll() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (!targetElement) return;

                const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            });
        });
    }

    /* Reveal elements on scroll
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    
                    // Unobserve after revealing
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        revealElements.forEach(element => {
            observer.observe(element);
        });
    }*/

    // Text splitting animation
    function initTextSplitting() {
        const splitTextElements = document.querySelectorAll('.split-text');

        splitTextElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';

            // Split by words
            const words = text.split(' ');

            words.forEach((word, wordIndex) => {
                const wordSpan = document.createElement('span');
                wordSpan.classList.add('word');

                // Split by characters
                for (let i = 0; i < word.length; i++) {
                    const charSpan = document.createElement('span');
                    charSpan.classList.add('char');
                    charSpan.textContent = word[i];
                    charSpan.style.animationDelay = `${(wordIndex * 0.05) + (i * 0.03)}s`;

                    wordSpan.appendChild(charSpan);
                }

                element.appendChild(wordSpan);

                // Add space after word
                if (wordIndex < words.length - 1) {
                    const space = document.createElement('span');
                    space.classList.add('space');
                    space.innerHTML = '&nbsp;';
                    element.appendChild(space);
                }
            });
        });
    }

    // Initialize mobile menu effects
    function initMobileMenuEffects() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const nav = document.querySelector('nav');
        const menuItems = document.querySelectorAll('nav li');

        if (!mobileMenuBtn || !nav || !menuItems.length) return;

        // Add staggered animation to menu items
        gsap.set(menuItems, { y: 20, opacity: 0 });

        // Create animation for menu opening
        const menuTimeline = gsap.timeline({ paused: true });

        menuTimeline
            .to(nav, {
                x: 0,
                duration: 0.5,
                ease: "power3.out"
            })
            .to(menuItems, {
                y: 0,
                opacity: 1,
                stagger: 0.1,
                duration: 0.4,
                ease: "power2.out"
            }, "-=0.3");

        // Toggle menu animation
        function toggleMenu() {
            if (nav.classList.contains('active')) {
                menuTimeline.play();
            } else {
                menuTimeline.reverse();
            }
        }

        // Watch for class changes on nav element
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    toggleMenu();
                }
            });
        });

        observer.observe(nav, { attributes: true });
    }

    // Initialize all effects
    function initEffects() {
        console.log('Initializing effects...');
        try {
            // Core effects
            initMagneticEffect();
            initTiltEffect();
            initNoiseEffect();
            initImageDistortion();
            initParallaxScroll();
            initSmoothScroll();

            // Optional effects that might depend on external libraries
            if (typeof initParticleField === 'function') initParticleField();
            if (typeof initPageTransitions === 'function') initPageTransitions();
            if (typeof initTextScramble === 'function') initTextScramble();
            if (typeof initAnimatedGradients === 'function') initAnimatedGradients();
            if (typeof initTextSplitting === 'function') initTextSplitting();
            if (typeof initMobileMenuEffects === 'function') initMobileMenuEffects();

            console.log('All effects initialized successfully!');
        } catch (error) {
            console.error('Error initializing effects:', error);
        }
    }

    // Run effects when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM fully loaded, initializing effects...');
        initEffects();
        // Additional initializations as requested
        // Initialize all effects
        if (typeof initPageTransitions === 'function') initPageTransitions();
        if (typeof initTextScramble === 'function') initTextScramble();
        // initMagneticEffect(); // Disabled to prevent double initialization if other scripts handle it
        if (typeof initTiltEffect === 'function') initTiltEffect();
        if (typeof initAnimatedGradients === 'function') initAnimatedGradients();
        if (typeof initNoiseEffect === 'function') initNoiseEffect();
        if (typeof initImageDistortion === 'function') initImageDistortion();
    });

    // Export functions for potential use in other scripts
    // export {
    //     initPageTransitions,
    //     initTextScramble,
    //     // initMagneticEffect, // Disabled to prevent double initialization if other scripts handle it
    //     initTiltEffect,
    //     initAnimatedGradients,
    //     initNoiseEffect,
    //     initImageDistortion,
    //     initParallaxScroll,
    //     initSmoothScroll,
    //     initTextSplitting,
    //     initMobileMenuEffects,
    //     initEffects
    // };

    // Function to fix tools-icon visibility and functionality
    function fixToolsIconForAllDevices() {
        const toolsIcon = document.querySelector('.tools-icon');

        if (!toolsIcon) {
            console.warn('Tools icon not found in the DOM');
            return;
        }

        console.log('Fixing tools-icon for all devices');

        // Force display
        toolsIcon.style.display = 'flex';
        toolsIcon.style.visibility = 'visible';
        toolsIcon.style.opacity = '1';

        // Ensure proper positioning
        toolsIcon.style.position = 'relative';
        toolsIcon.style.zIndex = '999';

        // Make sure the SVG is inside a span for consistent magnetic behavior
        let span = toolsIcon.querySelector('span');
        const svg = toolsIcon.querySelector('svg');

        if (svg && !span) {
            // SVG is direct child - wrap it in span
            const svgContent = svg.outerHTML;
            span = document.createElement('span');
            span.innerHTML = svgContent;
            svg.remove();
            toolsIcon.appendChild(span);
            console.log('Added span wrapper to tools-icon SVG');
        } else if (!svg && !span) {
            // Create default SVG icon
            span = document.createElement('span');
            span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>`;
            toolsIcon.appendChild(span);
            console.log('Created new tools-icon with SVG');
        }

        // Check for Safari browser to apply specific fixes
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        // On mobile/touch devices, disable magnetic effect but keep functionality
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 768;

        // Create style rules based on browser and device type
        const styleEl = document.createElement('style');
        let cssRules = `
        .tools-icon {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            align-items: center !important;
            justify-content: center !important;
            width: ${window.innerWidth <= 480 ? '32px' : (window.innerWidth <= 768 ? '36px' : '38px')} !important;
            height: ${window.innerWidth <= 480 ? '32px' : (window.innerWidth <= 768 ? '36px' : '38px')} !important;
            position: relative !important;
            overflow: visible !important;
        }
        .tools-icon.magnetic {
            transform: none !important;
            transition: background-color 0.3s ease, box-shadow 0.3s ease !important;
        }
        .tools-icon.magnetic:hover {
            transform: none !important;
        }
        .tools-icon.magnetic span {
            transform: none !important;
            transition: none !important;
            position: relative !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 100% !important;
            height: 100% !important;
        }
        .tools-icon svg {
            position: relative !important;
            transform: none !important;
            transition: transform 0.3s ease !important;
            width: ${window.innerWidth <= 480 ? '18px' : '20px'} !important;
            height: ${window.innerWidth <= 480 ? '18px' : '20px'} !important;
        }
        .tools-icon:hover svg {
            transform: rotate(90deg) !important;
        }`;

        // Add Safari-specific CSS fixes
        if (isSafari) {
            cssRules += `
        @supports (-webkit-touch-callout: none) {
            .tools-icon {
                z-index: 9999 !important;
            }
            .tools-icon svg {
                position: relative !important;
                top: auto !important;
                left: auto !important;
                transform: none !important;
            }
            .tools-icon:hover svg {
                transform: rotate(90deg) !important;
            }
        }`;
        }

        // Add mobile-specific CSS
        cssRules += `
        @media (max-width: 768px) {
            .tools-icon {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                margin-right: 10px !important;
            }
        }
        @media (max-width: 480px) {
            .tools-icon {
                width: 32px !important;
                height: 32px !important;
                margin-right: 8px !important;
            }
            .tools-icon svg {
                width: 18px !important;
                height: 18px !important;
            }
        }`;

        styleEl.textContent = cssRules;
        document.head.appendChild(styleEl);

        // Make sure the click event still works
        const existingClickHandler = toolsIcon.onclick;
        toolsIcon.addEventListener('click', function (e) {
            const toolsMenu = document.querySelector('.tools-menu');
            if (toolsMenu) {
                e.preventDefault();
                e.stopPropagation();
                toolsMenu.classList.add('active');
                document.body.classList.add('tools-menu-open');

                // Pulse animation for feedback
                toolsIcon.classList.add('pulse-animation');
                setTimeout(() => {
                    toolsIcon.classList.remove('pulse-animation');
                }, 500);
            }
        });

        // Make sure click events work properly in all environments
        toolsIcon.style.cursor = 'pointer';
        if (span) span.style.cursor = 'pointer';
        if (svg) svg.style.cursor = 'pointer';

        // Ensure tools menu close button works
        const toolsMenuClose = document.querySelector('.tools-menu-close');
        if (toolsMenuClose) {
            toolsMenuClose.addEventListener('click', function () {
                const toolsMenu = document.querySelector('.tools-menu');
                if (toolsMenu) {
                    toolsMenu.classList.remove('active');
                    document.body.classList.remove('tools-menu-open');
                }
            });
        }
    }

    // Function to ensure horizontal scrolling works properly
    function enforceHorizontalScrolling() {
        if (typeof initHorizontalScroll === 'function') {
            console.log('Ensuring horizontal scrolling is working properly');

            // Re-initialize horizontal scrolling
            initHorizontalScroll();

            // Add a scroll trigger to re-calculate horizontal scroll position
            setTimeout(() => {
                // Trigger a small scroll to recalculate positions
                const currentScroll = window.scrollY;
                window.scrollTo(0, currentScroll + 1);
                setTimeout(() => {
                    window.scrollTo(0, currentScroll);
                }, 10);
            }, 500);
        }
    }

    // Call this function after DOM is loaded
    document.addEventListener('DOMContentLoaded', function () {
        // Call all other initializations
        if (typeof initEffects === 'function') initEffects();

        // Fix tools icon
        if (typeof fixToolsIconForAllDevices === 'function') fixToolsIconForAllDevices();

        // Ensure horizontal scrolling is working
        enforceHorizontalScrolling();
    });

    // Re-apply on resize
    window.addEventListener('resize', function () {
        if (typeof fixToolsIconForAllDevices === 'function') fixToolsIconForAllDevices();
        enforceHorizontalScrolling();
    });

    // Execute immediately with a slight delay to ensure the DOM is available
    setTimeout(function () {
        if (typeof fixToolsIconForAllDevices === 'function') fixToolsIconForAllDevices();
        enforceHorizontalScrolling();
    }, 100);
} 