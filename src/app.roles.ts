import { RolesBuilder } from 'nest-access-control';

export enum AppRoles {
  USER_CREATE_ANY_VIDEO = 'USER_CREATE_ANY_VIDEO',
  ADMIN_UPDATE_OWN_VIDEO = 'ADMIN_UPDATE_OWN_VIDEO',
}

export const roles: RolesBuilder = new RolesBuilder();
