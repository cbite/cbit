export enum UserState {
  Present,
  Deleting,
  Deleted
}

export interface User {
  username: string;
  realname: string;
}
