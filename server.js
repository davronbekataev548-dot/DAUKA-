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
