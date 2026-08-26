import neo4j, { type Driver } from "neo4j-driver";

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME || "cognodb";
const password = process.env.COGNODB_PASSWORD;

declare global {
  // Reuse the driver across warm serverless invocations.
  var cognodbDriver: Driver | undefined;
}

export function getDriver(): Driver {
  if (!uri || !password) {
    throw new Error("Missing COGNODB_URI or COGNODB_PASSWORD environment variable.");
  }

  if (!globalThis.cognodbDriver) {
    globalThis.cognodbDriver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  }

  return globalThis.cognodbDriver;
}
