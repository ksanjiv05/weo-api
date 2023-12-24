import fs from "fs";
import { ILog } from "../../interfaces/ILog";

export const logging = ({
  ip = "",
  method = "",
  url = "",
  status = -1,
  userAgent = "",
  responseTime = -1,
}: ILog) => {
  const fileName = new Date().toISOString().split("T")[0];
  const filePath = `./logs/${fileName}.log`;

  if (!fs.existsSync(filePath)) {
  }
};

// function onRequest(request, response) {
//     var clientIPaddr = null,
//         clientProxy = null;

//     // is client going through a proxy?
//     if (request.headers['via']) { // yes
//         clientIPaddr = request.headers['x-forwarded-for'];
//         clientProxy = request.headers['via'];
//     } else { // no
//         clientIPaddr = request.connection.remoteAddress;
//         clientProxy = "none";
//     }
//     var pathname = url.parse(request.url).pathname;
//     if (pathname!="/favicon.ico") {
//         console.log("&gt;&gt; Request for "+pathname);
//         console.log("&gt;&gt;&gt; Client : "+request.headers['user-agent']);
//         console.log("&gt;&gt;&gt; IP address "+clientIPaddr+" via proxy "+clientProxy);
//     }

//     // rest of request handling code
// }
