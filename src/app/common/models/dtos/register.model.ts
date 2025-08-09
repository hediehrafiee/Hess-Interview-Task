import {prop, required} from '@rxweb/reactive-form-validators';

export interface RegisterModel {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export class RegisterFormModel {
  @prop()
  @required()
  email!: string;

  @prop()
  @required()
  password!: string;

  @prop()
  @required()
  firstName!: string;

  @prop()
  @required()
  lastName!: string;
}
