const express = require("express");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const DB = "./keys.json";

app.use(express.json());

/* CORS */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

/* Базаны оқу */
function loadKeys() {
  if (!fs.existsSync(DB)) {
    fs.writeFileSync(DB, "[]");
  }

  try {
    return JSON.parse(fs.readFileSync(DB, "utf8"));
  } catch {
    return [];
  }
}

/* Базаға сақтау */
function saveKeys(keys) {
  fs.writeFileSync(
    DB,
    JSON.stringify(keys, null, 2)
  );
}

/* Бірегей Key */
function generateKey() {
  let key;

  do {
    key =
      "DAUKA-" +
      crypto.randomBytes(12)
        .toString("hex")
        .toUpperCase();
  } while (loadKeys().some(x => x.key === key));

  return key;
}

/* KEY ЖАСАУ */
app.post("/api/create-key", (req, res) => {

  const keys = loadKeys();

  const createdAt = Date.now();
  const expiresAt =
    createdAt + 24 * 60 * 60 * 1000;

  const key = generateKey();

  keys.push({
    key,
    createdAt,
    expiresAt
  });

  saveKeys(keys);

  res.json({
    success: true,
    key,
    expiresAt
  });
});

/* KEY ТЕКСЕРУ */
app.post("/api/check-key", (req, res) => {

  const key =
    String(req.body.key || "")
      .trim()
      .toUpperCase();

  const keys = loadKeys();

  const index =
    keys.findIndex(x => x.key === key);

  if (index === -1) {
    return res.json({
      success: false,
      message: "Key жарамсыз"
    });
  }

  const item = keys[index];

  if (Date.now() >= item.expiresAt) {

    keys.splice(index, 1);
    saveKeys(keys);

    return res.json({
      success: false,
      message: "Key мерзімі біткен"
    });
  }

  res.json({
    success: true,
    message: "Key дұрыс",
    expiresAt: item.expiresAt,
    remaining:
      item.expiresAt - Date.now()
  });
});

/* SERVER STATUS */
app.get("/", (req, res) => {
  res.json({
    status: "online",
    name: "DAUKA KEY SERVER"
  });
});

app.listen(PORT, () => {
  console.log(
    "DAUKA KEY SERVER іске қосылды: " + PORT
  );
});
