export const generateSuccessfulResponse = (data: any) => ({
  status: "success",
  data,
});

export const generateErrorResponse = (errorMsg: string) => ({
  status: "error",
  error: errorMsg,
});
