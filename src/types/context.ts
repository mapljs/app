export interface Context {
  req: Request;
  params: string[];

  headers: (readonly [string, string])[];
  status: number;
  statusText: string;
}
