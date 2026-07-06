export interface IRole {
  _id?:         string;
  name:         string; 
  description:  string;
  isSystemRole: boolean;
  createdAt?:   Date;
  updatedAt?:   Date;
}