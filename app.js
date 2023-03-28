let express = require("express");
let { open } = require("sqlite");

let sqlite3 = require("sqlite3");
let path = require("path");

let database = path.join(__dirname, "covid19India.db");

let app = express();
app.use(express.json());

let DATABASE = null;

let start = async () => {
  try {
    DATABASE = await open({
      filename: database,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running AT http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DataBase ERROR ${e.message}`);
  }
};

start();

const snakeCase_to_camelCase = (databaseobject) => {
  return {
    stateId: databaseobject.state_id,
    stateName: databaseobject.state_name,
    population: databaseobject.population,
  };
};

const snakeCase_to_camelCase_to_DISTRICT = (data_BASE_object) => {
  return {
    districtId: data_BASE_object.district_id,
    districtName: data_BASE_object.district_name,
    stateId: data_BASE_object.state_id,
    cases: data_BASE_object.cases,
    cured: data_BASE_object.cured,
    active: data_BASE_object.active,
    deaths: data_BASE_object.deaths,
  };
};

// API 1 GET (ALL)

app.get("/states/", async (request, response) => {
  let getStates = `
    SELECT
    * 
    FROM 
    state`;

  let result = await DATABASE.all(getStates);

  response.send(result.map((eachplayer) => snakeCase_to_camelCase(eachplayer)));
});

// API 2 GET (by ID)

app.get("/states/:stateId/", async (request, response) => {
  let { stateId } = request.params;

  const getstate = `
    SELECT
   *
    FROM 
    state

    WHERE
  state_id = ${stateId};`;

  const output = await DATABASE.get(getstate);
  response.send(snakeCase_to_camelCase(output));
});

// API 3 POST

app.post("/districts/", async (request, response) => {
  try {
    let { districtName, stateId, cases, cured, active, deaths } = request.body;

    const addDistricts = `
   INSERT INTO 
    district
   (district_name,state_id,cases,cured,active,deaths)
    
   VALUES
   (
       '${districtName}',
        ${stateId},
        ${cases},
        ${cured},
        '${active}',
        ${deaths}
    );`;

    const DATA = await DATABASE.run(addDistricts);

    response.send("District Successfully Added");
  } catch (e) {
    console.log(`DATAbase erro000r ${e.message}`);
  }
});

//API 4

app.get("/districts/:districtId/", async (request, response) => {
  let { districtId } = request.params;
  try {
    let getDISTRICT = `
    SELECT
    *
    FROM             
    district


    WHERE
    district_id = ${districtId};`;

    let output = await DATABASE.get(getDISTRICT);
    response.send(snakeCase_to_camelCase_to_DISTRICT(output));
  } catch (e) {
    console.log(`${e.message}`);
  }
});

//api 5

app.delete("/districts/:districtId/", async (request, response) => {
  try {
    const { districtId } = request.params;

    const DELETEdistric = `
        SELECT
        *
        FROM
        district
        WHERE
        district_id = ${districtId};`;

    const result = await DATABASE.run(DELETEdistric);
    response.send("District Removed");
  } catch (e) {
    console.log(`DATABASE ERROR ${e.message}`);
  }
});

// API 6

app.put("/districts/:districtId/", async (request, response) => {
  try {
    const { districtId } = request.params;
    const {
      districtName,
      stateId,
      cases,
      cured,
      active,
      deaths,
    } = request.body;

    const update = `
    UPDATE district
    SET 
    district_name = '${districtName}',
    state_id = '${stateId}',
    cases = '${cases}',
    cured = ${cured},
    active = ${active},
    deaths = ${deaths}
    
    WHERE
    district_id = ${districtId};`;

    await DATABASE.run(update);
    response.send("District Details Updated");
  } catch (e) {
    console.log(`Error ${e.message}`);
  }
});

//API 7

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  try {
    const x = `
    SELECT
    SUM(cases),
    SUM(cured),
    SUM(active),
    SUM(deaths)
    
    FROM 
    district
    
    WHERE 
    state_id = ${stateId}`;

    let y = await DATABASE.get(x);
    response.send({
      totalCases: y["SUM(cases)"],
      totalCured: y["SUM(cured)"],
      totalActive: y["SUM(active)"],
      totalDeaths: y["SUM(deaths)"],
    });
  } catch (e) {
    console.log(`DATA error ${e.message}`);
  }
});

// API 8

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;

  try {
    const getStateName = `
        SELECT
        state_name AS stateName
       
        FROM 
        state NATURAL JOIN district
        
        WHERE
        district_id = ${districtId};`;

    const a = await DATABASE.get(getStateName);
    response.send(a);
  } catch (e) {
    console.log(`DATA error ${e.message}`);
  }
});
module.exports = app;
