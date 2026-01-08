// test-v8.cjs
const sql = require('msnodesqlv8');
const cs =
  'Server=localhost\\SQLEXPRESS;' +
  'Database=sgsb;' +
  'Driver={ODBC Driver 17 for SQL Server};' + // <-- troque p/ 17 neste teste
  'Encrypt=Yes;TrustServerCertificate=Yes;' +
  'Trusted_Connection=Yes;';
sql.open(cs, (e, c) => {
  if (e) return console.error('OPEN ERROR =', e);
  c.query('SELECT @@VERSION AS v', (e2, rows) => {
    console.log(e2 || rows[0].v);
    c.close(()=>{});
  });
});
