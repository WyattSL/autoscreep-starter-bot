/**
 * CreepService
 *
 * Organizes creeps by their role, used in Managers and Operations
 */
import { Role } from '../enums/role';
import { log } from '../utils/logger';

export class CreepService {
  private creepDictionary: { [role: number]: Creep[] };

  constructor() {
    this.creepDictionary = this.makeDictionary();
  }

  public creepShouldRun(creep: Creep) {
    if (!creep.memory.homeroom) {
      creep.memory.homeroom = creep.room.name;
    }

    if (creep.spawning) {
      return false;
    }
    return true;
  }

  public runCreeps(role: Role, creepRunMethod: Function) {
    const creepsWithRole = this.getAllOfRole(role);
    for (const creep of creepsWithRole) {
      if (this.creepShouldRun(creep)) {
        creepRunMethod(creep);
      }
    }
  }

  public getCreeps(role: Role | null = null, target: string | null = null, homeroom: string | null = null) {
    const creeps: Creep[] = [];

    if (role !== null) {
      if (!this.creepDictionary[role]) {
        return creeps;
      }
      for (const creep of this.creepDictionary[role]) {
        if (
          (target === null || creep.memory.target === target) &&
          (homeroom === null || creep.memory.homeroom === homeroom)
        ) {
          creeps.push(creep);
        }
      }
      return creeps;
    }

    for (const creepName in Game.creeps) {
      const creep = Game.creeps[creepName];
      if (
        (target === null || creep.memory.target === target) &&
        (homeroom === null || creep.memory.homeroom === homeroom) &&
        (role === null || creep.memory.role === role)
      ) {
        creeps.push(creep);
      }
    }
    return creeps;
  }

  public getAllOfRole(role: Role) {
    if (this.creepDictionary[role]) {
      return this.creepDictionary[role];
    }
    return [];
  }

  private makeDictionary() {
    const creeps: { [role: number]: Creep[] } = {};

    for (const name in Game.creeps) {
      const creep = Game.creeps[name];

      if (creep.memory.role === undefined) {
        log.warning(`Creep ${creep.name} has no role`, creep.room.name);
        continue;
      }

      if (!creeps[creep.memory.role]) {
        creeps[creep.memory.role] = [];
      }
      creeps[creep.memory.role].push(creep);
    }
    return creeps;
  }
}
