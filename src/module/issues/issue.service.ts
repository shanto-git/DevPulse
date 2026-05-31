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

const getAllIssueFromDB = async () => {
  const result = await pool.query(`
        SELECT * FROM issues ORDER BY created_at DESC
        `);

  const issues = result.rows;

  const reporterId = [
    ...new Set(issues.map((issue) => issue.reporter_id)),
  ];
  
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

  getUser.rows.forEach((user) => {
    usersMap.set(user.id, user);
  });

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
  return formattedIssues
};

export const issueService = {
  createIssueIntoDB,
  getAllIssueFromDB,
};
