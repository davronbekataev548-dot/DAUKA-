const express = require("express");
const crypto = require("crypto");
const fs = require("fs");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const DB = "./keys.json";

function loadKeys(){
  if(!fs.existsSync(DB)){
    fs.writeFileSync(DB,"[]");
  }

  return JSON.parse(
    fs.readFileSync(DB,"utf8")
  );
}

function saveKeys(keys){
  fs.writeFileSync(
    DB,
    JSON.stringify(keys,null,2)
  );
}

function generateKey(){

  return "DAUKA-" +
    crypto.randomBytes(12)
      .toString("hex")
      .toUpperCase();
}


/* ЖАҢА KEY */

app.post("/api/create-key",(req,res)=>{

  const keys = loadKeys();

  const key = generateKey();

  const createdAt = Date.now();

  const expiresAt =
    createdAt + 24 * 60 * 60 * 1000;

  keys.push({
    key:key,
    createdAt:createdAt,
    expiresAt:expiresAt
  });

  saveKeys(keys);

  res.json({
    success:true,
    key:key,
    expiresAt:expiresAt
  });
});


/* KEY ТЕКСЕРУ */

app.post("/api/check-key",(req,res)=>{

  const key =
    String(req.body.key || "")
      .trim()
      .toUpperCase();

  const keys = loadKeys();

  const index =
    keys.findIndex(
      item => item.key === key
    );

  if(index === -1){

    return res.json({
      success:false,
      message:"Key жарамсыз"
    });
  }

  const item = keys[index];

  if(Date.now() >= item.expiresAt){

    keys.splice(index,1);

    saveKeys(keys);

    return res.json({
      success:false,
      message:"Key мерзімі біткен"
    });
  }

  res.json({
    success:true,
    message:"Key дұрыс",
    expiresAt:item.expiresAt,
    remaining:
      item.expiresAt - Date.now()
  });
});


/* SERVER STATUS */

app.get("/",(req,res)=>{

  res.json({
    status:"online",
    name:"DAUKA KEY SERVER"
  });

});


app.listen(PORT,()=>{

  console.log(
    "DAUKA KEY SERVER іске қосылды: "
    + PORT
  );

});
