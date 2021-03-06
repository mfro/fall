import * as pixi from 'pixi.js';

import * as input from '@/input';
import * as world from './world';

import { Container } from 'pixi.js';
import { lifecycle, Vec, size } from '@/utils';

export const container = new Container();

let app: pixi.Application;
let target: pixi.DisplayObject | null = null;

export function follow(t: pixi.DisplayObject) {
  target = t;
}

export function confetti(origin: Vec) {
  let size = new Vec(12, 6);

  let c = new pixi.Graphics();
  c.beginFill(Math.random() * 0xFFFFFF, 1);
  c.drawRect(-size.x / 2, -size.y / 2, size.x, size.y);
  c.endFill();
  c.x = origin.x;
  c.y = origin.y;
  container.addChild(c);

  let speed = Math.random() * 15 + 1;
  let rot = Math.random() * Math.PI * 0.1;
  let dir = -Math.random() * Math.PI * 2;
  let motion = Vec.polar(speed, dir);

  let lifetime = 60 * 10;

  let delay = 0;
  let release = world.tick((dT) => {
    if (delay > dT) {
      delay -= dT;
    } else {
      delay = 1;
      if (--lifetime == 0) {
        release();
        container.removeChild(c);
        return;
      }

      c.x += motion.x;
      c.y += motion.y;
      c.rotation += rot;
      motion = Vec.add(motion, new Vec(0, 0.1));
      motion = Vec.polar(motion.len * 0.96, motion.dir);
    }
  });
}

export function background(sprite: string, scale = 0) {
  let bg = new pixi.Sprite(pixi.utils.TextureCache[sprite]);
  bg.texture.baseTexture.scaleMode = pixi.SCALE_MODES.NEAREST;
  let r1 = app.view.width / bg.texture.width;
  let r2 = app.view.height / bg.texture.height;
  let r = scale || Math.min(r1, r2);
  bg.scale = new pixi.Point(r, r);
  bg.y = app.view.height - bg.texture.height * r;
  bg.x = size.x / 2;
  bg.y = size.y / 2;
  bg.anchor.x = 0.5;
  bg.anchor.y = 0.5;
  container.addChildAt(bg, 0);
}

lifecycle.hook('reset', 'camera', () => {
  console.log(container.children.length);
  container.removeChildren(0, container.children.length);
  console.log(container.children.length);
  target = null;
});

lifecycle.hook('init', 'camera', ap => {
  app = ap;
  app.renderer.on('prerender', update);

  app.stage.addChild(container);
});

function update() {
  if (!target) return;

  container.position = new pixi.Point(
    -target.x + app.view.width / 2,
    -target.y + app.view.height / 2);
}

// export function leaf_physics(target: pixi.DisplayObject) {
//   let vel = new Vec(Math.random() * 6 + 3, 0);
//   let upwards = new Vec(0, -Math.random() * Math.PI);

//   let floor = size.y;

//   let constants = {
//     GRAV: 0.25 + Math.random() * 0.5,
//     DRAG: 1,
//     DRAG_MIN: 10,
//     ROTATION: 0.002,
//   };

//   app.ticker.add(dT => {
//     let landed = target.y >= floor;

//     if (landed) {
//       // pos = new Vec(pos.x, floor);
//       upwards = new Vec(0, 1);
//     } else if (!input.isKeyDown(input.SPACE)) {
//       target.x += vel.x;
//       target.y += vel.y;

//       let delta = Vec.delta(vel, upwards) / (Math.PI / 2);
//       delta *= vel.len * constants.ROTATION;

//       vel = Vec.polar(vel.len, vel.dir + delta);
//       upwards = Vec.polar(1, upwards.dir + delta);

//       if (vel.y < 0) {
//         let grav = Vec.polar(-constants.GRAV, vel.dir);
//         vel = Vec.add(vel, grav);
//       } else {
//         let grav = Vec.polar(constants.GRAV, vel.dir);
//         vel = Vec.add(vel, grav);
//       }

//       if (vel.len < 1) {
//         if (upwards.y > 0)
//           upwards = Vec.polar(-upwards.len, upwards.dir);
//       }

//       if (vel.len > constants.DRAG_MIN)
//         vel = Vec.polar(vel.len * constants.DRAG, vel.dir);
//     }

//     // target.x = pos.x;
//     // target.y = pos.y;
//     // target.rotation = rotation;
//   });
// }
