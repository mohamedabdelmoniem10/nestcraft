import { DataSource } from "typeorm";
import { dataSourceOptions } from "../config/database.config";

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
