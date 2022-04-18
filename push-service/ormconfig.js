
const {
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_USERNAME,
    POSTGRES_PASSWORD,
    POSTGRES_DB,
} = process.env;

// eslint-disable-next-line import/no-default-export
module.exports = {
    type: "postgres",
    host: POSTGRES_HOST,
    port: +POSTGRES_PORT,
    username: POSTGRES_USERNAME,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    entities: ["dist/models/*.js"],
};
