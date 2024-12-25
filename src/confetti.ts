/**
 * This code adapted from
 * https://codepen.io/jonathanbell/pen/OvYVYw
 */

const randomFromTo = (from: number, to: number) => {
    return Math.floor(Math.random() * (to - from + 1) + from);
}

class Particle {
    private static possibleColors = [
        'DodgerBlue',
        'OliveDrab',
        'Gold',
        'Pink',
        'SlateBlue',
        'LightBlue',
        'Gold',
        'Violet',
        'PaleGreen',
        'SteelBlue',
        'SandyBrown',
        'Chocolate',
        'Crimson'
    ];

    confetti: Confetti
    x: number;
    y: number;
    r: number;
    d: number;
    color: string;
    tilt: number;
    tiltAngleIncremental: number;
    tiltAngle: number;

    constructor(confetti: Confetti) {
        this.confetti = confetti;
        this.x = Math.random() * confetti.w; // x
        this.y = Math.random() * confetti.h - confetti.h; // y
        this.r = randomFromTo(11, 33); // radius
        this.d = Math.random() * confetti.maxConfettis + 11;
        this.color =
        Particle.possibleColors[Math.floor(Math.random() * Particle.possibleColors.length)];
        this.tilt = Math.floor(Math.random() * 33) - 11;
        this.tiltAngleIncremental = Math.random() * 0.07 + 0.05;
        this.tiltAngle = 0;
    }

    draw() {
        const context = this.confetti.context;
        context.beginPath();
        context.lineWidth = this.r / 2;
        context.strokeStyle = this.color;
        context.moveTo(this.x + this.tilt + this.r / 3, this.y);
        context.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 5);
        return context.stroke();
    };
}

export class Confetti extends HTMLElement {
    w: number;
    h: number;
    canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D;
    maxConfettis = 150;
    particles: Particle[] = [];

    constructor() {
        super();
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d')!;

        this.onResize = this.onResize.bind(this);
    }

    connectedCallback() {
        window.addEventListener('resize', this.onResize);

        // Push new confetti objects to `particles[]`
        for (var i = 0; i < this.maxConfettis; i++) {
            this.particles.push(new Particle(this));
        }

        // Initialize
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.append(this.canvas);
        this.canvas.width = this.w;
        this.canvas.height = this.h;
        this.draw();
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this.onResize);
    }

    draw() {
        const results = [];
    
        // Magical recursive functional love
        requestAnimationFrame(this.draw.bind(this));
    
        this.context.clearRect(0, 0, this.w, window.innerHeight);
    
        for (var i = 0; i < this.maxConfettis; i++) {
            results.push(this.particles[i].draw());
        }
    
        let remainingFlakes = 0;
        for (var i = 0; i < this.maxConfettis; i++) {
            const particle = this.particles[i];
    
            particle.tiltAngle += particle.tiltAngleIncremental;
            particle.y += (Math.cos(particle.d) + 3 + particle.r / 2) / 2;
            particle.tilt = Math.sin(particle.tiltAngle - i / 3) * 15;
    
            if (particle.y <= this.h) remainingFlakes++;
    
            // If a confetti has fluttered out of view,
            // bring it back to above the viewport and let if re-fall.
            if (particle.x > this.w + 30 || particle.x < -30 || particle.y > this.h) {
                particle.x = Math.random() * this.w;
                particle.y = -30;
                particle.tilt = Math.floor(Math.random() * 10) - 20;
            }
        }
    
        return results;
    }

    onResize() {
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
}
