import { pool } from "../../db";
import type { IIssue } from "./issue.interface";

const createIssueIntoDB = async (payload: IIssue) => {
  const { title, description, type, reporter_id } = payload;

  const result = await pool.query(
    `
        INSERT INTO issues(title, description, type, reporter_id) VALUES ($1, $2, $3, $4) RETURNING *
        `,
    [title, description, type, reporter_id],
  );
  return result.rows[0];
};

const getAllIssueFromDB = async (queryParams: { sort?: string; type?: string; status?: string }) => {
  const {sort, type, status} = queryParams;

  let queryText = `SELECT * FROM issues WHERE 1=1`;
  const queryParamsArray: any[] = [];
  let paramIndex = 1;

  if (type) {
    queryText += ` AND type = $${paramIndex}`;
    queryParamsArray.push(type);
    paramIndex++;
  }
  if (status) {
    queryText += ` AND status = $${paramIndex}`;
    queryParamsArray.push(status);
    paramIndex++;
  }

  if (sort === "oldest") {
    queryText += ` ORDER BY created_at ASC`;
  } else {
    queryText += ` ORDER BY created_at DESC`;
  }

  const result = await pool.query(queryText, queryParamsArray);
  const issues = result.rows;
  const reporterId = [...new Set(issues.map((issue) => issue.reporter_id))];

  if (reporterId.length === 0) {
    return [];
  }

  const getUser = await pool.query(
    `
            SELECT * FROM users WHERE id = any($1)
            `,
    [reporterId],
  );

  const usersMap = new Map();

  getUser.rows.forEach((user) => usersMap.set(user.id, user));

  const formattedIssues = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: usersMap.get(issue.reporter_id),
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  }));
  return formattedIssues;
};

const singleIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
      SELECT * FROM issues WHERE id = $1
      `,
    [id],
  );
  const issue = result.rows[0];

  if (!issue) {
    return null;
  }

  const userResult = await pool.query(
    `
      SELECT * FROM issues WHERE id = $1
      `,
    [issue.reporter_id],
  );
  const reporter = userResult.rows[0];

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};

const updateIssueFromDB = async (payload: IIssue, id: string) => {
  console.log("Service started");
  const { title, description, type, status } = payload;
  const result = await pool.query(
    `
    UPDATE issues SET title = COALESCE($1, title),
    description = COALESCE($2, description),
    type = COALESCE($3, type),
    status = COALESCE($4, 'in_progress'), updated_at=NOW() WHERE id = $5 RETURNING *
    `,
    [title, description, type, status, id],
  );

  console.log("DB result:", result.rows);
  return result.rows[0];
};

const deleteIssueFromDB = async (id:string, role:string)=>{
  const result = await pool.query(`
    DELETE FROM issues WHERE id = $1
    `,[id])

    return result.rows[0]
}

export const issueService = {
  createIssueIntoDB,
  getAllIssueFromDB,
  singleIssueFromDB,
  updateIssueFromDB,
  deleteIssueFromDB
};
