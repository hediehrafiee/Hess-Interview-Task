import {prop, required} from '@rxweb/reactive-form-validators';

export interface LoginModel {
  email: string;
  password: string;
}

export class LoginFormModel {
  @prop()
  @required()
  email!: string;

  @prop()
  @required()
  password!: string;
}
