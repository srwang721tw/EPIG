/**
 * @fileoverview Disease spread from unremoved dead pigs.
 *
 * A dead pig not cleaned within DISEASE_GRACE_MS triggers disease spread:
 * each live pen-mate has a SPREAD_CHANCE_PER_HOUR chance per hour to become
 * infected. Infected pigs have their health decay rate tripled.
 */

const DISEASE_GRACE_MS = 30 * 60 * 1000; // 30 real minutes
const SPREAD_CHANCE_PER_HOUR = 0.10;

/**
 * Checks for dead pigs and possibly infects live pen-mates.
 * @param {Object} state
 * @param {number} deltaMs
 */
export function checkDiseaseSpread(state, deltaMs) {
  const hours = deltaMs / (60 * 60 * 1000);
  const now = Date.now();

  for (const pen of Object.values(state.pens)) {
    const deadPigs = pen.pigIds
      .map(id => state.pigs[id])
      .filter(p => p?.isDead && p.deadSinceMs !== null);

    for (const dead of deadPigs) {
      const timeDead = now - dead.deadSinceMs;
      if (timeDead < DISEASE_GRACE_MS) continue;

      // Warn player if not yet warned about this pig
      if (!dead.diseaseWarned) {
        dead.diseaseWarned = true;
        state.events.push({
          type: 'disease_warning',
          penId: pen.id,
          pigId: dead.id,
          message: `⚠️ ${dead.name} 的屍體還沒處理！其他豬可能會生病！`,
        });
      }

      // Spread infection to live pen-mates
      const livePigs = pen.pigIds
        .map(id => state.pigs[id])
        .filter(p => p?.isAlive && !p.isInfected);

      for (const livePig of livePigs) {
        const spreadRoll = Math.random();
        if (spreadRoll < SPREAD_CHANCE_PER_HOUR * hours) {
          livePig.isInfected = true;
          state.events.push({
            type: 'infected',
            pigId: livePig.id,
            message: `😷 ${livePig.name} 被感染了！趕快處理死豬並幫牠治療！`,
          });
        }
      }
    }

    // Extra health damage for infected pigs (×3 decay, applied on top of healthSystem)
    const infectedPigs = pen.pigIds
      .map(id => state.pigs[id])
      .filter(p => p?.isAlive && p.isInfected);

    for (const pig of infectedPigs) {
      pig.health = Math.max(0, pig.health - (6 * hours)); // extra 6/hr on top of normal
    }
  }
}

/**
 * Removes a dead pig from its pen (player action: clean up corpse).
 * Clears infection flag from all former pen-mates if no dead pigs remain.
 * @param {string} pigId
 * @param {Object} state
 */
export function removeDeadPig(pigId, state) {
  const pig = state.pigs[pigId];
  if (!pig || !pig.isDead) return;

  const pen = pig.penId ? state.pens[pig.penId] : null;
  if (pen) {
    pen.pigIds = pen.pigIds.filter(id => id !== pigId);
    // If no more dead pigs in pen, cure infections
    const stillDead = pen.pigIds.some(id => state.pigs[id]?.isDead);
    if (!stillDead) {
      for (const id of pen.pigIds) {
        if (state.pigs[id]) state.pigs[id].isInfected = false;
      }
    }
  }
  delete state.pigs[pigId];
}
