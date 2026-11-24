import proxy from "express-http-proxy";

const proxyWithHeader = (serviceUrl) => {
  return proxy(serviceUrl, {
    proxyReqPathResolver: (req) => {
      return req.url && req.url !== "" ? req.url : "/";
    },
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // 1. Forward cookies so downstream services (like chat) receive the auth session
      if (srcReq.headers.cookie) {
        proxyReqOpts.headers["cookie"] = srcReq.headers.cookie;
      }

      // 2. Prevent header spoofing & safely forward verified user ID
      if (srcReq.user?.id) {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.id;
      } else {
        delete proxyReqOpts.headers["x-user-id"];
      }

      return proxyReqOpts;
    },
  });
};

export default proxyWithHeader;
