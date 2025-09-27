export class CreateExtensionDto {
  id: number;
  number: string;
  callerIdName: string;
  emailAddr: string;
  mobileNumber: string;
  timezone: string;
  presenceStatus: string;
  balance?: number;
}
