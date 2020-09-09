declare module "heroku-client" {
  class Heroku {
    constructor(options?: any);

    request(options?: any): any;
    get<T>(path: string, options?: any): Promise<T>;
  }
  export = Heroku;
}
