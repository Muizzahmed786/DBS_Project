import bcrypt from "bcrypt";

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const isPasswordCorrect = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};


export {hashPassword,isPasswordCorrect};