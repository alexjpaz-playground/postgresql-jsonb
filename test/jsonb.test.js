// https://node-postgres.com/
//
//
const { expect } = require('chai');


const { Client } = require('pg')

let client;

before(async () => {
  client = new Client({
    user: 'postgres',
    database: 'postgres',
    password: 'example',
  });
  await client.connect();
});

after(async () => {
  await client.end()
});

it('should connect', async () => {
  const res = await client.query('SELECT $1::text as message', ['Hello world!'])
});

describe('jsonb test', () => {
  before(async () => {
    await client.query(`DROP TABLE IF EXISTS cards;`)
    await client.query(`
    CREATE TABLE cards (
      id serial NOT NULL,
      data jsonb
    );`);

  });

  it('insert', async () => {
    let query = "";
    for(let i=0;i<5e5;i++) {
      const json = {
        name: i,
        selectors: {
          contact_id: '0'
        }
      };

      query += `INSERT INTO cards VALUES (${i}, '${JSON.stringify(json)}');`;
    }

    await client.query(query);
  });

  const printRows = (rows) => rows.forEach((r) => console.log(JSON.stringify(r)));

  it('should query query all', async () => {
    const rsp = await client.query(`SELECT * FROM cards ORDER BY id DESC LIMIT 10`);

    printRows(rsp.rows)
  });

  it('should count', async () => {
  });

  it('should query by json', async () => {
    const rsp = await client.query(`SELECT * FROM cards WHERE data -> 'selectors' ->> 'contact_id' = '0' LIMIT 2000`);

    expect(rsp.rows.length).to.be.above(0);
    expect(rsp.rows.length).to.eql(2000);
  });
});


