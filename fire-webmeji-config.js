/* Student Guide fire companion configuration.
 * Movement engine: Webmeji by Lars de Rooij (Unlicense).
 * Sprite: FireCreature by BlackSwordo, OpenGameArt (CC BY 4.0).
 * Attribution details: FIRE-COMPANION-ATTRIBUTION.md
 */
(function () {
  'use strict';
  const FIRE = "https://opengameart.org/sites/default/files/1535543564422Instagram_last.png";
  const repeat = (count) => Array.from({ length: count }, () => FIRE);
  window.SPAWNING = [{ id: 'student-guide-fire-webmeji', config: 'STUDENT_GUIDE_FIRE_CONFIG' }];
  window.STUDENT_GUIDE_FIRE_CONFIG = {
    ALLOWANCES: ['bottom', 'top', 'left', 'right'],
    walkspeed: 34,
    fallspeed: 145,
    jumpspeed: 125,
    gettingupspeed: 1600,
    walk: { frames: repeat(4), interval: 180, loops: 6 },
    stand: { frames: [FIRE], interval: 300, loops: 1 },
    sit: { frames: [FIRE], interval: 1000, loops: 1, randomizeDuration: true, min: 2800, max: 7500 },
    spin: { frames: repeat(2), interval: 180, loops: 2 },
    dance: { frames: repeat(3), interval: 220, loops: 3 },
    trip: { frames: repeat(2), interval: 240, loops: 1 },
    forcewalk: { loops: 4 },
    forcethink: { frames: repeat(2), interval: 500, loops: 2 },
    pet: { frames: repeat(2), interval: 120 },
    drag: { frames: repeat(2), interval: 210 },
    falling: { frames: [FIRE], interval: 200, loops: 2 },
    fallen: { frames: repeat(2), interval: 250, loops: 1 },
    ORIGINAL_ACTIONS: ['walk','walk','walk','walk','walk','walk','walk','spin','sit','sit','dance','trip'],
    EDGE_ACTIONS: ['hang','hang','climb','climb','fall'],
    JUMP_CHANCE: 0.10,
    climbSide: { frames: repeat(2), interval: 200, loops: 2 },
    hangstillSide: { frames: [FIRE], interval: 200, loops: 2, randomizeDuration: true, min: 2500, max: 7000 },
    climbTop: { frames: repeat(2), interval: 200, loops: 4 },
    hangstillTop: { frames: [FIRE], interval: 200, loops: 2, randomizeDuration: true, min: 2500, max: 7000 },
    jump: { frames: [FIRE], interval: 200 }
  };
})();
