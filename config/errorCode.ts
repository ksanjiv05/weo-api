//  W000: "All successful response",
//   W001: "Authentication Issue",
//   W002: "multiple sessions issue (You have multiple login sessions opened concurrently. For security reason, this session will be terminated)",
//   W003: "Server related issue (Service is temporarily unavailable. Please try again later))",

//   W010: "account inactive issue",

//   W011: "Validation Issue with field name",
//   W012: "Required field issue with field name (Please provide field name to proceed further)",
//   W013: "duplication/Already exist issue with field name (The field name has already exist. Please add a different field name to proceed)",

//   W020: "No result found",
const ERROR_CODES = {
  SUCCESS: "W000",
  AUTH_ERR: "W001",
  MULTI_SESSION: "W002",
  SERVER_ERR: "W003",
  ACCOUNT_INACTIVE: "W010",
  FIELD_VALIDATION_ERR: "W011",
  FIELD_VALIDATION_REQUIRED_ERR: "W012",
  DUPLICATE: "W013",
  NOT_FOUND: "W020",
};
