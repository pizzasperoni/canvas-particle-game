import { Player } from './Player.js'
import { Projectile } from './Projectile.js'
import { Enemy } from './Enemy.js'
import { Particle } from './Particle.js'

const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height= innerHeight

const scoreEl = document.getElementById("scoreEl")
const startGameBtn = document.getElementById("startGameBtn")
const modalEl = document.getElementById("modalEl")
const bigScore = document.getElementById("bigScore")

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 10, 'white')
let projectiles = []
let enemies = []
let particles = []

function init () {
  player = new Player(x, y, 10, 'white')
  projectiles = []
  enemies = []
  particles = []
  score = 0
  scoreEl.innerHTML = score
  bigScore.innerHTML = score
}

function spawnEnemies() {
  setInterval(()=>{ 
    const radius = Math.random() * (30 - 5) + 5
    let x, y
    if(Math.random() < 0.5) {
      x = Math.random() < 0.5 ?  (0 - radius) : (canvas.width + radius)
      y =  Math.random() * canvas.height
    } else {
      x = Math.random() * canvas.width
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    }

    enemies.push(new Enemy(x, y, radius, color, velocity))

  }, 1000)
}

let animationId
let score = 0

function animate() {
  animationId = requestAnimationFrame(animate)
  context.fillStyle = 'rgba(0, 0 ,0 , 0.1)'
  context.fillRect(0, 0, canvas.width, canvas.height)
  player.draw(context)
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0){
      particles.splice(index, 1)
    }else {
      particle.update(context)
    }
  })
  projectiles.forEach((projectile, index) => {
    projectile.update(context)
    // remove from edges of screen
    if(projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height) {
      setTimeout(()=>{
        projectiles.splice(index, 1)
      }, 0)
    }
  })
  enemies.forEach((enemy, index) => {
    enemy.update(context)
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
    // end game
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId)
      modalEl.style.display = 'flex'
      bigScore.innerHTML = score
    }      
    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
      // when projectiles touch enemy
      if (dist - enemy.radius - projectile.radius < 1) {
        // create explosions
        for(let i = 0; i < enemy.radius * 2; i++){
          particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {x: Math.random() - 0.5 * Math.random() * 6, y: Math.random() - 0.5 * Math.random() * 6}))
        }
        if (enemy.radius - 10 > 5){
          // increase score
          score += 100
          scoreEl.innerHTML = score
          gsap.to(enemy, {
            radius: enemy.radius - 10
          })
          setTimeout(()=> {
            projectiles.splice(projectileIndex, 1)
          }, 0)
          
        }else {
          setTimeout(()=> {
            enemies.splice(index, 1)
            projectiles.splice(projectileIndex, 1)
          }, 0)
        }
      }
    })
  })
}
 
window.addEventListener('click', e =>{
  const angle = Math.atan2(e.clientY - canvas.height / 2, e.clientX - canvas.width / 2)
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5
  }
  projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity))
})

startGameBtn.addEventListener('click', () => {
  init()
  animate()
  spawnEnemies()
  modalEl.style.display = 'none'
})