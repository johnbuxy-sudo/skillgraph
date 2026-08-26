import neo4j from "neo4j-driver";

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME || "cognodb";
const password = process.env.COGNODB_PASSWORD;

export function getDriver() {
  if (!uri || !password) throw new Error("Missing COGNODB_URI or COGNODB_PASSWORD environment variable.");
  return neo4j.driver(uri, neo4j.auth.basic(username, password));
}
