import { UsernamePasswordInput } from "src/resolver/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "Invalid email",
      },
    ];
  }

  if (options.username.length <= 2) {
    return [
      {
        field: "username",
        message: "Length must be greater than 2 characters",
      },
    ];
  }

  if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "Can't have '@' character in a username",
      },
    ];
  }

  if (options.password.length <= 2) {
    return [
      {
        field: "password",
        message: "Length must be greater than 2 characters",
      },
    ];
  }

  return null;
};
