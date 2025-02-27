/**
 * Harvester
 *
 * Harvests energy from sources and transfers to structures
 */

import * as _Common from '../rolelib/common';

enum State {
  HarvestEnergy = 1,
  TransferEnergy = 2
}

export function run(creep: Creep) {
  if (!creep.hasState()) {
    creep.setState(State.HarvestEnergy);
  }

  switch (creep.getState()) {
    case State.HarvestEnergy:
      runHarvestEnergy(creep);
      break;
    case State.TransferEnergy:
      runTransferEnergy(creep);
      break;
    default:
      _Common.logCreepStateWarning(creep);
      creep.setState(State.HarvestEnergy);
      break;
  }
}

function runHarvestEnergy(creep: Creep) {
  if (creep.isFull()) {
    creep.say('💫Transfer');
    creep.setState(State.TransferEnergy);
    runTransferEnergy(creep);
    return;
  }

  const source = getTargetSource(creep);
  if (source) {
    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
    }
  }
}

function runTransferEnergy(creep: Creep) {
  if (!creep.store[RESOURCE_ENERGY]) {
    creep.say('⚡Harvest');
    creep.setState(State.HarvestEnergy);
    runHarvestEnergy(creep);
    return;
  }

  const targetStructure = creep.room.find(FIND_STRUCTURES, {
    filter: structure =>
      (structure.structureType === STRUCTURE_EXTENSION ||
        structure.structureType === STRUCTURE_SPAWN ||
        structure.structureType === STRUCTURE_TOWER) &&
      structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  })?.[0];

  if (targetStructure) {
    if (creep.transfer(targetStructure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(targetStructure, { visualizePathStyle: { stroke: '#ffffff' } });
    }
  }
}

function getTargetSource(creep: Creep) {
  if (!creep.memory.source && creep.memory.target) {
    creep.memory.source = creep.memory.target.split('-')[1] as Id<Source>;
  }
  if (!creep.memory.source) {
    return null;
  }
  return Game.getObjectById(creep.memory.source);
}
