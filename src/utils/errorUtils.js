export const extractErrorMessage = (error) => {
  if (typeof error === 'string')
    return error;

  if (error?.userMessage)
    return error.userMessage;

  if (error?.details?.length > 0)
    return error.details[0].message;

  if (error?.message)
    return error.message;

  return 'Something went wrong. Please try again';
};