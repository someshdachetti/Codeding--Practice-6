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

// API 1 GET (ALL)

app.get("/states/", async (request, response) => {
  let getStates = `
    SELECT
    * 
    FROM 
    state`;

  let result = await DATABASE.all(getStates);
  response.send(result);
});

// API 2 GET (by ID)

app.get("/state/:stateID", async (request, response) => {
  let { stateID } = request.params;

  let getstate = `
    SELECT
    *
    
    FROM 
    state

    WHERE
    state_id = ${stateID};`;

  let output = await DATABASE.get(getstate);
  response.send(output);
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
        ${deaths},
    );`;

    const DATA = await DATABASE.run(addDistricts);

    response.send("District Successfully Added");
  } catch (e) {
    console.log(`DATAbase erro000r ${e.message}`);
  }
});

//API 4

app.get("/districts/:districtId/", async (request, response) => {
  let { districId } = request.params;
  try {
    let getDISTRICT = `
    SELECT
    *
    FROM
    district

    WHERE
    distric_id = ${districId};`;

    let output = await DATABASE.get(getDISTRICT);
    response.send(output);
  } catch (e) {
    console.log(`${e.message}`);
  }
});

//api 5

app.delete("/districts/:districtId/", async (request, response) => {
  try {
    let { districtId } = request.params;

    let DELETEdistric = `
        SELECT
        *
        FROM
        district
        WHERE
        district_id = ${districtId};`;

    let result = await DATABASE.get(DELETEdistric);
    response.send("District Removed");
  } catch (e) {
    console.log(`DATABASE ERROR ${e.message}`);
  }
});

// API 6

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { addingInformation } = request.body;

  let {
    district_name,
    state_id,
    cases,
    cured,
    active,
    deaths,
  } = addingInformation;

  try {
    let update = `
    UPDATE district
    SET 
    district_name =${districtName},
    state_id =    ${stateId},
    cases =    ${cases},
    cured=    ${cured},
     active=   ${active},
      deaths=  ${deaths},
      
      WHERE
      district_Id= ${districtId};`;

    let a = await DATABASE.run(update);
    response.send("District Details Updated");
  } catch (e) {
    console.log(`ERROR ${e.message}`);
  }
});

//API 7

app.get("/states/:stateId/stats/", async (request, response) => {
  let { stateId } = request.params;
  try {
    let x = `
    SELECT
    SUM(cases)
    SUM(cured)
    SUM(active)
    SUM(deaths)
    
    FROM 
    district
    
    WHERE 
    state_id = ${stateId}`;

    let y = await DATABASE.get(x);
    response.send({
      TotalCases: stats["SUM(cases)"],
      TotalCured: stats["SUM(cured)"],
      TotalActive: stats["SUM(active)"],
      TotalDeaths: stats["SUM(deaths)"],
    });
  } catch (e) {
    console.log(`DATA error ${e.message}`);
  }
});

// API 8

app.get("/districts/:districtId/details/", async (request, response) => {
  let { districtId } = request.params;

  app.get("/districts/:districtId/details/", async (request, response) => {
    const { districtId } = request.params;
    const getDistrictIdQuery = `
select state_id from district
where
district_id = ${districtId};`;

    const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery);

    const getStateNameQuery = `
select state_name as stateName from state
where state_id = ${getDistrictIdQueryResponse.state_id};
`;
    const getStateNameQueryResponse = await database.get(getStateNameQuery);
    response.send(getStateNameQueryResponse);
  });
});

module.exports = app;
