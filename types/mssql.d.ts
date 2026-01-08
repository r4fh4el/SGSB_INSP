declare module "mssql" {
  export type config = any;
  export type ConnectionPool = any;
  export type Request = any;
  export type IResult<T = any> = any;
  export type Transaction = any;
  const sql: any;
  export default sql;
}

declare module "mssql/msnodesqlv8" {
  import sql from "mssql";
  export default sql;
}

