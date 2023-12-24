import axios from "axios";
import { IUser } from "../interfaces/IUser";

module.exports = async (data: any) => {
  const { uids = [], title, message, icon = "" } = data;
  console.log("call push notification", data);

  try {
    [].map(async (user: IUser) => {
      try {
        if (!user || user.fcmToken == undefined) return;

        if (user.fcmToken.length > 5) {
          console.log("isTokenExist.expoToken", user?.fcmToken);
          const responce = await axios.post(
            "https://fcm.googleapis.com/fcm/send",
            {
              to: user?.fcmToken,
              notification: {
                body: message,
                title,
                content_available: true,
                priority: "high",
                image: icon.length > 5 ? icon : "",
              },
              data: {
                body: message,
                title,
                image: icon.length > 5 ? icon : "",
                content_available: true,
                priority: "high",
              },
            },

            {
              headers: {
                "Content-Type": "application/json",
                Authorization:
                  "Bearer AAAAk97f_j0:APA91bH0LV4tIqdBP7PdYp5uIcg2JrelDDDdjsZtbYeo6tQfBhFV_GOouNaNtqu6PrsoUT7D_POQRQWbSD7SOfw6XDi_GzhfskTFr_wClJSpoIaqxlt0nge7EywM2XWITtO2p9SHDPJr",
              },
            }
          );
          if (responce.status == 200) {
            console.log("notification sended", responce.data);
            if (responce.data.success == 1) {
              console.log("notification send successfully");
            } else {
              console.log("unable to send notification");
            }
          } else {
            console.log("234567890");
          }
        }
      } catch (err) {
        console.log("send notification error ", err);
      }
    });
    return true;
  } catch (err) {
    console.log("getting shipment in notification error", err);
    return false;
  }
};
