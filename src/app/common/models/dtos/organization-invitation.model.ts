export type OrganizationInvitationRole = 'super_admin' | 'admin' | 'member';

export interface OrganizationInvitationModel {
  email: string;
  role: OrganizationInvitationRole;
}
