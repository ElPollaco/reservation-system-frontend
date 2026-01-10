export const extractErrorMessage = (error) => {
  if (typeof error === 'string')
    return error;

  if (error?.exceptions?.length > 0)
    return error.exceptions[0].message;

  if (error?.message)
    return error.message;

  return 'Something went wrong. Please try again.';
};