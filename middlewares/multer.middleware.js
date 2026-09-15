import multer from "multer";
import crypto from "crypto";
import os from "os";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, os.tmpdir());
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(16, function (err, raw) {
      if (err) return cb(err);
      cb(null, `${file.fieldname}-${raw.toString("hex")}${path.extname(file.originalname)}`);
    });
  },
});

export const upload = multer({ storage: storage });

