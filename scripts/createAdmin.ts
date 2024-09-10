import { getAuth } from "firebase-admin/auth";
import logging from "../config/logging";

import { adminApp } from "../firebase";

export const createSuperAdmin = async () => {
  try {
    const userObj: any = {
      displayName: "Admin",
      isAdminAccess: true,
      email: "",
      phone: "",
      password: "",
    };
    const newUserRecord = await getAuth(adminApp).createUser(userObj);
    await getAuth(adminApp).setCustomUserClaims(newUserRecord.uid, {
      // role: role,
      admin: userObj.isAdminAccess,
    });

    logging.info("USER", "Super Admin Created");
  } catch (err) {
    logging.error("USER", "Unable to create super admin", err);
  }
};
