import {
  AuthorisationsApi,
  Configuration,
  FinancialDataApi,
  InstitutionsApi,
  VirtualAccountsApi,
} from "./generated";

const config = new Configuration({
  username: process.env.YAPILY_APPLICATION_ID,
  password: process.env.YAPILY_SECRET,
});

export const institutionsAPI = new InstitutionsApi(config);
export const financialDataAPI = new FinancialDataApi(config);
export const authorizationAPI = new AuthorisationsApi(config);
