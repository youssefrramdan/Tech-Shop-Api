import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  let token = req.headers.token;
  jwt.verify(token, "myNameisYoussef", async (err, decoded) => {

    if (err) {
      res.status(401).json({ message: "invalid token", err });
    }
    req.user = decoded;
    next();
  });
};
